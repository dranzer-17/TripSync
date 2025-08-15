# backend/app/health/health_routes.py

from fastapi import APIRouter

router = APIRouter()

@router.get("/ping")
def ping_pong():
    """A simple health check endpoint."""
    return {"ping": "pong!"}