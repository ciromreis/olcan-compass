"""Social models for community features"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID, ARRAY, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base


# ============================================================================
# Posts & Content
# ============================================================================

class UserPost(Base):
    """User posts (blog, social, artifacts)"""
    __tablename__ = "user_posts"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_type = Column(String(50), nullable=False, index=True)  # blog, social, artifact, reference
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)
    excerpt = Column(String(500), nullable=True)
    media_urls = Column(JSONB, nullable=True)
    tags = Column(ARRAY(String(50)), nullable=True, index=True)
    visibility = Column(String(20), nullable=False, default="public")  # public, private, followers
    is_olcan_official = Column(Boolean, nullable=False, default=False, index=True)
    is_featured = Column(Boolean, nullable=False, default=False, index=True)
    journey_stage = Column(String(50), nullable=True, index=True)
    related_archetype = Column(String(50), nullable=True, index=True)
    like_count = Column(Integer, nullable=False, default=0)
    comment_count = Column(Integer, nullable=False, default=0)
    view_count = Column(Integer, nullable=False, default=0)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="user_posts")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("PostComment", back_populates="post", cascade="all, delete-orphan")


class PostLike(Base):
    """Post likes"""
    __tablename__ = "post_likes"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    post_id = Column(PGUUID(as_uuid=True), ForeignKey("user_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Relationships
    post = relationship("UserPost", back_populates="likes")
    user = relationship("User", back_populates="post_likes")


class PostComment(Base):
    """Post comments"""
    __tablename__ = "post_comments"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    post_id = Column(PGUUID(as_uuid=True), ForeignKey("user_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Relationships
    post = relationship("UserPost", back_populates="comments")
    user = relationship("User", back_populates="post_comments")


# ============================================================================
# Boards (Pinterest-like)
# ============================================================================

class UserBoard(Base):
    """User boards for collections"""
    __tablename__ = "user_boards"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    cover_image_url = Column(String(500), nullable=True)
    visibility = Column(String(20), nullable=False, default="public")
    board_type = Column(String(50), nullable=False, default="general")  # general, application, route, inspiration
    item_count = Column(Integer, nullable=False, default=0)
    follower_count = Column(Integer, nullable=False, default=0)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = relationship("BoardItem", back_populates="board", cascade="all, delete-orphan")
    followers = relationship("BoardFollower", back_populates="board", cascade="all, delete-orphan")


class BoardItem(Base):
    """Items in a board"""
    __tablename__ = "board_items"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    board_id = Column(PGUUID(as_uuid=True), ForeignKey("user_boards.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    item_type = Column(String(50), nullable=False, index=True)  # post, product, chronicle, external_link
    item_id = Column(PGUUID(as_uuid=True), nullable=True)
    external_url = Column(String(1000), nullable=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    item_metadata = Column(JSONB, nullable=True)
    notes = Column(Text, nullable=True)
    position = Column(Integer, nullable=False, default=0)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Relationships
    board = relationship("UserBoard", back_populates="items")


class BoardFollower(Base):
    """Board followers"""
    __tablename__ = "board_followers"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    board_id = Column(PGUUID(as_uuid=True), ForeignKey("user_boards.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Relationships
    board = relationship("UserBoard", back_populates="followers")


# ============================================================================
# Saved References
# ============================================================================

class SavedReference(Base):
    """Saved external references"""
    __tablename__ = "saved_references"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reference_type = Column(String(50), nullable=False, index=True)  # social_post, article, video, document
    source_platform = Column(String(50), nullable=True)  # instagram, twitter, linkedin, youtube, etc.
    source_url = Column(String(1000), nullable=False)
    title = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    author = Column(String(200), nullable=True)
    tags = Column(ARRAY(String(50)), nullable=True)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)


# ============================================================================
# Q&A System
# ============================================================================

class Question(Base):
    """Community questions"""
    __tablename__ = "questions"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(300), nullable=False)
    body = Column(Text, nullable=False)
    tags = Column(ARRAY(String(50)), nullable=True)
    related_archetype = Column(String(50), nullable=True, index=True)
    journey_stage = Column(String(50), nullable=True, index=True)
    view_count = Column(Integer, nullable=False, default=0)
    answer_count = Column(Integer, nullable=False, default=0)
    upvote_count = Column(Integer, nullable=False, default=0)
    has_accepted_answer = Column(Boolean, nullable=False, default=False)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")
    upvotes = relationship("QuestionUpvote", back_populates="question", cascade="all, delete-orphan")


class Answer(Base):
    """Answers to questions"""
    __tablename__ = "answers"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    question_id = Column(PGUUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    body = Column(Text, nullable=False)
    upvote_count = Column(Integer, nullable=False, default=0)
    downvote_count = Column(Integer, nullable=False, default=0)
    is_accepted = Column(Boolean, nullable=False, default=False)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    question = relationship("Question", back_populates="answers")
    upvotes = relationship("AnswerUpvote", back_populates="answer", cascade="all, delete-orphan")


class QuestionUpvote(Base):
    """Question upvotes"""
    __tablename__ = "question_upvotes"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    question_id = Column(PGUUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Relationships
    question = relationship("Question", back_populates="upvotes")


class AnswerUpvote(Base):
    """Answer upvotes"""
    __tablename__ = "answer_upvotes"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    answer_id = Column(PGUUID(as_uuid=True), ForeignKey("answers.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Relationships
    answer = relationship("Answer", back_populates="upvotes")
