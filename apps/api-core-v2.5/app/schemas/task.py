"""Pydantic schemas for task management API."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, validator

from app.db.models.task import TaskStatus, TaskPriority, TaskCategory, AchievementCategory


# ============================================================
# Task Schemas
# ============================================================

class TaskBase(BaseModel):
    """Base task schema."""
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    category: TaskCategory = Field(default=TaskCategory.CUSTOM, description="Task category")
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM, description="Task priority")
    due_date: Optional[datetime] = Field(None, description="Task due date")
    estimated_hours: Optional[int] = Field(None, ge=0, description="Estimated time in minutes")
    route_id: Optional[UUID] = Field(None, description="Associated route ID")
    notes: Optional[str] = Field(None, description="Additional notes")
    task_metadata: Optional[dict] = Field(None, description="Flexible metadata")


class TaskCreate(TaskBase):
    """Schema for creating a task."""
    subtasks: Optional[List[str]] = Field(None, description="List of subtask titles")


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[TaskCategory] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[int] = None
    notes: Optional[str] = None
    task_metadata: Optional[dict] = None


class TaskResponse(TaskBase):
    """Task response schema."""
    id: UUID
    user_id: UUID
    status: TaskStatus
    xp_reward: int
    level_requirement: Optional[int]
    streak_count: int
    completion_count: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    subtask_count: Optional[int] = 0
    completed_subtasks: Optional[int] = 0

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Response for task list."""
    tasks: List[TaskResponse]
    total: int
    filters_applied: dict = {}


# ============================================================
# SubTask Schemas
# ============================================================

class SubTaskCreate(BaseModel):
    """Schema for creating a subtask."""
    title: str = Field(..., min_length=1, max_length=255)
    position: int = Field(default=0, ge=0)


class SubTaskUpdate(BaseModel):
    """Schema for updating a subtask."""
    title: Optional[str] = None
    is_completed: Optional[bool] = None
    position: Optional[int] = None


class SubTaskResponse(BaseModel):
    """SubTask response schema."""
    id: UUID
    task_id: UUID
    title: str
    is_completed: bool
    position: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# User Progress Schemas
# ============================================================

class UserProgressResponse(BaseModel):
    """User progress and gamification stats."""
    user_id: UUID
    total_xp: int
    current_level: int
    level_title: str
    streak_current: int
    streak_best: int
    tasks_completed_today: int
    tasks_completed_total: int
    tasks_completed_this_week: int
    tasks_completed_this_month: int
    time_spent_minutes: int
    xp_to_next_level: int
    level_progress_percent: float
    last_activity_date: Optional[datetime]

    class Config:
        from_attributes = True


class UserProgressUpdate(BaseModel):
    """Schema for updating user progress."""
    total_xp: Optional[int] = None
    current_level: Optional[int] = None
    streak_current: Optional[int] = None
    streak_best: Optional[int] = None
    tasks_completed_today: Optional[int] = None
    tasks_completed_total: Optional[int] = None


# ============================================================
# Achievement Schemas
# ============================================================

class AchievementBase(BaseModel):
    """Base achievement schema."""
    name: str
    name_en: Optional[str]
    description: str
    icon: str
    xp_bonus: int
    category: AchievementCategory
    unlock_condition: dict


class AchievementResponse(AchievementBase):
    """Achievement response schema."""
    id: UUID
    is_active: bool
    display_order: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserAchievementResponse(BaseModel):
    """User's achievement with unlock status."""
    id: UUID
    achievement_id: UUID
    achievement: AchievementResponse
    unlocked_at: datetime
    progress: int
    claimed: bool

    class Config:
        from_attributes = True


class AchievementListResponse(BaseModel):
    """Response for achievement list."""
    achievements: List[AchievementResponse]
    total: int


class UserAchievementListResponse(BaseModel):
    """Response for user's achievements."""
    unlocked: List[UserAchievementResponse]
    locked: List[AchievementResponse]
    total_unlocked: int
    total_locked: int


# ============================================================
# Task Completion Schemas
# ============================================================

class TaskCompleteResponse(BaseModel):
    """Response when completing a task."""
    task: TaskResponse
    xp_earned: int
    total_xp: int
    level_up: bool
    new_level: Optional[int] = None
    streak_updated: bool
    new_streak: int
    achievements_unlocked: List[UserAchievementResponse] = []
    quests_updated: List[dict] = []  # NEW: Quest progress updates


class TaskStartResponse(BaseModel):
    """Response when starting a task."""
    task: TaskResponse
    message: str


# ============================================================
# Task Statistics Schemas
# ============================================================

class TaskStatistics(BaseModel):
    """Task completion statistics."""
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    blocked_tasks: int
    completion_rate: float
    avg_completion_time_hours: Optional[float]
    tasks_by_category: dict
    tasks_by_priority: dict
    tasks_completed_today: int
    tasks_completed_this_week: int
    tasks_completed_this_month: int
    current_streak: int
    best_streak: int


class DashboardStats(BaseModel):
    """Dashboard statistics overview."""
    progress: UserProgressResponse
    statistics: TaskStatistics
    today_tasks: List[TaskResponse]
    upcoming_deadlines: List[TaskResponse]
    recent_achievements: List[UserAchievementResponse]


# ============================================================
# Leaderboard Schemas
# ============================================================

class LeaderboardEntry(BaseModel):
    """Leaderboard entry."""
    rank: int
    user_id: UUID
    user_name: str
    user_email: str
    total_xp: int
    current_level: int
    level_title: str
    tasks_completed: int
    streak: int


class LeaderboardResponse(BaseModel):
    """Leaderboard response."""
    entries: List[LeaderboardEntry]
    user_rank: Optional[int] = None
    total_users: int


# ============================================================
# Task Template Schemas
# ============================================================

class TaskTemplateItem(BaseModel):
    """Task template item."""
    title: str
    description: Optional[str] = None
    category: TaskCategory
    priority: TaskPriority
    estimated_hours: Optional[int] = None
    xp_reward: int
    position: int = 0


class TaskTemplateResponse(BaseModel):
    """Task template for route types."""
    route_type: str
    route_type_label: str
    tasks: List[TaskTemplateItem]
    estimated_total_hours: int
    total_xp: int


# ============================================================
# Request/Response Wrappers
# ============================================================

class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response."""
    error: str
    detail: Optional[str] = None
    status_code: int
