from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db import get_db

router = APIRouter(prefix="/launches", tags=["launches"])

@router.get("/upcoming")
async def upcoming_launches(days: int = 14, db: AsyncSession = Depends(get_db)):
    q = text("""
        SELECT id, name, net_utc, status, provider_name, rocket_name, pad_name, pad_lat, pad_lon
        FROM launches
        WHERE net_utc IS NOT NULL
        ORDER BY net_utc ASC
        LIMIT 50
    """)
    rows = (await db.execute(q)).mappings().all()
    return {"results": [dict(r) for r in rows]}