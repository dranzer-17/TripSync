# backend/app/routes/pooling_router.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services import pooling_service, auth_service
from app.schemas import pooling_schema
from app.models import user_model

router = APIRouter()

@router.post("/requests", response_model=pooling_schema.PoolingMatchResponse)
async def create_pooling_request_and_find_matches(
    request_data: pooling_schema.PoolingRequestCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    """
    This single endpoint does two things:
    1. Creates a new pooling request for the current user (cancelling any old ones).
    2. Immediately searches for and returns any available matches.
    """
    # Step 1: Create the user's request
    new_request = pooling_service.create_or_update_pooling_request(
        db=db, user=current_user, request_data=request_data
    )
    
    # Step 2: Find matches for this new request
    matches = await pooling_service.find_matches(db=db, new_request=new_request)
    
    # Step 3: Format and return the response
    return pooling_schema.PoolingMatchResponse(
        request_id=new_request.id,
        matches=matches
    )