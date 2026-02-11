from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime

from app.db import get_db
from app.services.horizons import resolve_object, fetch_vectors, parse_vectors

router = APIRouter(prefix="/objects", tags=["objects"])


@router.get("/resolve")
async def resolve(q: str):
    return await resolve_object(q)


@router.post("")
async def create_object(
    kind: str, name: str, source_key: str, db: AsyncSession = Depends(get_db)
):
    await db.execute(
        text(
            """
        INSERT INTO objects (kind, name, source_key)
        VALUES (:kind, :name, :source_key)
        ON CONFLICT (source, source_key) DO NOTHING
    """
        ),
        {"kind": kind, "name": name, "source_key": source_key},
    )

    await db.commit()
    return {"created": True}


@router.get("/{object_id}/ephemeris")
async def ephemeris(
    object_id: int,
    t0: datetime,
    t1: datetime,
    step: int = 60,
    db: AsyncSession = Depends(get_db),
):
    obj = (
        (
            await db.execute(
                text("SELECT * FROM objects WHERE id = :id"), {"id": object_id}
            )
        )
        .mappings()
        .first()
    )

    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")

    # fetch from Horizons
    raw = await fetch_vectors(
        command=obj["source_key"],
        start=t0.isoformat(),
        stop=t1.isoformat(),
        step=step,
    )

    vectors = parse_vectors(raw)

    # cache
    for v in vectors:
        await db.execute(
            text(
                """
            INSERT INTO ephemeris_cache
              (object_id, t_utc, frame, center, step_sec, x_km, y_km, z_km)
            VALUES
              (:object_id, :t, 'J2000', 'EARTH', :step, :x, :y, :z)
            ON CONFLICT DO NOTHING
        """
            ),
            {
                "object_id": object_id,
                "t": v["t"],
                "step": step,
                "x": v["x_km"],
                "y": v["y_km"],
                "z": v["z_km"],
            },
        )

    await db.commit()

    return {"results": vectors}
