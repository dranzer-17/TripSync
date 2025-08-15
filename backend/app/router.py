# backend/app/router.py (Updated)
from fastapi import APIRouter
from app.routes import health_router

router = APIRouter()
router.include_router(health_router.router, prefix="/health", tags=["health"]) 