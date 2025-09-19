# backend/app/routes/services_router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.services import service_service, auth_service
from app.schemas import service_schema
from app.models import user_model

router = APIRouter()

@router.post("", response_model=service_schema.ServicePostDetail, status_code=status.HTTP_201_CREATED)
def create_new_service_post(
    post_data: service_schema.ServicePostCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    new_post = service_service.create_service_post(db=db, user=current_user, post_data=post_data)
    
    requirements_list = [req.requirement for req in new_post.requirements]
    filters_list = [{"type": f.filter_type, "value": f.filter_value} for f in new_post.filters]

    poster_data = service_schema.ProfileBase(full_name=new_post.poster.full_name)

    return service_schema.ServicePostDetail(
        id=new_post.id,
        title=new_post.title,
        description=new_post.description,
        # --- THIS IS THE FIX ---
        poster_user_id=new_post.poster_user_id, # <-- ADD THIS MISSING FIELD
        # -----------------------
        is_paid=new_post.is_paid,
        price=new_post.price,
        status=new_post.status.value,
        created_at=new_post.created_at,
        poster=poster_data,
        requirements=requirements_list,
        filters=filters_list
    )

@router.get("", response_model=List[service_schema.ServicePostList])
def get_all_open_service_posts(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
):
    posts = service_service.get_all_service_posts(db=db, skip=skip, limit=limit)
    return posts

@router.get("/{post_id}", response_model=service_schema.ServicePostDetail)
def get_single_service_post(
    post_id: int,
    db: Session = Depends(get_db)
):
    post = service_service.get_service_post_by_id(db=db, post_id=post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service post not found")

    requirements_list = [req.requirement for req in post.requirements]
    filters_list = [{"type": f.filter_type, "value": f.filter_value} for f in post.filters]
    
    poster_data = service_schema.ProfileBase(full_name=post.poster.full_name)

    return service_schema.ServicePostDetail(
        id=post.id,
        title=post.title,
        description=post.description,
        # --- THIS IS THE FIX ---
        poster_user_id=post.poster_user_id, # <-- ADD THIS MISSING FIELD
        # -----------------------
        is_paid=post.is_paid,
        price=post.price,
        status=post.status.value,
        created_at=post.created_at,
        poster=poster_data,
        requirements=requirements_list,
        filters=filters_list
    )

# --- ADD THE DELETE ENDPOINT ---
@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_service_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    service_service.delete_service_post(db=db, post_id=post_id, user=current_user)
    return