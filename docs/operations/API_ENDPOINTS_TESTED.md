# 🚀 Olcan Compass v2.5 - API Endpoints Testing Guide

**Last Updated**: March 25, 2026, 10:40 PM  
**Status**: All Core Endpoints Tested and Working ✅

---

## 📋 Quick Reference

**Base URL**: `http://localhost:8001/api/v1`  
**Authentication**: Bearer token in `Authorization` header  
**Content-Type**: `application/json` (except login which uses form data)

---

## ✅ Tested & Working Endpoints

### Authentication Endpoints

#### 1. Register User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "myuser",
  "password": "MyPass123!",
  "full_name": "My Name"
}

# Response (201 Created)
{
  "email": "user@example.com",
  "username": "myuser",
  "full_name": "My Name",
  "id": 1,
  "level": 1,
  "xp": 0,
  "is_active": true,
  "is_verified": false,
  "is_premium": false,
  "created_at": "2026-03-26T00:53:44"
}
```

**Test Command**:
```bash
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"Test123!","full_name":"Test User"}'
```

#### 2. Login
```bash
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=myuser&password=MyPass123!

# Response (200 OK)
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Test Command**:
```bash
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=Test123!"
```

#### 3. Get Current User
```bash
GET /api/v1/auth/me
Authorization: Bearer <access_token>

# Response (200 OK)
{
  "email": "test@test.com",
  "username": "testuser",
  "full_name": "Test User",
  "id": 1,
  "level": 1,
  "xp": 0,
  "is_active": true,
  "is_verified": false,
  "is_premium": false,
  "created_at": "2026-03-26T00:53:44"
}
```

**Test Command**:
```bash
TOKEN="<your_access_token>"
curl http://localhost:8001/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

### Companion Endpoints

#### 4. Get All Companions
```bash
GET /api/v1/companions/
Authorization: Bearer <access_token>

# Response (200 OK)
[
  {
    "id": 1,
    "name": "Sparky",
    "type": "fox",
    "level": 1,
    "xp": 60,
    "xp_to_next": 500,
    "evolution_stage": "egg",
    "abilities": [],
    "stats": {
      "power": 70,
      "wisdom": 70,
      "charisma": 70,
      "agility": 70
    },
    "current_health": 100.0,
    "max_health": 100.0,
    "energy": 90.0,
    "max_energy": 100.0,
    "created_at": "2026-03-26T01:39:27"
  }
]
```

**Test Command**:
```bash
curl http://localhost:8001/api/v1/companions/ \
  -H "Authorization: Bearer $TOKEN"
```

#### 5. Create Companion
```bash
POST /api/v1/companions/?name=<name>&companion_type=<type>
Authorization: Bearer <access_token>

# Response (201 Created)
{
  "id": 1,
  "name": "Sparky",
  "type": "fox",
  "level": 1,
  "xp": 0,
  "xp_to_next": 500,
  "evolution_stage": "egg",
  "abilities": [],
  "stats": {
    "power": 70,
    "wisdom": 70,
    "charisma": 70,
    "agility": 70
  },
  "current_health": 100.0,
  "max_health": 100.0,
  "energy": 100.0,
  "max_energy": 100.0,
  "created_at": "2026-03-26T01:39:27"
}
```

**Test Command**:
```bash
curl -X POST "http://localhost:8001/api/v1/companions/?name=Sparky&companion_type=fox" \
  -H "Authorization: Bearer $TOKEN"
```

#### 6. Get Specific Companion
```bash
GET /api/v1/companions/{companion_id}
Authorization: Bearer <access_token>

# Response (200 OK)
{
  "id": 1,
  "name": "Sparky",
  "type": "fox",
  "level": 1,
  "xp": 60,
  "xp_to_next": 500,
  "evolution_stage": "egg",
  "abilities": [],
  "stats": {...},
  "current_health": 100.0,
  "max_health": 100.0,
  "energy": 90.0,
  "max_energy": 100.0,
  "created_at": "2026-03-26T01:39:27",
  "updated_at": "2026-03-26T01:40:15"
}
```

**Test Command**:
```bash
curl http://localhost:8001/api/v1/companions/1 \
  -H "Authorization: Bearer $TOKEN"
```

#### 7. Feed Companion
```bash
POST /api/v1/companions/{companion_id}/feed
Authorization: Bearer <access_token>

# Response (200 OK)
{
  "message": "Companion fed successfully",
  "energy": 100.0,
  "xp": 10
}
```

**Test Command**:
```bash
curl -X POST http://localhost:8001/api/v1/companions/1/feed \
  -H "Authorization: Bearer $TOKEN"
```

**Effects**:
- Restores 20 energy (max 100)
- Grants 10 XP
- Creates activity record

#### 8. Train Companion
```bash
POST /api/v1/companions/{companion_id}/train
Authorization: Bearer <access_token>

# Response (200 OK)
{
  "message": "Companion trained successfully",
  "level": 1,
  "xp": 60,
  "energy": 90.0
}
```

**Test Command**:
```bash
curl -X POST http://localhost:8001/api/v1/companions/1/train \
  -H "Authorization: Bearer $TOKEN"
```

**Effects**:
- Costs 10 energy
- Grants 50 XP
- May trigger level up
- Creates activity record

**Requirements**:
- Companion must have at least 10 energy

---

### Marketplace Endpoints

#### 9. Get All Providers
```bash
GET /api/v1/marketplace/providers/
Authorization: Bearer <access_token>

# Optional query parameters:
# ?category=<category>
# ?search=<search_term>

# Response (200 OK)
[]  # Empty array if no providers
```

**Test Command**:
```bash
curl http://localhost:8001/api/v1/marketplace/providers/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 Complete Test Flow

### Full Authentication & Companion Flow
```bash
#!/bin/bash

# 1. Register a new user
echo "1. Registering user..."
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","username":"demouser","password":"Demo123!","full_name":"Demo User"}'

# 2. Login and get token
echo -e "\n\n2. Logging in..."
TOKEN=$(curl -s -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demouser&password=Demo123!" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "Token: $TOKEN"

# 3. Get current user
echo -e "\n\n3. Getting current user..."
curl http://localhost:8001/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Create a companion
echo -e "\n\n4. Creating companion..."
curl -X POST "http://localhost:8001/api/v1/companions/?name=Buddy&companion_type=dragon" \
  -H "Authorization: Bearer $TOKEN"

# 5. Get all companions
echo -e "\n\n5. Getting all companions..."
curl http://localhost:8001/api/v1/companions/ \
  -H "Authorization: Bearer $TOKEN"

# 6. Feed companion
echo -e "\n\n6. Feeding companion..."
curl -X POST http://localhost:8001/api/v1/companions/1/feed \
  -H "Authorization: Bearer $TOKEN"

# 7. Train companion
echo -e "\n\n7. Training companion..."
curl -X POST http://localhost:8001/api/v1/companions/1/train \
  -H "Authorization: Bearer $TOKEN"

# 8. Get updated companion
echo -e "\n\n8. Getting updated companion..."
curl http://localhost:8001/api/v1/companions/1 \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n✅ All tests complete!"
```

---

## 📱 Frontend Integration Examples

### Using the API Client

```typescript
import { apiClient } from '@/lib/api-client';

// 1. Register
async function register() {
  try {
    const user = await apiClient.register({
      email: 'user@example.com',
      username: 'myuser',
      password: 'MyPass123!',
      full_name: 'My Name'
    });
    console.log('Registered:', user);
  } catch (error) {
    console.error('Registration failed:', error);
  }
}

// 2. Login
async function login() {
  try {
    const tokens = await apiClient.login({
      username: 'myuser',
      password: 'MyPass123!'
    });
    console.log('Logged in, token stored automatically');
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// 3. Get current user
async function getCurrentUser() {
  try {
    const user = await apiClient.getCurrentUser();
    console.log('Current user:', user);
  } catch (error) {
    console.error('Failed to get user:', error);
  }
}

// 4. Create companion
async function createCompanion() {
  try {
    const companion = await apiClient.createCompanion({
      name: 'Sparky',
      companion_type: 'fox'
    });
    console.log('Created companion:', companion);
  } catch (error) {
    console.error('Failed to create companion:', error);
  }
}

// 5. Get companions
async function getCompanions() {
  try {
    const companions = await apiClient.getCompanions();
    console.log('Companions:', companions);
  } catch (error) {
    console.error('Failed to get companions:', error);
  }
}

// 6. Feed companion
async function feedCompanion(id: number) {
  try {
    const result = await apiClient.feedCompanion(id);
    console.log('Fed companion:', result);
  } catch (error) {
    console.error('Failed to feed companion:', error);
  }
}

// 7. Train companion
async function trainCompanion(id: number) {
  try {
    const result = await apiClient.trainCompanion(id);
    console.log('Trained companion:', result);
  } catch (error) {
    console.error('Failed to train companion:', error);
  }
}
```

---

## 🔒 Authentication Flow

### Token Management

**Access Token**:
- Expires in 30 minutes
- Used for all authenticated requests
- Stored in localStorage automatically by API client

**Refresh Token**:
- Expires in 7 days
- Can be used to get new access token (not implemented yet)
- Stored in localStorage

**Token Format**:
```
Authorization: Bearer <access_token>
```

### Protected Routes

All endpoints except `/auth/register` and `/auth/login` require authentication.

**Error Response** (401 Unauthorized):
```json
{
  "detail": "Could not validate credentials"
}
```

---

## 🎮 Companion Game Mechanics

### Companion Stats
- **Level**: Starts at 1, increases with XP
- **XP**: Experience points, gained from activities
- **XP to Next**: XP needed for next level (increases by 1.5x each level)
- **Evolution Stage**: egg → sprout → young → mature → master → legendary
- **Health**: Current/Max health (starts at 100)
- **Energy**: Current/Max energy (starts at 100)

### Activities

**Feed**:
- Restores 20 energy
- Grants 10 XP
- No energy cost
- Can be done anytime

**Train**:
- Costs 10 energy
- Grants 50 XP
- Requires at least 10 energy
- May trigger level up

### Level Up
- Occurs when XP >= XP to Next
- Increases level by 1
- Resets XP (carries over excess)
- Increases XP to Next by 1.5x

---

## 🐛 Error Handling

### Common Errors

**400 Bad Request**:
```json
{
  "detail": "Username already registered"
}
```

**401 Unauthorized**:
```json
{
  "detail": "Could not validate credentials"
}
```

**404 Not Found**:
```json
{
  "detail": "Companion not found"
}
```

**422 Validation Error**:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## 📊 Testing Checklist

### Authentication
- ✅ Register new user
- ✅ Login with credentials
- ✅ Get current user with token
- ✅ Logout (clears token)
- ✅ Protected endpoint rejects invalid token

### Companions
- ✅ Create companion
- ✅ Get all companions
- ✅ Get specific companion
- ✅ Feed companion
- ✅ Train companion
- ✅ Level up on sufficient XP
- ✅ Energy management

### Marketplace
- ✅ Get providers list
- ⏳ Create provider (not tested)
- ⏳ Get provider details (not tested)
- ⏳ Contact provider (not tested)

---

## 🚀 Quick Start for Developers

### 1. Start Backend
```bash
cd apps/api-core-v2
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Test Health
```bash
curl http://localhost:8001/health
# Should return: {"status":"healthy","version":"2.5.0"}
```

### 3. View API Docs
Open browser: http://localhost:8001/docs

### 4. Run Test Flow
Save the test script above as `test_api.sh` and run:
```bash
chmod +x test_api.sh
./test_api.sh
```

---

## 📝 Notes

### Database
- Using SQLite for development
- Database file: `compass_v25.db`
- Tables created automatically on startup
- Data persists between restarts

### CORS
- Configured for `http://localhost:3000` and `http://localhost:3001`
- Frontend can make requests from these origins

### Environment
- Development mode with auto-reload
- SQL queries logged to console
- Detailed error messages

---

**Status**: All core endpoints tested and working! Ready for frontend integration. 🎉
