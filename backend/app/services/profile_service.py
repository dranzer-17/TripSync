# backend/app/services/profile_service.py

from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models import user_model, profile_model
from app.schemas import profile_schema

def get_user_profile(db: Session, user: user_model.User) -> dict:
    """
    Fetches a user's profile. If one doesn't exist, it creates a default one.
    Combines data from the User and Profile models into a single response.
    """
    # Eagerly load the profile and college data in a single query for efficiency
    user_with_details = db.query(user_model.User).options(
        joinedload(user_model.User.profile),
        joinedload(user_model.User.college)
    ).filter(user_model.User.id == user.id).first()

    if not user_with_details.profile:
        # If the user somehow doesn't have a profile yet, create one
        new_profile = profile_model.Profile(user_id=user.id)
        db.add(new_profile)
        db.commit()
        db.refresh(user_with_details) # Refresh the user object to get the new profile

    # Combine data from all related models into a single dictionary
    profile_data = {
        "id": user_with_details.id,
        "full_name": user_with_details.full_name,
        "email": user_with_details.email,
        "college_name": user_with_details.college.name if user_with_details.college else "N/A",
        "username": user_with_details.profile.username,
        "profile_image_url": user_with_details.profile.profile_image_url,
        "has_resume": user_with_details.profile.resume_url is not None ,
        "phone_number": user_with_details.profile.phone_number,
        "bio": user_with_details.profile.bio,
        "year_of_study": user_with_details.profile.year_of_study,
        "reviews": user_with_details.profile.reviews,
        "preferences": user_with_details.profile.preferences,
        "social_media_links": user_with_details.profile.social_media_links,
        "emergency_contact": user_with_details.profile.emergency_contact,
    }
    return profile_data


def update_user_profile(db: Session, user: user_model.User, profile_data: profile_schema.ProfileUpdate) -> dict:
    """
    Updates a user's profile with the provided data.
    """
    # Ensure the profile exists before trying to update it
    user_profile = user.profile
    if not user_profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # The 'exclude_unset=True' is important. It means we only get the fields
    # that the user actually sent in the request, not all the optional ones.
    update_data = profile_data.model_dump(exclude_unset=True)

    # Update User model fields if they are present in the update data
    if "full_name" in update_data:
        user.full_name = update_data.pop("full_name")

    # Update Profile model fields for everything else
    for key, value in update_data.items():
        setattr(user_profile, key, value)
    
    db.add(user)
    db.add(user_profile)
    db.commit()
    db.refresh(user)
    
    # Return the newly updated, combined profile
    return get_user_profile(db=db, user=user)