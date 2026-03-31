# Narrative Forge - Feature Specification

> **AI-powered document crafting platform for international applications**

---

## 🎯 Feature Overview

### Executive Summary
The **Narrative Forge** is Olcan Compass's flagship AI-powered document creation system that helps international candidates craft compelling application materials (essays, personal statements, resumes) for scholarships, jobs, and immigration applications.

### Core Value Proposition
- **AI-Guided Writing**: Real-time AI assistance with tone, structure, and content optimization
- **Character Limit Management**: Intelligent editing tools for strict application constraints
- **Template Library**: Curated templates for various international application types
- **Collaboration Features**: Real-time feedback from mentors and peers
- **Version Control**: Track changes and maintain document history

### Success Metrics
- **Document Completion Rate**: 75% of started documents completed within 7 days
- **User Satisfaction**: 4.5/5 average rating for AI assistance quality
- **Template Usage**: 60% of users start from templates
- **AI Feature Adoption**: 80% of users utilize AI suggestions at least once

---

## 👥 Target Users & Personas

### Primary Persona: "The Global Aspirant"
- **Demographics**: 20-28 years old, university students/recent graduates
- **Goals**: Secure international scholarships and opportunities
- **Pain Points**: 
  - Character limit constraints (500-1000 words)
  - Imposter syndrome and lack of confidence
  - Uncertainty about application expectations
  - Limited access to quality feedback
- **Needs**: 
  - Guided writing process
  - Real-time feedback and suggestions
  - Templates and examples
  - Confidence-building features

### Secondary Persona: "The Skilled Professional"
- **Demographics**: 28-45 years old, mid-career professionals
- **Goals**: Obtain work visas and international job opportunities
- **Pain Points**:
  - Complex visa application requirements
  - Professional narrative crafting
  - Industry-specific language and terminology
- **Needs**:
  - Industry-specific templates
  - Professional tone optimization
  - Technical terminology guidance

---

## 🚀 Feature Requirements

### Core Functionality

#### 1. Document Creation & Editing
**Priority**: 🔴 Critical | **Complexity**: High | **Backend**: ✅ Complete | **Frontend**: 🟡 70%

**Requirements**:
- Rich text editor with character/word count
- Real-time auto-save with conflict resolution
- Version history with visual diff comparison
- Export to PDF, Word, and plain text formats
- Document templates categorized by application type
- **NEW**: ATS-friendly PDF generation (OpenResume integration)
- **NEW**: Real-time PDF preview with formatting
- **NEW**: Resume parsing and analysis capabilities
- **NEW**: Professional template library with industry standards

**Acceptance Criteria**:
- Documents auto-save every 30 seconds without data loss
- Character count updates in real-time with visual indicators
- Users can access up to 50 previous versions
- Export maintains formatting and includes metadata
- **NEW**: PDF export passes ATS compatibility tests
- **NEW**: Real-time preview updates within 1 second
- **NEW**: Resume parsing completes within 3 seconds
- **NEW**: Professional templates match industry standards

#### 2. AI Writing Assistant
**Priority**: 🔴 Critical | **Complexity**: High | **Backend**: ✅ 90% | **Frontend**: 🟡 60%

**Requirements**:
- Real-time grammar and style suggestions
- Tone optimization (academic, professional, creative)
- Content structure recommendations
- Plagiarism detection and originality scoring
- AI-powered content generation for specific sections
- **NEW**: ATS keyword optimization (Resume-Matcher integration)
- **NEW**: Resume-JD matching analysis
- **NEW**: Real-time ATS compliance scoring

**Acceptance Criteria**:
- AI suggestions appear within 2 seconds of user pause
- Suggestions maintain user's voice and intent
- Plagiarism scan completes within 10 seconds
- Users can accept/reject individual suggestions
- **NEW**: ATS optimization suggestions update in real-time
- **NEW**: Resume-JD match score displays with visual indicators
- **NEW**: Keyword density analysis with recommendations

#### 3. Template Library
**Priority**: 🟡 High | **Complexity**: Medium | **Backend**: 🟡 50% | **Frontend**: ⬜ 0%

**Requirements**:
- 50+ curated templates for different applications
- Customizable template parameters
- Template preview and selection interface
- User-contributed template system with moderation
- Template success metrics and ratings

**Acceptance Criteria**:
- Templates load within 3 seconds
- Users can customize 80% of template content
- Template ratings display with sample size
- New templates reviewed within 48 hours

#### 4. Collaboration System
**Priority**: 🟡 High | **Complexity**: Medium | **Backend**: 🟡 40% | **Frontend**: ⬜ 0%

**Requirements**:
- Real-time document sharing with mentors/peers
- Comment and suggestion system
- Permission levels (view, comment, edit)
- Integration with marketplace providers
- Collaboration history and analytics

**Acceptance Criteria**:
- Real-time updates within 1 second
- Comments can be resolved and tracked
- Permission changes take effect immediately
- Integration with marketplace provider accounts

---

## 🎨 User Experience Design

### User Journey Flow

#### New User Onboarding
1. **Account Setup** (2 minutes)
   - Profile creation with goals and targets
   - Application type selection
   - Welcome tutorial and feature introduction

2. **First Document Creation** (5 minutes)
   - Template selection or blank document
   - AI assistant introduction
   - Basic document setup

3. **Writing Process** (30-60 minutes)
   - Guided writing with AI suggestions
   - Real-time feedback and improvements
   - Progress tracking and milestones

#### Returning User Flow
1. **Dashboard Access** (30 seconds)
   - Document overview and status
   - Recent activity and suggestions
   - Quick actions for common tasks

2. **Document Management** (2 minutes)
   - Access and edit existing documents
   - Review collaboration feedback
   - Track application progress

### Key Screens

#### 1. Document Editor
- **Layout**: Split-screen with editor and AI panel
- **Components**: 
  - Rich text toolbar with formatting options
  - Character/word count display
  - AI suggestion panel with accept/reject options
  - Template structure guide
  - Collaboration sidebar

#### 2. Template Library
- **Layout**: Grid with filtering and search
- **Components**:
  - Category filters (scholarship, job, immigration)
  - Template cards with preview and success metrics
  - Customization options
  - User ratings and reviews

#### 3. Dashboard
- **Layout**: Card-based overview
- **Components**:
  - Document progress cards
  - AI usage statistics
  - Collaboration invitations
  - Application deadline tracking

---

## 🔧 Technical Requirements

### Frontend Specifications

#### Technology Stack
- **Framework**: React 18+ with TypeScript
- **State Management**: Zustand for local state
- **Editor**: Draft.js or TipTap for rich text
- **Real-time**: WebSocket connections for collaboration
- **File Handling**: File-saver and PDF generation

#### Performance Requirements
- **Load Time**: <3 seconds for initial document load
- **Auto-save**: <500ms for save operations
- **AI Response**: <2 seconds for suggestions
- **Real-time Sync**: <1 second for collaboration updates

#### Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation for all features
- Screen reader compatibility
- High contrast mode support
- Reduced motion options

### Backend Specifications

#### API Endpoints
```
POST /api/documents/create
GET /api/documents/{id}
PUT /api/documents/{id}
POST /api/documents/{id}/collaborate
GET /api/templates
POST /api/ai/suggest
POST /api/ai/analyze
```

#### Database Schema
```sql
documents {
  id: UUID PRIMARY KEY
  user_id: UUID FOREIGN KEY
  title: VARCHAR(255)
  content: TEXT
  template_id: UUID FOREIGN KEY
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
  version: INTEGER
}

document_versions {
  id: UUID PRIMARY KEY
  document_id: UUID FOREIGN KEY
  content: TEXT
  created_at: TIMESTAMP
  changes: JSONB
}

collaborations {
  id: UUID PRIMARY KEY
  document_id: UUID FOREIGN KEY
  user_id: UUID FOREIGN KEY
  permission: ENUM('view', 'comment', 'edit')
  created_at: TIMESTAMP
}
```

---

## 📊 Success Metrics & Analytics

### Primary KPIs

#### User Engagement
- **Document Creation Rate**: Number of new documents per user per week
- **Session Duration**: Average time spent in editor
- **Feature Adoption**: Percentage of users using AI features
- **Template Usage**: Percentage of documents started from templates

#### Content Quality
- **Completion Rate**: Percentage of documents marked as complete
- **AI Acceptance Rate**: Percentage of AI suggestions accepted
- **Revision Count**: Average number of revisions per document
- **Collaboration Rate**: Percentage of documents with collaborators

#### Business Impact
- **User Retention**: 30-day retention rate for active users
- **Conversion Rate**: Free to premium user conversion
- **Support Tickets**: Number of support requests per user
- **User Satisfaction**: NPS score and feature ratings

### Secondary Metrics

#### Performance
- **Load Times**: Average page and component load times
- **Error Rates**: Percentage of failed operations
- **Auto-save Success**: Percentage of successful auto-saves
- **AI Response Time**: Average AI suggestion response time

#### Content Analytics
- **Popular Templates**: Most used templates and success rates
- **Common Issues**: Frequently requested help topics
- **User Patterns**: Common writing workflows and patterns

---

## 🧪 Testing Strategy

### Unit Testing
- **Editor Components**: Test all editor functionality and edge cases
- **AI Integration**: Mock AI responses and test suggestion handling
- **Template System**: Test template loading and customization
- **Collaboration**: Test real-time sync and permission handling

### Integration Testing
- **API Endpoints**: Test all backend endpoints with various inputs
- **Real-time Features**: Test WebSocket connections and message handling
- **File Operations**: Test document saving, loading, and export
- **User Authentication**: Test permission-based access control

### User Testing
- **Usability Testing**: 10+ users complete common tasks
- **A/B Testing**: Test different AI suggestion interfaces
- **Performance Testing**: Load testing with concurrent users
- **Accessibility Testing**: Screen reader and keyboard navigation testing

### Quality Gates
- **Code Coverage**: Minimum 80% test coverage
- **Performance**: All pages load in <3 seconds
- **Accessibility**: WCAG 2.1 AA compliance verified
- **Security**: No critical vulnerabilities in security scan

---

## 🗓️ Implementation Plan

### Phase 1: Core Editor (Week 1-2)
- [ ] Rich text editor implementation
- [ ] Auto-save functionality
- [ ] Version control system
- [ ] Basic template loading

### Phase 2: AI Integration (Week 3-4)
- [ ] AI suggestion system
- [ ] Real-time grammar checking
- [ ] Tone optimization features
- [ ] Plagiarism detection

### Phase 3: Collaboration (Week 5-6)
- [ ] Real-time collaboration
- [ ] Comment and suggestion system
- [ ] Permission management
- [ ] Marketplace integration

### Phase 4: Template Library (Week 7-8)
- [ ] Template management system
- [ ] User contribution system
- [ ] Template analytics
- [ ] Success metrics tracking

---

## 🚨 Risks & Mitigation

### Technical Risks
- **AI Performance**: Slow AI responses affecting user experience
  - *Mitigation*: Implement caching and progressive loading
- **Real-time Sync**: Collaboration conflicts and data loss
  - *Mitigation*: Robust conflict resolution and backup systems
- **Editor Complexity**: Rich text editor bugs and performance issues
  - *Mitigation*: Thorough testing and fallback to plain text

### Product Risks
- **User Adoption**: Users may not trust AI suggestions
  - *Mitigation*: Transparent AI explanations and user control
- **Content Quality**: AI may generate inappropriate content
  - *Mitigation*: Content filtering and user reporting systems
- **Template Relevance**: Templates may not match user needs
  - *Mitigation*: Regular template updates and user feedback

### Business Risks
- **Development Costs**: AI API costs may exceed budget
  - *Mitigation*: Usage monitoring and cost optimization
- **Competition**: Competitors may launch similar features
  - *Mitigation*: Focus on unique value propositions and user experience
- **Legal Issues**: Copyright and plagiarism concerns
  - *Mitigation*: Clear terms of service and originality checks

---

## 📚 Documentation & Resources

### Technical Documentation
- [API Documentation](../../api/docs/narrative-forge.md)
- [Database Schema](../../database/schema.md)
- [Frontend Components](../../frontend/components/narrative-forge.md)

### User Documentation
- [User Guide](../../user-guide/narrative-forge.md)
- [Template Creation Guide](../../user-guide/templates.md)
- [AI Assistant Tutorial](../../user-guide/ai-assistant.md)

### Design Resources
- [UI Design System](../../design-system/narrative-forge.md)
- [User Flow Diagrams](../../design/user-flows/narrative-forge.md)
- [Interaction Patterns](../../design/interactions/narrative-forge.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-03-24  
**Next Review**: 2026-03-31  
**Product Owner**: [Product Lead Name]  
**Engineering Lead**: [Engineering Lead Name]  

---

> 💡 **Implementation Note**: This feature is critical for user acquisition and retention. Prioritize core editor functionality before advanced AI features to ensure stable user experience.
