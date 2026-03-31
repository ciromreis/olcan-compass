# 🔌 Olcan Compass v2.5 - API Reference

**Last Updated**: March 29, 2026  
**Base URL**: `http://localhost:8000` (development)  
**API Version**: v2.5  
**Authentication**: Bearer Token (JWT)

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Companions & Evolution](#companions--evolution)
3. [Documents](#documents)
4. [Interviews](#interviews)
5. [Marketplace](#marketplace)
6. [Guilds](#guilds)
7. [Response Formats](#response-formats)
8. [Error Codes](#error-codes)

---

## Authentication

All endpoints require authentication unless specified otherwise.

**Header Format:**
```
Authorization: Bearer <your_jwt_token>
```

---

## Companions & Evolution

### Get Companion Evolution Eligibility
Check if companion is eligible to evolve.

```http
GET /companions/{companion_id}/evolution/check
```

**Response:**
```json
{
  "is_eligible": true,
  "current_stage": "young",
  "next_stage": "mature",
  "requirements": {
    "min_level": 10,
    "min_xp": 5000,
    "min_care_streak": 7,
    "required_activities": ["feed", "train", "play"]
  },
  "progress": {
    "level": 12,
    "xp": 6500,
    "care_streak": 10,
    "completed_activities": ["feed", "train", "play", "rest"]
  },
  "missing_requirements": []
}
```

### Evolve Companion
Trigger companion evolution.

```http
POST /companions/{companion_id}/evolution
```

**Response:**
```json
{
  "id": "evo_123",
  "companion_id": "comp_456",
  "from_stage": "young",
  "to_stage": "mature",
  "stat_bonuses": {
    "power": 5,
    "wisdom": 3,
    "charisma": 4,
    "agility": 2
  },
  "evolved_at": "2026-03-29T10:30:00Z"
}
```

### Get Evolution History
Get companion's evolution history.

```http
GET /companions/{companion_id}/evolution/history
```

**Response:**
```json
[
  {
    "id": "evo_123",
    "from_stage": "young",
    "to_stage": "mature",
    "evolved_at": "2026-03-29T10:30:00Z"
  }
]
```

### Get Activity History
Get companion's recent activities.

```http
GET /companions/{companion_id}/activities?limit=20&offset=0
```

**Response:**
```json
[
  {
    "activity_type": "feed",
    "xp_gained": 50,
    "energy_change": -10,
    "performed_at": "2026-03-29T10:00:00Z"
  }
]
```

---

## Documents

### Create Document
Create a new career document.

```http
POST /documents
```

**Request Body:**
```json
{
  "title": "Software Engineer Resume",
  "document_type": "resume",
  "template_id": "modern-resume",
  "companion_id": "comp_456"
}
```

**Response:**
```json
{
  "id": "doc_789",
  "user_id": "user_123",
  "companion_id": "comp_456",
  "title": "Software Engineer Resume",
  "document_type": "resume",
  "status": "draft",
  "content": {
    "sections": [...]
  },
  "version": 1,
  "ai_suggestions_count": 0,
  "companion_contribution_score": 0,
  "created_at": "2026-03-29T10:30:00Z",
  "updated_at": "2026-03-29T10:30:00Z"
}
```

### List Documents
Get user's documents with filtering.

```http
GET /documents?document_type=resume&status=draft&limit=50&offset=0
```

**Query Parameters:**
- `document_type`: Filter by type (resume, cover_letter, portfolio, etc.)
- `status`: Filter by status (draft, in_review, completed, archived)
- `limit`: Results per page (default: 50, max: 100)
- `offset`: Pagination offset

**Response:**
```json
[
  {
    "id": "doc_789",
    "title": "Software Engineer Resume",
    "document_type": "resume",
    "status": "draft",
    "updated_at": "2026-03-29T10:30:00Z"
  }
]
```

### Get Document
Get specific document details.

```http
GET /documents/{document_id}
```

### Update Document
Update document content or metadata.

```http
PATCH /documents/{document_id}
```

**Request Body:**
```json
{
  "title": "Senior Software Engineer Resume",
  "content": {...},
  "status": "completed"
}
```

### Create Document Version
Create a new version of existing document.

```http
POST /documents/{document_id}/version
```

**Request Body:**
```json
{
  "title": "Software Engineer Resume v2"
}
```

### Delete Document
Delete a document.

```http
DELETE /documents/{document_id}
```

### Request AI Review
Request AI-powered review of document.

```http
POST /documents/{document_id}/review
```

**Response:**
```json
{
  "id": "review_123",
  "document_id": "doc_789",
  "overall_score": 85,
  "strengths": [
    "Clear and concise language",
    "Well-structured sections"
  ],
  "improvements": [
    "Add more quantifiable achievements",
    "Include industry keywords"
  ],
  "detailed_feedback": "Your document shows strong potential...",
  "section_scores": {
    "summary": 80,
    "experience": 90
  },
  "created_at": "2026-03-29T10:30:00Z"
}
```

### Get Templates
Get available document templates.

```http
GET /documents/templates/?document_type=resume&is_premium=false
```

**Response:**
```json
[
  {
    "id": "modern-resume",
    "name": "Modern Professional",
    "description": "Clean, modern design",
    "document_type": "resume",
    "is_premium": 0,
    "difficulty_level": "beginner",
    "usage_count": 1250
  }
]
```

---

## Interviews

### Create Interview
Create a new interview practice session.

```http
POST /interviews
```

**Request Body:**
```json
{
  "title": "Google Behavioral Interview",
  "interview_type": "behavioral",
  "difficulty": "intermediate",
  "template_id": "behavioral-tech",
  "target_company": "Google",
  "target_role": "Software Engineer"
}
```

**Response:**
```json
{
  "id": "int_456",
  "title": "Google Behavioral Interview",
  "interview_type": "behavioral",
  "difficulty": "intermediate",
  "status": "scheduled",
  "questions": [
    {
      "id": "q1",
      "text": "Tell me about a time...",
      "context": "This assesses problem-solving"
    }
  ],
  "created_at": "2026-03-29T10:30:00Z"
}
```

### List Interviews
Get user's interview sessions.

```http
GET /interviews?interview_type=behavioral&status=completed&limit=50
```

### Get Interview
Get specific interview details.

```http
GET /interviews/{interview_id}
```

### Start Interview
Begin an interview session.

```http
POST /interviews/{interview_id}/start
```

**Response:**
```json
{
  "id": "int_456",
  "status": "in_progress",
  "started_at": "2026-03-29T10:30:00Z"
}
```

### Submit Response
Submit answer to interview question.

```http
POST /interviews/{interview_id}/respond
```

**Request Body:**
```json
{
  "question_id": "q1",
  "response_text": "In my previous role at...",
  "response_metadata": {
    "time_taken_seconds": 180
  }
}
```

### Complete Interview
Finish interview and get AI feedback.

```http
POST /interviews/{interview_id}/complete
```

**Response:**
```json
{
  "id": "int_456",
  "status": "completed",
  "overall_score": 82,
  "feedback_summary": "Strong responses with good examples",
  "strengths": [
    "Clear communication",
    "Specific examples"
  ],
  "areas_for_improvement": [
    "Add more quantifiable results"
  ],
  "confidence_score": 0.85,
  "communication_score": 0.90,
  "duration_minutes": 45,
  "completed_at": "2026-03-29T11:15:00Z"
}
```

### Get Templates
Get available interview templates.

```http
GET /interviews/templates/?interview_type=technical&difficulty=advanced
```

---

## Marketplace

### Create Resource
Create a new marketplace resource.

```http
POST /marketplace/resources
```

**Request Body:**
```json
{
  "title": "Ultimate Resume Template Pack",
  "description": "10 professional resume templates",
  "resource_type": "template",
  "category": "resume_writing",
  "price": 29.99,
  "tags": ["resume", "professional", "tech"],
  "difficulty_level": "beginner"
}
```

### List Resources
Browse marketplace resources.

```http
GET /marketplace/resources?category=resume_writing&min_price=0&max_price=50&sort_by=rating&limit=50
```

**Query Parameters:**
- `resource_type`: Filter by type (template, guide, course, etc.)
- `category`: Filter by category
- `min_price`, `max_price`: Price range
- `search`: Search query
- `sort_by`: Sort order (created_at, price_asc, price_desc, rating, popular)

**Response:**
```json
[
  {
    "id": "res_123",
    "title": "Ultimate Resume Template Pack",
    "resource_type": "template",
    "category": "resume_writing",
    "price": 29.99,
    "rating": 4.8,
    "review_count": 156,
    "purchase_count": 1200,
    "slug": "ultimate-resume-template-pack"
  }
]
```

### Get Featured Resources
Get featured/popular resources.

```http
GET /marketplace/resources/featured?limit=10
```

### Get Resource
Get specific resource details.

```http
GET /marketplace/resources/{resource_id}
```

### Update Resource
Update resource (creator only).

```http
PATCH /marketplace/resources/{resource_id}
```

### Publish Resource
Publish resource to marketplace.

```http
POST /marketplace/resources/{resource_id}/publish
```

### Purchase Resource
Purchase a resource.

```http
POST /marketplace/resources/{resource_id}/purchase
```

**Response:**
```json
{
  "id": "pur_789",
  "resource_id": "res_123",
  "amount_paid": 29.99,
  "currency": "USD",
  "status": "completed",
  "purchased_at": "2026-03-29T10:30:00Z"
}
```

### Get Purchases
Get user's purchase history.

```http
GET /marketplace/purchases?limit=50
```

### Create Review
Review a purchased resource.

```http
POST /marketplace/resources/{resource_id}/reviews
```

**Request Body:**
```json
{
  "rating": 5,
  "title": "Excellent templates!",
  "comment": "These templates helped me land 3 interviews"
}
```

### Get Reviews
Get resource reviews.

```http
GET /marketplace/resources/{resource_id}/reviews?limit=50
```

### Create Collection
Create a resource collection/bundle.

```http
POST /marketplace/collections
```

**Request Body:**
```json
{
  "title": "Complete Job Search Bundle",
  "description": "Everything you need",
  "resource_ids": ["res_123", "res_456"],
  "price": 79.99,
  "discount_percentage": 20
}
```

---

## Guilds

### Create Guild
Create a new guild.

```http
POST /guilds
```

**Request Body:**
```json
{
  "name": "Tech Career Accelerators",
  "description": "Supporting tech professionals",
  "is_public": true,
  "max_members": 50,
  "tags": ["tech", "career", "networking"]
}
```

**Response:**
```json
{
  "id": "guild_123",
  "name": "Tech Career Accelerators",
  "level": 1,
  "xp": 0,
  "total_members": 1,
  "is_public": true,
  "created_at": "2026-03-29T10:30:00Z"
}
```

### List Guilds
Browse available guilds.

```http
GET /guilds?search=tech&is_public=true&sort_by=members&limit=50
```

**Query Parameters:**
- `search`: Search query
- `tags`: Filter by tags
- `is_public`: Filter public/private
- `sort_by`: Sort order (created_at, members, level, xp)

### Get My Guilds
Get guilds user is member of.

```http
GET /guilds/my-guilds
```

### Get Guild
Get specific guild details.

```http
GET /guilds/{guild_id}
```

### Update Guild
Update guild settings (leader/officer only).

```http
PATCH /guilds/{guild_id}
```

**Request Body:**
```json
{
  "description": "Updated description",
  "is_public": false,
  "max_members": 100
}
```

### Join Guild
Join a public guild.

```http
POST /guilds/{guild_id}/join
```

**Response:**
```json
{
  "id": "mem_456",
  "guild_id": "guild_123",
  "user_id": "user_789",
  "role": "member",
  "status": "active",
  "joined_at": "2026-03-29T10:30:00Z"
}
```

### Leave Guild
Leave a guild.

```http
POST /guilds/{guild_id}/leave
```

### Get Guild Members
Get guild member list.

```http
GET /guilds/{guild_id}/members?status=active&limit=100
```

**Response:**
```json
[
  {
    "id": "mem_456",
    "user_id": "user_789",
    "role": "leader",
    "contribution_points": 1500,
    "joined_at": "2026-03-29T10:30:00Z"
  }
]
```

### Update Member Role
Change member role (leader only).

```http
PATCH /guilds/{guild_id}/members/{user_id}/role
```

**Request Body:**
```json
{
  "new_role": "officer"
}
```

### Kick Member
Remove member from guild (leader/officer).

```http
DELETE /guilds/{guild_id}/members/{user_id}
```

### Create Event
Create a guild event.

```http
POST /guilds/{guild_id}/events
```

**Request Body:**
```json
{
  "name": "Weekly Strategy Session",
  "description": "Discuss career strategies",
  "event_type": "social",
  "start_time": "2026-03-30T18:00:00Z",
  "max_participants": 20
}
```

### Get Guild Events
Get guild's events.

```http
GET /guilds/{guild_id}/events?status=scheduled&limit=50
```

### Join Event
Join a guild event.

```http
POST /guilds/events/{event_id}/join
```

---

## Response Formats

### Success Response
```json
{
  "data": {...},
  "message": "Success"
}
```

### Error Response
```json
{
  "detail": "Error message",
  "error_code": "VALIDATION_ERROR"
}
```

### Paginated Response
```json
{
  "items": [...],
  "total": 150,
  "limit": 50,
  "offset": 0,
  "has_more": true
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Rate Limits

- **Default**: 100 requests per minute per user
- **Burst**: 200 requests per minute
- **Headers**:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## Webhooks (Coming Soon)

Future webhook events:
- `companion.evolved`
- `achievement.unlocked`
- `document.completed`
- `interview.completed`
- `resource.purchased`
- `guild.event.created`

---

**API Documentation**: Auto-generated Swagger docs available at `/docs`  
**Support**: For API support, contact the development team  
**Changelog**: See `CHANGELOG.md` for API version history
