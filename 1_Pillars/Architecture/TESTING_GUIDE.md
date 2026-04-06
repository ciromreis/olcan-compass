# 🧪 Olcan Compass v2.5 - Testing Guide

**Last Updated**: March 29, 2026  
**Platform Version**: v2.5  
**Testing Coverage Target**: 80%+

---

## 📋 Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [E2E Tests](#e2e-tests)
5. [API Testing](#api-testing)
6. [Frontend Testing](#frontend-testing)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)

---

## Testing Strategy

### Test Pyramid

```
        /\
       /E2E\        <- Few, critical user flows
      /------\
     /Integration\ <- Moderate, feature interactions
    /------------\
   /  Unit Tests  \ <- Many, individual functions
  /----------------\
```

### Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Key feature flows
- **E2E Tests**: Critical user journeys
- **API Tests**: All endpoints

---

## Unit Tests

### Backend Unit Tests (pytest)

**Setup:**
```bash
cd apps/api-core-v2
pip install pytest pytest-cov pytest-asyncio
```

**Run Tests:**
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/services/test_document_service.py

# Run with verbose output
pytest -v
```

**Example Test - Document Service:**

```python
# tests/services/test_document_service.py
import pytest
from app.services.document_service import DocumentService
from app.models.document import DocumentType, DocumentStatus

@pytest.fixture
def db_session():
    # Setup test database session
    pass

@pytest.fixture
def document_service(db_session):
    return DocumentService(db_session)

def test_create_document(document_service):
    """Test document creation"""
    doc = document_service.create_document(
        user_id="test-user",
        title="Test Resume",
        document_type=DocumentType.RESUME
    )
    
    assert doc.id is not None
    assert doc.title == "Test Resume"
    assert doc.status == DocumentStatus.DRAFT
    assert doc.version == 1

def test_create_document_from_template(document_service):
    """Test document creation from template"""
    doc = document_service.create_document(
        user_id="test-user",
        title="Resume from Template",
        document_type=DocumentType.RESUME,
        template_id="modern-resume"
    )
    
    assert doc.template_id == "modern-resume"
    assert doc.content is not None
    assert len(doc.content.get('sections', [])) > 0

def test_update_document(document_service):
    """Test document update"""
    doc = document_service.create_document(
        user_id="test-user",
        title="Original Title",
        document_type=DocumentType.RESUME
    )
    
    updated = document_service.update_document(
        document_id=doc.id,
        user_id="test-user",
        updates={"title": "Updated Title"}
    )
    
    assert updated.title == "Updated Title"
    assert updated.updated_at > doc.created_at

def test_create_version(document_service):
    """Test document versioning"""
    original = document_service.create_document(
        user_id="test-user",
        title="Version 1",
        document_type=DocumentType.RESUME
    )
    
    version2 = document_service.create_version(
        document_id=original.id,
        user_id="test-user"
    )
    
    assert version2.version == 2
    assert version2.parent_document_id == original.id
    assert version2.content == original.content
```

**Example Test - Interview Service:**

```python
# tests/services/test_interview_service.py
import pytest
from app.services.interview_service import InterviewService
from app.models.interview import InterviewType, InterviewDifficulty

def test_create_interview(interview_service):
    """Test interview creation"""
    interview = interview_service.create_interview(
        user_id="test-user",
        title="Tech Interview",
        interview_type=InterviewType.TECHNICAL,
        difficulty=InterviewDifficulty.INTERMEDIATE
    )
    
    assert interview.id is not None
    assert len(interview.questions) > 0
    assert interview.status == "scheduled"

def test_start_interview(interview_service):
    """Test starting interview"""
    interview = interview_service.create_interview(
        user_id="test-user",
        title="Test Interview",
        interview_type=InterviewType.BEHAVIORAL,
        difficulty=InterviewDifficulty.BEGINNER
    )
    
    started = interview_service.start_interview(interview.id, "test-user")
    
    assert started.status == "in_progress"
    assert started.started_at is not None

def test_submit_response(interview_service):
    """Test submitting interview response"""
    interview = interview_service.create_interview(
        user_id="test-user",
        title="Test",
        interview_type=InterviewType.BEHAVIORAL,
        difficulty=InterviewDifficulty.BEGINNER
    )
    
    interview_service.start_interview(interview.id, "test-user")
    
    updated = interview_service.submit_response(
        interview_id=interview.id,
        user_id="test-user",
        question_id=interview.questions[0]['id'],
        response_text="My answer here..."
    )
    
    assert updated.questions_answered == 1
    assert len(updated.responses) == 1
```

### Frontend Unit Tests (Jest + React Testing Library)

**Setup:**
```bash
cd apps/app-compass-v2
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Example Test - Component:**

```typescript
// src/components/companion/__tests__/CompanionVisual.test.tsx
import { render, screen } from '@testing-library/react'
import { CompanionVisual } from '../CompanionVisual'

describe('CompanionVisual', () => {
  it('renders companion with correct stage', () => {
    render(
      <CompanionVisual
        evolutionStage="mature"
        archetype="strategist"
        name="Buddy"
        level={15}
        stats={{ power: 20, wisdom: 25, charisma: 18, agility: 22 }}
        happiness={85}
        energy={70}
      />
    )
    
    expect(screen.getByText('Buddy')).toBeInTheDocument()
    expect(screen.getByText('Level 15')).toBeInTheDocument()
  })

  it('shows correct emoji for evolution stage', () => {
    const { rerender } = render(
      <CompanionVisual
        evolutionStage="egg"
        archetype="strategist"
        name="Test"
        level={1}
        stats={{ power: 5, wisdom: 5, charisma: 5, agility: 5 }}
        happiness={50}
        energy={50}
      />
    )
    
    expect(screen.getByText('🥚')).toBeInTheDocument()
    
    rerender(
      <CompanionVisual
        evolutionStage="legendary"
        archetype="strategist"
        name="Test"
        level={50}
        stats={{ power: 50, wisdom: 50, charisma: 50, agility: 50 }}
        happiness={100}
        energy={100}
      />
    )
    
    expect(screen.getByText('👑')).toBeInTheDocument()
  })
})
```

---

## Integration Tests

### API Integration Tests

**Example - Document Flow:**

```python
# tests/integration/test_document_flow.py
import pytest
from fastapi.testclient import TestClient
from app.main_real import app

client = TestClient(app)

def test_complete_document_workflow():
    """Test complete document creation workflow"""
    
    # 1. Create document
    response = client.post(
        "/documents",
        json={
            "title": "Integration Test Resume",
            "document_type": "resume",
            "template_id": "modern-resume"
        },
        headers={"Authorization": "Bearer test-token"}
    )
    assert response.status_code == 201
    doc_id = response.json()["id"]
    
    # 2. Update document
    response = client.patch(
        f"/documents/{doc_id}",
        json={
            "title": "Updated Resume",
            "status": "in_review"
        },
        headers={"Authorization": "Bearer test-token"}
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Resume"
    
    # 3. Request review
    response = client.post(
        f"/documents/{doc_id}/review",
        headers={"Authorization": "Bearer test-token"}
    )
    assert response.status_code == 200
    assert "overall_score" in response.json()
    
    # 4. Create version
    response = client.post(
        f"/documents/{doc_id}/version",
        json={"title": "Resume v2"},
        headers={"Authorization": "Bearer test-token"}
    )
    assert response.status_code == 201
    assert response.json()["version"] == 2
```

### Frontend Integration Tests

```typescript
// src/__tests__/integration/document-creation.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentCreationWizard } from '@/app/(app)/documents/new/page'

describe('Document Creation Flow', () => {
  it('completes full document creation', async () => {
    const user = userEvent.setup()
    render(<DocumentCreationWizard />)
    
    // Step 1: Select type
    await user.click(screen.getByText('Resume'))
    await user.click(screen.getByText('Continue'))
    
    // Step 2: Select template
    await user.click(screen.getByText('Modern Professional'))
    await user.click(screen.getByText('Continue'))
    
    // Step 3: Enter details
    await user.type(
      screen.getByPlaceholderText(/document title/i),
      'My Resume'
    )
    await user.click(screen.getByText('Create Document'))
    
    // Verify navigation
    await waitFor(() => {
      expect(window.location.pathname).toMatch(/\/documents\//)
    })
  })
})
```

---

## E2E Tests

### Playwright E2E Tests

**Setup:**
```bash
cd apps/app-compass-v2
npm install --save-dev @playwright/test
npx playwright install
```

**Example E2E Test:**

```typescript
// e2e/companion-care.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Companion Care Flow', () => {
  test('user can perform care activities', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Navigate to companion page
    await page.goto('/companion')
    await expect(page.locator('h1')).toContainText('Companion')
    
    // Perform feed activity
    await page.click('button:has-text("Feed")')
    
    // Wait for toast notification
    await expect(page.locator('.toast')).toBeVisible()
    await expect(page.locator('.toast')).toContainText('XP')
    
    // Verify stats updated
    const xpBefore = await page.locator('[data-testid="xp-value"]').textContent()
    await page.click('button:has-text("Train")')
    const xpAfter = await page.locator('[data-testid="xp-value"]').textContent()
    
    expect(parseInt(xpAfter!)).toBeGreaterThan(parseInt(xpBefore!))
  })

  test('user can evolve companion', async ({ page }) => {
    await page.goto('/companion')
    
    // Check evolution eligibility
    await page.click('button:has-text("Check Evolution")')
    
    // If eligible, evolve
    const evolveButton = page.locator('button:has-text("Evolve Now")')
    if (await evolveButton.isVisible()) {
      await evolveButton.click()
      
      // Wait for evolution ceremony
      await expect(page.locator('.evolution-ceremony')).toBeVisible()
      
      // Click continue after ceremony
      await page.click('button:has-text("Continue")')
      
      // Verify new stage
      await expect(page.locator('[data-testid="evolution-stage"]')).not.toContainText('egg')
    }
  })
})
```

---

## API Testing

### Postman/Thunder Client Collection

**Example Collection:**

```json
{
  "name": "Olcan Compass v2.5 API",
  "requests": [
    {
      "name": "Create Document",
      "method": "POST",
      "url": "{{baseUrl}}/documents",
      "headers": {
        "Authorization": "Bearer {{token}}",
        "Content-Type": "application/json"
      },
      "body": {
        "title": "Test Resume",
        "document_type": "resume",
        "template_id": "modern-resume"
      },
      "tests": [
        "pm.test('Status is 201', () => pm.response.to.have.status(201))",
        "pm.test('Has document ID', () => pm.expect(pm.response.json()).to.have.property('id'))"
      ]
    },
    {
      "name": "Get Documents",
      "method": "GET",
      "url": "{{baseUrl}}/documents?limit=10",
      "headers": {
        "Authorization": "Bearer {{token}}"
      },
      "tests": [
        "pm.test('Status is 200', () => pm.response.to.have.status(200))",
        "pm.test('Returns array', () => pm.expect(pm.response.json()).to.be.an('array'))"
      ]
    }
  ]
}
```

---

## Performance Testing

### Load Testing with Locust

**Setup:**
```bash
pip install locust
```

**Example Load Test:**

```python
# locustfile.py
from locust import HttpUser, task, between

class OlcanUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Login
        response = self.client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    @task(3)
    def get_documents(self):
        self.client.get("/documents", headers=self.headers)
    
    @task(2)
    def get_companion(self):
        self.client.get("/companions/me", headers=self.headers)
    
    @task(1)
    def create_document(self):
        self.client.post("/documents", json={
            "title": "Load Test Doc",
            "document_type": "resume"
        }, headers=self.headers)
```

**Run Load Test:**
```bash
locust -f locustfile.py --host=http://localhost:8000
```

---

## Security Testing

### Security Checklist

- [ ] SQL Injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection (tokens)
- [ ] Authentication (JWT validation)
- [ ] Authorization (role-based access)
- [ ] Rate limiting
- [ ] Input validation
- [ ] Secure headers
- [ ] HTTPS enforcement
- [ ] Secrets management

### Example Security Tests

```python
# tests/security/test_auth.py
def test_unauthorized_access():
    """Test that endpoints require authentication"""
    response = client.get("/documents")
    assert response.status_code == 401

def test_invalid_token():
    """Test invalid token rejection"""
    response = client.get(
        "/documents",
        headers={"Authorization": "Bearer invalid-token"}
    )
    assert response.status_code == 401

def test_sql_injection_prevention():
    """Test SQL injection protection"""
    response = client.get(
        "/documents?search=' OR '1'='1",
        headers={"Authorization": "Bearer valid-token"}
    )
    assert response.status_code == 200
    # Should return empty or safe results, not all documents
```

---

## Test Data Management

### Fixtures

```python
# tests/fixtures.py
import pytest
from app.models.user import User
from app.models.companion import Companion

@pytest.fixture
def test_user(db_session):
    user = User(
        id="test-user",
        email="test@example.com",
        name="Test User"
    )
    db_session.add(user)
    db_session.commit()
    return user

@pytest.fixture
def test_companion(db_session, test_user):
    companion = Companion(
        id="test-companion",
        user_id=test_user.id,
        name="Test Buddy",
        archetype="strategist",
        evolution_stage="young"
    )
    db_session.add(companion)
    db_session.commit()
    return companion
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          cd apps/api-core-v2
          pip install -r requirements.txt
          pip install pytest pytest-cov
      - name: Run tests
        run: |
          cd apps/api-core-v2
          pytest --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v2

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd apps/app-compass-v2
          npm install
      - name: Run tests
        run: |
          cd apps/app-compass-v2
          npm test -- --coverage
```

---

## Test Coverage Reports

### Generate Coverage

**Backend:**
```bash
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

**Frontend:**
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

---

## Best Practices

1. **Write tests first** (TDD when possible)
2. **Keep tests isolated** (no dependencies between tests)
3. **Use descriptive names** (test_should_create_document_with_template)
4. **Test edge cases** (empty inputs, max values, etc.)
5. **Mock external services** (APIs, databases in unit tests)
6. **Clean up after tests** (database cleanup, file deletion)
7. **Run tests in CI/CD** (automated on every commit)
8. **Maintain test data** (fixtures, factories)
9. **Test error cases** (not just happy paths)
10. **Keep tests fast** (unit tests < 1s, integration < 10s)

---

**Testing Status**: Ready for implementation  
**Priority**: High (before production deployment)  
**Estimated Effort**: 2-3 weeks for comprehensive coverage
