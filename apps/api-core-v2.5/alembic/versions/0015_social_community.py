"""add social community tables

Revision ID: 0015_social_community
Revises: 5d7b157b1dca
Create Date: 2026-04-10

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0015_social_community'
down_revision = '5d7b157b1dca'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ============================================================
    # User Posts (Olcan-authored and user-authored content)
    # ============================================================
    op.create_table(
        'user_posts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('post_type', sa.String(50), nullable=False, index=True),  # blog, social, artifact, reference
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('excerpt', sa.String(500), nullable=True),
        sa.Column('media_urls', postgresql.JSONB(), nullable=True),  # Array of media URLs
        sa.Column('tags', postgresql.ARRAY(sa.String(50)), nullable=True, index=True),
        sa.Column('visibility', sa.String(20), nullable=False, server_default='public'),  # public, private, followers
        sa.Column('is_olcan_official', sa.Boolean(), nullable=False, server_default='false', index=True),
        sa.Column('is_featured', sa.Boolean(), nullable=False, server_default='false', index=True),
        sa.Column('journey_stage', sa.String(50), nullable=True, index=True),  # discovery, preparation, application, etc.
        sa.Column('related_archetype', sa.String(50), nullable=True, index=True),
        sa.Column('like_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('comment_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('view_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('idx_user_posts_user_created', 'user_posts', ['user_id', 'created_at'])
    op.create_index('idx_user_posts_type_published', 'user_posts', ['post_type', 'published_at'])

    # ============================================================
    # User Boards (Pinterest-like collections)
    # ============================================================
    op.create_table(
        'user_boards',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('cover_image_url', sa.String(500), nullable=True),
        sa.Column('visibility', sa.String(20), nullable=False, server_default='public'),
        sa.Column('board_type', sa.String(50), nullable=False, server_default='general'),  # general, application, route, inspiration
        sa.Column('item_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('follower_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('idx_user_boards_user_created', 'user_boards', ['user_id', 'created_at'])

    # ============================================================
    # Board Items (Items saved to boards)
    # ============================================================
    op.create_table(
        'board_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('board_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('user_boards.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('item_type', sa.String(50), nullable=False, index=True),  # post, product, chronicle, external_link
        sa.Column('item_id', postgresql.UUID(as_uuid=True), nullable=True),  # ID of post, product, etc.
        sa.Column('external_url', sa.String(1000), nullable=True),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('thumbnail_url', sa.String(500), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),  # User's personal notes
        sa.Column('position', sa.Integer(), nullable=False, server_default='0'),  # For ordering
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('idx_board_items_board_position', 'board_items', ['board_id', 'position'])

    # ============================================================
    # Saved References (Quick-save for later)
    # ============================================================
    op.create_table(
        'saved_references',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('reference_type', sa.String(50), nullable=False, index=True),  # social_post, article, video, document
        sa.Column('source_platform', sa.String(50), nullable=True),  # instagram, twitter, linkedin, youtube, etc.
        sa.Column('source_url', sa.String(1000), nullable=False),
        sa.Column('title', sa.String(500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('thumbnail_url', sa.String(500), nullable=True),
        sa.Column('author', sa.String(200), nullable=True),
        sa.Column('tags', postgresql.ARRAY(sa.String(50)), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('idx_saved_references_user_created', 'saved_references', ['user_id', 'created_at'])

    # ============================================================
    # Questions (Community Q&A)
    # ============================================================
    op.create_table(
        'questions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tags', postgresql.ARRAY(sa.String(50)), nullable=True, index=True),
        sa.Column('category', sa.String(50), nullable=True, index=True),  # visa, application, documents, routes, etc.
        sa.Column('journey_stage', sa.String(50), nullable=True, index=True),
        sa.Column('is_answered', sa.Boolean(), nullable=False, server_default='false', index=True),
        sa.Column('accepted_answer_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('answer_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('vote_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('view_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('idx_questions_category_created', 'questions', ['category', 'created_at'])
    op.create_index('idx_questions_answered', 'questions', ['is_answered', 'created_at'])

    # ============================================================
    # Answers (Responses to questions)
    # ============================================================
    op.create_table(
        'question_answers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('question_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_accepted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_from_expert', sa.Boolean(), nullable=False, server_default='false'),  # Olcan team or verified expert
        sa.Column('vote_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('idx_question_answers_question_created', 'question_answers', ['question_id', 'created_at'])

    # Add foreign key for accepted answer
    op.create_foreign_key(
        'fk_questions_accepted_answer',
        'questions', 'question_answers',
        ['accepted_answer_id'], ['id'],
        ondelete='SET NULL'
    )

    # ============================================================
    # Post Likes
    # ============================================================
    op.create_table(
        'post_likes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('post_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('user_posts.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('post_id', 'user_id', name='uq_post_likes_post_user'),
    )

    # ============================================================
    # Post Comments
    # ============================================================
    op.create_table(
        'post_comments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('post_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('user_posts.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('parent_comment_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('post_comments.id', ondelete='CASCADE'), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('like_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('idx_post_comments_post_created', 'post_comments', ['post_id', 'created_at'])

    # ============================================================
    # User Follows (Social graph)
    # ============================================================
    op.create_table(
        'user_follows',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('follower_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('following_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('follower_id', 'following_id', name='uq_user_follows_follower_following'),
    )
    op.create_index('idx_user_follows_following', 'user_follows', ['following_id'])

    # ============================================================
    # Board Follows
    # ============================================================
    op.create_table(
        'board_follows',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('board_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('user_boards.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('user_id', 'board_id', name='uq_board_follows_user_board'),
    )


def downgrade() -> None:
    op.drop_table('board_follows')
    op.drop_table('user_follows')
    op.drop_table('post_comments')
    op.drop_table('post_likes')
    op.drop_table('question_answers')
    op.drop_table('questions')
    op.drop_table('saved_references')
    op.drop_table('board_items')
    op.drop_table('user_boards')
    op.drop_table('user_posts')
