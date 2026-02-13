from datetime import datetime, timedelta, timezone
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.horizons import fetch_vectors_result_text, parse_vectors_from_result


async def precompute_ephemeris(
    db: AsyncSession, step_min: int = 60, hours_ahead: int = 48
):
    t0 = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    t1 = t0 + timedelta(hours=hours_ahead)

    objs = (
        (
            await db.execute(
                text(
                    """
        SELECT id, source_key
        FROM objects
        WHERE source='horizons' AND (kind='moon' OR kind='planet' OR kind='star')
    """
                )
            )
        )
        .mappings()
        .all()
    )

    for o in objs:
        # Skip if we already have “enough” cached in this range
        cached_count = (
            (
                await db.execute(
                    text(
                        """
            SELECT count(*) AS n
            FROM ephemeris_cache
            WHERE object_id=:oid AND step_sec=:step_sec AND t_utc>=:t0 AND t_utc<=:t1
        """
                    ),
                    {"oid": o["id"], "step_sec": step_min * 60, "t0": t0, "t1": t1},
                )
            )
            .mappings()
            .first()["n"]
        )

        # crude expected points
        expected = int(((t1 - t0).total_seconds() // (step_min * 60)) + 1)
        if cached_count >= int(expected * 0.9):
            continue

        result_text = await fetch_vectors_result_text(
            command=o["source_key"],
            start_time=t0.strftime("%Y-%m-%d %H:%M"),
            stop_time=t1.strftime("%Y-%m-%d %H:%M"),
            step_minutes=step_min,
            center="500@399",
            ref_system="J2000",
        )
        vectors = parse_vectors_from_result(result_text)

        for v in vectors:
            await db.execute(
                text(
                    """
                INSERT INTO ephemeris_cache
                  (object_id, t_utc, frame, center, step_sec, x_km, y_km, z_km)
                VALUES
                  (:oid, :t, 'J2000', '500@399', :step_sec, :x, :y, :z)
                ON CONFLICT (object_id, t_utc, frame, center, step_sec) DO NOTHING
            """
                ),
                {
                    "oid": o["id"],
                    "t": v["t"],
                    "step_sec": step_min * 60,
                    "x": v["x_km"],
                    "y": v["y_km"],
                    "z": v["z_km"],
                },
            )

        await db.commit()
