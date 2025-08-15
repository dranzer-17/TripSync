# backend/app/schemas/user_schema.py

# --- REMOVE THIS IMPORT ---
# import uuid
from pydantic import BaseModel, EmailStr

# --- College Schemas ---
class CollegeBase(BaseModel):
    name: str

class CollegeCreate(CollegeBase):
    pass

class College(CollegeBase):
    # --- CHANGE THIS LINE ---
    id: int
    # ----------------------

    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    college_name: str

class User(UserBase):
    # --- CHANGE THESE TWO LINES ---
    id: int
    college_id: int
    # ----------------------------

    class Config:
        from_attributes = True