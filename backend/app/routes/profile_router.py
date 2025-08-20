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

@router.post("/me/image", response_model=profile_schema.Profile)
async def upload_profile_image(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth_service.get_current_user),
    file: UploadFile = File(...)
):
    """
    Handles profile image uploads by reading the file's binary content
    and saving it directly to the database.
    """
    if not current_user.profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Read the content of the uploaded file
    image_data = await file.read()

    # --- SET A SIZE LIMIT (e.g., 10MB) ---
    MAX_FILE_SIZE = 10 * 1024 * 1024 # 10 MB in bytes
    if len(image_data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image file is too large. Maximum size is 10MB."
        )

    # Save the binary data to the profile model
    current_user.profile.profile_image_file = image_data
    db.add(current_user.profile)
    db.commit()

    print(f"Successfully saved profile image for user {current_user.id} in the database.")

    # Return the updated profile data
    updated_profile_data = profile_service.get_user_profile(db=db, user=current_user)
    return updated_profile_data


@router.get("/{user_id}/image")
def get_user_profile_image(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Fetches a user's profile image directly from the database and returns it
    as an image response.
    """
    profile = db.query(profile_model.Profile).filter(profile_model.Profile.user_id == user_id).first()

    if not profile or not profile.profile_image_file:
        raise HTTPException(status_code=404, detail="Image not found")

    # Return the binary data with the correct media type for an image
    return Response(content=profile.profile_image_file, media_type="image/jpeg")