from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- Import this

from app.api.health import router as health_router
from app.api.admin import router as admin_router
from app.api.launches import router as launches_router
from app.api.satellites import router as satellites_router
from app.api.objects import router as objects_router

app = FastAPI(title="StarMaps")

origins = [
    "https://dheeraj080.github.io/StarMaps/",
    "http://localhost:5173",
    "http://localhost:4173"
]

# <-- Add this block
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(launches_router, prefix="/api")
app.include_router(satellites_router, prefix="/api")
app.include_router(objects_router, prefix="/api")
