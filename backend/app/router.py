# backend/app/router.py

from fastapi import APIRouter
from app.routes import health_router, auth_router,  pooling_router, pooling_ws_router, map_router
from app.routes import profile_router , services_router  # <-- ADD auth_router

router = APIRouter()

# Include feature-specific routers here
router.include_router(health_router.router, prefix="/health", tags=["Health"])
router.include_router(auth_router.router, prefix="/auth", tags=["Authentication"])
router.include_router(pooling_router.router, prefix="/pool", tags=["Pooling"])
router.include_router(profile_router.router, prefix="/profile", tags=["Profile"]) 
router.include_router(services_router.router, prefix="/services", tags=["Services"])
router.include_router(map_router.router, prefix="/map", tags=["Maps"])

router.include_router(pooling_ws_router.router, tags=["Pooling WebSocket"])