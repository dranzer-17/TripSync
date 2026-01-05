# backend/app/services/conversation_service.py

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional

from app.models import conversation_model, user_model

def find_or_create_conversation(
    db: Session,
    user1_id: int,
    user2_id: int
) -> conversation_model.Conversation:
    """
    Find or create a conversation between two users.
    Ensures user1_id < user2_id for consistency (sorted user IDs).
    """
    # Sort user IDs to ensure consistency
    sorted_user1 = min(user1_id, user2_id)
    sorted_user2 = max(user1_id, user2_id)
    
    # Try to find existing conversation
    conversation = db.query(conversation_model.Conversation).filter(
        and_(
            conversation_model.Conversation.user1_id == sorted_user1,
            conversation_model.Conversation.user2_id == sorted_user2
        )
    ).first()
    
    if conversation:
        return conversation
    
    # Create new conversation
    conversation = conversation_model.Conversation(
        user1_id=sorted_user1,
        user2_id=sorted_user2
    )
    
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    
    return conversation


def get_conversation_by_id(
    db: Session,
    conversation_id: int
) -> Optional[conversation_model.Conversation]:
    """
    Get a conversation by ID.
    """
    return db.query(conversation_model.Conversation).filter(
        conversation_model.Conversation.id == conversation_id
    ).first()


def get_conversation_for_users(
    db: Session,
    user1_id: int,
    user2_id: int
) -> Optional[conversation_model.Conversation]:
    """
    Get conversation between two users (if exists).
    """
    sorted_user1 = min(user1_id, user2_id)
    sorted_user2 = max(user1_id, user2_id)
    
    return db.query(conversation_model.Conversation).filter(
        and_(
            conversation_model.Conversation.user1_id == sorted_user1,
            conversation_model.Conversation.user2_id == sorted_user2
        )
    ).first()


def get_user_conversations(
    db: Session,
    user_id: int
) -> list[conversation_model.Conversation]:
    """
    Get all conversations for a user.
    """
    return db.query(conversation_model.Conversation).filter(
        (conversation_model.Conversation.user1_id == user_id) |
        (conversation_model.Conversation.user2_id == user_id)
    ).all()

