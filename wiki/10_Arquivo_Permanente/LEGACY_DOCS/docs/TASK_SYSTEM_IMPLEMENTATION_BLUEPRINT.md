# Olcan Compass v2.5 - Unified Task Management System Implementation Blueprint

## Executive Summary

This document outlines the complete implementation plan for the gamified task management system - the core SaaS capability of Olcan Compass. The system guides users through their professional journey abroad with RPG mechanics, AI companion integration, and comprehensive document management.

**Status**: Phase 1 Backend Foundation - 70% Complete  
**Date**: April 13, 2026  
**Priority**: Critical (Core SaaS Feature)

---

## ✅ Completed Work

### 1. Database Layer (100% Complete)
- ✅ 5 tables created via Alembic migration `0020_task_management`
  - `tasks` - Main task entities with gamification support
  - `subtasks` - Task checklists
  - `user_progress` - XP, levels, streaks tracking
  - `achievements` - 21 predefined achievements seeded
  - `user_achievements` - User's unlocked achievements
- ✅ 4 custom PostgreSQL enums created
  - `taskstatus`, `taskpriority`, `taskcategory`, `achievementcategory`

### 2. Backend Services (90% Complete)
- ✅ **XP Calculator Service** (`app/services/xp_calculator.py`)
  - 10-level progression system (Explorer → Legend)
  - Streak management with 36-hour grace period
  - Achievement condition checking engine
- ✅ **Task Service Layer** (`app/services/task_service.py`)
  - Full CRUD operations
  - Task completion with XP awarding
  - Statistics generation
- ⚠️ **Minor Import Issues** - Need to fix `auth_service.get_current_user_id` reference

### 3. API Endpoints (85% Complete)
- ✅ 16 RESTful endpoints defined in `app/api/routes/tasks.py`
  - Task CRUD: POST/GET/PATCH/DELETE `/api/tasks`
  - Task Actions: POST `/api/tasks/{id}/complete`, `/api/tasks/{id}/start`
  - Progress: GET `/api/tasks/progress`, `/api/tasks/progress/leaderboard`
  - Achievements: GET `/api/tasks/achievements`, `/api/tasks/achievements/user`
  - Statistics: GET `/api/tasks/stats`
- ⚠️ **Routes Registered** but API needs minor import fixes to start

### 4. Achievements Seeded (100% Complete)
- ✅ 21 achievements across 6 categories:
  - **First Steps** (5): First Step, Explorer, Navigator, Initial Documentation, Complete Profile
  - **Consistency** (4): First Streak (3 days), Dedicated (7 days), Unstoppable (30 days), Legendary (100 days)
  - **Mastery** (4): Documentation Master, Polyglot, Interview Expert, Route Conqueror
  - **Social** (3): Networker, Mentor, Olcan Ambassador
  - **Speed** (3): Lightning Fast, Productive, Marathoner
  - **Special** (2): Visa Approved, New Life

### 5. Pydantic Schemas (100% Complete)
- ✅ Complete request/response validation schemas
- ✅ Task, SubTask, UserProgress, Achievement schemas
- ✅ Statistics and leaderboard schemas

---

## 🚧 Immediate Next Steps (Week 1)

### Task 1: Fix API Backend Startup (2 hours)

**Issue**: Import errors preventing API from starting

**Solution**:
```python
# File: app/api/routes/tasks.py
# Change line 19:
from app.services.auth_service import get_current_user_id

# To:
from app.core.auth import get_current_user
from fastapi import Depends

# Then in endpoints, change:
user_id: str = Depends(get_current_user_id)

# To:
current_user = Depends(get_current_user)
user_id = str(current_user.id)
```

**Alternative**: Create the missing function in `app/services/auth_service.py`:
```python
async def get_current_user_id(
    current_user: User = Depends(get_current_user)
) -> str:
    """Extract user ID from authenticated user."""
    return str(current_user.id)
```

**Verification**:
```bash
cd apps/api-core-v2.5
uvicorn app.main:app --reload --port 8000
# Should see: INFO: Application startup complete
curl http://localhost:8000/health
# Should return: {"status": "healthy", "version": "2.5.0"}
```

---

### Task 2: Create Task Templates for Route Types (4 hours)

**File**: `scripts/seed_task_templates.py`

**Purpose**: Pre-populate task templates for different professional journey routes (Canada, Germany, Australia, etc.)

**Structure**:
```python
TASK_TEMPLATES = {
    "canada_express_entry": {
        "name": "Canada Express Entry",
        "estimated_weeks": 24,
        "tasks": [
            {
                "title": "Language Test Preparation",
                "category": "LANGUAGE",
                "priority": "CRITICAL",
                "estimated_hours": 120,
                "xp_reward": 100,
                "subtasks": [
                    "Book IELTS/CELPIP exam",
                    "Complete 20 practice tests",
                    "Achieve CLB 9+ scores"
                ]
            },
            {
                "title": "Educational Credential Assessment (ECA)",
                "category": "DOCUMENTATION",
                "priority": "HIGH",
                "estimated_hours": 40,
                "xp_reward": 75,
            },
            # ... 30+ more tasks
        ]
    }
}
```

**Implementation**:
- Create templates for top 10 destinations
- Each template: 25-40 tasks
- Total: ~300-400 predefined tasks
- Script to seed into database

---

### Task 3: Build Task Dashboard UI - Phase 1 (16 hours)

**Priority**: HIGH - This is the main user-facing component

#### 3.1 Task Dashboard Layout

**File**: `apps/app-compass-v2.5/src/app/(app)/tasks/page.tsx`

```tsx
import { TaskDashboard } from '@/components/tasks/TaskDashboard'

export default function TasksPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Task Navigation */}
      <aside className="w-64 bg-white border-r">
        <TaskSidebar />
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <TaskDashboard />
      </main>
      
      {/* Right Panel - Gamification */}
      <aside className="w-80 bg-white border-l">
        <GamificationPanel />
      </aside>
    </div>
  )
}
```

#### 3.2 Core Components to Build

**Component Tree**:
```
src/components/tasks/
├── TaskDashboard.tsx          # Main dashboard layout
├── TaskSidebar.tsx            # Category filters, search
├── TaskList.tsx               # Task list with filters
├── TaskCard.tsx               # Individual task card
├── TaskDetail.tsx             # Task detail view
├── SubTaskList.tsx            # Subtask checklist
├── GamificationPanel.tsx      # XP, level, streak display
├── AchievementGallery.tsx     # Unlocked/locked achievements
├── ProgressBar.tsx            # Level progress bar
├── StreakCalendar.tsx         # Visual streak calendar
└── TaskFilters.tsx            # Advanced filtering
```

#### 3.3 Task Card Component

**File**: `src/components/tasks/TaskCard.tsx`

```tsx
interface TaskCardProps {
  task: Task
  onComplete: (taskId: string) => void
  onStart: (taskId: string) => void
}

export function TaskCard({ task, onComplete, onStart }: TaskCardProps) {
  const priorityColors = {
    CRITICAL: 'border-l-red-500',
    HIGH: 'border-l-orange-500',
    MEDIUM: 'border-l-yellow-500',
    LOW: 'border-l-green-500',
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${priorityColors[task.priority]} p-4`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{task.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{task.description}</p>
        </div>
        <Badge variant={task.category}>{task.category}</Badge>
      </div>
      
      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-1">
          <StarIcon className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">{task.xp_reward} XP</span>
        </div>
        
        {task.due_date && (
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            <span className="text-sm">{formatDate(task.due_date)}</span>
          </div>
        )}
        
        {task.subtask_count > 0 && (
          <div className="flex items-center gap-1">
            <CheckCircleIcon className="w-4 h-4" />
            <span className="text-sm">{task.completed_subtasks}/{task.subtask_count}</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-4">
        {task.status === 'PENDING' && (
          <Button onClick={() => onStart(task.id)} variant="outline">
            Start Task
          </Button>
        )}
        
        {task.status === 'IN_PROGRESS' && (
          <Button onClick={() => onComplete(task.id)} variant="success">
            Complete & Earn {task.xp_reward} XP
          </Button>
        )}
      </div>
    </div>
  )
}
```

#### 3.4 Gamification Panel

**File**: `src/components/tasks/GamificationPanel.tsx`

```tsx
export function GamificationPanel() {
  const { progress, level, streak, achievements } = useTaskStore()
  
  return (
    <div className="p-6 space-y-6">
      {/* Level & XP */}
      <div className="text-center">
        <div className="text-6xl mb-2">{getLevelEmoji(level)}</div>
        <h2 className="text-2xl font-bold">{getLevelTitle(level)}</h2>
        <p className="text-gray-600">Level {level}</p>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{progress.total_xp} XP</span>
            <span>{progress.xp_to_next_level} XP to next level</span>
          </div>
          <ProgressBar 
            value={progress.level_progress_percent} 
            className="h-3"
          />
        </div>
      </div>
      
      {/* Streak */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Current Streak</p>
            <p className="text-3xl font-bold text-orange-600">
              🔥 {streak.current} days
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Best Streak</p>
            <p className="text-xl font-semibold">{streak.best} days</p>
          </div>
        </div>
      </div>
      
      {/* Today's Progress */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Today's Progress</h3>
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-blue-600" />
          <span>{progress.tasks_completed_today} tasks completed</span>
        </div>
        {progress.tasks_completed_today === 0 && (
          <p className="text-sm text-gray-600 mt-2">
            Complete your first task today for +15 XP bonus!
          </p>
        )}
      </div>
      
      {/* Recent Achievements */}
      <div>
        <h3 className="font-semibold mb-3">Recent Achievements</h3>
        <div className="space-y-2">
          {achievements.recent.slice(0, 3).map(achievement => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### 3.5 Zustand Store for Task State

**File**: `src/stores/taskStore.ts`

```typescript
import { create } from 'zustand'
import { api } from '@/lib/api'

interface TaskState {
  // Data
  tasks: Task[]
  progress: UserProgress
  achievements: Achievement[]
  statistics: TaskStatistics
  
  // Filters
  filters: {
    status?: TaskStatus
    category?: TaskCategory
    priority?: TaskPriority
    search?: string
  }
  
  // Loading states
  loading: boolean
  error: string | null
  
  // Actions
  fetchTasks: () => Promise<void>
  completeTask: (taskId: string) => Promise<TaskCompleteResponse>
  startTask: (taskId: string) => Promise<void>
  createTask: (data: TaskCreate) => Promise<void>
  updateFilters: (filters: Partial<TaskState['filters']>) => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  progress: null!,
  achievements: [],
  statistics: null!,
  filters: {},
  loading: false,
  error: null,
  
  fetchTasks: async () => {
    set({ loading: true, error: null })
    try {
      const { filters } = get()
      const [tasksResponse, progressResponse] = await Promise.all([
        api.get('/api/tasks', { params: filters }),
        api.get('/api/tasks/progress')
      ])
      
      set({
        tasks: tasksResponse.data.tasks,
        progress: progressResponse.data,
        loading: false
      })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  completeTask: async (taskId: string) => {
    const response = await api.post(`/api/tasks/${taskId}/complete`)
    
    // Refresh data
    await get().fetchTasks()
    
    // Show notification
    if (response.data.level_up) {
      showLevelUpNotification(response.data.new_level)
    }
    if (response.data.achievements_unlocked.length > 0) {
      showAchievementNotification(response.data.achievements_unlocked)
    }
    
    return response.data
  },
  
  startTask: async (taskId: string) => {
    await api.post(`/api/tasks/${taskId}/start`)
    await get().fetchTasks()
  },
  
  createTask: async (data: TaskCreate) => {
    await api.post('/api/tasks', data)
    await get().fetchTasks()
  },
  
  updateFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } })
    get().fetchTasks()
  }
}))
```

---

## 📋 Week 2-3 Implementation Tasks

### Task 4: Redesign User Onboarding Flow (24 hours)

**Current Flow**: Psychological Test → Route Selection → Dashboard  
**New Flow**: Psychological Test → Companion Assignment → Route Selection → Task Tutorial → Dashboard

**Key Changes**:
1. **After Psychological Test**:
   - Assign AI companion (Aura) based on personality profile
   - Companion introduces themselves with personalized message
   
2. **Route Selection Enhancement**:
   - Show recommended routes based on psychological profile
   - Display task count, estimated time, difficulty
   - Preview task templates before committing

3. **Task Tutorial** (NEW):
   - Interactive walkthrough of task system
   - First task auto-created: "Complete Your Profile"
   - Guided completion with companion hints
   - Earn first achievement: "Primeiro Passo" (First Step)

**Implementation Files**:
```
src/app/onboarding/
├── page.tsx                     # Onboarding hub
├── psychological-test/          # Existing
├── companion-assignment/        # NEW
├── route-selection/             # Enhanced
├── task-tutorial/               # NEW
└── complete/                    # Final step
```

---

### Task 5: Aura Companion Integration (20 hours)

**Integration Points**:

#### 5.1 Task Prompts & Reminders
```typescript
// Aura suggests tasks based on:
// - User's psychological profile
// - Current streak status
// - Upcoming deadlines
// - Achievement progress

interface AuraTaskSuggestion {
  taskId: string
  reason: string
  urgency: 'low' | 'medium' | 'high'
  motivationalMessage: string
}

// Example:
{
  taskId: "abc-123",
  reason: "You're 2 tasks away from 'Dedicated' achievement!",
  urgency: "high",
  motivationalMessage: "I know you can do this! Your streak is on fire 🔥"
}
```

#### 5.2 Completion Celebrations
```typescript
// When user completes task:
Aura celebrates with personalized message based on:
- Task difficulty
- User's personality type
- Current level/streak
- Achievement unlocked

// Example responses:
"Amazing work! That's 5 tasks in a row - you're on fire! 🔥"
"Great job on the documentation task! One step closer to your dream 🌟"
```

#### 5.3 API Integration
```typescript
// New endpoint: /api/tasks/aura/suggestions
POST /api/tasks/aura/suggestions
{
  user_id: string
  context: {
    current_streak: number
    tasks_completed_today: number
    upcoming_deadlines: Task[]
    recent_achievements: Achievement[]
  }
}

Response:
{
  suggestions: AuraTaskSuggestion[]
  motivationalMessage: string
  nextRecommendedTask: Task
}
```

---

### Task 6: Unify RPG Rewards System (16 hours)

**Current State**: XP system exists but not fully integrated  
**Goal**: Unified rewards across all platform activities

#### 6.1 XP Sources (All Activities)
```typescript
const XP_REWARDS = {
  // Tasks
  task_complete_base: 10,
  task_complete_high: 25,
  task_complete_critical: 50,
  first_task_of_day: 15,
  streak_bonus_per_day: 5,
  
  // Documents (Forge)
  document_created: 20,
  document_polished: 30,
  document_finalized: 50,
  
  // Route Progress
  route_created: 100,
  route_25_percent: 150,
  route_50_percent: 300,
  route_completed: 500,
  
  // Companion Interaction
  daily_check_in: 5,
  conversation_milestone: 25,
  
  // Community (Future)
  help_other_user: 40,
  receive_upvote: 10,
}
```

#### 6.2 Level Titles & Benefits
```typescript
const LEVELS = {
  1: { title: "Explorador", emoji: "🧭", benefits: ["Basic tasks"] },
  2: { title: "Viajante", emoji: "✈️", benefits: ["5 routes", "Priority support"] },
  3: { title: "Navegador", emoji: "⚓", benefits: ["10 routes", "Advanced analytics"] },
  4: { title: "Desbravador", emoji: "🗺️", benefits: ["Unlimited routes", "Custom tasks"] },
  5: { title: "Voyager", emoji: "🌍", benefits: ["All Forge features", "Mentorship access"] },
  6: { title: "Embaixador", emoji: "🎖️", benefits: ["Community features", "Beta access"] },
  7: { title: "Diplomata", emoji: "🏛️", benefits: ["Premium templates", "Priority matching"] },
  8: { title: "Cônsul", emoji: "👑", benefits: ["VIP support", "Exclusive content"] },
  9: { title: "Comissário", emoji: "⭐", benefits: ["All features", "Early access"] },
  10: { title: "Lenda", emoji: "🌟", benefits: ["Legendary status", "Hall of Fame"] },
}
```

#### 6.3 Integration Points
- **Forge Documents**: Award XP for creation, polishing, finalization
- **Route Progress**: Award XP for milestone completion
- **Aura Interactions**: Award XP for daily engagement
- **CRM Integration**: Award XP for profile completeness

---

### Task 7: CMS Integration for Document Management (20 hours)

**Goal**: Leverage existing CMS for visa forms, documentation templates

**Architecture**:
```
CMS (Existing)
  ↓
Document Templates API
  ↓
Task System (creates document tasks)
  ↓
Forge (document creation/polishing)
  ↓
User completes task → Earns XP
```

**Implementation**:
1. **Query CMS for document templates** by route type
2. **Auto-create document tasks** when route selected
3. **Link to Forge** for document creation
4. **Track completion** and award XP

**Example Flow**:
```
User selects "Canada Express Entry" route
  ↓
System queries CMS: "What documents needed for Canada EE?"
  ↓
CMS returns: [Language Test, ECA, Police Certificate, Medical Exam, ...]
  ↓
System creates tasks for each document
  ↓
User completes "Language Test" task
  ↓
System links to Forge: "Create your IELTS study plan"
  ↓
User creates document in Forge
  ↓
Task marked complete → +75 XP
```

---

## 🔧 Technical Debt & Fixes Required

### 1. API Import Issues (High Priority)
- [ ] Fix `get_current_user_id` in `app/api/routes/tasks.py`
- [ ] Verify all auth dependencies working
- [ ] Test all 16 task endpoints

### 2. Missing Imports
- [ ] `app.core.logger` doesn't exist → Use standard `logging`
- [ ] Ensure `app.core.entitlements` has all required functions

### 3. Frontend API Client
- [ ] Create `/lib/api.ts` with task endpoints
- [ ] Add TypeScript types for all task schemas
- [ ] Implement error handling and retries

### 4. State Management
- [ ] Set up Zustand stores
- [ ] Implement optimistic updates
- [ ] Add loading states and error boundaries

---

## 📊 Success Metrics

### Phase 1 (Week 1)
- [ ] API backend running without errors
- [ ] All 16 task endpoints tested and working
- [ ] Task templates seeded for top 5 destinations
- [ ] Basic task dashboard UI functional

### Phase 2 (Week 2-3)
- [ ] Complete onboarding flow redesigned
- [ ] Aura companion integrated with task suggestions
- [ ] RPG rewards unified across platform
- [ ] Task dashboard fully functional with all features

### Phase 3 (Week 4)
- [ ] CMS integration complete
- [ ] Achievement system fully operational
- [ ] Leaderboard functional
- [ ] Mobile responsive design

### KPIs
- **User Engagement**: >70% daily active users complete at least 1 task
- **Streak Retention**: >50% users maintain 7+ day streak
- **Task Completion**: Average 5+ tasks per week per user
- **Achievement Unlock**: Average 3+ achievements in first month

---

## 🚀 Quick Start Guide for Development Team

### 1. Start Backend
```bash
# Terminal 1: API Backend
cd apps/api-core-v2.5

# Fix import issues first (see Task 1 above)
# Then start:
uvicorn app.main:app --reload --port 8000
```

### 2. Start Frontend
```bash
# Terminal 2: Frontend
cd apps/app-compass-v2.5
pnpm dev:v2.5
```

### 3. Test Task Endpoints
```bash
# Get user token first (login)
TOKEN="your_jwt_token"

# List tasks
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/tasks

# Create task
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "category": "DOCUMENTATION",
    "priority": "HIGH",
    "description": "Test task creation"
  }'

# Complete task
curl -X POST http://localhost:8000/api/tasks/{task_id}/complete \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Verify Database
```bash
docker exec -it olcan_compass_db psql -U olcan_app -d olcan_production

# Check achievements
SELECT count(*) FROM achievements;  -- Should return 21

# Check enums
SELECT unnest(enum_range(NULL::taskstatus));

# Check tables
\dt tasks user_progress achievements subtasks user_achievements
```

---

## 📝 Notes & Considerations

### Design Decisions
1. **Why separate `task_metadata` from `metadata`?**
   - SQLAlchemy reserves `metadata` attribute name
   - Column name in DB is still `metadata` for compatibility

2. **Why 10 levels?**
   - Matches Life Architect 2 reference
   - Provides clear progression without being overwhelming
   - Each level feels achievable (~2-3 weeks of consistent use)

3. **Why 36-hour streak grace period?**
   - Accounts for timezone differences
   - Allows users to miss one day without breaking streak
   - Industry standard (Duolingo, Habitica use similar)

### Future Enhancements (Post v2.5)
- [ ] Social features (friend streaks, team achievements)
- [ ] Advanced analytics (completion trends, time tracking)
- [ ] AI-generated personalized task recommendations
- [ ] Integration with external calendars
- [ ] Mobile app with push notifications
- [ ] Offline mode with sync

---

## 🆘 Support & Contact

For questions or blockers:
1. Check this document first
2. Review existing code in `apps/api-core-v2.5/app/services/task_service.py`
3. Test API endpoints with Postman collection (create from OpenAPI spec)
4. Check database schema: `\d+ tasks` in psql

---

**Last Updated**: April 13, 2026  
**Status**: Phase 1 - Backend Foundation (70% Complete)  
**Next Review**: After API startup issues resolved
