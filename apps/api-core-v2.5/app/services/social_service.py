"""
Social Service

Business logic for social features: activity feed, follows, notifications, profiles.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, and_
from datetime import datetime
import uuid

from ..models.social import (
    Activity,
    Follow,
    ActivityLike,
    ActivityComment,
    Notification,
    UserProfile,
    Badge,
    UserBadge,
    ActivityType,
    NotificationType
)
from ..models.user import User


class SocialService:
    """Service for managing social features"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # ============================================================================
    # ACTIVITY FEED
    # ============================================================================
    
    def create_activity(
        self,
        user_id: str,
        activity_type: ActivityType,
        title: str,
        description: Optional[str] = None,
        related_entity_type: Optional[str] = None,
        related_entity_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        is_public: bool = True
    ) -> Activity:
        """Create a new activity"""
        
        activity = Activity(
            id=str(uuid.uuid4()),
            user_id=user_id,
            activity_type=activity_type,
            title=title,
            description=description,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
            metadata=metadata,
            is_public=is_public
        )
        
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        
        return activity
    
    def get_activity_feed(
        self,
        user_id: str,
        include_following: bool = True,
        activity_types: Optional[List[ActivityType]] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Activity]:
        """Get personalized activity feed"""
        
        query = self.db.query(Activity).filter(Activity.is_public == True)
        
        if include_following:
            # Get users that current user follows
            following_ids = self.db.query(Follow.following_id).filter(
                Follow.follower_id == user_id
            ).all()
            following_ids = [f[0] for f in following_ids]
            
            # Include own activities and activities from followed users
            query = query.filter(
                or_(
                    Activity.user_id == user_id,
                    Activity.user_id.in_(following_ids)
                )
            )
        else:
            # Only own activities
            query = query.filter(Activity.user_id == user_id)
        
        if activity_types:
            query = query.filter(Activity.activity_type.in_(activity_types))
        
        activities = query.order_by(Activity.created_at.desc()).offset(offset).limit(limit).all()
        
        return activities
    
    def get_user_activities(
        self,
        user_id: str,
        is_public_only: bool = True,
        limit: int = 50,
        offset: int = 0
    ) -> List[Activity]:
        """Get specific user's activities"""
        
        query = self.db.query(Activity).filter(Activity.user_id == user_id)
        
        if is_public_only:
            query = query.filter(Activity.is_public == True)
        
        activities = query.order_by(Activity.created_at.desc()).offset(offset).limit(limit).all()
        
        return activities
    
    def like_activity(self, activity_id: str, user_id: str) -> ActivityLike:
        """Like an activity"""
        
        # Check if already liked
        existing = self.db.query(ActivityLike).filter(
            ActivityLike.activity_id == activity_id,
            ActivityLike.user_id == user_id
        ).first()
        
        if existing:
            raise ValueError("Already liked this activity")
        
        # Create like
        like = ActivityLike(
            id=str(uuid.uuid4()),
            activity_id=activity_id,
            user_id=user_id
        )
        
        self.db.add(like)
        
        # Update activity like count
        activity = self.db.query(Activity).filter(Activity.id == activity_id).first()
        if activity:
            activity.like_count += 1
        
        self.db.commit()
        self.db.refresh(like)
        
        return like
    
    def unlike_activity(self, activity_id: str, user_id: str) -> bool:
        """Unlike an activity"""
        
        like = self.db.query(ActivityLike).filter(
            ActivityLike.activity_id == activity_id,
            ActivityLike.user_id == user_id
        ).first()
        
        if not like:
            raise ValueError("Not liked")
        
        self.db.delete(like)
        
        # Update activity like count
        activity = self.db.query(Activity).filter(Activity.id == activity_id).first()
        if activity and activity.like_count > 0:
            activity.like_count -= 1
        
        self.db.commit()
        
        return True
    
    def comment_on_activity(
        self,
        activity_id: str,
        user_id: str,
        content: str,
        parent_comment_id: Optional[str] = None
    ) -> ActivityComment:
        """Comment on an activity"""
        
        comment = ActivityComment(
            id=str(uuid.uuid4()),
            activity_id=activity_id,
            user_id=user_id,
            content=content,
            parent_comment_id=parent_comment_id
        )
        
        self.db.add(comment)
        
        # Update activity comment count
        activity = self.db.query(Activity).filter(Activity.id == activity_id).first()
        if activity:
            activity.comment_count += 1
        
        self.db.commit()
        self.db.refresh(comment)
        
        return comment
    
    def get_activity_comments(
        self,
        activity_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[ActivityComment]:
        """Get comments for an activity"""
        
        comments = self.db.query(ActivityComment).filter(
            ActivityComment.activity_id == activity_id,
            ActivityComment.parent_comment_id == None  # Top-level comments only
        ).order_by(ActivityComment.created_at.desc()).offset(offset).limit(limit).all()
        
        return comments
    
    # ============================================================================
    # FOLLOW SYSTEM
    # ============================================================================
    
    def follow_user(self, follower_id: str, following_id: str) -> Follow:
        """Follow a user"""
        
        if follower_id == following_id:
            raise ValueError("Cannot follow yourself")
        
        # Check if already following
        existing = self.db.query(Follow).filter(
            Follow.follower_id == follower_id,
            Follow.following_id == following_id
        ).first()
        
        if existing:
            raise ValueError("Already following this user")
        
        # Create follow
        follow = Follow(
            id=str(uuid.uuid4()),
            follower_id=follower_id,
            following_id=following_id
        )
        
        self.db.add(follow)
        
        # Update profile stats
        follower_profile = self.get_or_create_profile(follower_id)
        following_profile = self.get_or_create_profile(following_id)
        
        follower_profile.following_count += 1
        following_profile.follower_count += 1
        
        self.db.commit()
        self.db.refresh(follow)
        
        # Create notification
        self.create_notification(
            user_id=following_id,
            notification_type=NotificationType.FOLLOWER,
            title="New Follower",
            message=f"You have a new follower",
            related_entity_type="user",
            related_entity_id=follower_id
        )
        
        return follow
    
    def unfollow_user(self, follower_id: str, following_id: str) -> bool:
        """Unfollow a user"""
        
        follow = self.db.query(Follow).filter(
            Follow.follower_id == follower_id,
            Follow.following_id == following_id
        ).first()
        
        if not follow:
            raise ValueError("Not following this user")
        
        self.db.delete(follow)
        
        # Update profile stats
        follower_profile = self.get_or_create_profile(follower_id)
        following_profile = self.get_or_create_profile(following_id)
        
        if follower_profile.following_count > 0:
            follower_profile.following_count -= 1
        if following_profile.follower_count > 0:
            following_profile.follower_count -= 1
        
        self.db.commit()
        
        return True
    
    def get_followers(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Follow]:
        """Get user's followers"""
        
        followers = self.db.query(Follow).filter(
            Follow.following_id == user_id
        ).order_by(Follow.created_at.desc()).offset(offset).limit(limit).all()
        
        return followers
    
    def get_following(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Follow]:
        """Get users that user is following"""
        
        following = self.db.query(Follow).filter(
            Follow.follower_id == user_id
        ).order_by(Follow.created_at.desc()).offset(offset).limit(limit).all()
        
        return following
    
    def is_following(self, follower_id: str, following_id: str) -> bool:
        """Check if user is following another user"""
        
        follow = self.db.query(Follow).filter(
            Follow.follower_id == follower_id,
            Follow.following_id == following_id
        ).first()
        
        return follow is not None
    
    # ============================================================================
    # NOTIFICATIONS
    # ============================================================================
    
    def create_notification(
        self,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: Optional[str] = None,
        related_entity_type: Optional[str] = None,
        related_entity_id: Optional[str] = None,
        action_url: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Notification:
        """Create a notification"""
        
        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
            action_url=action_url,
            metadata=metadata
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        return notification
    
    def get_notifications(
        self,
        user_id: str,
        is_read: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Notification]:
        """Get user's notifications"""
        
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        
        if is_read is not None:
            query = query.filter(Notification.is_read == is_read)
        
        notifications = query.order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()
        
        return notifications
    
    def mark_notification_read(self, notification_id: str, user_id: str) -> Notification:
        """Mark notification as read"""
        
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if not notification:
            raise ValueError("Notification not found")
        
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(notification)
        
        return notification
    
    def mark_all_notifications_read(self, user_id: str) -> int:
        """Mark all notifications as read"""
        
        count = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({
            "is_read": True,
            "read_at": datetime.utcnow()
        })
        
        self.db.commit()
        
        return count
    
    def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications"""
        
        count = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
        
        return count
    
    # ============================================================================
    # USER PROFILES
    # ============================================================================
    
    def get_or_create_profile(self, user_id: str) -> UserProfile:
        """Get or create user profile"""
        
        profile = self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        
        if not profile:
            profile = UserProfile(
                id=str(uuid.uuid4()),
                user_id=user_id
            )
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)
        
        return profile
    
    def update_profile(
        self,
        user_id: str,
        updates: Dict[str, Any]
    ) -> UserProfile:
        """Update user profile"""
        
        profile = self.get_or_create_profile(user_id)
        
        # Update allowed fields
        allowed_fields = [
            'bio', 'avatar_url', 'banner_url', 'location', 'website',
            'linkedin_url', 'twitter_url', 'github_url',
            'current_role', 'current_company', 'industry', 'skills',
            'is_profile_public', 'show_activity', 'show_achievements'
        ]
        
        for field in allowed_fields:
            if field in updates:
                setattr(profile, field, updates[field])
        
        profile.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(profile)
        
        return profile
    
    def get_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile"""
        
        return self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    # ============================================================================
    # BADGES
    # ============================================================================
    
    def award_badge(
        self,
        user_id: str,
        badge_id: str,
        awarded_for: Optional[str] = None
    ) -> UserBadge:
        """Award a badge to user"""
        
        # Check if already has badge
        existing = self.db.query(UserBadge).filter(
            UserBadge.user_id == user_id,
            UserBadge.badge_id == badge_id
        ).first()
        
        if existing:
            raise ValueError("User already has this badge")
        
        # Create user badge
        user_badge = UserBadge(
            id=str(uuid.uuid4()),
            user_id=user_id,
            badge_id=badge_id,
            awarded_for=awarded_for
        )
        
        self.db.add(user_badge)
        
        # Update badge stats
        badge = self.db.query(Badge).filter(Badge.id == badge_id).first()
        if badge:
            badge.total_awarded += 1
        
        self.db.commit()
        self.db.refresh(user_badge)
        
        # Create notification
        self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.ACHIEVEMENT,
            title="Badge Earned!",
            message=f"You earned a new badge",
            related_entity_type="badge",
            related_entity_id=badge_id
        )
        
        return user_badge
    
    def get_user_badges(self, user_id: str) -> List[UserBadge]:
        """Get user's badges"""
        
        badges = self.db.query(UserBadge).filter(
            UserBadge.user_id == user_id
        ).order_by(UserBadge.awarded_at.desc()).all()
        
        return badges
    
    def set_displayed_badges(self, user_id: str, badge_ids: List[str]) -> List[UserBadge]:
        """Set which badges to display on profile"""
        
        # Reset all badges
        self.db.query(UserBadge).filter(
            UserBadge.user_id == user_id
        ).update({"is_displayed": False})
        
        # Set selected badges as displayed
        for i, badge_id in enumerate(badge_ids[:5]):  # Max 5 displayed
            user_badge = self.db.query(UserBadge).filter(
                UserBadge.user_id == user_id,
                UserBadge.badge_id == badge_id
            ).first()
            
            if user_badge:
                user_badge.is_displayed = True
                user_badge.display_order = i
        
        self.db.commit()
        
        return self.get_user_badges(user_id)
