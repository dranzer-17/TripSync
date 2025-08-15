# backend/app/routes/auth_router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.db.database import get_db
from app.services import user_service, auth_service # <-- ADD auth_service
from app.schemas import user_schema, token_schema  

router = APIRouter()


@router.post("/register", response_model=user_schema.User, status_code=status.HTTP_201_CREATED)
def register_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    """
    Handles user registration.

    - Checks if a user with the given email already exists.
    - If not, it creates a new user and a new college if necessary.
    - Returns the newly created user's data (without the password).
    """
    db_user = user_service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    new_user = user_service.create_user(db=db, user=user)
    return new_user

@router.post("/token", response_model=token_schema.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Handles user login and returns a JWT access token.
    
    This uses the OAuth2 Password Flow. The client must send the credentials
    in a form-data body with 'username' and 'password' fields.
    """
    # 1. Find the user by their email (which is the 'username' in this flow)
    user = user_service.get_user_by_email(db, email=form_data.username)

    # 2. If user doesn't exist or password doesn't match, raise an error
    if not user or not user_service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. If credentials are correct, create a new access token
    access_token = auth_service.create_access_token(
        data={"sub": user.email}
    )

    # 4. Return the token in the response
    return {"access_token": access_token, "token_type": "bearer"}