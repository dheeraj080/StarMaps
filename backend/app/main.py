from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.admin import router as admin_router
from app.api.launches import router as launches_router
from app.api.satellites import router as satellites_router
from app.api.objects import router as objects_router


app = FastAPI(title="StarMaps")

# All routes stay under /api (same as before)
app.include_router(health_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(launches_router, prefix="/api")
app.include_router(satellites_router, prefix="/api")
app.include_router(objects_router, prefix="/api")
