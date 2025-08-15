# backend/app/router.py

from fastapi import APIRouter
from app.routes import health_router, auth_router  # <-- ADD auth_router

router = APIRouter()

# Include feature-specific routers here
router.include_router(health_router.router, prefix="/health", tags=["Health"])
router.include_router(auth_router.router, prefix="/auth", tags=["Authentication"]) # <-- ADD THIS LINE