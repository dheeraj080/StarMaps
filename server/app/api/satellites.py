from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db import get_db

router = APIRouter(prefix="/satellites", tags=["satellites"])


@router.get("/")
async def get_all_active_satellites(
    limit: int = 5000, db: AsyncSession = Depends(get_db)
):
    """
    REQUIRED BY FRONTEND: Returns a bulk list of the latest TLE for all satellites.
    """
    # This query gets the most recent TLE for every satellite in the DB
    q = text(
        """
        SELECT DISTINCT ON (s.norad_id)
            s.norad_id, s.name, t.line1, t.line2, t.epoch
        FROM satellites s
        JOIN tles t ON s.norad_id = t.norad_id
        ORDER BY s.norad_id, t.epoch DESC
        LIMIT :limit
    """
    )
    rows = (await db.execute(q, {"limit": limit})).mappings().all()
    return [dict(r) for r in rows]


@router.get("/{norad_id}/tle/latest")
async def latest_tle(norad_id: int, db: AsyncSession = Depends(get_db)):
    q = text(
        """
        SELECT norad_id, epoch, line1, line2, source, fetched_at
        FROM tles
        WHERE norad_id = :norad_id
        ORDER BY epoch DESC
        LIMIT 1
    """
    )
    row = (await db.execute(q, {"norad_id": norad_id})).mappings().first()
    if not row:
        return {"error": "No TLE found. Ingest first."}
    return dict(row)


@router.get("/search")
async def search_satellites(
    q: str, limit: int = 25, db: AsyncSession = Depends(get_db)
):
    # Your existing search logic is great for a search bar UI!
    q_sql = text(
        """
        SELECT norad_id, name
        FROM satellites
        WHERE name ILIKE :pat OR CAST(norad_id AS TEXT) ILIKE :pat
        ORDER BY
          CASE WHEN name ILIKE :starts THEN 0 ELSE 1 END,
          name ASC
        LIMIT :limit
    """
    )
    rows = (
        (await db.execute(q_sql, {"pat": f"%{q}%", "starts": f"{q}%", "limit": limit}))
        .mappings()
        .all()
    )
    return {"results": [dict(r) for r in rows]}
