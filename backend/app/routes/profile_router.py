# backend/app/routes/profile_router.py

from fastapi import APIRouter, Depends, Response, status, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services import profile_service, auth_service
from app.schemas import profile_schema
from app.models import user_model
from app.models import profile_model

router = APIRouter()

@router.get("/me", response_model=profile_schema.Profile)
def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    """
    Fetches the complete profile for the currently authenticated user.
    """
    profile_data = profile_service.get_user_profile(db=db, user=current_user)
    return profile_data

@router.put("/me", response_model=profile_schema.Profile)
def update_current_user_profile(
    profile_update_data: profile_schema.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    """
    Updates the profile for the currently authenticated user.
    """
    updated_profile_data = profile_service.update_user_profile(
        db=db, user=current_user, profile_data=profile_update_data
    )
    return updated_profile_data

