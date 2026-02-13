from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.services.horizons import (
    resolve_object,
    fetch_vectors_result_text,
    parse_vectors_from_result,
)

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
            INSERT INTO objects (kind, name, source, source_key)
            VALUES (:kind, :name, 'horizons', :source_key)
            ON CONFLICT (source, source_key) DO UPDATE SET
              name = EXCLUDED.name,
              kind = EXCLUDED.kind,
              updated_at = now()
        """
        ),
        {"kind": kind, "name": name, "source_key": source_key},
    )
    await db.commit()
    return {"ok": True}


@router.get("/{object_id}/ephemeris")
async def ephemeris(
    object_id: int,
    t0: datetime,
    t1: datetime,
    step: int = 60,  # minutes
    db: AsyncSession = Depends(get_db),
):
    obj = (
        (
            await db.execute(
                text("SELECT id, source_key FROM objects WHERE id = :id"),
                {"id": object_id},
            )
        )
        .mappings()
        .first()
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")

    # Ensure UTC (Horizons expects explicit UTC-ish strings)
    if t0.tzinfo is None:
        t0 = t0.replace(tzinfo=timezone.utc)
    if t1.tzinfo is None:
        t1 = t1.replace(tzinfo=timezone.utc)

    # 1) Try cache first
    cached = (
        (
            await db.execute(
                text(
                    """
                SELECT t_utc, x_km, y_km, z_km
                FROM ephemeris_cache
                WHERE object_id = :oid
                  AND step_sec = :step_sec
                  AND t_utc >= :t0 AND t_utc <= :t1
                ORDER BY t_utc ASC
            """
                ),
                {"oid": object_id, "step_sec": step * 60, "t0": t0, "t1": t1},
            )
        )
        .mappings()
        .all()
    )

    if cached:
        return {
            "cached": True,
            "results": [
                {
                    "t": r["t_utc"],
                    "x_km": r["x_km"],
                    "y_km": r["y_km"],
                    "z_km": r["z_km"],
                }
                for r in cached
            ],
        }

    # 2) Fetch from Horizons, parse, then cache
    result_text = await fetch_vectors_result_text(
        command=obj["source_key"],
        start_time=t0.strftime("%Y-%m-%d %H:%M"),
        stop_time=t1.strftime("%Y-%m-%d %H:%M"),
        step_minutes=step,
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
                "oid": object_id,
                "t": v["t"],
                "step_sec": step * 60,
                "x": v["x_km"],
                "y": v["y_km"],
                "z": v["z_km"],
            },
        )

    await db.commit()
    return {"cached": False, "results": vectors}


@router.get("")
async def list_objects(db: AsyncSession = Depends(get_db)):
    rows = (
        (
            await db.execute(
                text(
                    """
        SELECT id, kind, name, source, source_key
        FROM objects
        ORDER BY kind, name
    """
                )
            )
        )
        .mappings()
        .all()
    )
    return {"results": [dict(r) for r in rows]}
