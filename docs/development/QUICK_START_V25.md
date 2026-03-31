# 🚀 Olcan Compass v2.5 - Quick Start Guide

## Immediate Next Steps

### 1. Start the Backend (5 minutes)

```bash
# Navigate to backend directory
cd apps/api-core-v2

# Ensure PostgreSQL is running
brew services start postgresql

# Create database if needed
createdb compass

# Install dependencies (if not already done)
pip install -r requirements.txt

# Start v2.5 backend
./start_v25.sh

# Backend will be available at: http://localhost:8001
```

### 2. Test Backend Health (2 minutes)

```bash
# Test health endpoint
curl http://localhost:8001/health

# Expected response:
# {"status":"healthy","version":"2.5.0"}

# Test v2.5 API availability
curl http://localhost:8001/api/v2.5/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123",
    "full_name": "Test User"
  }'
```

### 3. Start the Frontend (3 minutes)

```bash
# Navigate to frontend directory
cd apps/app-compass-v2

# Update .env.local for v2.5 API
echo "NEXT_PUBLIC_API_URL=http://localhost:8001/api/v2.5" >> .env.local

# Start frontend
npm run dev

# Frontend will be available at: http://localhost:3000
```

### 4. Test Full Stack (5 minutes)

1. **Open browser**: http://localhost:3000
2. **Register a new user** via the UI
3. **Login** with credentials
4. **Test companion features**
5. **Check marketplace**

---

## File Structure Reference

```
olcan-compass/
├── apps/
│   ├── app-compass-v2/          # Frontend (Next.js)
│   │   ├── src/
│   │   │   ├── app/             # Pages and routes
│   │   │   ├── components/      # React components
│   │   │   ├── stores/          # Zustand state
│   │   │   └── lib/             # Utilities
│   │   └── .env.local           # Frontend config
│   │
│   └── api-core-v2/             # Backend (FastAPI)
│       ├── app/
│       │   ├── api/v1/          # V2.5 endpoints
│       │   ├── core/            # Database, auth
│       │   ├── models/          # Database models
│       │   ├── schemas/         # Pydantic schemas
│       │   └── services/        # Business logic
│       ├── start_v25.sh         # Startup script
│       └── README_V25.md        # Full documentation
│
├── packages/
│   └── ui-components/           # Shared UI library
│
└── V2_5_DEVELOPMENT_COMPLETE.md # This session's work
```

---

## API Endpoints Quick Reference

### Base URL
```
http://localhost:8001/api/v2.5
```

### Authentication
```bash
# Register
POST /auth/register
Body: { email, username, password, full_name }

# Login
POST /auth/login
Body: FormData { username, password }
Returns: { access_token, refresh_token }

# Get Current User
GET /auth/me
Headers: { Authorization: "Bearer <token>" }
```

### Companions
```bash
# List companions
GET /companions
Headers: { Authorization: "Bearer <token>" }

# Get companion
GET /companions/{id}
Headers: { Authorization: "Bearer <token>" }

# Feed companion
POST /companions/{id}/feed
Headers: { Authorization: "Bearer <token>" }

# Train companion
POST /companions/{id}/train
Headers: { Authorization: "Bearer <token>" }
```

### Marketplace
```bash
# List providers
GET /marketplace/providers

# Get provider details
GET /marketplace/providers/{id}

# Contact provider
POST /marketplace/providers/{id}/contact
Headers: { Authorization: "Bearer <token>" }
Body: { message }
```

---

## Common Issues & Solutions

### Backend won't start
```bash
# Check PostgreSQL
pg_isready -h localhost -p 5432

# If not running:
brew services start postgresql

# Check port availability
lsof -i :8001

# If port in use, kill process:
kill -9 <PID>
```

### Database connection failed
```bash
# Create database
createdb compass

# Test connection
psql -h localhost -U postgres -d compass

# Check DATABASE_URL in .env
cat apps/api-core-v2/.env | grep DATABASE_URL
```

### Import errors
```bash
# Reinstall dependencies
cd apps/api-core-v2
pip install --force-reinstall -r requirements.txt

# Check Python version
python --version  # Should be 3.10+
```

### Frontend API errors
```bash
# Check .env.local
cat apps/app-compass-v2/.env.local

# Should contain:
# NEXT_PUBLIC_API_URL=http://localhost:8001/api/v2.5

# Restart frontend after changing .env
npm run dev
```

---

## Development Workflow

### Making Backend Changes
```bash
cd apps/api-core-v2

# 1. Make changes to code
# 2. Backend auto-reloads (uvicorn --reload)
# 3. Test endpoint
curl http://localhost:8001/api/v2.5/...
```

### Making Frontend Changes
```bash
cd apps/app-compass-v2

# 1. Make changes to code
# 2. Frontend auto-reloads (Next.js dev)
# 3. Check browser
open http://localhost:3000
```

### Database Changes
```bash
cd apps/api-core-v2

# 1. Modify models in app/models/
# 2. Create migration
alembic revision --autogenerate -m "description"

# 3. Apply migration
alembic upgrade head

# 4. Rollback if needed
alembic downgrade -1
```

---

## Testing Checklist

### Backend Tests
- [ ] Health endpoint responds
- [ ] Database connection works
- [ ] User registration works
- [ ] Login returns JWT token
- [ ] Protected endpoints require auth
- [ ] Companion CRUD operations work
- [ ] Marketplace endpoints respond

### Frontend Tests
- [ ] App loads without errors
- [ ] Registration form works
- [ ] Login form works
- [ ] Dashboard displays
- [ ] Companion page functional
- [ ] Marketplace page loads
- [ ] Theme system works

### Integration Tests
- [ ] Frontend can register users
- [ ] Frontend can login users
- [ ] JWT token stored correctly
- [ ] Protected routes work
- [ ] API calls successful
- [ ] Error handling works

---

## Next Development Priorities

### High Priority
1. Complete backend testing
2. Frontend API integration
3. Authentication flow end-to-end
4. Companion operations testing

### Medium Priority
1. WebSocket implementation
2. Real-time features
3. File upload system
4. Email verification

### Low Priority
1. Admin dashboard
2. Analytics
3. Performance optimization
4. Production deployment

---

## Resources

### Documentation
- `V2_5_DEVELOPMENT_COMPLETE.md` - Complete session summary
- `apps/api-core-v2/README_V25.md` - Backend documentation
- `archive/documentation/` - Assessment and roadmap docs

### Code References
- Backend API: `apps/api-core-v2/app/api/v1/`
- Frontend: `apps/app-compass-v2/src/`
- UI Components: `packages/ui-components/src/`

### External Resources
- FastAPI Docs: https://fastapi.tiangolo.com
- Next.js Docs: https://nextjs.org/docs
- SQLAlchemy Docs: https://docs.sqlalchemy.org

---

## Support

If you encounter issues:
1. Check this guide first
2. Review `V2_5_DEVELOPMENT_COMPLETE.md`
3. Check backend logs in terminal
4. Check browser console for frontend errors
5. Review `.env` and `.env.local` configuration

---

**Quick Start Complete!** 🎉

You should now have:
- ✅ Backend running on port 8001
- ✅ Frontend running on port 3000
- ✅ Database connected
- ✅ API endpoints available

**Next**: Test the authentication flow and start integrating features!
