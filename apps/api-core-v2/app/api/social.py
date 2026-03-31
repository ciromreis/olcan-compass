"""
Social API

REST endpoints for social features: activity feed, follows, notifications, profiles.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field

from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import User
from ..models.social import ActivityType, NotificationType
from ..services.social_service import SocialService

router = APIRouter(prefix="/social", tags=["social"])


# ============================================================================
# SCHEMAS
# ============================================================================

class ActivityCreate(BaseModel):
    activity_type: ActivityType
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None
    metadata: Optional[dict] = None
    is_public: bool = True


class ActivityResponse(BaseModel):
    id: str
    user_id: str
    activity_type: ActivityType
    title: str
    description: Optional[str]
    related_entity_type: Optional[str]
    related_entity_id: Optional[str]
    metadata: Optional[dict]
    is_public: bool
    like_count: int
    comment_count: int
    created_at: str

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    parent_comment_id: Optional[str] = None


class CommentResponse(BaseModel):
    id: str
    activity_id: str
    user_id: str
    content: str
    parent_comment_id: Optional[str]
    like_count: int
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    notification_type: NotificationType
    title: str
    message: Optional[str]
    related_entity_type: Optional[str]
    related_entity_id: Optional[str]
    action_url: Optional[str]
    metadata: Optional[dict]
    is_read: bool
    read_at: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    location: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    github_url: Optional[str] = None
    current_role: Optional[str] = Field(None, max_length=100)
    current_company: Optional[str] = Field(None, max_length=100)
    industry: Optional[str] = Field(None, max_length=100)
    skills: Optional[List[str]] = None
    is_profile_public: Optional[bool] = None
    show_activity: Optional[bool] = None
    show_achievements: Optional[bool] = None


class ProfileResponse(BaseModel):
    id: str
    user_id: str
    bio: Optional[str]
    avatar_url: Optional[str]
    banner_url: Optional[str]
    location: Optional[str]
    website: Optional[str]
    linkedin_url: Optional[str]
    twitter_url: Optional[str]
    github_url: Optional[str]
    current_role: Optional[str]
    current_company: Optional[str]
    industry: Optional[str]
    skills: Optional[List[str]]
    is_profile_public: bool
    show_activity: bool
    show_achievements: bool
    follower_count: int
    following_count: int
    activity_count: int
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class FollowResponse(BaseModel):
    id: str
    follower_id: str
    following_id: str
    notification_enabled: bool
    created_at: str

    class Config:
        from_attributes = True


# ============================================================================
# ACTIVITY FEED ENDPOINTS
# ============================================================================

@router.post("/activities", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
async def create_activity(
    activity_data: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new activity"""
    
    service = SocialService(db)
    
    activity = service.create_activity(
        user_id=current_user.id,
        **activity_data.model_dump()
    )
    
    return ActivityResponse(
        id=activity.id,
        user_id=activity.user_id,
        activity_type=activity.activity_type,
        title=activity.title,
        description=activity.description,
        related_entity_type=activity.related_entity_type,
        related_entity_id=activity.related_entity_id,
        metadata=activity.metadata,
        is_public=activity.is_public,
        like_count=activity.like_count,
        comment_count=activity.comment_count,
        created_at=activity.created_at.isoformat()
    )


@router.get("/feed", response_model=List[ActivityResponse])
async def get_activity_feed(
    include_following: bool = Query(default=True),
    activity_types: Optional[List[ActivityType]] = Query(default=None),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get personalized activity feed"""
    
    service = SocialService(db)
    
    activities = service.get_activity_feed(
        user_id=current_user.id,
        include_following=include_following,
        activity_types=activity_types,
        limit=limit,
        offset=offset
    )
    
    return [
        ActivityResponse(
            id=a.id,
            user_id=a.user_id,
            activity_type=a.activity_type,
            title=a.title,
            description=a.description,
            related_entity_type=a.related_entity_type,
            related_entity_id=a.related_entity_id,
            metadata=a.metadata,
            is_public=a.is_public,
            like_count=a.like_count,
            comment_count=a.comment_count,
            created_at=a.created_at.isoformat()
        )
        for a in activities
    ]


@router.get("/users/{user_id}/activities", response_model=List[ActivityResponse])
async def get_user_activities(
    user_id: str,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific user's activities"""
    
    service = SocialService(db)
    
    # Check if viewing own profile or public profile
    is_own_profile = user_id == current_user.id
    
    activities = service.get_user_activities(
        user_id=user_id,
        is_public_only=not is_own_profile,
        limit=limit,
        offset=offset
    )
    
    return [
        ActivityResponse(
            id=a.id,
            user_id=a.user_id,
            activity_type=a.activity_type,
            title=a.title,
            description=a.description,
            related_entity_type=a.related_entity_type,
            related_entity_id=a.related_entity_id,
            metadata=a.metadata,
            is_public=a.is_public,
            like_count=a.like_count,
            comment_count=a.comment_count,
            created_at=a.created_at.isoformat()
        )
        for a in activities
    ]


@router.post("/activities/{activity_id}/like", status_code=status.HTTP_201_CREATED)
async def like_activity(
    activity_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Like an activity"""
    
    service = SocialService(db)
    
    try:
        service.like_activity(activity_id, current_user.id)
        return {"message": "Activity liked"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/activities/{activity_id}/like", status_code=status.HTTP_204_NO_CONTENT)
async def unlike_activity(
    activity_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unlike an activity"""
    
    service = SocialService(db)
    
    try:
        service.unlike_activity(activity_id, current_user.id)
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/activities/{activity_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def comment_on_activity(
    activity_id: str,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Comment on an activity"""
    
    service = SocialService(db)
    
    comment = service.comment_on_activity(
        activity_id=activity_id,
        user_id=current_user.id,
        content=comment_data.content,
        parent_comment_id=comment_data.parent_comment_id
    )
    
    return CommentResponse(
        id=comment.id,
        activity_id=comment.activity_id,
        user_id=comment.user_id,
        content=comment.content,
        parent_comment_id=comment.parent_comment_id,
        like_count=comment.like_count,
        created_at=comment.created_at.isoformat(),
        updated_at=comment.updated_at.isoformat()
    )


@router.get("/activities/{activity_id}/comments", response_model=List[CommentResponse])
async def get_activity_comments(
    activity_id: str,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Get comments for an activity"""
    
    service = SocialService(db)
    
    comments = service.get_activity_comments(activity_id, limit=limit, offset=offset)
    
    return [
        CommentResponse(
            id=c.id,
            activity_id=c.activity_id,
            user_id=c.user_id,
            content=c.content,
            parent_comment_id=c.parent_comment_id,
            like_count=c.like_count,
            created_at=c.created_at.isoformat(),
            updated_at=c.updated_at.isoformat()
        )
        for c in comments
    ]


# ============================================================================
# FOLLOW ENDPOINTS
# ============================================================================

@router.post("/users/{user_id}/follow", response_model=FollowResponse, status_code=status.HTTP_201_CREATED)
async def follow_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Follow a user"""
    
    service = SocialService(db)
    
    try:
        follow = service.follow_user(current_user.id, user_id)
        
        return FollowResponse(
            id=follow.id,
            follower_id=follow.follower_id,
            following_id=follow.following_id,
            notification_enabled=follow.notification_enabled,
            created_at=follow.created_at.isoformat()
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/users/{user_id}/follow", status_code=status.HTTP_204_NO_CONTENT)
async def unfollow_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unfollow a user"""
    
    service = SocialService(db)
    
    try:
        service.unfollow_user(current_user.id, user_id)
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/users/{user_id}/followers", response_model=List[FollowResponse])
async def get_followers(
    user_id: str,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Get user's followers"""
    
    service = SocialService(db)
    
    followers = service.get_followers(user_id, limit=limit, offset=offset)
    
    return [
        FollowResponse(
            id=f.id,
            follower_id=f.follower_id,
            following_id=f.following_id,
            notification_enabled=f.notification_enabled,
            created_at=f.created_at.isoformat()
        )
        for f in followers
    ]


@router.get("/users/{user_id}/following", response_model=List[FollowResponse])
async def get_following(
    user_id: str,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Get users that user is following"""
    
    service = SocialService(db)
    
    following = service.get_following(user_id, limit=limit, offset=offset)
    
    return [
        FollowResponse(
            id=f.id,
            follower_id=f.follower_id,
            following_id=f.following_id,
            notification_enabled=f.notification_enabled,
            created_at=f.created_at.isoformat()
        )
        for f in following
    ]


# ============================================================================
# NOTIFICATION ENDPOINTS
# ============================================================================

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    is_read: Optional[bool] = None,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's notifications"""
    
    service = SocialService(db)
    
    notifications = service.get_notifications(
        user_id=current_user.id,
        is_read=is_read,
        limit=limit,
        offset=offset
    )
    
    return [
        NotificationResponse(
            id=n.id,
            user_id=n.user_id,
            notification_type=n.notification_type,
            title=n.title,
            message=n.message,
            related_entity_type=n.related_entity_type,
            related_entity_id=n.related_entity_id,
            action_url=n.action_url,
            metadata=n.metadata,
            is_read=n.is_read,
            read_at=n.read_at.isoformat() if n.read_at else None,
            created_at=n.created_at.isoformat()
        )
        for n in notifications
    ]


@router.get("/notifications/unread-count")
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications"""
    
    service = SocialService(db)
    count = service.get_unread_count(current_user.id)
    
    return {"count": count}


@router.patch("/notifications/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark notification as read"""
    
    service = SocialService(db)
    
    try:
        notification = service.mark_notification_read(notification_id, current_user.id)
        
        return NotificationResponse(
            id=notification.id,
            user_id=notification.user_id,
            notification_type=notification.notification_type,
            title=notification.title,
            message=notification.message,
            related_entity_type=notification.related_entity_type,
            related_entity_id=notification.related_entity_id,
            action_url=notification.action_url,
            metadata=notification.metadata,
            is_read=notification.is_read,
            read_at=notification.read_at.isoformat() if notification.read_at else None,
            created_at=notification.created_at.isoformat()
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/notifications/mark-all-read")
async def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read"""
    
    service = SocialService(db)
    count = service.mark_all_notifications_read(current_user.id)
    
    return {"message": f"Marked {count} notifications as read"}


# ============================================================================
# PROFILE ENDPOINTS
# ============================================================================

@router.get("/profile", response_model=ProfileResponse)
async def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's profile"""
    
    service = SocialService(db)
    profile = service.get_or_create_profile(current_user.id)
    
    return ProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        bio=profile.bio,
        avatar_url=profile.avatar_url,
        banner_url=profile.banner_url,
        location=profile.location,
        website=profile.website,
        linkedin_url=profile.linkedin_url,
        twitter_url=profile.twitter_url,
        github_url=profile.github_url,
        current_role=profile.current_role,
        current_company=profile.current_company,
        industry=profile.industry,
        skills=profile.skills,
        is_profile_public=profile.is_profile_public,
        show_activity=profile.show_activity,
        show_achievements=profile.show_achievements,
        follower_count=profile.follower_count,
        following_count=profile.following_count,
        activity_count=profile.activity_count,
        created_at=profile.created_at.isoformat(),
        updated_at=profile.updated_at.isoformat()
    )


@router.get("/users/{user_id}/profile", response_model=ProfileResponse)
async def get_user_profile(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get specific user's profile"""
    
    service = SocialService(db)
    profile = service.get_profile(user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    if not profile.is_profile_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Profile is private"
        )
    
    return ProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        bio=profile.bio,
        avatar_url=profile.avatar_url,
        banner_url=profile.banner_url,
        location=profile.location,
        website=profile.website,
        linkedin_url=profile.linkedin_url,
        twitter_url=profile.twitter_url,
        github_url=profile.github_url,
        current_role=profile.current_role,
        current_company=profile.current_company,
        industry=profile.industry,
        skills=profile.skills,
        is_profile_public=profile.is_profile_public,
        show_activity=profile.show_activity,
        show_achievements=profile.show_achievements,
        follower_count=profile.follower_count,
        following_count=profile.following_count,
        activity_count=profile.activity_count,
        created_at=profile.created_at.isoformat(),
        updated_at=profile.updated_at.isoformat()
    )


@router.patch("/profile", response_model=ProfileResponse)
async def update_profile(
    updates: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile"""
    
    service = SocialService(db)
    
    profile = service.update_profile(
        user_id=current_user.id,
        updates=updates.model_dump(exclude_unset=True)
    )
    
    return ProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        bio=profile.bio,
        avatar_url=profile.avatar_url,
        banner_url=profile.banner_url,
        location=profile.location,
        website=profile.website,
        linkedin_url=profile.linkedin_url,
        twitter_url=profile.twitter_url,
        github_url=profile.github_url,
        current_role=profile.current_role,
        current_company=profile.current_company,
        industry=profile.industry,
        skills=profile.skills,
        is_profile_public=profile.is_profile_public,
        show_activity=profile.show_activity,
        show_achievements=profile.show_achievements,
        follower_count=profile.follower_count,
        following_count=profile.following_count,
        activity_count=profile.activity_count,
        created_at=profile.created_at.isoformat(),
        updated_at=profile.updated_at.isoformat()
    )
