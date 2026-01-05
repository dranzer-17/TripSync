#!/usr/bin/env python3
"""
Script to reset the database by dropping all tables and recreating them.
WARNING: This will delete all data in the database!
"""

from app.db.database import Base, engine
from app.models import (
    user_model,
    profile_model,
    pooling_model,
    message_model,
    conversation_model,
    service_model
)

def reset_database():
    """Drop all tables and recreate them."""
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database reset complete!")
    print("All tables have been recreated with the new schema.")

if __name__ == "__main__":
    reset_database()
