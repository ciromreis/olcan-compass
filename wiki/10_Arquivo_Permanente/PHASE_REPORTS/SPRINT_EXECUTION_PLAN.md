# Sprint Execution Plan - Olcan Compass v2.5
**12-Week Implementation Roadmap with Actionable Tasks**

---

## Sprint Structure

**Sprint Duration:** 1 week (Monday-Friday)  
**Team Capacity:** Assume 1 full-time developer + design/product support  
**Buffer:** 15% for unknowns and bug fixes  
**Review:** Friday afternoon sprint review + retrospective  

---

## Sprint 0: Foundation & Bug Fixes (Week 1)

### Sprint Goal
Stabilize V2 production and prepare infrastructure for V2.5 features

### Tasks (Priority Order)

#### Critical Bug Fixes (Day 1-2)
**Estimated:** 8 hours

1. **Fix Route Creation 500 Error** (30 min)
   - Add `temporal_match_score: float = 0.0` to `RouteTemplateResponse` schema
   - Update route sorting logic to use schema field
   - Test: Create route with psych profile

2. **Fix Interview Timer Memory Leak** (30 min)
   - Add `isFinished` dependency to useEffect
   - Clear interval when session completes
   - Test: Complete interview, verify timer stops

3. **Fix Sprint Bulk Create** (2 hours)
   - Create `POST /sprints/:id/tasks/bulk` endpoint
   - Add `SprintTaskBulkCreate` schema
   - Update frontend to use single API call
   - Test: Create sprint with 20 tasks

4. **Fix Community Link Loop** (3 hours)
   - Update `CommunityContextSection.tsx` links to `/community/${item.id}`
   - Create `app/(app)/community/[id]/page.tsx`
   - Implement post detail view with replies
   - Test: Navigate from dashboard to post detail

5. **Fix Neon Cold Start** (1 hour)
   - Add `pool_pre_ping=True` to database config
   - Implement retry logic with exponential backoff (3 attempts)
   - Increase Axios timeout to 45s for auth endpoints
   - Test: Login after 10 minutes of inactivity

#### Infrastructure Setup (Day 3-4)
**Estimated:** 8 hours

6. **OIOS Schema Migration** (2 hours)
   - Complete Alembic migration `91e881fee226`
   - Add OIOS enums and columns
   - Test on staging branch
   - Deploy to staging database

7. **Monitoring Setup** (3 hours)
   - Configure PostHog project
   - Add event tracking to key actions
   - Set up Datadog dashboards
   - Configure alerts (error rate, response time)

8. **Feature Flags** (2 hours)
   - Implement feature flag system
   - Add flags for: narrativeForge, interviewSimulator, marketplace, oiosNudges
   - Create admin UI for flag management

9. **Staging Environment** (1 hour)
   - Create Neon staging branch
   - Configure Vercel preview deployments
   - Set up test data seeding

#### Planning & Documentation (Day 5)
**Estimated:** 4 hours

10. **Sprint 1 Planning** (2 hours)
    - Break down Narrative Forge into tasks
    - Estimate effort for each task
    - Assign priorities
    - Create GitHub issues

11. **Design System Audit** (2 hours)
    - Review existing components
    - Identify components to replace
    - Create migration checklist
    - Document component dependencies

### Success Criteria
- [ ] Zero critical bugs in production
- [ ] All V2 features functional
- [ ] OIOS schema deployed to staging
- [ ] Monitoring dashboards live
- [ ] Sprint 1 planned and ready

### Risks
- Bug fixes take longer than estimated → Buffer time available
- Migration breaks existing features → Staging branch protects production

---


## Sprint 1: Narrative Forge Foundation (Week 2)

### Sprint Goal
Launch basic document editor with Focus Mode and character counting

### Tasks (Priority Order)

#### Frontend Components (Day 1-3)
**Estimated:** 12 hours

1. **Focus Mode Container** (3 hours)
   - Create `FocusMode.tsx` component
   - Implement Framer Motion fade to OLED black
   - Hide navigation and sidebar
   - Add Esc key handler to exit
   - Test: Toggle Focus Mode, verify UI hides

2. **Document Editor** (4 hours)
   - Integrate Tiptap editor
   - Add basic formatting (bold, italic, lists)
   - Implement auto-save with debounce (30s)
   - Add optimistic concurrency check
   - Test: Write content, verify auto-save

3. **Character Counter** (2 hours)
   - Create `CharacterCounter.tsx` component
   - Real-time counting with visual warnings
   - Color coding: green (under), yellow (near), red (over)
   - Word count + character count
   - Test: Type text, verify counts update

4. **Document Type Selector** (2 hours)
   - Create dropdown for CV, Letter, Essay, SOP
   - Store selection in document metadata
   - Update character limits based on type
   - Test: Switch types, verify limits change

5. **Version History UI** (1 hour)
   - Create `VersionHistory.tsx` component
   - Display list of versions with timestamps
   - Show "user" vs "ai" created versions
   - Add rollback button
   - Test: Create versions, verify display

#### Backend API (Day 4-5)
**Estimated:** 8 hours

6. **Document CRUD Endpoints** (3 hours)
   - `POST /api/documents` - Create document
   - `GET /api/documents/:id` - Fetch document
   - `PATCH /api/documents/:id` - Update with version control
   - `DELETE /api/documents/:id` - Soft delete
   - Test: CRUD operations via Swagger

7. **Version Control Logic** (2 hours)
   - Implement optimistic concurrency (check `updated_at`)
   - Create version on each save
   - Tag versions as 'user' or 'ai'
   - Test: Concurrent updates, verify conflict handling

8. **Document List Endpoint** (1 hour)
   - `GET /api/documents` with pagination
   - Filter by type, status
   - Sort by updated_at
   - Test: Fetch documents, verify filtering

9. **Database Schema** (2 hours)
   - Create `documents` table
   - Create `document_versions` table
   - Add indexes for performance
   - Test: Insert documents, verify performance

### Success Criteria
- [ ] Users can create and edit documents
- [ ] Focus Mode works smoothly
- [ ] Character counter updates in real-time
- [ ] Auto-save prevents data loss
- [ ] Version history displays correctly

### Risks
- Tiptap integration complexity → Use minimal config initially
- Auto-save conflicts → Optimistic concurrency handles this

---

## Sprint 2: AI Polish Integration (Week 3)

### Sprint Goal
Enable AI-powered document polishing with OIOS context injection

### Tasks (Priority Order)

#### AI Gateway (Day 1-2)
**Estimated:** 8 hours

1. **AI Gateway Middleware** (3 hours)
   - Create rate limiting decorator
   - Implement usage tracking
   - Add OIOS context injection
   - Configure tier limits (free: 3, pro: unlimited)
   - Test: Exceed limit, verify 402 error

2. **Polish Document Endpoint** (3 hours)
   - `POST /api/ai/polish-document`
   - Accept: text, doc_type, user_id
   - Inject archetype + fear cluster from database
   - Call Gemini Flash with STAR methodology prompt
   - Return polished text + token count
   - Test: Polish document, verify OIOS context used

3. **Gemini Flash Integration** (2 hours)
   - Configure Gemini API client
   - Implement streaming response (optional)
   - Add error handling and fallback
   - Test: Various document types

#### Frontend Integration (Day 3-4)
**Estimated:** 8 hours

4. **AI Polish Button** (2 hours)
   - Create `AIPolishButton.tsx` with Lumina green
   - Add loading state with animated spinner
   - Implement hover glow effect
   - Test: Click button, verify loading state

5. **Polish Preview Modal** (3 hours)
   - Show original vs polished side-by-side
   - Add "Accept" and "Reject" buttons
   - Implement diff highlighting (optional)
   - Test: Accept/reject changes

6. **Usage Tracking UI** (2 hours)
   - Display "X of 3 free polishes used"
   - Show upgrade prompt after 3rd use
   - Add "Upgrade to Pro" button
   - Test: Use 3 polishes, verify paywall

7. **Error Handling** (1 hour)
   - Handle rate limit errors gracefully
   - Show clear upgrade messaging
   - Handle API failures with retry
   - Test: Various error scenarios

#### Payment Integration (Day 5)
**Estimated:** 4 hours

8. **Stripe Checkout** (3 hours)
   - Create checkout session endpoint
   - Implement success/cancel webhooks
   - Update user tier on payment
   - Test: Complete payment flow

9. **Pricing Page** (1 hour)
   - Create simple pricing table
   - Show free vs pro features
   - Add "Upgrade" CTAs
   - Test: Navigate to pricing, verify display

### Success Criteria
- [ ] AI polish works with archetype context
- [ ] Rate limiting enforces free tier limits
- [ ] Payment processing functional
- [ ] 60% free → paid conversion (target)
- [ ] < 3s AI response time

### Risks
- Gemini API rate limits → Implement queueing
- Payment webhook failures → Add retry logic

---


## Sprint 3: OIOS Nudge Engine (Week 4)

### Sprint Goal
Implement behavioral psychology layer with archetype-aware nudges

### Tasks (Priority Order)

#### Diagnostic Quiz (Day 1-2)
**Estimated:** 8 hours

1. **Quiz UI Component** (4 hours)
   - Create 12-question quiz interface
   - Implement progress indicator
   - Add archetype calculation logic
   - Design result reveal animation
   - Test: Complete quiz, verify archetype assigned

2. **Archetype Calculation** (2 hours)
   - Implement scoring algorithm
   - Map answers to archetypes
   - Determine fear cluster
   - Test: Various answer combinations

3. **Result Display** (2 hours)
   - Create `ArchetypeCard.tsx` component
   - Show archetype name, description, visual
   - Display fear cluster
   - Add "Learn More" link
   - Test: View result, verify accuracy

#### Nudge System (Day 3-4)
**Estimated:** 8 hours

4. **Nudge Scheduling Engine** (3 hours)
   - Create background job for nudge triggers
   - Implement trigger conditions (3-day, 7-day inactivity)
   - Add momentum calculation logic
   - Test: Simulate inactivity, verify nudges trigger

5. **Reframe Card Component** (2 hours)
   - Create `ReframeCard.tsx` with archetype styling
   - Implement fade-in animation
   - Add dismiss and action buttons
   - Test: Display reframe, verify styling

6. **Nudge Delivery System** (2 hours)
   - In-app banner component
   - Email template for nudges
   - User preference management
   - Test: Deliver nudge via multiple channels

7. **Nudge Content Library** (1 hour)
   - Create reframe messages for each archetype × fear cluster
   - Write momentum nudge templates
   - Write celebration messages
   - Test: Verify message relevance

#### Evolution System (Day 5)
**Estimated:** 4 hours

8. **Evolution Badge Component** (2 hours)
   - Create `EvolutionBadge.tsx`
   - Display current stage (Rookie, Champion, Mega)
   - Show progress to next stage
   - Add archetype-specific styling
   - Test: Display badge, verify styling

9. **Evolution Trigger Logic** (1 hour)
   - Implement stage advancement conditions
   - Trigger on: first document, 85+ score, etc.
   - Update database on evolution
   - Test: Meet conditions, verify advancement

10. **Evolution Celebration** (1 hour)
    - Create celebration modal with animation
    - Show new stage and unlocked capabilities
    - Add confetti particle effect
    - Test: Trigger evolution, verify celebration

### Success Criteria
- [ ] 90% complete archetype diagnostic
- [ ] Nudges trigger based on behavior
- [ ] 50% reduction in 7-day churn (target)
- [ ] 4.0+ nudge relevance rating (target)
- [ ] Evolution stages display correctly

### Risks
- Nudge timing too aggressive → Make frequency configurable
- Reframe messages feel generic → Test with real users

---

## Sprint 4: Interview Simulator Foundation (Week 5)

### Sprint Goal
Build dynamic question generation and session management

### Tasks (Priority Order)

#### Question Generation (Day 1-2)
**Estimated:** 8 hours

1. **Question Generation Endpoint** (3 hours)
   - `POST /api/interviews/generate-questions`
   - Accept: resume_text, job_description, interview_type
   - Call Gemini Flash with dynamic prompt
   - Return 5-10 tailored questions
   - Test: Generate questions, verify relevance

2. **Session Setup UI** (3 hours)
   - Create `SessionSetup.tsx` component
   - Add interview type selector (Behavioral, Technical, Cultural)
   - Add resume upload (optional)
   - Add job description textarea
   - Test: Set up session, verify data captured

3. **Question Display** (2 hours)
   - Create `QuestionDisplay.tsx` component
   - Show current question with timer
   - Add "Next Question" button
   - Show progress (Question 3 of 10)
   - Test: Navigate through questions

#### Session Management (Day 3-4)
**Estimated:** 8 hours

4. **Session CRUD Endpoints** (3 hours)
   - `POST /api/interviews/sessions` - Create session
   - `GET /api/interviews/sessions/:id` - Fetch session
   - `POST /api/interviews/sessions/:id/answer` - Submit answer
   - `PATCH /api/interviews/sessions/:id/complete` - Complete session
   - Test: Full session flow via API

5. **Answer Submission** (2 hours)
   - Create answer submission form
   - Store text answer (voice in Sprint 5)
   - Track time spent per question
   - Calculate total duration correctly (sum of answer times)
   - Test: Submit answers, verify duration

6. **Session History** (2 hours)
   - Create `PracticeHistory.tsx` component
   - Display past sessions with scores
   - Show improvement trends
   - Test: View history, verify data

7. **Progress Dashboard** (1 hour)
   - Create `ProgressDashboard.tsx`
   - Show session count, average scores
   - Display improvement chart
   - Test: Complete multiple sessions, verify trends

### Success Criteria
- [ ] Dynamic questions generate from context
- [ ] Sessions save correctly
- [ ] Duration calculates accurately (fixed bug)
- [ ] History displays with trends

### Risks
- Gemini Flash quality varies → Add quality check
- Question relevance issues → Refine prompts

---


## Sprint 5: Interview Simulator Voice Mode (Week 6)

### Sprint Goal
Add voice recording and AI fluency analysis

### Tasks (Priority Order)

#### Voice Recording (Day 1-2)
**Estimated:** 8 hours

1. **Web Audio API Integration** (4 hours)
   - Create `AudioRecorder.tsx` component
   - Implement MediaRecorder with audio stream
   - Add recording controls (start, stop, pause)
   - Display waveform visualization (optional)
   - Test: Record audio in Chrome, Firefox, Safari

2. **Audio Upload** (2 hours)
   - Convert audio blob to format for API
   - Upload to backend endpoint
   - Show upload progress
   - Handle upload errors
   - Test: Record and upload audio

3. **Transcription Endpoint** (2 hours)
   - `POST /api/ai/transcribe-answer`
   - Accept audio file
   - Call Gemini Flash multimodal API
   - Return transcript
   - Test: Upload audio, verify transcript

#### Fluency Analysis (Day 3-4)
**Estimated:** 8 hours

4. **Fluency Analysis Endpoint** (3 hours)
   - `POST /api/ai/analyze-fluency`
   - Accept transcript text
   - Analyze: filler words, pace, clarity
   - Check STAR methodology compliance
   - Return scores and feedback
   - Test: Analyze various transcripts

5. **Feedback Panel Component** (3 hours)
   - Create `FeedbackPanel.tsx`
   - Display fluency score with visual indicator
   - Show filler word count and examples
   - Display STAR compliance check
   - Add improvement suggestions
   - Test: Display feedback, verify clarity

6. **Score Calculation** (2 hours)
   - Implement fluency scoring algorithm
   - Calculate filler word percentage
   - Assess STAR structure
   - Generate improvement tips
   - Test: Various answer qualities

#### Payment Integration (Day 5)
**Estimated:** 4 hours

7. **Session Paywall** (2 hours)
   - Check user tier before session start
   - Show "1 free session used" indicator
   - Redirect to checkout after free session
   - Test: Use free session, verify paywall

8. **Stripe Product Setup** (1 hour)
   - Create Stripe products (single session, 5-pack, unlimited)
   - Configure pricing ($10, $40, $25/month)
   - Set up webhook handling
   - Test: Purchase session, verify access

9. **Session Purchase Flow** (1 hour)
   - Create checkout page
   - Handle success/cancel redirects
   - Update user session credits
   - Test: Complete purchase, verify credits

### Success Criteria
- [ ] Voice recording works in all browsers
- [ ] Transcription accuracy > 90%
- [ ] Fluency analysis provides actionable feedback
- [ ] Payment flow functional
- [ ] 40% free → paid conversion (target)

### Risks
- Browser compatibility issues → Test early, provide fallbacks
- Transcription accuracy → Use high-quality audio settings

---

## Sprint 6: Sprint Orchestrator Enhancement (Week 7)

### Sprint Goal
Improve productivity features with bandwidth-aware planning

### Tasks (Priority Order)

#### Bandwidth Assessment (Day 1)
**Estimated:** 4 hours

1. **Bandwidth Input UI** (2 hours)
   - Create `BandwidthInput.tsx` component
   - Add slider for weekly hours (1-20)
   - Show time commitment examples
   - Store preference in user profile
   - Test: Set bandwidth, verify storage

2. **Micro-Sprint Generation** (2 hours)
   - Implement task size calculation (15-30 min based on bandwidth)
   - Break goals into micro-tasks
   - Limit visible tasks to 5
   - Test: Generate sprint, verify task sizes

#### Adaptive Difficulty (Day 2-3)
**Estimated:** 8 hours

3. **Completion Rate Tracking** (2 hours)
   - Calculate user's historical completion rate
   - Store in user profile
   - Update after each sprint
   - Test: Complete sprints, verify rate updates

4. **Difficulty Adjustment** (3 hours)
   - Implement adaptive task sizing
   - Reduce size if completion < 50%
   - Increase size if completion > 90%
   - Test: Various completion rates

5. **DAG-Based Filtering** (3 hours)
   - Implement opportunity filtering logic
   - Check: financial viability, timeline, qualifications
   - Hide impossible paths
   - Test: Filter opportunities, verify accuracy

#### UX Improvements (Day 4-5)
**Estimated:** 8 hours

6. **Progress Orb Component** (3 hours)
   - Create `ProgressOrb.tsx` with circular progress
   - Add glow effect and animation
   - Show percentage and label
   - Test: Update progress, verify animation

7. **Celebration Modal** (2 hours)
   - Create sprint completion celebration
   - Show stats (tasks completed, time spent)
   - Add "5 more minutes or call it?" options
   - Test: Complete sprint, verify celebration

8. **Sprint History View** (2 hours)
   - Display past sprints with completion rates
   - Show improvement trends
   - Add filters (completed, abandoned)
   - Test: View history, verify data

9. **Opt-Out Mechanics** (1 hour)
   - Add "Pause Sprint" button
   - Implement "Call it for now" option
   - Save progress on pause
   - Test: Pause and resume sprint

### Success Criteria
- [ ] Bandwidth-aware task generation works
- [ ] Adaptive difficulty adjusts correctly
- [ ] DAG filtering hides impossible paths
- [ ] 75% sprint completion rate (target)
- [ ] 60% report reduced overwhelm (target)

### Risks
- Task sizing too aggressive → Start conservative
- DAG logic too restrictive → Make configurable

---


## Sprint 7: ATS Intelligence (Week 8)

### Sprint Goal
Add competitive differentiation with ATS keyword analysis

### Tasks (Priority Order)

#### Keyword Extraction (Day 1-2)
**Estimated:** 8 hours

1. **ATS Analysis Endpoint** (4 hours)
   - `POST /api/ai/ats-score`
   - Accept: document_text, job_description
   - Extract keywords from both
   - Calculate match percentage
   - Identify missing keywords
   - Test: Analyze various documents

2. **Keyword Matching Logic** (2 hours)
   - Implement fuzzy matching (handle variations)
   - Weight keywords by importance
   - Calculate overall score (0-100)
   - Test: Various keyword combinations

3. **Improvement Suggestions** (2 hours)
   - Generate suggestions for missing keywords
   - Suggest where to add keywords naturally
   - Provide example sentences
   - Test: Verify suggestions are actionable

#### ATS Score Panel (Day 3-4)
**Estimated:** 8 hours

4. **Score Panel Component** (3 hours)
   - Create `ATSScorePanel.tsx`
   - Display overall score with visual indicator
   - Show matched vs missing keywords
   - Add improvement suggestions
   - Test: Display panel, verify clarity

5. **Job Description Input** (2 hours)
   - Add textarea for JD paste
   - Parse and extract requirements
   - Store for reuse
   - Test: Paste JD, verify parsing

6. **Keyword Highlighting** (2 hours)
   - Highlight matched keywords in document (green)
   - Highlight missing keywords in JD (yellow)
   - Add tooltip with explanation
   - Test: Verify highlighting accuracy

7. **Score History** (1 hour)
   - Track score improvements over versions
   - Display trend chart
   - Show before/after comparisons
   - Test: Multiple versions, verify trends

#### Integration (Day 5)
**Estimated:** 4 hours

8. **Forge Integration** (2 hours)
   - Add ATS panel to Forge sidebar
   - Auto-analyze on document save
   - Show score changes in real-time
   - Test: Edit document, verify score updates

9. **Export with Score** (1 hour)
   - Include ATS score in PDF metadata
   - Add score badge to exported document
   - Test: Export, verify score included

10. **Documentation** (1 hour)
    - Write user guide for ATS feature
    - Create video tutorial (optional)
    - Add tooltips for first-time users
    - Test: New user flow, verify clarity

### Success Criteria
- [ ] ATS scoring works accurately
- [ ] Suggestions are actionable
- [ ] 80% of users use ATS feature (target)
- [ ] 15% improvement in keyword match (target)
- [ ] 4.0+ usefulness rating (target)

### Risks
- Keyword extraction accuracy → Use proven NLP libraries
- Score calculation complexity → Start simple, iterate

---

## Sprint 8: Marketplace Foundation (Week 9)

### Sprint Goal
Enable mentor onboarding and profile creation

### Tasks (Priority Order)

#### Mentor Onboarding (Day 1-2)
**Estimated:** 8 hours

1. **Mentor Registration** (3 hours)
   - Create mentor signup flow
   - Collect: expertise, bio, specializations
   - Add archetype specialization selector
   - Test: Complete registration

2. **Stripe Connect Onboarding** (3 hours)
   - `POST /api/marketplace/connect/onboard`
   - Create Stripe Connect Express account
   - Handle onboarding redirect
   - Store stripe_account_id
   - Test: Complete Stripe onboarding

3. **Mentor Profile Page** (2 hours)
   - Create mentor profile editor
   - Add photo upload
   - Set pricing per review
   - Test: Edit profile, verify updates

#### Mentor Directory (Day 3-4)
**Estimated:** 8 hours

4. **Mentor Card Component** (3 hours)
   - Create `MentorCard.tsx` with glass styling
   - Display: photo, name, rating, expertise, price
   - Add hover effect with lift + glow
   - Test: Display mentor cards

5. **Directory Page** (3 hours)
   - Create `/marketplace` page
   - Grid layout with mentor cards
   - Add filters (expertise, archetype, price)
   - Implement search
   - Test: Browse mentors, verify filtering

6. **Mentor Detail Modal** (2 hours)
   - Create detailed mentor profile view
   - Show: full bio, reviews, availability
   - Add "Request Review" CTA
   - Test: View mentor details

#### Review Request Flow (Day 5)
**Estimated:** 4 hours

7. **Review Request UI** (2 hours)
   - Create document section selector
   - Add specific concerns textarea
   - Show price and estimated turnaround
   - Test: Create review request

8. **Archetype Brief Generation** (1 hour)
   - Auto-generate mentor brief with OIOS context
   - Include: archetype, fear cluster, specific concerns
   - Test: Verify brief accuracy

9. **Database Schema** (1 hour)
   - Create mentors, transactions, reviews tables
   - Add indexes for performance
   - Test: Insert test data

### Success Criteria
- [ ] 20+ mentors onboarded (target)
- [ ] Mentor directory functional
- [ ] Review request flow works
- [ ] Archetype briefs generate correctly

### Risks
- Mentor recruitment → Start outreach early
- Stripe Connect complexity → Use Express (simplest)

---


## Sprint 9: Marketplace Completion (Week 10)

### Sprint Goal
Complete payment processing and mentor review workflow

### Tasks (Priority Order)

#### Payment Processing (Day 1-2)
**Estimated:** 8 hours

1. **Checkout Endpoint** (3 hours)
   - `POST /api/marketplace/checkout`
   - Create Stripe Checkout Session
   - Include mentor_id, document_id in metadata
   - Handle success/cancel webhooks
   - Test: Complete checkout flow

2. **Payment Webhook Handler** (3 hours)
   - Handle `checkout.session.completed` event
   - Create transaction record
   - Generate ephemeral access token
   - Notify mentor via email
   - Test: Simulate webhook, verify flow

3. **Transaction History** (2 hours)
   - Create transaction list page
   - Show: date, mentor, amount, status
   - Add receipt download
   - Test: View transactions

#### Mentor Review Workflow (Day 3-4)
**Estimated:** 8 hours

4. **Mentor Dashboard** (3 hours)
   - Create `/mentor/dashboard` page
   - Show pending reviews
   - Display archetype briefs
   - Add earnings summary
   - Test: View as mentor

5. **Review Interface** (3 hours)
   - Create document view with comment system
   - Implement ephemeral access check
   - Add rating and feedback form
   - Test: Submit review as mentor

6. **Ephemeral Token System** (2 hours)
   - Generate time-limited JWT (24h expiry)
   - Scope: read + comment only (not edit/delete)
   - Validate on document access
   - Test: Token expiry, scope restrictions

#### Notification System (Day 5)
**Estimated:** 4 hours

7. **Email Notifications** (2 hours)
   - Mentor: New review request
   - User: Review completed
   - Use SendGrid or similar
   - Test: Trigger notifications

8. **In-App Notifications** (1 hour)
   - Create notification bell icon
   - Show unread count
   - Display notification list
   - Test: Receive notifications

9. **Reputation System** (1 hour)
   - Calculate mentor rating (average)
   - Update review count
   - Display on mentor cards
   - Test: Submit ratings, verify updates

### Success Criteria
- [ ] Payment processing works end-to-end
- [ ] Mentors can review documents
- [ ] Ephemeral access enforced
- [ ] Notifications delivered
- [ ] 70% complete purchase (target)

### Risks
- Webhook reliability → Add retry logic
- Token security → Thorough testing required

---

## Sprint 10: Design System Migration (Week 11)

### Sprint Goal
Replace old components with new glass morphism design system

### Tasks (Priority Order)

#### Component Replacement (Day 1-3)
**Estimated:** 12 hours

1. **Button Migration** (2 hours)
   - Replace all old buttons with `GlassButton`
   - Update props to match new API
   - Test: All button interactions

2. **Card Migration** (3 hours)
   - Replace all old cards with `GlassCard`
   - Update layouts for new card structure
   - Test: All card displays

3. **Input Migration** (2 hours)
   - Replace all inputs with `GlassInput`
   - Update form handling
   - Test: All form submissions

4. **Modal Migration** (2 hours)
   - Replace all modals with `GlassModal`
   - Update modal triggers
   - Test: All modal flows

5. **Badge Migration** (1 hour)
   - Replace emojis with `StatusBadge`
   - Update status indicators
   - Test: All status displays

6. **Navigation Migration** (2 hours)
   - Update sidebar with glass styling
   - Update top nav with glass styling
   - Test: All navigation flows

#### Visual QA (Day 4-5)
**Estimated:** 8 hours

7. **Cross-Browser Testing** (3 hours)
   - Test in Chrome, Firefox, Safari, Edge
   - Verify glass effects render correctly
   - Check animation performance
   - Test: All major features in each browser

8. **Responsive Testing** (2 hours)
   - Test on mobile, tablet, desktop
   - Verify glass effects on mobile (reduced)
   - Check touch interactions
   - Test: All features on each device

9. **Accessibility Audit** (2 hours)
   - Run axe DevTools on all pages
   - Test keyboard navigation
   - Test with screen reader
   - Fix any issues found

10. **Performance Audit** (1 hour)
    - Run Lighthouse on all pages
    - Check bundle size
    - Verify 60fps animations
    - Optimize if needed

### Success Criteria
- [ ] All old components replaced
- [ ] Zero emojis in production UI
- [ ] Consistent glass morphism aesthetic
- [ ] WCAG AA compliant
- [ ] Lighthouse score > 90

### Risks
- Migration breaks existing features → Thorough testing required
- Performance degradation → Monitor and optimize

---


## Sprint 11: Analytics & Optimization (Week 12)

### Sprint Goal
Implement comprehensive analytics and cost monitoring

### Tasks (Priority Order)

#### Event Tracking (Day 1-2)
**Estimated:** 8 hours

1. **PostHog Integration** (2 hours)
   - Install PostHog SDK
   - Configure project
   - Add tracking wrapper
   - Test: Events appear in PostHog

2. **Key Event Tracking** (4 hours)
   - Track: signup, login, document_created, ai_polish_used
   - Track: interview_started, interview_completed
   - Track: sprint_created, task_completed
   - Track: payment_initiated, payment_completed
   - Track: nudge_triggered, nudge_dismissed, nudge_acted
   - Test: Trigger events, verify in PostHog

3. **Funnel Setup** (2 hours)
   - Create funnels in PostHog
   - Signup → First document → AI polish → Payment
   - Signup → Archetype quiz → First sprint → Completion
   - Stuck → Marketplace → Purchase → Review
   - Test: Verify funnel data

#### Cost Monitoring (Day 3)
**Estimated:** 4 hours

4. **LLM Usage Tracking** (2 hours)
   - Create `llm_usage` table
   - Track: user_id, tokens, cost, timestamp
   - Add to every LLM call
   - Test: Make LLM calls, verify tracking

5. **Cost Dashboard** (2 hours)
   - Create admin dashboard for costs
   - Show: total cost, cost per user, cost by feature
   - Add alerts for cost spikes
   - Test: View dashboard, verify accuracy

#### Revenue Attribution (Day 4)
**Estimated:** 4 hours

6. **Revenue Tracking** (2 hours)
   - Create `revenue_attribution` table
   - Track revenue by feature
   - Link payments to features
   - Test: Make payments, verify attribution

7. **Revenue Dashboard** (2 hours)
   - Show: total revenue, revenue by feature, ARPU
   - Display: conversion rates, LTV estimates
   - Add: profit margin calculation
   - Test: View dashboard, verify metrics

#### Optimization (Day 5)
**Estimated:** 4 hours

8. **Performance Optimization** (2 hours)
   - Optimize slow database queries
   - Add caching for common requests
   - Reduce bundle size
   - Test: Verify improvements

9. **Cost Optimization** (1 hour)
   - Implement LLM response caching
   - Reduce context window where possible
   - Optimize prompts for token efficiency
   - Test: Verify cost reduction

10. **A/B Testing Setup** (1 hour)
    - Implement feature flag-based A/B tests
    - Set up PostHog experiments
    - Document testing process
    - Test: Run sample experiment

### Success Criteria
- [ ] All key events tracked
- [ ] Cost monitoring functional
- [ ] Revenue attribution accurate
- [ ] < $0.50 LLM cost per user (target)
- [ ] Performance optimized

### Risks
- PostHog data volume → Configure sampling
- Cost tracking accuracy → Validate against Stripe

---

## Sprint 12: Launch Preparation (Week 12)

### Sprint Goal
Final polish, documentation, and launch readiness

### Tasks (Priority Order)

#### Documentation (Day 1-2)
**Estimated:** 8 hours

1. **User Documentation** (3 hours)
   - Write feature guides (Forge, Interview, Sprint)
   - Create video tutorials (optional)
   - Add in-app tooltips
   - Test: New user can follow guides

2. **API Documentation** (2 hours)
   - Generate Swagger/OpenAPI docs
   - Add endpoint descriptions
   - Include example requests/responses
   - Test: Docs are accurate and complete

3. **Admin Runbook** (2 hours)
   - Document common issues and solutions
   - Create incident response procedures
   - Add monitoring alert explanations
   - Test: Follow runbook for sample issue

4. **Changelog** (1 hour)
   - Document all V2.5 changes
   - Highlight new features
   - Note breaking changes (if any)
   - Test: Review for accuracy

#### Final Testing (Day 3-4)
**Estimated:** 8 hours

5. **End-to-End Testing** (4 hours)
   - Test complete user journeys
   - Signup → Diagnostic → Document → Polish → Pay
   - Signup → Interview → Practice → Pay
   - Stuck → Marketplace → Purchase → Review
   - Test: All critical paths work

6. **Load Testing** (2 hours)
   - Simulate 100 concurrent users
   - Verify database handles load
   - Check API response times
   - Test: Performance under load

7. **Security Audit** (2 hours)
   - Run security scanner (Snyk, OWASP ZAP)
   - Check for common vulnerabilities
   - Verify RLS policies
   - Test: Attempt unauthorized access

#### Launch Preparation (Day 5)
**Estimated:** 4 hours

8. **Deployment Checklist** (1 hour)
   - Verify all environment variables set
   - Check database migrations applied
   - Confirm monitoring configured
   - Test: Staging environment matches production

9. **Rollback Plan** (1 hour)
   - Document rollback procedure
   - Test rollback on staging
   - Prepare communication for users
   - Test: Execute rollback, verify works

10. **Launch Communication** (2 hours)
    - Write launch announcement
    - Prepare email to existing users
    - Create social media posts
    - Schedule launch activities

### Success Criteria
- [ ] All documentation complete
- [ ] All tests passing
- [ ] Security audit clean
- [ ] Rollback plan tested
- [ ] Launch communication ready

### Risks
- Last-minute bugs → Buffer time available
- Deployment issues → Rollback plan ready

---


## Post-Launch: Continuous Improvement

### Week 13-16: Iteration & Optimization

#### Week 13: User Feedback Collection
**Focus:** Gather data on what's working and what's not

**Tasks:**
- [ ] Send NPS survey to all users
- [ ] Analyze PostHog funnels for drop-off points
- [ ] Review support tickets for common issues
- [ ] Conduct 10 user interviews
- [ ] Synthesize feedback into themes

**Deliverable:** Feedback synthesis report with prioritized improvements

#### Week 14: Quick Wins
**Focus:** Fix top 5 issues from feedback

**Tasks:**
- [ ] Implement top 3 UX improvements
- [ ] Fix top 2 bugs reported
- [ ] Optimize slowest endpoints
- [ ] Improve most confusing UI elements
- [ ] Update documentation based on questions

**Deliverable:** Improved user experience based on real feedback

#### Week 15: Feature Enhancement
**Focus:** Deepen existing features based on usage data

**Tasks:**
- [ ] Add most-requested feature variations
- [ ] Improve AI prompt quality based on feedback
- [ ] Enhance nudge messaging based on effectiveness
- [ ] Add missing integrations (if needed)
- [ ] Optimize conversion funnels

**Deliverable:** Enhanced features with higher engagement

#### Week 16: Growth Experiments
**Focus:** Test growth hypotheses

**Tasks:**
- [ ] Run 3 A/B tests (pricing, messaging, onboarding)
- [ ] Launch referral program
- [ ] Create viral achievement cards
- [ ] Test new marketing channels
- [ ] Optimize for conversion

**Deliverable:** Data-driven growth strategy

---

## Sprint Retrospective Template

### What Went Well
- Successes and wins
- Effective processes
- Good decisions

### What Didn't Go Well
- Challenges and blockers
- Process issues
- Poor decisions

### Action Items
- Specific improvements for next sprint
- Process changes
- Tool or workflow updates

### Metrics Review
- Sprint velocity (story points completed)
- Bug count (new vs fixed)
- Code quality (test coverage, linting)
- User feedback (if available)

---

## Daily Standup Template

### Yesterday
- What did I complete?
- What blockers did I resolve?

### Today
- What will I work on?
- What's my priority?

### Blockers
- What's blocking me?
- What help do I need?

**Duration:** 15 minutes max  
**Format:** Async (Slack) or sync (video call)  
**Frequency:** Every weekday

---

## Task Estimation Guide

### Complexity Levels

**Small (1-2 hours):**
- Simple UI component
- Basic CRUD endpoint
- Configuration change
- Documentation update

**Medium (3-4 hours):**
- Complex UI component with state
- API endpoint with business logic
- Database migration
- Integration with external service

**Large (1 day):**
- Feature with multiple components
- Complex algorithm implementation
- Full user flow (frontend + backend)
- Major refactoring

**Extra Large (2-3 days):**
- Complete feature module
- Complex integration (Stripe Connect)
- Performance optimization project
- Major architectural change

### Estimation Tips
- Add 15% buffer for unknowns
- Break large tasks into smaller ones
- Consider dependencies
- Account for testing time
- Include documentation time

---


## Risk Management Per Sprint

### Sprint 0 Risks
**High:** Bug fixes take longer than estimated
- Mitigation: Start with highest priority bugs
- Contingency: Extend sprint by 2 days if needed

**Medium:** Migration breaks existing features
- Mitigation: Use staging branch, thorough testing
- Contingency: Rollback migration, fix issues

### Sprint 1-2 Risks (Narrative Forge)
**High:** Tiptap integration complexity
- Mitigation: Use minimal config, add features incrementally
- Contingency: Use simpler textarea initially

**Medium:** Auto-save conflicts
- Mitigation: Optimistic concurrency control
- Contingency: Show conflict resolution UI

**Medium:** AI response quality varies
- Mitigation: Refine prompts with OIOS context
- Contingency: Add manual editing option

### Sprint 3 Risks (OIOS Nudge Engine)
**High:** Nudge timing too aggressive
- Mitigation: Make frequency configurable
- Contingency: Reduce default frequency

**Medium:** Reframe messages feel generic
- Mitigation: Test with real users, iterate
- Contingency: Add more message variations

### Sprint 4-5 Risks (Interview Simulator)
**High:** Browser compatibility for Web Audio
- Mitigation: Test early, provide fallbacks
- Contingency: Text-only mode for unsupported browsers

**Medium:** Transcription accuracy
- Mitigation: Use high-quality audio settings
- Contingency: Allow manual transcript editing

**Medium:** Gemini Flash quality varies
- Mitigation: Add quality check, retry if needed
- Contingency: Fallback to Gemini Pro

### Sprint 6 Risks (Sprint Orchestrator)
**Medium:** Task sizing too aggressive
- Mitigation: Start conservative, adjust based on data
- Contingency: Allow manual task size adjustment

**Low:** DAG logic too restrictive
- Mitigation: Make filtering configurable
- Contingency: Add "Show all" option

### Sprint 8-9 Risks (Marketplace)
**High:** Mentor recruitment (need 20+)
- Mitigation: Start outreach in Sprint 0
- Contingency: Delay launch, use Olcan team as mentors

**High:** Stripe Connect complexity
- Mitigation: Use Express (simplest option)
- Contingency: Manual payment processing initially

**Medium:** Webhook reliability
- Mitigation: Add retry logic, idempotency
- Contingency: Manual transaction reconciliation

### Sprint 10 Risks (Design Migration)
**Medium:** Migration breaks features
- Mitigation: Thorough testing, gradual rollout
- Contingency: Feature flags for quick rollback

**Low:** Performance degradation
- Mitigation: Monitor and optimize
- Contingency: Reduce glass effects on mobile

### Sprint 11 Risks (Analytics)
**Low:** PostHog data volume
- Mitigation: Configure sampling
- Contingency: Reduce tracked events

**Low:** Cost tracking accuracy
- Mitigation: Validate against Stripe
- Contingency: Manual reconciliation

---

## Success Metrics Dashboard

### Weekly Tracking

**Development Velocity:**
- Story points completed vs planned
- Bug count (new vs fixed)
- Code review turnaround time
- Deployment frequency

**Product Metrics:**
- Monthly Active Users (MAU)
- Daily Active Users (DAU)
- Feature adoption rates
- Conversion rates by feature

**Business Metrics:**
- Revenue (total, by feature)
- ARPU (average revenue per user)
- LTV (lifetime value)
- CAC (customer acquisition cost)

**Quality Metrics:**
- Error rate (by endpoint)
- Response time (p50, p95, p99)
- Uptime percentage
- User satisfaction (NPS)

### Sprint Review Format

**Agenda:**
1. Demo completed features (15 min)
2. Review metrics vs targets (10 min)
3. Discuss blockers and risks (10 min)
4. Plan next sprint (15 min)
5. Retrospective (10 min)

**Attendees:**
- Development team
- Product owner
- Design lead
- Stakeholders (optional)

**Deliverable:**
- Sprint review notes
- Next sprint plan
- Action items

---

## Definition of Done

### Feature Complete Checklist

**Code:**
- [ ] Implementation complete
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Code reviewed and approved
- [ ] No linting errors
- [ ] TypeScript types defined

**Quality:**
- [ ] Manual testing complete
- [ ] Cross-browser tested
- [ ] Responsive design verified
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met

**Documentation:**
- [ ] API documentation updated
- [ ] User guide written
- [ ] Code comments added
- [ ] Storybook story created (if UI component)

**Deployment:**
- [ ] Deployed to staging
- [ ] Smoke tests passed
- [ ] Monitoring configured
- [ ] Rollback plan documented

**Business:**
- [ ] Success metrics defined
- [ ] Tracking implemented
- [ ] Stakeholder approval
- [ ] Launch communication ready

---

## Emergency Procedures

### Critical Bug in Production

**Severity Levels:**
- **P0 (Critical):** System down, data loss, security breach
- **P1 (High):** Major feature broken, payment issues
- **P2 (Medium):** Minor feature broken, UX issues
- **P3 (Low):** Cosmetic issues, nice-to-haves

**Response Time:**
- P0: Immediate (< 30 min)
- P1: Same day (< 4 hours)
- P2: Next sprint (< 1 week)
- P3: Backlog (prioritize later)

**Incident Response:**
1. Acknowledge issue (communicate to users)
2. Assess severity and impact
3. Implement hotfix or rollback
4. Deploy fix to production
5. Verify fix works
6. Post-mortem (what happened, how to prevent)

### Rollback Procedure

**When to Rollback:**
- Critical bug introduced
- Performance degradation > 50%
- Data integrity issues
- Security vulnerability

**How to Rollback:**
1. Revert to previous Vercel deployment
2. Rollback database migration (if needed)
3. Disable feature flags for new features
4. Communicate to users
5. Fix issues in staging
6. Redeploy when ready

---

