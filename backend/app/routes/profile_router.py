# backend/app/routes/profile_router.py

from fastapi import APIRouter, Depends, Response, status, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
# --- THIS IS THE FIX ---
from typing import List # <--- Add 'List' to this import

# --- (keep other existing imports) ---
from app.models import user_model, service_model, profile_model # Ensure profile_model is here
from app.schemas import service_schema, profile_schema # Ensure profile_schema is here
from app.services import profile_service, auth_service
from app.db.database import get_db # Ensure get_db is here

router = APIRouter()

# --- (keep existing /me endpoints) ---

@router.get("/me", response_model=profile_schema.Profile)
def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    profile_data = profile_service.get_user_profile(db=db, user=current_user)
    return profile_data

@router.put("/me", response_model=profile_schema.Profile)
def update_current_user_profile(
    profile_update_data: profile_schema.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    updated_profile_data = profile_service.update_user_profile(
        db=db, user=current_user, profile_data=profile_update_data
    )
    return updated_profile_data

# --- (The two new endpoints will now work correctly) ---
@router.get("/me/posts", response_model=List[service_schema.ServicePostList])
def get_my_posted_services(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    """
    Fetches all service posts created by the currently authenticated user.
    """
    posts = db.query(service_model.ServicePost).filter(
        service_model.ServicePost.poster_user_id == current_user.id
    ).order_by(service_model.ServicePost.created_at.desc()).all()
    
    return posts

@router.get("/me/applications", response_model=List[service_schema.ServiceApplication])
def get_my_submitted_applications(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    """
    Fetches all applications submitted by the currently authenticated user.
    """
    # Eagerly load the related service_post to include its title in the response.
    # We must also import joinedload for this to work.
    from sqlalchemy.orm import joinedload 

    applications = db.query(service_model.ServiceApplication).options(
        joinedload(service_model.ServiceApplication.service_post) 
    ).filter(
        service_model.ServiceApplication.applicant_user_id == current_user.id
    ).order_by(service_model.ServiceApplication.application_date.desc()).all()

    return applications