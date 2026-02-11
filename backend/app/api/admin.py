from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

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
