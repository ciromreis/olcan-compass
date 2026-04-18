"""Boards API Routes

Endpoints for Pinterest-like board collections.
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc

from app.core.auth import get_current_user
from app.db.session import get_db
from app.db.models import User

router = APIRouter(prefix="/boards", tags=["Boards"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class CreateBoardRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    cover_image_url: Optional[str] = Field(None, max_length=500)
    visibility: str = Field(default="public", max_length=20)
    board_type: str = Field(default="general", max_length=50)


class UpdateBoardRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    cover_image_url: Optional[str] = Field(None, max_length=500)
    visibility: Optional[str] = Field(None, max_length=20)
    board_type: Optional[str] = Field(None, max_length=50)


class BoardResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    cover_image_url: Optional[str]
    visibility: str
    board_type: str
    item_count: int
    follower_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AddItemRequest(BaseModel):
    item_type: str = Field(..., max_length=50)  # post, product, chronicle, external_link
    item_id: Optional[UUID] = None
    external_url: Optional[str] = Field(None, max_length=1000)
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = Field(None, max_length=500)
    item_metadata: Optional[dict] = None
    notes: Optional[str] = None


class BoardItemResponse(BaseModel):
    id: UUID
    board_id: UUID
    user_id: UUID
    item_type: str
    item_id: Optional[UUID]
    external_url: Optional[str]
    title: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    metadata: Optional[dict]
    notes: Optional[str]
    position: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Board Endpoints
# ---------------------------------------------------------------------------

@router.post("/", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
async def create_board(
    request: CreateBoardRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new board"""
    from app.db.models.social import UserBoard
    
    board = UserBoard(
        user_id=current_user.id,
        name=request.name,
        description=request.description,
        cover_image_url=request.cover_image_url,
        visibility=request.visibility,
        board_type=request.board_type,
        item_count=0,
        follower_count=0
    )
    
    db.add(board)
    await db.commit()
    await db.refresh(board)
    
    return board


@router.get("/", response_model=List[BoardResponse])
async def list_boards(
    user_id: Optional[UUID] = Query(None),
    board_type: Optional[str] = Query(None),
    public_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List boards"""
    from app.db.models.social import UserBoard
    
    query = select(UserBoard)
    
    if user_id:
        query = query.where(UserBoard.user_id == user_id)
    
    if public_only and (not current_user or (user_id and user_id != current_user.id)):
        query = query.where(UserBoard.visibility == "public")
    
    if board_type:
        query = query.where(UserBoard.board_type == board_type)
    
    query = query.order_by(desc(UserBoard.updated_at)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    boards = result.scalars().all()
    
    return boards


@router.get("/{board_id}", response_model=BoardResponse)
async def get_board(
    board_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get board by ID"""
    from app.db.models.social import UserBoard
    
    result = await db.execute(
        select(UserBoard).where(UserBoard.id == board_id)
    )
    board = result.scalar_one_or_none()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    return board


@router.put("/{board_id}", response_model=BoardResponse)
async def update_board(
    board_id: UUID,
    request: UpdateBoardRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a board (owner only)"""
    from app.db.models.social import UserBoard
    
    result = await db.execute(
        select(UserBoard).where(
            and_(
                UserBoard.id == board_id,
                UserBoard.user_id == current_user.id
            )
        )
    )
    board = result.scalar_one_or_none()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found or not authorized"
        )
    
    # Update fields
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(board, field, value)
    
    board.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(board)
    
    return board


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board(
    board_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a board (owner only)"""
    from app.db.models.social import UserBoard
    
    result = await db.execute(
        select(UserBoard).where(
            and_(
                UserBoard.id == board_id,
                UserBoard.user_id == current_user.id
            )
        )
    )
    board = result.scalar_one_or_none()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found or not authorized"
        )
    
    await db.delete(board)
    await db.commit()


# ---------------------------------------------------------------------------
# Board Item Endpoints
# ---------------------------------------------------------------------------

@router.post("/{board_id}/items", response_model=BoardItemResponse, status_code=status.HTTP_201_CREATED)
async def add_item_to_board(
    board_id: UUID,
    request: AddItemRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add an item to a board"""
    from app.db.models.social import UserBoard, BoardItem
    
    # Check if board exists and user owns it
    result = await db.execute(
        select(UserBoard).where(
            and_(
                UserBoard.id == board_id,
                UserBoard.user_id == current_user.id
            )
        )
    )
    board = result.scalar_one_or_none()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found or not authorized"
        )
    
    # Get next position
    result = await db.execute(
        select(BoardItem)
        .where(BoardItem.board_id == board_id)
        .order_by(desc(BoardItem.position))
        .limit(1)
    )
    last_item = result.scalar_one_or_none()
    next_position = (last_item.position + 1) if last_item else 0
    
    # Create item
    item = BoardItem(
        board_id=board_id,
        user_id=current_user.id,
        item_type=request.item_type,
        item_id=request.item_id,
        external_url=request.external_url,
        title=request.title,
        description=request.description,
        thumbnail_url=request.thumbnail_url,
        item_metadata=request.item_metadata or {},
        notes=request.notes,
        position=next_position
    )
    
    db.add(item)
    
    # Increment board item count
    board.item_count += 1
    board.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(item)
    
    return item


@router.get("/{board_id}/items", response_model=List[BoardItemResponse])
async def get_board_items(
    board_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """Get items in a board"""
    from app.db.models.social import BoardItem
    
    result = await db.execute(
        select(BoardItem)
        .where(BoardItem.board_id == board_id)
        .order_by(BoardItem.position)
        .offset(skip)
        .limit(limit)
    )
    items = result.scalars().all()
    
    return items


@router.delete("/{board_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_item_from_board(
    board_id: UUID,
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove an item from a board"""
    from app.db.models.social import UserBoard, BoardItem
    
    # Get item
    result = await db.execute(
        select(BoardItem).where(
            and_(
                BoardItem.id == item_id,
                BoardItem.board_id == board_id,
                BoardItem.user_id == current_user.id
            )
        )
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found or not authorized"
        )
    
    # Delete item
    await db.delete(item)
    
    # Decrement board item count
    result = await db.execute(
        select(UserBoard).where(UserBoard.id == board_id)
    )
    board = result.scalar_one_or_none()
    if board and board.item_count > 0:
        board.item_count -= 1
        board.updated_at = datetime.utcnow()
    
    await db.commit()


@router.post("/{board_id}/follow", status_code=status.HTTP_201_CREATED)
async def follow_board(
    board_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Follow a board"""
    from app.db.models.social import UserBoard, BoardFollower
    
    # Check if board exists
    result = await db.execute(
        select(UserBoard).where(UserBoard.id == board_id)
    )
    board = result.scalar_one_or_none()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    # Check if already following
    result = await db.execute(
        select(BoardFollower).where(
            and_(
                BoardFollower.board_id == board_id,
                BoardFollower.user_id == current_user.id
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already following this board"
        )
    
    # Create follower
    follower = BoardFollower(
        board_id=board_id,
        user_id=current_user.id
    )
    db.add(follower)
    
    # Increment follower count
    board.follower_count += 1
    
    await db.commit()
    
    return {"message": "Board followed successfully"}


@router.delete("/{board_id}/follow", status_code=status.HTTP_204_NO_CONTENT)
async def unfollow_board(
    board_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Unfollow a board"""
    from app.db.models.social import UserBoard, BoardFollower
    
    # Get follower
    result = await db.execute(
        select(BoardFollower).where(
            and_(
                BoardFollower.board_id == board_id,
                BoardFollower.user_id == current_user.id
            )
        )
    )
    follower = result.scalar_one_or_none()
    
    if not follower:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not following this board"
        )
    
    # Delete follower
    await db.delete(follower)
    
    # Decrement follower count
    result = await db.execute(
        select(UserBoard).where(UserBoard.id == board_id)
    )
    board = result.scalar_one_or_none()
    if board and board.follower_count > 0:
        board.follower_count -= 1
    
    await db.commit()


@router.get("/my/boards", response_model=List[BoardResponse])
async def get_my_boards(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's boards"""
    from app.db.models.social import UserBoard
    
    result = await db.execute(
        select(UserBoard)
        .where(UserBoard.user_id == current_user.id)
        .order_by(desc(UserBoard.updated_at))
    )
    boards = result.scalars().all()
    
    return boards
