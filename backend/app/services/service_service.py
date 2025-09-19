# backend/app/services/service_service.py

from sqlalchemy.orm import Session, joinedload
from typing import List
from fastapi import HTTPException, status
from app.models import user_model, service_model
from app.schemas import service_schema

def create_service_post(
    db: Session, user: user_model.User, post_data: service_schema.ServicePostCreate
) -> service_model.ServicePost:
    """Creates a new service post, including its requirements and filters, in the database."""
    
    # Create the main ServicePost object
    new_post = service_model.ServicePost(
        poster_user_id=user.id,
        title=post_data.title,
        description=post_data.description,
        is_paid=post_data.is_paid,
        price=post_data.price if post_data.is_paid else None
    )
    db.add(new_post)
    
    # Create the associated ServiceRequirement objects
    for req_text in post_data.requirements:
        new_req = service_model.ServiceRequirement(
            service_post=new_post,
            requirement=req_text
        )
        db.add(new_req)
        
    # Create the associated ServiceFilter objects
    for filt_data in post_data.filters:
        new_filt = service_model.ServiceFilter(
            service_post=new_post,
            filter_type=filt_data.get("type"),
            filter_value=filt_data.get("value")
        )
        db.add(new_filt)
        
    db.commit()
    db.refresh(new_post)
    
    return new_post


def get_all_service_posts(db: Session, skip: int = 0, limit: int = 100) -> List[service_model.ServicePost]:
    """
    Fetches a list of all service posts with an 'open' status.
    Uses pagination (skip, limit) for efficiency.
    """
    posts = db.query(service_model.ServicePost).options(
        joinedload(service_model.ServicePost.poster).joinedload(user_model.User.profile)
    ).filter(
        service_model.ServicePost.status == service_model.ServiceStatus.OPEN
    ).order_by(
        service_model.ServicePost.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return posts

def get_service_post_by_id(db: Session, post_id: int) -> service_model.ServicePost | None:
    """Fetches a single, detailed service post by its ID."""
    post = db.query(service_model.ServicePost).options(
        joinedload(service_model.ServicePost.poster).joinedload(user_model.User.profile),
        joinedload(service_model.ServicePost.requirements),
        joinedload(service_model.ServicePost.filters)
    ).filter(service_model.ServicePost.id == post_id).first()

    return post

def delete_service_post(db: Session, post_id: int, user: user_model.User):
    """
    Deletes a service post from the database.
    Ensures that only the user who created the post can delete it.
    """
    post_to_delete = db.query(service_model.ServicePost).filter(
        service_model.ServicePost.id == post_id
    ).first()

    # Check 1: Does the post exist?
    if not post_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service post not found"
        )

    # Check 2: Is the current user the owner of the post?
    if post_to_delete.poster_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this post"
        )

    # If all checks pass, delete the post
    db.delete(post_to_delete)
    db.commit()
    
    return {"detail": "Service post deleted successfully"}