from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db import get_db
from app.ingest import ingest_launches, ingest_iss_tle, ingest_celestrak_group

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/ingest/launches")
async def admin_ingest_launches(db: AsyncSession = Depends(get_db)):
    n = await ingest_launches(db)
    return {"upserted": n}


@router.post("/ingest/iss")
async def admin_ingest_iss(db: AsyncSession = Depends(get_db)):
    return await ingest_iss_tle(db)


@router.post("/ingest/celestrak")
async def admin_ingest_celestrak(
    group: str = Query(..., description="e.g. stations, weather, gps-ops, active"),
    db: AsyncSession = Depends(get_db),
):
    return await ingest_celestrak_group(db, group)


from sqlalchemy import text


@router.post("/seed/solarsystem")
async def seed_solarsystem(db: AsyncSession = Depends(get_db)):
    # Horizons IDs commonly used:
    # Sun=10, Mercury=199, Venus=299, Earth=399, Moon=301,
    # Mars=499, Jupiter=599, Saturn=699, Uranus=799, Neptune=899
    bodies = [
        ("star", "Sun", "10"),
        ("planet", "Mercury", "199"),
        ("planet", "Venus", "299"),
        ("planet", "Earth", "399"),
        ("moon", "Moon", "301"),
        ("planet", "Mars", "499"),
        ("planet", "Jupiter", "599"),
        ("planet", "Saturn", "699"),
        ("planet", "Uranus", "799"),
        ("planet", "Neptune", "899"),
    ]

    for kind, name, key in bodies:
        await db.execute(
            text(
                """
            INSERT INTO objects (kind, name, source, source_key)
            VALUES (:kind, :name, 'horizons', :key)
            ON CONFLICT (source, source_key) DO UPDATE SET
              name = EXCLUDED.name,
              kind = EXCLUDED.kind,
              updated_at = now()
        """
            ),
            {"kind": kind, "name": name, "key": key},
        )

    await db.commit()
    return {"seeded": len(bodies)}
