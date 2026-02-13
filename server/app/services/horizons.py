from __future__ import annotations

from typing import Any

import re
from datetime import datetime, timezone
from typing import Any

import httpx

HORIZONS_LOOKUP = "https://ssd.jpl.nasa.gov/api/horizons_lookup.api"
HORIZONS_API = "https://ssd.jpl.nasa.gov/api/horizons.api"

# Matches:
# 2026-Feb-11 00:00
_DT_RE = re.compile(r"^\s*(\d{4}-[A-Za-z]{3}-\d{2}\s+\d{2}:\d{2})(?::\d{2})?\s*$")

# Matches vector line like:
# X =  3.123E+05 Y = -1.234E+05 Z =  9.999E+04
_VEC_RE = re.compile(
    r"X\s*=\s*([-\d\.E+]+)\s+Y\s*=\s*([-\d\.E+]+)\s+Z\s*=\s*([-\d\.E+]+)",
    re.IGNORECASE,
)


async def resolve_object(query: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(HORIZONS_LOOKUP, params={"sstr": query})
        r.raise_for_status()
        return r.json()


async def fetch_vectors_result_text(
    command: str,
    start_time: str,  # "YYYY-MM-DD HH:MM"
    stop_time: str,  # "YYYY-MM-DD HH:MM"
    step_minutes: int,
    center: str = "500@399",  # Earth center
    ref_system: str = "J2000",
) -> str:
    # NOTE: Horizons API likes quoted values.
    params: dict[str, Any] = {
        "format": "json",
        "COMMAND": f"'{command}'",
        "MAKE_EPHEM": "'YES'",
        "TABLE_TYPE": "'VECTORS'",  # <-- key fix
        "CENTER": f"'{center}'",
        "START_TIME": f"'{start_time}'",
        "STOP_TIME": f"'{stop_time}'",
        "STEP_SIZE": f"'{int(step_minutes)} MINUTES'",
        "OUT_UNITS": "'KM-S'",
        "REF_SYSTEM": f"'{ref_system}'",  # <-- key fix
        "VEC_TABLE": "'2'",
        "CSV_FORMAT": "'YES'",  # easier parsing
        "OBJ_DATA": "'NO'",
    }

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.get(HORIZONS_API, params=params)
        # Helpful error if it still fails:
        if r.status_code >= 400:
            raise RuntimeError(f"Horizons {r.status_code}: {r.text[:500]}")
        data = r.json()

    if "result" not in data:
        raise RuntimeError(f"Horizons response missing 'result': {data}")

    return data["result"]


def parse_vectors_from_result(result_text: str):
    lines = result_text.splitlines()

    # find $$SOE/$$EOE
    try:
        i0 = next(i for i, ln in enumerate(lines) if "$$SOE" in ln) + 1
        i1 = next(i for i, ln in enumerate(lines) if "$$EOE" in ln)
    except StopIteration:
        raise RuntimeError("Could not find $$SOE/$$EOE in Horizons result")

    out = []
    for ln in lines[i0:i1]:
        ln = ln.strip()
        if not ln or ln.startswith("*"):
            continue

        # CSV_FORMAT=YES gives: JDTDB, Calendar Date, X, Y, Z, ...
        parts = [p.strip() for p in ln.split(",")]
        if len(parts) < 5:
            continue

        # parts[1] looks like "A.D. 2026-Feb-11 00:00:00.0000 TDB"
        # We'll parse the middle "2026-Feb-11 00:00:00.0000"
        cal = parts[1]
        try:
            cal_mid = cal.split("A.D.")[1].split("TDB")[0].strip()
            t = datetime.strptime(cal_mid, "%Y-%b-%d %H:%M:%S.%f").replace(
                tzinfo=timezone.utc
            )
        except Exception:
            # fallback: skip line if unexpected
            continue

        x = float(parts[2])
        y = float(parts[3])
        z = float(parts[4])
        out.append({"t": t, "x_km": x, "y_km": y, "z_km": z})

    if not out:
        raise RuntimeError("Parsed 0 vectors from Horizons result")
    return out
