from __future__ import annotations

import asyncio
from datetime import datetime, timezone, timedelta
from typing import Any, Optional

import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# ----------------------------
# Launch Library 2 (LL2)
# ----------------------------
LL2_UPCOMING = "https://ll.thespacedevs.com/2.2.0/launch/upcoming/"

def _parse_iso(dt_str: Optional[str]) -> Optional[datetime]:
    if not dt_str:
        return None
    dt_str = dt_str.replace("Z", "+00:00")
    return datetime.fromisoformat(dt_str)

async def _http_get_json_with_backoff(
    client: httpx.AsyncClient,
    url: str,
    params: dict[str, Any],
    max_retries: int = 5,
) -> dict[str, Any]:
    """
    Handles 429/5xx with exponential backoff.
    """
    delay = 2.0
    for attempt in range(max_retries):
        r = await client.get(url, params=params)
        if r.status_code in (429, 500, 502, 503, 504):
            # Try Retry-After first if present
            retry_after = r.headers.get("Retry-After")
            if retry_after:
                try:
                    wait = float(retry_after)
                except ValueError:
                    wait = delay
            else:
                wait = delay

            await asyncio.sleep(wait)
            delay = min(delay * 2.0, 60.0)
            continue

        r.raise_for_status()
        return r.json()

    # If we reach here, last response was bad
    r.raise_for_status()
    return {}  # unreachable


async def ingest_launches(
    db: AsyncSession,
    max_pages: int = 2,           # <= IMPORTANT: reduces LL2 rate-limit risk
    page_size: int = 50,
    page_delay_sec: float = 0.6,  # <= IMPORTANT: gentle paging
) -> int:
    """
    Fetch upcoming launches from Launch Library 2 and upsert into DB.
    To avoid 429, we cap pages and add delay + backoff.
    """
    inserted_or_updated = 0

    params = {"limit": page_size, "offset": 0}
    page = 0

    async with httpx.AsyncClient(timeout=30) as client:
        while True:
            data = await _http_get_json_with_backoff(client, LL2_UPCOMING, params)

            for item in data.get("results", []):
                source_id = str(item.get("id"))
                name = item.get("name") or "Unknown Launch"
                net = _parse_iso(item.get("net"))

                status = (item.get("status") or {}).get("name")
                provider = (item.get("launch_service_provider") or {}).get("name")

                rocket = (((item.get("rocket") or {}) or {}).get("configuration") or {}).get("name")

                pad = item.get("pad") or {}
                pad_name = pad.get("name")
                pad_lat = pad.get("latitude")
                pad_lon = pad.get("longitude")

                webcast_url = None  # keep nullable for now
                last_source_update = _parse_iso(item.get("last_updated")) or datetime.now(timezone.utc)

                q = text("""
                    INSERT INTO launches
                      (source, source_id, name, net_utc, status, provider_name, rocket_name,
                       pad_name, pad_lat, pad_lon, webcast_url, last_source_update, updated_at)
                    VALUES
                      ('ll2', :source_id, :name, :net_utc, :status, :provider_name, :rocket_name,
                       :pad_name, :pad_lat, :pad_lon, :webcast_url, :last_source_update, now())
                    ON CONFLICT (source_id) DO UPDATE SET
                      name = EXCLUDED.name,
                      net_utc = EXCLUDED.net_utc,
                      status = EXCLUDED.status,
                      provider_name = EXCLUDED.provider_name,
                      rocket_name = EXCLUDED.rocket_name,
                      pad_name = EXCLUDED.pad_name,
                      pad_lat = EXCLUDED.pad_lat,
                      pad_lon = EXCLUDED.pad_lon,
                      webcast_url = EXCLUDED.webcast_url,
                      last_source_update = EXCLUDED.last_source_update,
                      updated_at = now()
                """)

                await db.execute(q, {
                    "source_id": source_id,
                    "name": name,
                    "net_utc": net,
                    "status": status,
                    "provider_name": provider,
                    "rocket_name": rocket,
                    "pad_name": pad_name,
                    "pad_lat": float(pad_lat) if pad_lat is not None else None,
                    "pad_lon": float(pad_lon) if pad_lon is not None else None,
                    "webcast_url": webcast_url,
                    "last_source_update": last_source_update,
                })
                inserted_or_updated += 1

            await db.commit()

            page += 1
            if page >= max_pages or not data.get("next"):
                break

            params["offset"] += page_size
            await asyncio.sleep(page_delay_sec)

    return inserted_or_updated


# ----------------------------
# CelesTrak TLE ingestion
# ----------------------------
CELESTRAK_GP = "https://celestrak.org/NORAD/elements/gp.php"
CELESTRAK_TLE_ISS = "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle"

def _norad_from_line1(line1: str) -> int:
    return int(line1[2:7].strip())

def _epoch_from_line1(line1: str) -> datetime:
    raw = line1[18:32].strip()  # YYDDD.DDDDDDDD
    yy = int(raw[0:2])
    ddd_frac = float(raw[2:])
    year = 2000 + yy if yy < 57 else 1900 + yy
    day_of_year = int(ddd_frac)
    frac = ddd_frac - day_of_year
    base = datetime(year, 1, 1, tzinfo=timezone.utc)
    return base + timedelta(days=day_of_year - 1, seconds=frac * 86400.0)

def _parse_tle_3line(text_blob: str) -> list[tuple[str, str, str]]:
    lines = [ln.rstrip() for ln in text_blob.splitlines() if ln.strip()]
    out: list[tuple[str, str, str]] = []
    i = 0
    while i + 2 < len(lines):
        name = lines[i].strip()
        line1 = lines[i + 1].strip()
        line2 = lines[i + 2].strip()
        if line1.startswith("1 ") and line2.startswith("2 "):
            out.append((name, line1, line2))
            i += 3
        else:
            i += 1
    return out

async def ingest_celestrak_group(db: AsyncSession, group: str) -> dict[str, Any]:
    params = {"GROUP": group, "FORMAT": "tle"}

    async with httpx.AsyncClient(timeout=45) as client:
        r = await client.get(CELESTRAK_GP, params=params)
        r.raise_for_status()
        tles = _parse_tle_3line(r.text)

    # Upsert satellites + insert TLEs (deduped by unique index)
    for name, line1, line2 in tles:
        norad_id = _norad_from_line1(line1)
        epoch = _epoch_from_line1(line1)

        await db.execute(text("""
            INSERT INTO satellites (norad_id, name, updated_at)
            VALUES (:norad_id, :name, now())
            ON CONFLICT (norad_id) DO UPDATE SET
              name = EXCLUDED.name,
              updated_at = now()
        """), {"norad_id": norad_id, "name": name})

        await db.execute(text("""
            INSERT INTO tles (norad_id, epoch, line1, line2, source)
            VALUES (:norad_id, :epoch, :line1, :line2, 'celestrak')
            ON CONFLICT (norad_id, epoch, line1, line2) DO NOTHING
        """), {"norad_id": norad_id, "epoch": epoch, "line1": line1, "line2": line2})

    await db.commit()

    return {"group": group, "satellites_seen": len(tles)}


async def ingest_iss_tle(db: AsyncSession) -> dict[str, Any]:
    """
    Convenience: pull ISS TLE only (still uses the same dedupe rule).
    """
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(CELESTRAK_TLE_ISS)
        r.raise_for_status()
        tles = _parse_tle_3line(r.text)

    if not tles:
        raise RuntimeError("Unexpected ISS TLE response")

    name, line1, line2 = tles[0]
    norad_id = _norad_from_line1(line1)
    epoch = _epoch_from_line1(line1)

    await db.execute(text("""
        INSERT INTO satellites (norad_id, name, updated_at)
        VALUES (:norad_id, :name, now())
        ON CONFLICT (norad_id) DO UPDATE SET
          name = EXCLUDED.name,
          updated_at = now()
    """), {"norad_id": norad_id, "name": name})

    await db.execute(text("""
        INSERT INTO tles (norad_id, epoch, line1, line2, source)
        VALUES (:norad_id, :epoch, :line1, :line2, 'celestrak')
        ON CONFLICT (norad_id, epoch, line1, line2) DO NOTHING
    """), {"norad_id": norad_id, "epoch": epoch, "line1": line1, "line2": line2})

    await db.commit()
    return {"norad_id": norad_id, "name": name, "epoch": epoch.isoformat()}
