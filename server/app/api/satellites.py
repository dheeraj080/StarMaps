from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db import get_db

router = APIRouter(prefix="/satellites", tags=["satellites"])

@router.get("/{norad_id}/tle/latest")
async def latest_tle(norad_id: int, db: AsyncSession = Depends(get_db)):
    q = text("""
        SELECT norad_id, epoch, line1, line2, source, fetched_at
        FROM tles
        WHERE norad_id = :norad_id
        ORDER BY epoch DESC
        LIMIT 1
    """)
    row = (await db.execute(q, {"norad_id": norad_id})).mappings().first()
    if not row:
        return {"error": "No TLE found. Ingest first."}
    return dict(row)

@router.get("/search")
async def search_satellites(q: str, limit: int = 25, db: AsyncSession = Depends(get_db)):
    q_sql = text("""
        SELECT norad_id, name
        FROM satellites
        WHERE name ILIKE :pat OR CAST(norad_id AS TEXT) ILIKE :pat
        ORDER BY
          CASE WHEN name ILIKE :starts THEN 0 ELSE 1 END,
          name ASC
        LIMIT :limit
    """)
    rows = (await db.execute(q_sql, {
        "pat": f"%{q}%",
        "starts": f"{q}%",
        "limit": limit
    })).mappings().all()
    return {"results": [dict(r) for r in rows]}
