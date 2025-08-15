import uuid
from pydantic import BaseModel, EmailStr

# --- College Schemas ---
class CollegeBase(BaseModel):
    name: str

class CollegeCreate(CollegeBase):
    pass

class College(CollegeBase):
    id: uuid.UUID

    class Config:
        from_attributes = True # Allows Pydantic to read data from ORM models


# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

# Schema for creating a user (input from the client)
class UserCreate(UserBase):
    password: str
    college_name: str

# Schema for reading a user (output from the API)
class User(UserBase):
    id: uuid.UUID
    college_id: uuid.UUID

    class Config:
        from_attributes = True

