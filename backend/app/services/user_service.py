# backend/app/services/user_service.py

from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.models import user_model
from app.schemas import user_schema

# Setup the password hashing context
# This tells passlib to use the bcrypt algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --- ADD THIS NEW FUNCTION ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if a plain text password matches a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_email(db: Session, email: str):
    """Fetches a user from the database by their email address."""
    return db.query(user_model.User).filter(user_model.User.email == email).first()


def get_or_create_college(db: Session, college_name: str):
    """
    Fetches a college by name from the database.
    If it doesn't exist, it creates a new one.
    """
    college = db.query(user_model.College).filter(user_model.College.name == college_name).first()
    if not college:
        college = user_model.College(name=college_name)
        db.add(college)
        db.commit()
        db.refresh(college)
    return college


def create_user(db: Session, user: user_schema.UserCreate):
    """Creates a new user in the database."""
    # Hash the user's password before storing it
    hashed_password = pwd_context.hash(user.password)

    # Find or create the college for the user
    college = get_or_create_college(db, college_name=user.college_name)

    # Create a new User database model instance
    db_user = user_model.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        college_id=college.id
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user