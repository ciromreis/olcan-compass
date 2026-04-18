"""Social API Routes

Endpoints for posts, boards, saved references, and Q&A.
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import User

router = APIRouter(prefix="/social", tags=["Social"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class CreatePostRequest(BaseModel):
    post_type: str = Field(..., max_length=50)  # blog, social, artifact, reference
    title: str = Field(..., min_length=1, max_length=500)
    content: Optional[str] = None
    excerpt: Optional[str] = Field(None, max_length=500)
    media_urls: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    visibility: str = Field(default="public", max_length=20)
    journey_stage: Optional[str] = Field(None, max_length=50)
    related_archetype: Optional[str] = Field(None, max_length=50)


class UpdatePostRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = None
    excerpt: Optional[str] = Field(None, max_length=500)
    media_urls: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    visibility: Optional[str] = Field(None, max_length=20)


class PostResponse(BaseModel):
    id: UUID
    user_id: UUID
    post_type: str
    title: str
    content: Optional[str]
    excerpt: Optional[str]
    media_urls: Optional[List[str]]
    tags: Optional[List[str]]
    visibility: str
    is_olcan_official: bool
    is_featured: bool
    journey_stage: Optional[str]
    related_archetype: Optional[str]
    like_count: int
    comment_count: int
    view_count: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class CreateCommentRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class CommentResponse(BaseModel):
    id: UUID
    post_id: UUID
    user_id: UUID
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class SaveReferenceRequest(BaseModel):
    reference_type: str = Field(..., max_length=50)
    source_platform: Optional[str] = Field(None, max_length=50)
    source_url: str = Field(..., max_length=1000)
    title: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = Field(None, max_length=500)
    author: Optional[str] = Field(None, max_length=200)
    tags: Optional[List[str]] = None


class SavedReferenceResponse(BaseModel):
    id: UUID
    user_id: UUID
    reference_type: str
    source_platform: Optional[str]
    source_url: str
    title: Optional[str]
    description: Optional[str]
    thumbnail_url: Optional[str]
    author: Optional[str]
    tags: Optional[List[str]]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Post Endpoints
# ---------------------------------------------------------------------------

@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    request: CreatePostRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new post"""
    from app.db.models.social import UserPost
    
    post = UserPost(
        user_id=current_user.id,
        post_type=request.post_type,
        title=request.title,
        content=request.content,
        excerpt=request.excerpt,
        media_urls=request.media_urls,
        tags=request.tags or [],
        visibility=request.visibility,
        journey_stage=request.journey_stage,
        related_archetype=request.related_archetype,
        is_olcan_official=False,
        is_featured=False,
        like_count=0,
        comment_count=0,
        view_count=0,
        published_at=datetime.utcnow()
    )
    
    db.add(post)
    await db.commit()
    await db.refresh(post)
    
    return post


@router.get("/posts", response_model=List[PostResponse])
async def list_posts(
    post_type: Optional[str] = Query(None),
    journey_stage: Optional[str] = Query(None),
    archetype: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    search: Optional[str] = Query(None),
    featured_only: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List posts with filters"""
    from app.db.models.social import UserPost
    
    query = select(UserPost).where(UserPost.visibility == "public")
    
    if post_type:
        query = query.where(UserPost.post_type == post_type)
    
    if journey_stage:
        query = query.where(UserPost.journey_stage == journey_stage)
    
    if archetype:
        query = query.where(UserPost.related_archetype == archetype)
    
    if featured_only:
        query = query.where(UserPost.is_featured == True)
    
    if tags:
        # PostgreSQL array overlap
        query = query.where(UserPost.tags.overlap(tags))
    
    if search:
        # Full-text search on title and content
        query = query.where(
            or_(
                UserPost.title.ilike(f"%{search}%"),
                UserPost.content.ilike(f"%{search}%")
            )
        )
    
    query = query.order_by(desc(UserPost.published_at)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    posts = result.scalars().all()
    
    return posts


@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get post by ID and increment view count"""
    from app.db.models.social import UserPost
    
    result = await db.execute(
        select(UserPost).where(UserPost.id == post_id)
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Increment view count
    post.view_count += 1
    await db.commit()
    await db.refresh(post)
    
    return post


@router.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: UUID,
    request: UpdatePostRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a post (author only)"""
    from app.db.models.social import UserPost
    
    result = await db.execute(
        select(UserPost).where(
            and_(
                UserPost.id == post_id,
                UserPost.user_id == current_user.id
            )
        )
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or not authorized"
        )
    
    # Update fields
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(post, field, value)
    
    post.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(post)
    
    return post


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a post (author only)"""
    from app.db.models.social import UserPost
    
    result = await db.execute(
        select(UserPost).where(
            and_(
                UserPost.id == post_id,
                UserPost.user_id == current_user.id
            )
        )
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or not authorized"
        )
    
    await db.delete(post)
    await db.commit()


@router.post("/posts/{post_id}/like", status_code=status.HTTP_201_CREATED)
async def like_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Like a post"""
    from app.db.models.social import UserPost, PostLike
    
    # Check if post exists
    result = await db.execute(
        select(UserPost).where(UserPost.id == post_id)
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if already liked
    result = await db.execute(
        select(PostLike).where(
            and_(
                PostLike.post_id == post_id,
                PostLike.user_id == current_user.id
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Post already liked"
        )
    
    # Create like
    like = PostLike(
        post_id=post_id,
        user_id=current_user.id
    )
    db.add(like)
    
    # Increment like count
    post.like_count += 1
    
    await db.commit()
    
    return {"message": "Post liked successfully"}


@router.delete("/posts/{post_id}/like", status_code=status.HTTP_204_NO_CONTENT)
async def unlike_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Unlike a post"""
    from app.db.models.social import UserPost, PostLike
    
    # Get like
    result = await db.execute(
        select(PostLike).where(
            and_(
                PostLike.post_id == post_id,
                PostLike.user_id == current_user.id
            )
        )
    )
    like = result.scalar_one_or_none()
    
    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Like not found"
        )
    
    # Delete like
    await db.delete(like)
    
    # Decrement like count
    result = await db.execute(
        select(UserPost).where(UserPost.id == post_id)
    )
    post = result.scalar_one_or_none()
    if post and post.like_count > 0:
        post.like_count -= 1
    
    await db.commit()


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: UUID,
    request: CreateCommentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a comment to a post"""
    from app.db.models.social import UserPost, PostComment
    
    # Check if post exists
    result = await db.execute(
        select(UserPost).where(UserPost.id == post_id)
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Create comment
    comment = PostComment(
        post_id=post_id,
        user_id=current_user.id,
        content=request.content
    )
    db.add(comment)
    
    # Increment comment count
    post.comment_count += 1
    
    await db.commit()
    await db.refresh(comment)
    
    return comment


@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
async def get_post_comments(
    post_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """Get comments for a post"""
    from app.db.models.social import PostComment
    
    result = await db.execute(
        select(PostComment)
        .where(PostComment.post_id == post_id)
        .order_by(PostComment.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    comments = result.scalars().all()
    
    return comments


# ---------------------------------------------------------------------------
# Saved References Endpoints
# ---------------------------------------------------------------------------

@router.post("/references", response_model=SavedReferenceResponse, status_code=status.HTTP_201_CREATED)
async def save_reference(
    request: SaveReferenceRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Save an external reference"""
    from app.db.models.social import SavedReference
    
    # Check if already saved
    result = await db.execute(
        select(SavedReference).where(
            and_(
                SavedReference.user_id == current_user.id,
                SavedReference.source_url == request.source_url
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Reference already saved"
        )
    
    # Create reference
    reference = SavedReference(
        user_id=current_user.id,
        reference_type=request.reference_type,
        source_platform=request.source_platform,
        source_url=request.source_url,
        title=request.title,
        description=request.description,
        thumbnail_url=request.thumbnail_url,
        author=request.author,
        tags=request.tags or []
    )
    
    db.add(reference)
    await db.commit()
    await db.refresh(reference)
    
    return reference


@router.get("/references", response_model=List[SavedReferenceResponse])
async def list_saved_references(
    reference_type: Optional[str] = Query(None),
    source_platform: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's saved references"""
    from app.db.models.social import SavedReference
    
    query = select(SavedReference).where(SavedReference.user_id == current_user.id)
    
    if reference_type:
        query = query.where(SavedReference.reference_type == reference_type)
    
    if source_platform:
        query = query.where(SavedReference.source_platform == source_platform)
    
    if tags:
        query = query.where(SavedReference.tags.overlap(tags))
    
    query = query.order_by(desc(SavedReference.created_at)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    references = result.scalars().all()
    
    return references


@router.delete("/references/{reference_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reference(
    reference_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a saved reference"""
    from app.db.models.social import SavedReference
    
    result = await db.execute(
        select(SavedReference).where(
            and_(
                SavedReference.id == reference_id,
                SavedReference.user_id == current_user.id
            )
        )
    )
    reference = result.scalar_one_or_none()
    
    if not reference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reference not found"
        )
    
    await db.delete(reference)
    await db.commit()


@router.get("/my/posts", response_model=List[PostResponse])
async def get_my_posts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's posts"""
    from app.db.models.social import UserPost
    
    result = await db.execute(
        select(UserPost)
        .where(UserPost.user_id == current_user.id)
        .order_by(desc(UserPost.created_at))
    )
    posts = result.scalars().all()
    
    return posts
