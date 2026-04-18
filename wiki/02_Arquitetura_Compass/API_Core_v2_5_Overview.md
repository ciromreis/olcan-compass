---
title: API Core v2.5 Overview
type: drawer
layer: 2
status: active
last_seen: 2026-04-17
backlinks:
  - Arquitetura_v2_5_Compass
  - Verdade_do_Produto
---

# Olcan Compass v2.5 Backend API

## Overview

This is the enhanced backend API for Olcan Compass v2.5, built with FastAPI and PostgreSQL. It provides authentication, companion management, marketplace features, and user progress tracking.

## Key Features

- **JWT Authentication**: Secure user authentication with access and refresh tokens
- **Companion System**: Full CRUD operations for AI companions with training and evolution
- **Marketplace**: Provider profiles, services, reviews, and messaging
- **User Progress**: XP tracking, achievements, quests, and gamification
- **Guild System**: Social features with guilds, members, and events

## Architecture

### Database Models
- **User**: User accounts with authentication and profiles
- **Companion**: AI companions with stats, abilities, and evolution
- **Marketplace**: Providers, services, reviews, conversations, messages
- **Progress**: User progress, achievements, quests
- **Guild**: Guilds, members, events

### API Endpoints

#### V2.5 Enhanced Endpoints (prefix: `/api/v2.5`)

**Authentication** (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT tokens
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - Logout user

**Companions** (`/companions`)
- `GET /companions` - Get all user companions
- `GET /companions/{id}` - Get specific companion
- `POST /companions/{id}/feed` - Feed companion
- `POST /companions/{id}/train` - Train companion

**Marketplace** (`/marketplace`)
- `GET /marketplace/providers` - List all providers
- `GET /marketplace/providers/{id}` - Get provider details
- `POST /marketplace/providers/{id}/contact` - Contact provider
- `GET /marketplace/conversations` - Get user conversations
- `GET /marketplace/conversations/{id}/messages` - Get messages

**Users** (`/users`)
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/progress` - Get user progress and stats
- `GET /users/{id}` - Get public user info

## Setup Instructions

### Prerequisites
- Python 3.10+
- PostgreSQL 15+
- pip or poetry

### Installation

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up PostgreSQL**
   ```bash
   # Start PostgreSQL
   brew services start postgresql
   
   # Create database
   createdb compass
   ```

3. **Configure environment**
   ```bash
   # Copy .env file and update values
   cp .env.example .env
   ```

4. **Run migrations** (if using Alembic)
   ```bash
   alembic upgrade head
   ```

5. **Start the server**
   ```bash
   # Using the startup script
   ./start_v25.sh
   
   # Or manually
   uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
   ```

## Environment Variables

```bash
# API Configuration
APP_NAME=olcan-compass-api
ENV=development
PORT=8001

# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/compass

# JWT Authentication
JWT_SECRET_KEY=your-secret-key-minimum-32-characters
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ALLOW_ORIGINS=http://localhost:3000,http://localhost:3001
```

## API Integration

### Frontend Integration

Update your frontend `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v2.5
```

### Example API Calls

**Register User**
```javascript
const response = await fetch('http://localhost:8001/api/v2.5/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'username',
    password: 'SecurePass123',
    full_name: 'John Doe'
  })
});
```

**Login**
```javascript
const formData = new FormData();
formData.append('username', 'username');
formData.append('password', 'SecurePass123');

const response = await fetch('http://localhost:8001/api/v2.5/auth/login', {
  method: 'POST',
  body: formData
});

const { access_token } = await response.json();
```

**Get Companions**
```javascript
const response = await fetch('http://localhost:8001/api/v2.5/companions', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});
```

## Development

### Running Tests
```bash
pytest
```

### Code Quality
```bash
# Format code
black app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Deployment

### Production Checklist
- [ ] Update `JWT_SECRET_KEY` to secure random string
- [ ] Set `ENV=production`
- [ ] Configure production database URL
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure logging and monitoring
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Configure Sentry for error tracking

### Docker Deployment
```bash
# Build image
docker build -t olcan-compass-api:v2.5 .

# Run container
docker run -p 8001:8001 --env-file .env olcan-compass-api:v2.5
```

## Compatibility

### V2.0 Compatibility
This v2.5 backend is designed to run alongside the existing v2.0 backend:
- V2.0 runs on port 8000
- V2.5 runs on port 8001
- Both can coexist during migration period
- V2.5 endpoints are prefixed with `/api/v2.5`

### Migration Strategy
1. Deploy v2.5 backend on separate port
2. Gradually migrate frontend features to v2.5 endpoints
3. Monitor both systems during transition
4. Deprecate v2.0 endpoints once migration complete

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check database exists
psql -l | grep compass

# Test connection
psql -h localhost -U postgres -d compass
```

### Port Conflicts
If port 8001 is in use:
```bash
# Find process using port
lsof -i :8001

# Kill process
kill -9 <PID>
```

### Import Errors
```bash
# Reinstall dependencies
pip install --force-reinstall -r requirements.txt

# Check Python path
python -c "import sys; print(sys.path)"
```

## Contributing

1. Create feature branch from `main`
2. Make changes with tests
3. Run code quality checks
4. Submit pull request
5. Wait for review and approval

## Support

For issues and questions:
- GitHub Issues: [repository-url]
- Documentation: [docs-url]
- Email: support@olcancompass.com

## License

Proprietary - All rights reserved
