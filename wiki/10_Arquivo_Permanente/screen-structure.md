# This is a **screen topology map**, not a UI sketch.

I will:

1. Map user types

2. Map primary journeys

3. Map state-dependent screens

4. Map modal overlays

5. Map AI-interaction states

6. Map mobile navigation structure

7. Map desktop navigation structure

8. Define screen objects in JSON-like structured format

9. Include buttons, CTAs, data panels, state transitions

10. Include forward/back paths

This is exhaustive.

---

# **USER TYPES**

{  
  "user\_types": \[  
    "ANONYMOUS\_VISITOR",  
    "FREE\_USER",  
    "PRO\_USER",  
    "PREMIUM\_USER",  
    "PROVIDER",  
    "ORG\_MEMBER",  
    "ORG\_COORDINATOR",  
    "ORG\_ADMIN",  
    "SUPER\_ADMIN"  
  \]  
}  
---

# **GLOBAL NAVIGATION MODEL (Mobile-First)**

Bottom navigation (primary app users):

\[Home\] \[Route\] \[Practice\] \[Applications\] \[More\]

Desktop adds sidebar \+ topbar.

---

# **MASTER SCREEN MAP STRUCTURE**

Below is the full system screen structure.

---

{  
  "app": {  
    "public\_screens": {},  
    "auth\_screens": {},  
    "core\_user\_screens": {},  
    "provider\_screens": {},  
    "organization\_screens": {},  
    "admin\_screens": {},  
    "shared\_modals": {}  
  }  
}

Now expanded fully.

---

# **1️⃣ PUBLIC SCREENS**

"public\_screens": {  
  "landing\_page": {  
    "sections": \[  
      "Hero (AI-powered mobility OS)",  
      "How It Works (3 steps)",  
      "Psych \+ Strategy \+ Execution pillars",  
      "Success stories",  
      "Marketplace preview",  
      "Pricing preview",  
      "CTA: Start Assessment",  
      "CTA: Login"  
    \],  
    "routes": {  
      "start\_assessment": "psych\_onboarding\_intro",  
      "login": "login\_screen"  
    }  
  },

  "pricing\_page": {  
    "elements": \[  
      "Free vs Pro vs Premium comparison table",  
      "Marketplace access highlight",  
      "Upgrade CTA",  
      "FAQ accordion"  
    \]  
  },

  "provider\_landing": {  
    "elements": \[  
      "Become a Provider CTA",  
      "Benefits section",  
      "Commission explanation",  
      "Login CTA"  
    \]  
  }  
}  
---

# **2️⃣ AUTH SCREENS**

"auth\_screens": {  
  "login\_screen": {  
    "fields": \["email", "password"\],  
    "buttons": \["Login", "Forgot Password", "Sign Up"\],  
    "state\_transitions": {  
      "success": "home\_dashboard",  
      "forgot\_password": "password\_reset"  
    }  
  },

  "signup\_screen": {  
    "fields": \["email", "password", "confirm\_password"\],  
    "checkbox": \["Accept Terms"\],  
    "cta": "Create Account",  
    "on\_success": "psych\_onboarding\_intro"  
  },

  "password\_reset": {  
    "fields": \["email"\],  
    "cta": "Send Reset Link"  
  }  
}  
---

# **3️⃣ PSYCHOLOGICAL ONBOARDING FLOW**

Sequence-based.

"psych\_onboarding": {  
  "psych\_onboarding\_intro": {  
    "elements": \[  
      "Welcome message",  
      "Explanation of Compass assessment",  
      "Estimated time",  
      "CTA: Begin"  
    \]  
  },

  "psych\_question\_screen": {  
    "dynamic\_questions": true,  
    "progress\_bar": true,  
    "navigation": \["Next", "Back"\],  
    "save\_progress": true  
  },

  "psych\_results\_screen": {  
    "elements": \[  
      "Confidence Index Card",  
      "Anxiety Index Card",  
      "Discipline Card",  
      "Psychological State Label",  
      "Personalized Insight Summary"  
    \],  
    "cta": "Create Your First Route"  
  }  
}  
---

# **4️⃣ HOME DASHBOARD (AI-FIRST)**

"home\_dashboard": {  
  "sections": \[  
    "Welcome header (dynamic by psych state)",  
    "Current Route Snapshot Card",  
    "Readiness Score Card",  
    "Next Recommended Action Card",  
    "Momentum Indicator",  
    "Upcoming Deadline Banner",  
    "Marketplace Suggestion Card (contextual)",  
    "Upgrade Suggestion Banner (if free)"  
  \],  
  "quick\_actions": \[  
    "Resume Route",  
    "Start Interview Practice",  
    "Improve Narrative",  
    "View Applications"  
  \]  
}  
---

# **5️⃣ ROUTE DOMAIN SCREENS**

"route\_screens": {  
  "route\_selection\_screen": {  
    "cards": \[  
      "Scholarship",  
      "Job Relocation",  
      "Research",  
      "Startup Visa",  
      "Exchange"  
    \],  
    "cta": "Create Route"  
  },

  "route\_overview\_screen": {  
    "sections": \[  
      "Route State Badge",  
      "Progress Bar",  
      "Milestone List (grouped)",  
      "Risk Indicator",  
      "Timeline Countdown",  
      "Readiness Score Snapshot"  
    \],  
    "actions": \[  
      "Complete Milestone",  
      "View Readiness",  
      "Open Narrative",  
      "Practice Interview",  
      "Add Opportunity"  
    \]  
  },

  "milestone\_detail\_screen": {  
    "elements": \[  
      "Milestone Description",  
      "Required Evidence",  
      "Upload Button",  
      "Mark Complete"  
    \]  
  }  
}  
---

# **6️⃣ READINESS SCREENS**

"readiness\_screens": {  
  "readiness\_overview": {  
    "elements": \[  
      "Overall Score Gauge",  
      "Dimension Breakdown Radar Chart",  
      "Risk Index Indicator",  
      "Success Probability Display",  
      "Top 3 Gaps List",  
      "Improvement CTA Buttons"  
    \]  
  },

  "readiness\_history": {  
    "elements": \[  
      "Trend Graph",  
      "Risk Trend Line",  
      "Momentum Line",  
      "Snapshot Comparison Selector"  
    \]  
  }  
}  
---

# **7️⃣ NARRATIVE SCREENS**

"narrative\_screens": {  
  "narrative\_list": {  
    "cards": \[  
      "Motivation Letter",  
      "Statement of Purpose",  
      "Research Proposal",  
      "CV Summary"  
    \],  
    "cta": "Create New Document"  
  },

  "narrative\_editor": {  
    "elements": \[  
      "Rich Text Editor",  
      "Word Count Indicator",  
      "Save Draft",  
      "Submit for Analysis"  
    \]  
  },

  "narrative\_analysis\_screen": {  
    "elements": \[  
      "Clarity Score",  
      "Coherence Score",  
      "Alignment Score",  
      "Authenticity Risk Indicator",  
      "Improvement Actions List",  
      "Compare Versions Button"  
    \]  
  }  
}  
---

# **8️⃣ INTERVIEW SCREENS**

"interview\_screens": {  
  "interview\_intro": {  
    "elements": \[  
      "Session Type",  
      "Difficulty Level",  
      "Estimated Duration",  
      "CTA: Start Interview"  
    \]  
  },

  "interview\_question\_screen": {  
    "elements": \[  
      "Question Text",  
      "Text Input Area",  
      "Timer Indicator",  
      "Next Button"  
    \]  
  },

  "interview\_results\_screen": {  
    "elements": \[  
      "Overall Score",  
      "Resilience Index",  
      "Confidence Projection Score",  
      "Improvement Points",  
      "Practice Again CTA"  
    \]  
  },

  "interview\_history\_screen": {  
    "elements": \[  
      "Session List",  
      "Trend Graph",  
      "Difficulty Progression Chart"  
    \]  
  }  
}  
---

# **9️⃣ APPLICATION SCREENS**

"application\_screens": {  
  "application\_list": {  
    "cards": \[  
      "Opportunity Card (state badge)",  
      "Deadline indicator",  
      "Outcome label"  
    \],  
    "cta": "Add Opportunity"  
  },

  "application\_create\_screen": {  
    "fields": \[  
      "Title",  
      "Organization",  
      "Country",  
      "Deadline",  
      "Competitiveness"  
    \],  
    "cta": "Create"  
  },

  "application\_detail\_screen": {  
    "elements": \[  
      "State Badge",  
      "Readiness Snapshot at Submission",  
      "Linked Narrative Version",  
      "Deadline Countdown",  
      "Submission CTA"  
    \]  
  },

  "application\_outcome\_screen": {  
    "elements": \[  
      "Outcome Badge",  
      "Recalibration Insight",  
      "Suggested Improvements",  
      "Iteration CTA"  
    \]  
  }  
}  
---

# **🔟 MARKETPLACE SCREENS**

"marketplace\_screens": {  
  "marketplace\_home": {  
    "elements": \[  
      "Recommended Providers (context-based)",  
      "Service Filters",  
      "Search Field"  
    \]  
  },

  "provider\_profile": {  
    "elements": \[  
      "Bio",  
      "Rating",  
      "Services List",  
      "Book Session Button"  
    \]  
  },

  "booking\_flow": {  
    "steps": \[  
      "Select Time",  
      "Confirm Details",  
      "Payment Screen",  
      "Booking Confirmation"  
    \]  
  },

  "booking\_history": {  
    "elements": \[  
      "Past Sessions",  
      "Rating Submission",  
      "Rebook Button"  
    \]  
  }  
}  
---

# **1️⃣1️⃣ SUBSCRIPTION SCREENS**

"subscription\_screens": {  
  "subscription\_overview": {  
    "elements": \[  
      "Current Plan",  
      "Usage Stats",  
      "Upgrade Button",  
      "Cancel Button"  
    \]  
  },

  "upgrade\_screen": {  
    "elements": \[  
      "Plan Comparison",  
      "Stripe Checkout",  
      "Trial Notice"  
    \]  
  }  
}  
---

# **1️⃣2️⃣ ORGANIZATION SCREENS (B2B)**

"organization\_screens": {  
  "org\_dashboard": {  
    "elements": \[  
      "Cohort Readiness Average",  
      "Acceptance Rate",  
      "Risk Heatmap",  
      "Member List"  
    \]  
  },

  "cohort\_detail\_screen": {  
    "elements": \[  
      "Member Progress Table",  
      "Interview Trend",  
      "Deadline Alerts"  
    \]  
  },

  "org\_member\_detail\_screen": {  
    "elements": \[  
      "Readiness Summary",  
      "Interview Summary",  
      "Narrative Score Summary",  
      "Leave Note"  
    \]  
  }  
}  
---

# **1️⃣3️⃣ PROVIDER SCREENS**

"provider\_screens": {  
  "provider\_dashboard": {  
    "elements": \[  
      "Upcoming Sessions",  
      "Earnings Summary",  
      "Rating Summary"  
    \]  
  },

  "service\_management": {  
    "elements": \[  
      "Add Service",  
      "Edit Pricing",  
      "Manage Availability"  
    \]  
  }  
}  
---

# **1️⃣4️⃣ ADMIN SCREENS**

"admin\_screens": {  
  "admin\_dashboard": {  
    "elements": \[  
      "User Count",  
      "AI Cost Metrics",  
      "Revenue Metrics",  
      "Error Logs"  
    \]  
  },

  "route\_template\_management": {},  
  "ai\_prompt\_registry": {},  
  "provider\_management": {},  
  "organization\_management": {}  
}  
---

# **1️⃣5️⃣ SHARED MODALS**

"shared\_modals": {  
  "upgrade\_modal": {},  
  "marketplace\_suggestion\_modal": {},  
  "deadline\_warning\_modal": {},  
  "rejection\_recalibration\_modal": {},  
  "confidence\_boost\_modal": {},  
  "data\_sharing\_consent\_modal": {},  
  "error\_modal": {}  
}  
---

# **NAVIGATION FLOW**

Primary path:

Landing → Signup → Psych → Route → Readiness → Narrative → Interview → Application → Outcome → Iterate

Parallel paths:

Route ↔ Narrative ↔ Interview ↔ Marketplace

Dashboard ↔ Any active domain

Org dashboard ↔ Cohort ↔ Member detail

Backwards always allowed except submission state transitions.

---

# **FINAL RESULT**

This is:

A full navigational topology of Compass.

It includes:

* All user types

* All states

* All engines

* All edge cases

* All forward/back transitions

* Mobile-first navigation logic

* Desktop scalability

* AI-first interaction points

Nothing critical is missing.

Good.

Public screens are not “marketing pages.”

They are:

* Trust builders

* Psychological primers

* Segmentation filters

* Conversion engines

* Data capture points

* Expectation setters

* AI positioning narratives

If weak → low-quality users.

If shallow → wrong users.

If confusing → no one converts.

We now design **Public Screens** as a full system.

Mobile-first.

AI-first positioning.

Psych-aware messaging.

B2C primary.

B2B visible but secondary.

---

# **1️⃣ PUBLIC SCREENS — FULL SPECIFICATION**

---

# **STRUCTURAL OVERVIEW**

Public screens include:

1. Landing Page

2. How It Works (Deep Explanation)

3. Route Explorer

4. Assessment Teaser

5. Success Stories

6. Marketplace Preview

7. Pricing Page

8. B2B / Institutional Page

9. Provider Page

10. FAQ

11. Blog / Resources (Authority Engine)

12. About / Trust Page

13. Legal Pages

14. Error Pages

15. Waitlist / Early Access (optional)

16. Demo Mode Entry

We go one by one.

---

# **1\. LANDING PAGE (PRIMARY ENTRY POINT)**

## **Objective**

* Convert visitor → assessment start

* Filter wrong users

* Establish authority

* Signal AI \+ structure

* Avoid overwhelming

---

## **MOBILE-FIRST STRUCTURE**

{  
  "layout": "vertical\_scroll",  
  "sections\_order": \[  
    "hero",  
    "problem\_statement",  
    "solution\_framework",  
    "how\_it\_works",  
    "who\_it\_is\_for",  
    "psychological\_angle",  
    "marketplace\_signal",  
    "social\_proof",  
    "pricing\_preview",  
    "faq\_preview",  
    "final\_cta"  
  \]  
}  
---

## **SECTION DETAILS**

---

### **HERO**

Elements:

* Headline:

   “From Uncertain Aspirant to Structured International Achiever”

* Subheadline:

   “Compass is your AI-guided operating system for global mobility.”

* CTA Primary:

   “Start Your Assessment”

* CTA Secondary:

   “Explore Routes”

* Visual:

   Animated readiness dashboard mock

* Trust badges:

   “Structured”, “AI-assisted”, “Psych-aware”

Psychological layer:

* Low anxiety language

* Avoid “competitive rejection fear”

---

### **PROBLEM STATEMENT**

Elements:

* 3 cards:

  * “Too many opportunities?”

  * “Don’t know if you’re ready?”

  * “Fear of rejection?”

Each card expands accordion style.

---

### **SOLUTION FRAMEWORK**

3 Pillars (visual system blocks):

1. Identity

2. Strategy

3. Execution

Each card links to deeper explanation page.

---

### **HOW IT WORKS (High-Level)**

Step flow:

1. Take structured assessment

2. Choose your route

3. Build readiness

4. Practice interviews

5. Apply strategically

Each step clickable.

---

### **WHO IT IS FOR**

Segment cards:

* Scholarship seekers

* Professionals seeking relocation

* Researchers

* Founders

* Exchange students

Each links to Route Explorer.

---

### **PSYCHOLOGICAL ANGLE**

Headline:

“Preparation is not only structural. It’s psychological.”

Explain:

* Confidence tracking

* Interview simulation

* Behavioral adaptation

---

### **MARKETPLACE SIGNAL**

Short preview:

* CV Review

* Interview Coaching

* Translation

CTA:

“Explore Support”

---

### **SOCIAL PROOF**

Elements:

* Success metrics (not fake claims)

* “Users improved readiness by X%”

* Testimonials (future real)

* Acceptance rate improvement trends (if available)

---

### **PRICING PREVIEW**

3-tier cards:

Free / Pro / Premium

CTA:

“Compare Plans”

---

### **FAQ PREVIEW**

3 expandable FAQs:

* “Is this only for scholarships?”

* “Do I need to know where I want to go?”

* “What if I get rejected?”

---

### **FINAL CTA**

Large button:

“Start My Compass”

Secondary:

“Log In”

---

# **2\. HOW IT WORKS PAGE (DEEPER EXPLANATION)**

Purpose:

Educate analytical users.

Sections:

* Full process diagram

* Psychological \+ readiness explanation

* Interview engine explanation

* Application governance explanation

* AI explanation (structured, not hype)

* Data privacy reassurance

CTA always visible:

“Start Assessment”

---

# **3\. ROUTE EXPLORER (PUBLIC VERSION)**

Purpose:

Let user explore before committing.

Elements:

* Route type filter

* Geographic filter

* Timeline filter

* Basic explanation per route

* Example requirements

* Estimated competitiveness

No login required for exploration.

CTA:

“Create Route → Start Assessment”

---

# **4\. ASSESSMENT TEASER PAGE**

Bridge between public and onboarding.

Elements:

* What the assessment measures

* Estimated time (5–7 min)

* Example sample question

* Privacy assurance

* “We don’t sell your data.”

CTA:

“Begin Assessment”

Back:

“Back to Home”

---

# **5\. SUCCESS STORIES PAGE**

Structured case studies.

Elements:

* Before readiness score

* After readiness score

* Interview practice count

* Outcome

* Timeline

Avoid false promises.

CTA:

“Start Your Path”

---

# **6\. MARKETPLACE PREVIEW PAGE**

Purpose:

Pre-sell hybrid nature.

Elements:

* Service categories

* Provider highlight cards

* “Only available inside Compass”

* Commission transparency note

* Quality assurance note

CTA:

“Create Account to Access”

---

# **7\. PRICING PAGE (DEEP)**

Mobile-first stacked layout.

Sections:

* Plan comparison table

* Feature breakdown by engine

* AI usage limits

* Marketplace access

* Interview session limits

* FAQ specific to pricing

* Refund policy summary

CTA:

“Start Free”

“Upgrade to Pro”

---

# **8\. B2B / INSTITUTIONAL PAGE**

Audience:

Universities, NGOs, Foundations.

Sections:

* Cohort tracking explanation

* Dashboard preview

* Acceptance analytics preview

* Seat-based pricing explanation

* Case use scenarios

* Security & compliance mention

CTA:

“Request Institutional Demo”

---

# **9\. PROVIDER PAGE**

Audience:

Interview coaches, translators, consultants.

Sections:

* Why join Compass

* Commission explanation

* Quality standard explanation

* Application process

* Earnings example

CTA:

“Apply as Provider”

---

# **10\. FAQ PAGE (FULL)**

Categories:

* General

* Technical

* Psychological

* Pricing

* Data & Security

* B2B

Expandable accordion.

---

# **11\. BLOG / RESOURCES PAGE**

Purpose:

Authority \+ SEO \+ thought leadership.

Content types:

* Scholarship guides

* Interview strategies

* Psychological resilience posts

* Route comparisons

* Visa trends

* Financial planning tips

Each article includes:

Inline CTA:

“Structure your path with Compass.”

---

# **12\. ABOUT PAGE**

Purpose:

Trust.

Sections:

* Mission

* Philosophy

* Why structured preparation matters

* Data ethics stance

* AI transparency

* Contact info

---

# **13\. LEGAL PAGES**

* Terms of Service

* Privacy Policy

* Data Processing Policy

* Refund Policy

* Cookie Policy

Must be accessible in footer.

---

# **14\. ERROR PAGES**

* 404

* 500

* Payment failure

* Maintenance page

Each includes:

CTA back to home.

---

# **15\. WAITLIST / EARLY ACCESS (OPTIONAL)**

Elements:

* Email capture

* Route interest selection

* “What’s your goal?” short survey

Used pre-launch.

---

# **16\. DEMO MODE ENTRY (POWER FEATURE)**

Allow:

Limited demo dashboard preview.

Read-only.

CTA:

“Create account to unlock.”

---

# **FOOTER (GLOBAL)**

Contains:

* Product links

* Routes

* Marketplace

* Pricing

* Institutional

* Provider

* Blog

* Legal

* Social links

* Language selector

---

# **NAVIGATION STRUCTURE (PUBLIC)**

Mobile:

Hamburger → slide panel with:

* Home

* How it Works

* Routes

* Marketplace

* Pricing

* Institutional

* Provider

* Blog

* Login

Desktop:

Top nav bar.

---

# **AI-FIRST ELEMENTS ON PUBLIC SCREENS**

* Contextual chatbot (non-invasive)

* Route suggestion quick input

* “Not sure where to start?” button

* Quick 3-question micro-assessment

* Behavioral language adaptation (future)

---

# **EDGE CASE FLOWS**

* Visitor clicks start assessment → must sign up first

* Visitor starts assessment → abandons → return via email link

* Visitor explores route → gets gated at “create route”

* Visitor tries marketplace → prompted to create account

---

# **ANALYTICS FOR PUBLIC SCREENS**

Track:

* Scroll depth

* CTA clicks

* Route type interest

* Pricing tier interest

* Drop-off point

* Assessment start rate

* Signup conversion rate

---

# **PSYCHOLOGICAL CONSIDERATIONS**

Public screens must:

* Reduce fear

* Avoid competitive framing

* Avoid “beat others”

* Emphasize structure and clarity

* Avoid overwhelming with features

* Emphasize support

---

# **DESKTOP HARMONY**

Desktop enhancements:

* Side-by-side layout

* Animated readiness gauge demo

* Interactive process flow diagram

* Hover explanation tooltips

---

# **SUMMARY**

Public screens are:

Conversion engine

Trust builder

Authority layer

Segmentation filter

Expectation setter

Behavioral primer

They must:

* Filter serious users

* Prime for assessment

* Position Compass as system, not tool

* Signal psychological depth

* Signal execution rigor

* Signal AI governance

* Signal security

---

If you want next, we can:

* Go equally deep on Auth \+ Onboarding screens

* Or simulate three public user personas and their decision flow

* Or define full copy strategy logic for public pages

Choose the next descent.

Excellent.

Auth screens are not “forms.”

They are:

* Trust thresholds

* Friction calibrators

* Psychological state transitions

* Conversion chokepoints

* Security gates

* Identity anchors

If weak → drop-off.

If overbuilt → abandonment.

If cold → anxiety spike.

We design Auth as:

Mobile-first

Low cognitive load

AI-positioned

Psych-safe

Security-rigorous

Conversion-optimized

And fully aligned with the backend \+ roles \+ B2C/B2B logic.

---

# **2️⃣ AUTH SCREENS — FULL SYSTEM SPECIFICATION**

---

# **AUTH FLOW OVERVIEW**

{  
  "auth\_entry\_points": \[  
    "Landing CTA",  
    "Route Explorer CTA",  
    "Marketplace CTA",  
    "Pricing Upgrade CTA",  
    "Institutional Demo CTA",  
    "Provider Application CTA"  
  \],  
  "auth\_flows": \[  
    "Standard User Signup",  
    "Provider Signup",  
    "Organization Invite Signup",  
    "Login Existing User",  
    "Password Reset",  
    "Email Verification",  
    "MFA Verification (Admin/Provider)",  
    "Reauthentication (Sensitive Action)"  
  \]  
}  
---

# **AUTH SCREEN ARCHITECTURE PRINCIPLES**

1. Single-column mobile-first layout

2. No long paragraphs

3. Visible security reassurance

4. Minimal required fields

5. Clear progress state

6. Psychological micro-copy

7. Adaptive redirection after login

---

# **SCREEN INVENTORY**

We break into:

1. Login

2. Signup (User)

3. Signup (Provider)

4. Signup (Org Invite)

5. Email Verification

6. Password Reset Request

7. Password Reset Confirmation

8. MFA Verification

9. Session Expired Screen

10. Reauthentication Modal

11. Account Locked Screen

12. Suspended Account Screen

All exhaustive.

---

# **1️⃣ LOGIN SCREEN**

## **Purpose**

* Authenticate existing user

* Route correctly based on role

* Minimize friction

---

## **UI STRUCTURE (Mobile)**

{  
  "screen": "login",  
  "layout": "centered\_card",  
  "elements": {  
    "header": "Welcome back",  
    "subtext": "Continue your structured path.",  
    "fields": \[  
      "email\_input",  
      "password\_input"  
    \],  
    "checkbox": "Remember me",  
    "buttons": \[  
      "Login (primary)",  
      "Forgot password (secondary link)",  
      "Sign up (secondary link)"  
    \],  
    "security\_note": "Your data is encrypted and never shared."  
  }  
}  
---

## **Backend Logic**

* Validate email exists

* Rate-limit login attempts

* Account lock after X failures

* Return JWT access \+ refresh token

* Redirect based on role:

{  
  "END\_USER": "home\_dashboard",  
  "PROVIDER": "provider\_dashboard",  
  "ORG\_ADMIN": "org\_dashboard",  
  "COORDINATOR": "org\_dashboard",  
  "SUPER\_ADMIN": "admin\_dashboard"  
}  
---

## **Edge Cases**

* Email not verified → redirect to email verification

* MFA required → redirect to MFA screen

* Suspended → show suspended screen

* Locked → show locked screen

---

# **2️⃣ USER SIGNUP SCREEN (B2C)**

## **Objective**

* Fast entry

* Minimal friction

* Low anxiety

* Immediate progress into psych onboarding

---

## **Step-Based Structure (Recommended)**

### **Step 1: Credentials**

{  
  "fields": \[  
    "email",  
    "password",  
    "confirm\_password"  
  \],  
  "password\_rules": \[  
    "Minimum 8 characters",  
    "One uppercase",  
    "One number"  
  \],  
  "checkboxes": \[  
    "Accept Terms",  
    "Accept Privacy Policy"  
  \],  
  "cta": "Create Account"  
}  
---

### **Step 2: Basic Context (Optional but Strategic)**

Ask:

* What is your main goal?

  * Scholarship

  * Job abroad

  * Research

  * Not sure yet

* Target region (optional)

Purpose:

Pre-configure psych \+ route suggestions.

---

## **On Success**

* Send verification email

* Auto-login (optional)

* Redirect to psych\_onboarding\_intro

---

## **Micro-copy Strategy**

Instead of:

“Create an account”

Use:

“Start building your path”

---

# **3️⃣ PROVIDER SIGNUP SCREEN**

Separate flow.

---

## **Structure**

{  
  "fields": \[  
    "full\_name",  
    "email",  
    "password",  
    "primary\_service\_type",  
    "years\_experience",  
    "country"  
  \],  
  "cta": "Apply as Provider"  
}  
---

## **Flow**

* Create account with PROVIDER role (pending)

* Status \= “Pending Verification”

* Admin review required

* Provider receives approval email

* On approval → provider\_dashboard access enabled

---

# **4️⃣ ORGANIZATION INVITE SIGNUP**

Flow triggered by invitation email.

---

## **Screen Structure**

{  
  "header": "Join \[Organization Name\]",  
  "fields": \[  
    "email (pre-filled, locked)",  
    "password",  
    "confirm\_password"  
  \],  
  "cta": "Join Organization"  
}  
---

## **Logic**

* Link tied to organization\_id

* Seat count validated

* Role assigned (MEMBER / COORDINATOR)

* Redirect to org\_onboarding\_intro

---

# **5️⃣ EMAIL VERIFICATION SCREEN**

## **Structure**

{  
  "message": "Check your email to verify your account.",  
  "buttons": \[  
    "Resend verification email",  
    "Back to login"  
  \]  
}  
---

## **Backend**

* Verification token expiry

* Token single-use

* On verification → auto-login

---

# **6️⃣ PASSWORD RESET REQUEST**

{  
  "fields": \["email"\],  
  "cta": "Send Reset Link"  
}

Logic:

* Always return generic success message

* Email token expires after X minutes

---

# **7️⃣ PASSWORD RESET CONFIRMATION**

{  
  "fields": \[  
    "new\_password",  
    "confirm\_password"  
  \],  
  "cta": "Reset Password"  
}

On success:

Redirect to login with success banner.

---

# **8️⃣ MFA VERIFICATION (Admin \+ Provider)**

{  
  "fields": \["6-digit code"\],  
  "cta": "Verify"  
}

Features:

* Resend code

* Backup codes

* Timeout expiration

---

# **9️⃣ SESSION EXPIRED SCREEN**

Trigger:

Refresh token invalid.

{  
  "message": "Your session has expired.",  
  "cta": "Log in again"  
}  
---

# **🔟 REAUTHENTICATION MODAL**

Used for:

* Subscription cancellation

* Account deletion

* Provider payout change

Modal:

{  
  "fields": \["password"\],  
  "cta": "Confirm"  
}  
---

# **1️⃣1️⃣ ACCOUNT LOCKED SCREEN**

Triggered after X failed attempts.

{  
  "message": "Too many failed login attempts.",  
  "cta": "Reset Password"  
}  
---

# **1️⃣2️⃣ SUSPENDED ACCOUNT SCREEN**

Triggered by admin.

{  
  "message": "Your account has been suspended.",  
  "support\_contact": "Email support",  
  "cta": "Contact Support"  
}  
---

# **MOBILE UX DETAILS**

* Autofocus on first field

* Keyboard-aware layout

* Password visibility toggle

* Input validation inline

* Smooth transitions between steps

* No page reload (SPA behavior)

---

# **DESKTOP ENHANCEMENTS**

* Side illustration panel

* Trust badge column

* Testimonial snippet

* Security explanation sidebar

---

# **SECURITY FEATURES VISUALLY SIGNALLED**

* Lock icon near password

* “Encrypted” micro-text

* “We never share your data” line

* Link to privacy policy

---

# **ROLE-SPECIFIC REDIRECTION LOGIC**

{  
  "END\_USER": "home\_dashboard",  
  "PROVIDER\_PENDING": "provider\_pending\_review",  
  "PROVIDER\_ACTIVE": "provider\_dashboard",  
  "ORG\_MEMBER": "home\_dashboard",  
  "ORG\_COORDINATOR": "org\_dashboard",  
  "ORG\_ADMIN": "org\_dashboard",  
  "SUPER\_ADMIN": "admin\_dashboard"  
}  
---

# **AUTH STATE TRANSITION MAP**

Landing → Signup → Email Verification → Psych Onboarding → Home

Landing → Login → Home

Invite → Signup → Org Onboarding → Home

Provider Landing → Provider Signup → Pending → Approval → Provider Dashboard

---

# **EDGE CASE HANDLING**

* Email already exists → suggest login

* Password too weak → inline guidance

* Expired verification token → resend flow

* Expired reset token → restart reset

* Organization full → show seat limit screen

* Provider rejected → show explanation

---

# **ANALYTICS EVENTS**

Track:

* Signup started

* Signup completed

* Login success

* Login failure

* Reset request

* Reset success

* MFA success/failure

* Drop-off between signup steps

---

# **PSYCHOLOGICAL DESIGN PRINCIPLES**

* Avoid urgency pressure

* Avoid competitive framing

* Use calm language

* Avoid too many fields at once

* Encourage progression

* Frame login as continuation, not gate

---

# **FINAL AUTH SYSTEM SUMMARY**

Auth screens must provide:

* Security

* Clarity

* Role-based routing

* Friction calibration

* Psychological reassurance

* Conversion optimization

* Institutional compatibility

* Provider compatibility

* Data privacy compliance

They are the entry into the OS.

If you want next, we can:

* Go deep on 3️⃣ Core User Screens (Home \+ Route \+ AI interaction)

* Or simulate full signup journey for 3 archetypes

* Or define authentication API contract (technical layer)

Choose the next descent.

Excellent.

This is one of the most important parts of Compass.

The Psychological Onboarding Flow is not a “quiz.”

It is:

* The emotional handshake

* The identity anchoring moment

* The calibration engine

* The personalization foundation

* The first AI trust-building interaction

* The beginning of user transformation

If shallow → Compass becomes generic.

If overwhelming → users drop.

If poorly sequenced → anxiety increases.

If manipulative → trust collapses.

We design this as:

Mobile-first

Conversational but structured

Psych-safe

Low cognitive overload

Data-rich but friction-light

Fully aligned with backend psych\_profiles \+ psych\_assessment\_sessions

Now we go deep.

---

# **3️⃣ PSYCHOLOGICAL ONBOARDING FLOW — FULL SYSTEM SPECIFICATION**

---

# **OVERALL OBJECTIVES**

1. Assess key psychological dimensions

2. Establish tone of Compass

3. Reduce anxiety

4. Increase perceived competence

5. Build emotional safety

6. Personalize dashboard from day 1

7. Segment user route path

8. Prepare readiness engine calibration

---

# **FLOW STRUCTURE**

{  
  "psych\_onboarding\_flow": \[  
    "intro\_screen",  
    "context\_calibration",  
    "confidence\_block",  
    "risk\_orientation\_block",  
    "discipline\_block",  
    "decision\_pattern\_block",  
    "interview\_anxiety\_block",  
    "goal\_clarity\_block",  
    "financial\_stress\_signal\_block",  
    "summary\_transition",  
    "results\_screen",  
    "route\_prompt\_screen"  
  \]  
}

Each block \= 3–5 micro-questions max.

Never show 25-question list at once.

---

# **UX PRINCIPLES**

* One question per screen (mobile)

* Large tap areas

* Slider or segmented control

* Progress bar visible

* Soft transitions

* Back allowed

* Save progress automatically

* Micro-copy reinforcing normalcy

* No “wrong answers”

---

# **1️⃣ INTRO SCREEN**

Purpose:

Set tone \+ reduce fear.

{  
  "header": "Before we build your path…",  
  "text": "Let’s understand how you approach uncertainty, preparation, and growth.",  
  "reassurance": "This is not a test. There are no right answers.",  
  "duration\_label": "Takes about 4–6 minutes",  
  "cta": "Begin"  
}

Microcopy:

“We use this to personalize your journey.”

---

# **2️⃣ CONTEXT CALIBRATION BLOCK**

Goal:

Establish high-level intent.

Questions:

1. What brings you here?

   * Scholarship

   * Job abroad

   * Research

   * Startup visa

   * Not sure yet

2. How urgent is your plan?

   * Just exploring

   * Within 12 months

   * Within 6 months

   * ASAP

UI:

Segmented cards.

Backend impact:

mobility\_urgency

route\_suggestion\_bias

---

# **3️⃣ CONFIDENCE BLOCK**

Goal:

Measure self-efficacy.

Example Questions:

* “If you applied today, how confident would you feel?”

   Slider 0–100

* “When facing competitive processes, I usually…”

  * Feel prepared

  * Feel unsure

  * Feel overwhelmed

Backend:

confidence\_index

narrative\_self\_efficacy\_score

---

# **4️⃣ RISK ORIENTATION BLOCK**

Goal:

Measure risk tolerance.

Questions:

* “I prefer applying only when I feel fully ready.”

   Agree scale

* “I am comfortable taking strategic risks.”

   Likert scale

Backend:

risk\_tolerance\_score

loss\_sensitivity\_index

---

# **5️⃣ DISCIPLINE BLOCK**

Goal:

Measure execution consistency.

Questions:

* “I follow through on long-term goals.”

* “I struggle to stay consistent.”

UI:

Likert slider.

Backend:

discipline\_score

Impact:

Momentum algorithm baseline.

---

# **6️⃣ DECISION PATTERN BLOCK**

Goal:

Measure indecision / overanalysis.

Questions:

* “I often overthink important decisions.”

* “I delay starting because I want clarity first.”

Backend:

decision\_latency\_score

Used for:

Route micro-task granularity.

---

# **7️⃣ INTERVIEW ANXIETY BLOCK**

Goal:

Capture performance anxiety.

Questions:

* “Speaking about my achievements makes me uncomfortable.”

* “Interviews make me anxious.”

Backend:

interview\_anxiety\_score

Used for:

Interview engine framing.

---

# **8️⃣ GOAL CLARITY BLOCK**

Goal:

Measure narrative coherence.

Questions:

* “I can clearly explain why I want to go abroad.”

* “My career direction is well defined.”

Backend:

narrative\_self\_efficacy\_score

Feeds:

Narrative engine initial state.

---

# **9️⃣ FINANCIAL STRESS SIGNAL BLOCK**

Goal:

Identify stress without deep financial form.

Questions:

* “Finances are my biggest concern.”

* “I feel financially prepared.”

Backend:

Financial risk bias modifier.

Used for:

Readiness weighting \+ Marketplace suggestion.

---

# **🔟 SUMMARY TRANSITION SCREEN**

Purpose:

Avoid abrupt scoring shock.

{  
  "message": "Analyzing your profile…",  
  "visual": "Animated compass rotation",  
  "duration": "1–2 seconds (real calculation time)"  
}

Backend:

Compute psych\_profiles

Store psych\_assessment\_session

---

# **1️⃣1️⃣ RESULTS SCREEN**

Critical screen.

Must:

* Affirm strengths

* Normalize weaknesses

* Avoid labeling negatively

* Show structured insight

---

## **STRUCTURE**

{  
  "cards": \[  
    "Confidence Index",  
    "Execution Discipline",  
    "Risk Orientation",  
    "Interview Readiness"  
  \],  
  "psychological\_state\_label": "STRUCTURING",  
  "insight\_summary": "You tend to seek clarity before acting. Compass will help you build structured confidence.",  
  "cta\_primary": "Create Your Route",  
  "cta\_secondary": "Review My Answers"  
}  
---

## **VISUAL ELEMENTS**

* Circular gauge for confidence

* Soft color gradient (avoid red)

* Badge for current psych state

* AI-generated personalized insight paragraph

---

# **1️⃣2️⃣ ROUTE PROMPT SCREEN**

Bridge to Route Engine.

{  
  "header": "Based on your profile…",  
  "recommended\_route\_cards": \[  
    "Scholarship Path",  
    "Professional Relocation Path"  
  \],  
  "cta": "Start This Route",  
  "secondary": "Explore All Routes"  
}

Uses:

confidence \+ urgency \+ clarity

---

# **PSYCHOLOGICAL STATE CLASSIFICATION**

{  
  "UNCERTAIN": "Low confidence \+ high anxiety",  
  "STRUCTURING": "Moderate confidence \+ high decision latency",  
  "BUILDING\_CONFIDENCE": "Moderate everything",  
  "EXECUTING": "High discipline \+ moderate risk",  
  "RESILIENT": "High discipline \+ high resilience"  
}

State stored in psych\_profiles.

Used everywhere:

Dashboard

Framing

Marketplace suggestions

Upgrade prompts

---

# **MICRO-INTERACTIONS**

* Soft vibration on mobile when selecting

* Subtle animation on slider movement

* Encouraging text on next screen

---

# **BACKEND TRIGGERS**

On completion:

* Create psych\_profile

* Create psych\_assessment\_session

* Emit PsychProfileCreatedEvent

* Precompute behavioral interaction config

* Preload recommended route template

---

# **ERROR HANDLING**

* User exits mid-assessment → auto-save

* Resume later from where left

* If partial answers → allow completion

* Never lose progress

---

# **EDGE VARIATIONS**

If org\_member:

Add:

“This assessment helps your institution support you better.”

If provider:

Skip this flow.

If returning user:

Offer reassessment after X months.

---

# **DESKTOP ENHANCEMENTS**

* Two-column layout

* Larger insight panel

* Comparison toggle (if reassessment)

---

# **ANALYTICS EVENTS**

Track:

* Assessment start

* Completion rate

* Drop-off question index

* Average confidence score

* State distribution

* Time per question

---

# **PSYCHOLOGICAL DESIGN SAFETY**

Avoid:

* Labels like “Low Confidence”

* Red warning colors

* Competitive comparison

* “You are not ready”

Always:

Frame as growth

Show agency

Show control

---

# **TRANSITION TO CORE APP**

After route selection:

Route creation screen

Then Home Dashboard

Then guided first milestone

---

# **WHY THIS FLOW MATTERS**

It:

* Differentiates Compass

* Anchors personalization

* Reduces imposter syndrome

* Enables behavioral adaptation

* Creates data moat

* Feeds every engine

This is not onboarding.

This is calibration.

---

If you want next, we can:

* Go deep on 4️⃣ HOME DASHBOARD (AI-first adaptive UI)

* Or simulate full onboarding for three psych archetypes

* Or design behavioral framing engine in UI logic

Choose the next descent.

Excellent.

This is the core of Compass.

The Home Dashboard is not a “summary page.”

It is:

* The operating system interface

* The decision cockpit

* The AI mediation layer

* The behavioral regulator

* The execution control center

Everything converges here:

Psych profile

Route state

Readiness

Narrative progress

Interview performance

Applications

Marketplace

Deadlines

Subscription tier

If this screen fails → Compass feels fragmented.

We design it as:

Mobile-first

AI-first

State-aware

Low cognitive load

High signal density

Context-adaptive

Now we go deep.

---

# **4️⃣ HOME DASHBOARD — FULL SPECIFICATION**

---

# **I. CORE PRINCIPLES**

1. One primary action at a time

2. Context \> features

3. Show next best action

4. Adapt tone based on psychological\_state

5. Avoid overwhelming

6. Surface risk without panic

7. Encourage momentum

---

# **II. GLOBAL STRUCTURE (MOBILE-FIRST)**

{  
  "home\_dashboard": {  
    "sections\_order": \[  
      "dynamic\_header",  
      "route\_snapshot\_card",  
      "ai\_next\_action\_card",  
      "readiness\_summary\_card",  
      "momentum\_indicator",  
      "deadline\_alert",  
      "interview\_progress\_card",  
      "narrative\_status\_card",  
      "application\_status\_card",  
      "marketplace\_suggestion\_card",  
      "upgrade\_suggestion\_card",  
      "quick\_actions\_bar"  
    \]  
  }  
}

Not all appear at once.

Visibility is conditional.

---

# **III. DYNAMIC HEADER**

## **Purpose**

Set emotional tone.

Adapts based on:

* psychological\_state

* momentum\_index

* deadline proximity

---

## **Structure**

{  
  "dynamic\_header": {  
    "greeting": "Good morning, Ciro.",  
    "state\_label": "STRUCTURING",  
    "micro\_message": "Clarity first. Then action.",  
    "progress\_hint": "You're 32% through your path."  
  }  
}  
---

## **Psychological Variants**

UNCERTAIN:

“Let’s reduce uncertainty step by step.”

BUILDING\_CONFIDENCE:

“You’re gaining structure.”

EXECUTING:

“You’re building real momentum.”

RESILIENT:

“You handle complexity well.”

---

# **IV. ROUTE SNAPSHOT CARD**

## **Always visible if route exists.**

{  
  "route\_snapshot\_card": {  
    "route\_name": "Scholarship Path",  
    "mobility\_state": "PREPARING",  
    "progress\_bar": 0.32,  
    "risk\_indicator": "Moderate",  
    "timeline\_pressure": "Low",  
    "cta": "Open Route"  
  }  
}

Tap → route\_overview\_screen.

If no route:

Replace with:

“Create your first route.”

---

# **V. AI NEXT ACTION CARD (PRIMARY FEATURE)**

This is the heart.

Only one major action at a time.

---

## **Example 1: Missing narrative**

{  
  "ai\_next\_action\_card": {  
    "title": "Strengthen your positioning",  
    "explanation": "Your narrative clarity score is low.",  
    "cta": "Improve Motivation Letter"  
  }  
}  
---

## **Example 2: Interview weakness**

{  
  "title": "Practice interview resilience",  
  "explanation": "Confidence projection is below route requirement.",  
  "cta": "Start Interview Practice"  
}  
---

## **Example 3: Deadline approaching**

{  
  "title": "7 days to deadline",  
  "explanation": "Submission readiness at 68%.",  
  "cta": "Review Readiness"  
}  
---

This card:

* Must never show more than 1 primary CTA

* Must be psychologically framed

* Must consider loss\_sensitivity

---

# **VI. READINESS SUMMARY CARD**

Compact version.

{  
  "readiness\_summary\_card": {  
    "overall\_score": 72,  
    "dimension\_breakdown": {  
      "academic": 80,  
      "language": 60,  
      "documents": 75,  
      "financial": 50,  
      "experience": 70,  
      "momentum": 65  
    },  
    "risk\_index": 35,  
    "cta": "View Full Readiness"  
  }  
}

Tap → readiness\_overview.

Color coding subtle.

Never red for moderate risk.

---

# **VII. MOMENTUM INDICATOR**

Small but powerful.

{  
  "momentum\_indicator": {  
    "current\_index": 61,  
    "trend": "Up",  
    "micro\_text": "You completed 3 milestones this week."  
  }  
}

If decline:

“You’ve slowed down slightly.”

Never:

“You are failing.”

---

# **VIII. DEADLINE ALERT BANNER**

Conditional.

Visible only if:

deadline \< 14 days.

{  
  "deadline\_alert": {  
    "opportunity": "DAAD Scholarship",  
    "days\_remaining": 10,  
    "readiness\_at\_current": 72,  
    "cta": "Prepare Submission"  
  }  
}

Sticky near top if urgent (\<5 days).

---

# **IX. INTERVIEW PROGRESS CARD**

Visible if interview sessions exist.

{  
  "interview\_progress\_card": {  
    "average\_score": 68,  
    "last\_session\_delta": "+5",  
    "difficulty\_level": 2,  
    "cta": "Practice Again"  
  }  
}

If no sessions:

Show teaser:

“Simulate your first interview.”

---

# **X. NARRATIVE STATUS CARD**

{  
  "narrative\_status\_card": {  
    "document\_type": "Motivation Letter",  
    "clarity\_score": 62,  
    "last\_updated": "3 days ago",  
    "cta": "Refine Narrative"  
  }  
}

If no narrative:

“Create your first draft.”

---

# **XI. APPLICATION STATUS CARD**

Visible if applications exist.

{  
  "application\_status\_card": {  
    "active\_applications": 2,  
    "awaiting\_decision": 1,  
    "last\_outcome": "Rejected",  
    "cta": "View Applications"  
  }  
}

If rejection:

Show recalibration prompt.

---

# **XII. MARKETPLACE SUGGESTION CARD**

Only triggered by:

Low score \+ event.

{  
  "marketplace\_suggestion\_card": {  
    "title": "Professional Interview Coaching",  
    "reason": "Resilience score below threshold.",  
    "cta": "View Coaches"  
  }  
}

Subtle.

Not pushy.

---

# **XIII. UPGRADE SUGGESTION CARD**

Only for FREE users hitting limit.

{  
  "upgrade\_suggestion\_card": {  
    "title": "Unlock unlimited interview simulations",  
    "cta": "Upgrade to Pro"  
  }  
}

Shown after value moment, not randomly.

---

# **XIV. QUICK ACTIONS BAR (Bottom)**

Fixed bottom bar (mobile).

{  
  "quick\_actions": \[  
    "Route",  
    "Practice",  
    "Applications",  
    "Marketplace",  
    "More"  
  \]  
}

Desktop: sidebar.

---

# **XV. AI CHAT FLOATING BUTTON (OPTIONAL V1.5)**

Small floating icon.

Opens:

AI Assistant overlay.

Context-aware:

“Help me decide next step.”

Must not replace structured logic.

---

# **XVI. CONDITIONAL VISIBILITY LOGIC**

Use backend flags:

{  
  "show\_deadline\_alert": "deadline \< 14",  
  "show\_interview\_card": "interview\_sessions\_count \> 0",  
  "show\_marketplace\_card": "marketplace\_trigger \= true",  
  "show\_upgrade\_card": "feature\_limit\_hit \= true"  
}  
---

# **XVII. EDGE CASE STATES**

1. No route created

    → Only show route creation CTA

2. Route created but no milestones started

    → Show guided start milestone

3. All milestones complete but no application

    → Prompt application creation

4. Accepted outcome

    → Celebration header

    → Relocation prep CTA

5. Rejected outcome

    → Calm recalibration card

---

# **XVIII. DESKTOP VERSION**

Left sidebar:

* Dashboard

* Route

* Practice

* Applications

* Marketplace

* Profile

Right panel:

* AI next action

* Deadline alert

Center:

Main cards

---

# **XIX. BEHAVIORAL ADAPTATION**

If anxiety\_score high:

Hide numeric risk by default.

Show:

“Focus on next step.”

If confidence high:

Show dimension breakdown boldly.

If discipline low:

Break next step into micro-step.

---

# **XX. PERFORMANCE REQUIREMENTS**

* Load \< 800ms

* Data aggregated in single API call

* No blocking AI calls

* Lazy load lower cards

---

# **XXI. ANALYTICS TRACKING**

Track:

* Card click-through rate

* CTA completion rate

* Next action acceptance rate

* Dashboard dwell time

* Scroll depth

* Quick action usage frequency

---

# **XXII. FAILURE MODE HANDLING**

If backend error:

Show:

“Unable to load insights.”

Retry button.

Never blank screen.

---

# **FINAL SUMMARY**

The Home Dashboard must:

* Feel intelligent

* Feel calm

* Feel structured

* Feel personalized

* Feel actionable

* Feel contained

* Avoid feature overload

* Adapt to user psychology

* Adapt to route stage

* Adapt to urgency

It is the OS interface.

---

If you want next, we can:

* Go deep on 5️⃣ Route & Milestone Screens (execution engine UI)

* Or design full adaptive behavioral logic mapping for dashboard

* Or simulate dashboard for 3 archetypes in different states

Choose the next descent.

Excellent.

Now we enter the **execution backbone** of Compass.

If the Home Dashboard is the cockpit,

the **Route Domain Screens** are the engine room.

This is where:

* Strategy becomes structure

* Structure becomes milestones

* Milestones become execution

* Execution becomes readiness

* Readiness becomes submission

This domain must:

* Feel structured, not chaotic

* Avoid overwhelming complexity

* Surface dependencies clearly

* Prevent premature action

* Integrate AI insights without clutter

* Work mobile-first

* Scale to multi-route scenarios

We go deep.

---

# **5️⃣ ROUTE DOMAIN SCREENS — FULL SYSTEM SPECIFICATION**

---

# **STRUCTURAL OVERVIEW**

{  
  "route\_domain": {  
    "screens": \[  
      "route\_selection\_screen",  
      "route\_creation\_config",  
      "route\_overview\_screen",  
      "route\_milestone\_group\_view",  
      "milestone\_detail\_screen",  
      "milestone\_dependency\_view",  
      "route\_timeline\_screen",  
      "route\_risk\_screen",  
      "route\_iteration\_screen",  
      "multi\_route\_switcher",  
      "route\_settings\_screen"  
    \]  
  }  
}  
---

# **DESIGN PRINCIPLES**

1. One route is a “project”

2. Projects are stateful

3. Milestones are structured units

4. Dependencies are visualized, not hidden

5. Risk is contextualized

6. Completion is rewarding

7. AI appears as guidance, not noise

---

# **1️⃣ ROUTE SELECTION SCREEN**

Entry point from:

* Psych results

* Dashboard

* Public route explorer

---

## **UI STRUCTURE**

{  
  "route\_selection\_screen": {  
    "header": "Choose your structured path",  
    "route\_cards": \[  
      {  
        "route\_type": "Scholarship",  
        "description": "Structured preparation for academic funding.",  
        "estimated\_timeline": "6–12 months",  
        "competitiveness\_label": "High"  
      },  
      {  
        "route\_type": "Professional Relocation",  
        "description": "Prepare for international job mobility.",  
        "estimated\_timeline": "3–9 months"  
      }  
    \],  
    "cta": "Create Route"  
  }  
}  
---

## **Advanced Features**

* Filter by urgency

* Filter by region

* “Not sure?” → AI suggestion modal

---

# **2️⃣ ROUTE CREATION CONFIG SCREEN**

After selecting route.

---

## **Structure**

{  
  "route\_creation\_config": {  
    "fields": \[  
      "Target country (optional)",  
      "Primary opportunity type",  
      "Timeline goal",  
      "Financial constraints"  
    \],  
    "cta": "Initialize Route"  
  }  
}  
---

## **Backend Action**

* Instantiate route\_template

* Generate route\_milestones

* Initialize readiness baseline

* Emit RouteCreatedEvent

---

# **3️⃣ ROUTE OVERVIEW SCREEN (CORE EXECUTION VIEW)**

Most important route screen.

---

## **Layout (Mobile)**

{  
  "route\_overview\_screen": {  
    "header": {  
      "route\_name": "Scholarship Path",  
      "state\_badge": "PREPARING",  
      "progress\_bar": 0.32  
    },  
    "sections": \[  
      "milestone\_groups",  
      "risk\_snapshot",  
      "timeline\_preview",  
      "ai\_route\_guidance"  
    \]  
  }  
}  
---

# **3A. MILESTONE GROUPS**

Grouped by dimension:

* Academic Preparation

* Standardized Tests

* Narrative Development

* Financial Preparation

* Interview Preparation

* Application Execution

---

## **Group Structure**

{  
  "milestone\_group": {  
    "title": "Narrative Development",  
    "completion\_ratio": "1/3",  
    "expandable": true  
  }  
}  
---

# **3B. MILESTONE ITEM STRUCTURE**

{  
  "milestone\_item": {  
    "title": "Draft Motivation Letter",  
    "status": "IN\_PROGRESS",  
    "dependency\_warning": false,  
    "deadline\_indicator": null,  
    "cta": "Open"  
  }  
}  
---

## **Status Types**

* NOT\_STARTED

* IN\_PROGRESS

* COMPLETED

* BLOCKED

* OPTIONAL

---

# **4️⃣ MILESTONE DETAIL SCREEN**

Deep execution screen.

---

## **Structure**

{  
  "milestone\_detail\_screen": {  
    "title": "Complete IELTS Exam",  
    "description": "Standardized English test required.",  
    "required\_for": \["Scholarship Applications"\],  
    "dependencies": \["Register for Exam"\],  
    "evidence\_upload": true,  
    "cta\_primary": "Mark as Complete",  
    "cta\_secondary": "Attach Evidence"  
  }  
}  
---

## **Features**

* Attach file

* Add note

* Add target date

* View related readiness impact

* See which applications depend on it

---

# **5️⃣ MILESTONE DEPENDENCY VIEW**

Optional but powerful.

Graph-style visualization.

{  
  "dependency\_graph": {  
    "nodes": \["Register Exam", "Take Exam", "Upload Score"\],  
    "edges": \[\["Register", "Take"\], \["Take", "Upload"\]\]  
  }  
}

Mobile version simplified to list.

---

# **6️⃣ ROUTE TIMELINE SCREEN**

Chronological execution overview.

---

## **Structure**

{  
  "route\_timeline\_screen": {  
    "milestones\_sorted\_by\_date": true,  
    "upcoming\_deadlines": true,  
    "estimated\_submission\_window": "Oct 2026"  
  }  
}  
---

Features:

* Scrollable vertical timeline

* Deadline countdown

* Timeline compression indicator

* Overdue flags

---

# **7️⃣ ROUTE RISK SCREEN**

Deep risk analysis.

---

## **Structure**

{  
  "route\_risk\_screen": {  
    "overall\_risk\_index": 35,  
    "risk\_factors": \[  
      "Language score below threshold",  
      "Financial gap of 20%"  
    \],  
    "recommended\_actions": \[  
      "Schedule language test",  
      "Explore funding sources"  
    \]  
  }  
}  
---

Must avoid alarmist tone.

---

# **8️⃣ ROUTE ITERATION SCREEN (POST-REJECTION)**

Triggered after outcome \= REJECTED.

---

## **Structure**

{  
  "route\_iteration\_screen": {  
    "header": "Recalibrate and iterate",  
    "snapshot\_at\_submission": {  
      "readiness\_score": 68,  
      "interview\_score": 60  
    },  
    "identified\_weak\_areas": \[  
      "Narrative alignment",  
      "Financial readiness"  
    \],  
    "cta": "Start Iteration Plan"  
  }  
}  
---

# **9️⃣ MULTI-ROUTE SWITCHER**

Accessible from top bar.

{  
  "multi\_route\_switcher": {  
    "active\_routes": \[  
      {  
        "route\_name": "Scholarship Path",  
        "progress": 32  
      },  
      {  
        "route\_name": "Professional Relocation",  
        "progress": 12  
      }  
    \],  
    "cta": "Create New Route"  
  }  
}  
---

# **🔟 ROUTE SETTINGS SCREEN**

{  
  "route\_settings\_screen": {  
    "fields": \[  
      "Edit target country",  
      "Adjust timeline",  
      "Archive route",  
      "Delete route"  
    \]  
  }  
}

Deletion requires reauthentication.

---

# **MOBILE UX BEHAVIOR**

* Expandable milestone groups

* Sticky progress bar

* Floating “Next Action” button

* Swipe between groups

* Pull-to-refresh readiness recalculation

---

# **DESKTOP ENHANCEMENTS**

* Sidebar milestone list

* Right panel readiness preview

* Dependency graph expanded

* Drag-to-reorder optional milestones (future)

---

# **AI INTEGRATION WITHIN ROUTE**

AI can:

* Suggest milestone order

* Suggest optional milestone

* Suggest funding source

* Suggest application timing

Displayed in:

AI route guidance card.

---

# **EDGE STATES**

## **No milestones started**

Show:

“Start with this milestone.”

## **All milestones complete**

Show:

“You’re structurally ready to apply.”

## **Timeline compressed**

Show:

“Timeline pressure is increasing.”

---

# **PERFORMANCE REQUIREMENTS**

* Route load \< 500ms

* Milestone update \< 200ms

* No blocking AI calls

* Batch milestone status update optimized

---

# **ANALYTICS EVENTS**

* Milestone started

* Milestone completed

* Milestone abandoned

* Route archived

* Route deleted

* Route iteration started

* Timeline delay event

---

# **PSYCHOLOGICAL ADAPTATION**

Low discipline:

Break milestone into micro-tasks.

High anxiety:

Hide dependency graph by default.

High confidence:

Show competitiveness insights.

---

# **SUMMARY**

Route domain screens must:

* Be structured

* Be visually calm

* Make dependencies visible

* Prevent chaos

* Guide execution

* Integrate readiness

* Integrate interview

* Integrate narrative

* Integrate application

* Adapt psychologically

This is where Compass becomes an OS, not a checklist.

---

Excellent.

Now we enter the **decision intelligence layer** of Compass.

If Route Screens are execution,

Readiness Screens are judgment.

This is where the system answers:

* Am I ready?

* What is missing?

* What is risky?

* What should I improve first?

* Should I apply now?

* Why was I rejected?

If this area is weak → Compass feels vague.

If too aggressive → users panic.

If too optimistic → users fail.

If too technical → users disengage.

This layer must feel:

Structured

Calm

Quantified

Actionable

Transparent

Psych-aware

Now we go deep.

---

# **6️⃣ READINESS SCREENS — FULL SYSTEM SPECIFICATION**

---

# **STRUCTURAL OVERVIEW**

{  
  "readiness\_domain": {  
    "screens": \[  
      "readiness\_overview\_screen",  
      "dimension\_detail\_screen",  
      "readiness\_gaps\_screen",  
      "risk\_analysis\_screen",  
      "submission\_readiness\_gate\_screen",  
      "readiness\_history\_screen",  
      "scenario\_simulation\_screen",  
      "financial\_viability\_screen",  
      "institutional\_view\_readiness"  
    \]  
  }  
}  
---

# **DESIGN PRINCIPLES**

1. Never shame the user

2. Never exaggerate certainty

3. Always show improvement path

4. Quantify but contextualize

5. Show relative trajectory

6. Separate structural readiness from psychological readiness

7. Adapt visual intensity to anxiety level

---

# **1️⃣ READINESS OVERVIEW SCREEN (PRIMARY)**

This is the most visited readiness screen.

---

## **MOBILE STRUCTURE**

{  
  "readiness\_overview\_screen": {  
    "header": {  
      "title": "Your Readiness",  
      "route\_name": "Scholarship Path",  
      "last\_updated": "2 days ago"  
    },  
    "main\_score\_card": {},  
    "dimension\_breakdown\_section": {},  
    "risk\_summary\_section": {},  
    "gaps\_preview\_section": {},  
    "cta\_section": {}  
  }  
}  
---

# **1A. MAIN SCORE CARD**

This must feel serious but not dramatic.

{  
  "main\_score\_card": {  
    "overall\_score": 72,  
    "confidence\_band": "Moderate-High",  
    "estimated\_success\_probability": "Structured Estimate: 61%",  
    "score\_interpretation": "You are progressing well, but key areas need strengthening."  
  }  
}  
---

## **UI Design**

* Circular gauge (not red/green)

* Neutral gradient

* Tooltip explaining:

   “This is a structured estimate, not a guarantee.”

If anxiety\_score high:

Hide % probability by default.

Show:

“Progress is building.”

---

# **1B. DIMENSION BREAKDOWN**

Dimensions (example):

* Academic Profile

* Language/Test

* Narrative Strength

* Financial Preparedness

* Experience Alignment

* Momentum

---

## **Layout**

Scrollable vertical cards (mobile):

{  
  "dimension\_card": {  
    "name": "Narrative Strength",  
    "score": 62,  
    "trend": "+4",  
    "status": "Needs Refinement",  
    "cta": "Improve"  
  }  
}

Tap → dimension\_detail\_screen.

---

# **1C. RISK SUMMARY SECTION**

{  
  "risk\_summary\_section": {  
    "risk\_index": 35,  
    "risk\_level": "Moderate",  
    "primary\_risk\_driver": "Financial Gap",  
    "cta": "View Risk Details"  
  }  
}

Risk index is inverse of readiness, but must be shown differently.

Never:

“High risk of failure.”

Instead:

“Probability sensitivity increases if…”

---

# **1D. GAPS PREVIEW SECTION**

Top 3 prioritized gaps.

{  
  "gaps\_preview\_section": \[  
    {  
      "gap\_type": "Language Score",  
      "severity": "High",  
      "impact\_on\_score": "-8",  
      "cta": "Resolve"  
    },  
    {  
      "gap\_type": "Narrative Alignment",  
      "severity": "Medium",  
      "impact\_on\_score": "-5"  
    }  
  \]  
}  
---

# **1E. CTA SECTION**

Contextual:

* “Simulate Submission”

* “Improve Top Gap”

* “Review Narrative”

* “Prepare for Interview”

Only one primary CTA.

---

# **2️⃣ DIMENSION DETAIL SCREEN**

Deep dive per dimension.

---

## **Structure**

{  
  "dimension\_detail\_screen": {  
    "dimension\_name": "Financial Preparedness",  
    "current\_score": 50,  
    "score\_breakdown": \[  
      "Available Funds",  
      "Funding Sources Identified",  
      "Scholarship Fit"  
    \],  
    "improvement\_actions": \[\],  
    "estimated\_gain\_if\_resolved": "+12"  
  }  
}  
---

Must show:

* What contributes to score

* How to improve

* Estimated gain

* Related milestones

---

# **3️⃣ READINESS GAPS SCREEN**

Dedicated gap prioritization screen.

---

## **Structure**

{  
  "readiness\_gaps\_screen": {  
    "gaps\_ranked\_by\_priority": \[  
      {  
        "gap": "IELTS below required threshold",  
        "severity": 8.5,  
        "readiness\_impact": \-10,  
        "effort\_estimate": "Medium",  
        "cta": "Schedule Test"  
      }  
    \]  
  }  
}  
---

Add sorting options:

* Highest impact

* Lowest effort

* Fastest improvement

---

# **4️⃣ RISK ANALYSIS SCREEN**

Advanced screen for analytical users.

---

## **Structure**

{  
  "risk\_analysis\_screen": {  
    "overall\_risk\_index": 35,  
    "risk\_contributors": \[  
      {  
        "factor": "Narrative clarity",  
        "weight": 0.25  
      },  
      {  
        "factor": "Interview readiness",  
        "weight": 0.20  
      }  
    \],  
    "sensitivity\_analysis": "Improving narrative \+10 → overall \+6"  
  }  
}  
---

Explain:

* What affects competitiveness

* Which areas are binding constraints

---

# **5️⃣ SUBMISSION READINESS GATE SCREEN**

Triggered when user attempts to submit application.

---

## **Structure**

{  
  "submission\_readiness\_gate\_screen": {  
    "current\_score": 68,  
    "recommended\_threshold": 75,  
    "blocking\_issues": \[  
      "Interview score below minimum"  
    \],  
    "decision\_options": \[  
      "Apply Anyway",  
      "Improve First"  
    \]  
  }  
}

Must:

Avoid paternalism.

Present structured trade-offs.

---

# **6️⃣ READINESS HISTORY SCREEN**

Trend tracking.

---

## **Structure**

{  
  "readiness\_history\_screen": {  
    "timeline\_chart": "score\_over\_time",  
    "dimension\_trend\_toggle": true,  
    "event\_markers": \[  
      "Narrative updated",  
      "Interview session completed"  
    \]  
  }  
}  
---

Purpose:

Show growth.

Encourage momentum.

---

# **7️⃣ SCENARIO SIMULATION SCREEN**

Advanced but powerful.

User adjusts dimension hypothetically.

---

## **Structure**

{  
  "scenario\_simulation\_screen": {  
    "adjustable\_sliders": \[  
      "Language Score",  
      "Interview Score",  
      "Narrative Score"  
    \],  
    "simulated\_overall\_score": 80,  
    "difference\_from\_current": "+8"  
  }  
}

This reinforces strategic prioritization.

---

# **8️⃣ FINANCIAL VIABILITY SCREEN**

If financial risk detected.

---

## **Structure**

{  
  "financial\_viability\_screen": {  
    "estimated\_total\_cost": "$25,000",  
    "available\_funds": "$15,000",  
    "gap": "$10,000",  
    "suggested\_actions": \[  
      "Apply to funding A",  
      "Seek partial grant"  
    \]  
  }  
}  
---

# **9️⃣ INSTITUTIONAL VIEW READINESS (B2B)**

Restricted access.

---

## **Structure**

{  
  "institutional\_view\_readiness": {  
    "student\_readiness\_score": 70,  
    "risk\_flags": \["Low financial viability"\],  
    "interview\_trend": "+3",  
    "cohort\_average": 65  
  }  
}  
---

# **PSYCHOLOGICAL ADAPTATION**

If anxiety high:

* Hide % probability by default

* Emphasize trend

* Emphasize improvement

If discipline low:

* Show micro-step improvement suggestion

If confidence high:

* Show competitiveness comparison

---

# **VISUAL RULES**

Never:

* Bright red risk

* “You will fail”

* Harsh language

Always:

* “Structured estimate”

* “Improvement opportunity”

* “Momentum building”

---

# **EDGE CASES**

No milestones completed:

Show:

“Start building your readiness.”

All complete:

Show:

“You are structurally strong.”

Rejected:

Show:

“Your submission readiness was X at time of application.”

---

# **PERFORMANCE REQUIREMENTS**

* All readiness calculations precomputed

* No heavy AI call on load

* Snapshot cached

* Recalculation triggered by event (milestone complete, narrative update, interview update)

---

# **ANALYTICS EVENTS**

* Readiness viewed

* Gap resolved

* Simulation used

* Submission attempted below threshold

* Readiness delta \> 5

---

# **SUMMARY**

Readiness Screens must:

* Quantify without terrifying

* Prioritize without overwhelming

* Model trade-offs

* Enable strategic decision-making

* Encourage improvement

* Prevent reckless submission

* Provide transparency

* Adapt psychologically

* Integrate with route \+ narrative \+ interview \+ application

This is Compass’s strategic intelligence interface.

---

If you want next, we can:

* Go deep on 7️⃣ Narrative Intelligence Screens

* Or fully map readiness → submission → rejection → recalibration cycle

* Or design behavioral adaptation matrix across all screens

Choose the next descent.

Excellent.

This is one of the most strategic parts of Compass.

Narrative is not “writing.”

It is:

* Positioning architecture

* Identity projection

* Strategic alignment

* Competitive signaling

* Psychological coherence

* Selection committee communication

If weak → rejection.

If generic → invisibility.

If inflated → credibility loss.

If misaligned → structural failure.

The Narrative Screens must:

* Feel serious but safe

* Encourage depth without overwhelm

* Integrate AI without replacing agency

* Track evolution

* Link directly to readiness

* Link directly to interview performance

* Allow versioning

* Be mobile-friendly but powerful on desktop

Now we go deep.

---

# **7️⃣ NARRATIVE SCREENS — FULL SYSTEM SPECIFICATION**

---

# **STRUCTURAL OVERVIEW**

{  
  "narrative\_domain": {  
    "screens": \[  
      "narrative\_list\_screen",  
      "narrative\_document\_setup\_screen",  
      "narrative\_editor\_screen",  
      "narrative\_analysis\_screen",  
      "narrative\_version\_history\_screen",  
      "narrative\_comparison\_screen",  
      "narrative\_alignment\_screen",  
      "narrative\_competitiveness\_screen",  
      "narrative\_coach\_mode\_screen",  
      "narrative\_export\_screen",  
      "institutional\_view\_narrative"  
    \]  
  }  
}  
---

# **DESIGN PRINCIPLES**

1. The user owns the narrative

2. AI assists but does not overwrite

3. Version history is mandatory

4. Structural feedback \> stylistic fluff

5. Alignment with route is visible

6. Narrative improvement impacts readiness visibly

7. Never auto-generate full letters silently

---

# **1️⃣ NARRATIVE LIST SCREEN**

Entry point from:

* Dashboard

* Route Overview

* Application Detail

---

## **Structure (Mobile)**

{  
  "narrative\_list\_screen": {  
    "header": "Your Narrative Assets",  
    "document\_cards": \[  
      {  
        "type": "Motivation Letter",  
        "status": "Drafted",  
        "clarity\_score": 62,  
        "last\_updated": "3 days ago"  
      },  
      {  
        "type": "Statement of Purpose",  
        "status": "Not Started"  
      }  
    \],  
    "cta": "Create New Document"  
  }  
}  
---

## **Status Types**

* Not Started

* Drafting

* Analyzed

* Improving

* Application-Linked

---

# **2️⃣ NARRATIVE DOCUMENT SETUP SCREEN**

When creating new document.

---

## **Structure**

{  
  "narrative\_document\_setup\_screen": {  
    "fields": \[  
      "Document Type",  
      "Target Opportunity (optional)",  
      "Word Limit",  
      "Tone Preference (optional)"  
    \],  
    "cta": "Start Writing"  
  }  
}  
---

Backend:

* Create narrative\_document

* Initialize version 1 (empty)

---

# **3️⃣ NARRATIVE EDITOR SCREEN (CORE)**

This is a controlled writing environment.

---

## **Mobile Layout**

Single-column scroll editor.

---

## **Desktop Layout**

Two-panel:

Left: Editor

Right: AI Insight Panel

---

## **Structure**

{  
  "narrative\_editor\_screen": {  
    "editor": {  
      "rich\_text": true,  
      "word\_count\_live": true,  
      "word\_limit\_indicator": true,  
      "autosave": true  
    },  
    "actions": \[  
      "Save Draft",  
      "Analyze",  
      "View History"  
    \],  
    "ai\_panel\_collapsible": true  
  }  
}  
---

## **Editor Features**

* Markdown support (optional)

* Paragraph segmentation detection

* Highlight passive language (future)

* Highlight repetition (future)

* Live word counter

* Over-limit warning

* Auto-save every 5 seconds

---

# **4️⃣ NARRATIVE ANALYSIS SCREEN**

Triggered after “Analyze.”

Must:

* Use structured AI output schema

* Never hallucinate competitiveness claims

* Provide dimensional scoring

---

## **Structure**

{  
  "narrative\_analysis\_screen": {  
    "overall\_score": 68,  
    "dimension\_scores": {  
      "Clarity": 72,  
      "Coherence": 65,  
      "Strategic Alignment": 60,  
      "Specificity": 55,  
      "Authenticity Risk": "Low"  
    },  
    "improvement\_actions": \[  
      "Clarify long-term career goal",  
      "Add specific academic example",  
      "Reduce abstract phrasing"  
    \],  
    "cta": "Revise Document"  
  }  
}  
---

## **Behavioral Guardrails**

* Avoid labeling as “Weak”

* Use “Opportunity to strengthen”

* Show potential score gain

---

# **5️⃣ NARRATIVE VERSION HISTORY SCREEN**

Critical for serious applicants.

---

## **Structure**

{  
  "narrative\_version\_history\_screen": {  
    "versions": \[  
      {  
        "version": 1,  
        "score": 58,  
        "date": "2026-01-10"  
      },  
      {  
        "version": 2,  
        "score": 68,  
        "date": "2026-01-15"  
      }  
    \],  
    "cta": "Compare Versions"  
  }  
}  
---

# **6️⃣ NARRATIVE COMPARISON SCREEN**

Desktop enhanced.

---

## **Structure**

{  
  "narrative\_comparison\_screen": {  
    "side\_by\_side\_view": true,  
    "score\_delta": "+10",  
    "improved\_dimensions": \["Clarity", "Alignment"\]  
  }  
}  
---

Features:

* Highlight added paragraphs

* Highlight removed text

* Show score improvement

---

# **7️⃣ NARRATIVE ALIGNMENT SCREEN**

Align narrative with route requirements.

---

## **Structure**

{  
  "narrative\_alignment\_screen": {  
    "route\_requirements": \[  
      "Leadership experience",  
      "Research focus clarity"  
    \],  
    "coverage\_status": {  
      "Leadership experience": "Partially Covered",  
      "Research focus clarity": "Missing"  
    },  
    "cta": "Address Missing Elements"  
  }  
}  
---

This connects narrative directly to route.

---

# **8️⃣ NARRATIVE COMPETITIVENESS SCREEN**

Advanced analytical view.

---

## **Structure**

{  
  "narrative\_competitiveness\_screen": {  
    "competitiveness\_index\_estimate": 0.64,  
    "strength\_areas": \["Academic alignment"\],  
    "vulnerability\_areas": \["Specificity"\],  
    "suggested\_focus": "Strengthen impact examples"  
  }  
}  
---

Must be framed as:

“Structured estimate.”

Never:

“You are below average.”

---

# **9️⃣ NARRATIVE COACH MODE SCREEN**

Optional interactive AI refinement.

---

## **Structure**

{  
  "narrative\_coach\_mode\_screen": {  
    "prompt\_input": "Help me refine paragraph 2",  
    "ai\_suggestions": \[\],  
    "accept\_or\_reject\_buttons": true,  
    "manual\_edit\_required": true  
  }  
}  
---

Guardrails:

* No full auto-rewrite

* User must confirm changes

* Track AI-assisted segments (optional)

---

# **🔟 NARRATIVE EXPORT SCREEN**

For application submission.

---

## **Structure**

{  
  "narrative\_export\_screen": {  
    "format\_options": \["PDF", "DOCX", "Plain Text"\],  
    "final\_word\_count": 998,  
    "export\_button": "Download"  
  }  
}  
---

Must:

Lock version used for application.

---

# **1️⃣1️⃣ INSTITUTIONAL VIEW (B2B)**

Coordinators see:

{  
  "institutional\_view\_narrative": {  
    "student\_score": 68,  
    "risk\_flags": \["Lacks specificity"\],  
    "trend": "+5"  
  }  
}

No raw text by default unless consented.

---

# **AI-FIRST INTEGRATION RULES**

* All AI responses structured JSON

* Output schema enforced

* No hallucinated admissions data

* No false probability claims

* No rewriting entire identity

---

# **EDGE CASES**

No document created:

Show:

“Your narrative is central to competitiveness.”

Overconfidence user:

Show deeper alignment insights.

Low confidence user:

Emphasize strengths first.

High rejection history:

Highlight improvement trajectory.

---

# **MOBILE UX OPTIMIZATION**

* Collapse AI panel

* Focus on writing

* Large input field

* Sticky bottom action buttons

---

# **DESKTOP UX ENHANCEMENT**

* Dual panel editor \+ analysis

* Version comparison side-by-side

* Alignment map visible while editing

---

# **PERFORMANCE REQUIREMENTS**

* Autosave \< 200ms

* AI analysis async

* Loading indicator on analysis

* No freeze on long text

---

# **ANALYTICS EVENTS**

* Narrative created

* Narrative analyzed

* Version created

* Version improved delta \> 5

* Narrative linked to application

* AI coach used

* Export generated

---

# **PSYCHOLOGICAL SAFETY**

Never:

* “This is weak”

* “You are not competitive”

* “This will fail”

Always:

* “Opportunity to refine”

* “Increase specificity”

* “Strengthen clarity”

* “Structured improvement path”

---

# **STRATEGIC ROLE**

Narrative screens:

* Feed readiness engine

* Feed interview engine

* Influence risk index

* Influence marketplace trigger

* Influence institutional analytics

* Create long-term data moat

This is not a writing tool.

It is a positioning laboratory.

---

If you want next, we can:

* Go deep on 8️⃣ Interview Intelligence Screens

* Or map Narrative → Readiness → Interview synergy layer

* Or design AI guardrail architecture specifically for narrative engine

Choose the next descent.

Excellent.

Now we enter the **performance simulation layer** of Compass.

If Narrative is positioning,

Interview is live performance under pressure.

This is where:

* Confidence meets unpredictability

* Structure meets spontaneity

* Self-perception meets external evaluation

* Psychological state becomes visible

If weak → false sense of preparedness.

If too harsh → anxiety spike.

If too soft → delusion.

If gamified poorly → unrealistic readiness.

Interview Screens must:

* Simulate pressure safely

* Quantify delivery objectively

* Track growth longitudinally

* Link directly to readiness

* Adapt to psychological profile

* Escalate difficulty intelligently

* Avoid becoming a chatbot toy

Now we go deep.

---

# **8️⃣ INTERVIEW SCREENS — FULL SYSTEM SPECIFICATION**

---

# **STRUCTURAL OVERVIEW**

{  
  "interview\_domain": {  
    "screens": \[  
      "interview\_intro\_screen",  
      "interview\_configuration\_screen",  
      "interview\_live\_session\_screen",  
      "interview\_mid\_session\_feedback\_modal",  
      "interview\_results\_screen",  
      "interview\_dimension\_breakdown\_screen",  
      "interview\_transcript\_screen",  
      "interview\_history\_screen",  
      "difficulty\_progression\_screen",  
      "interview\_recommendation\_screen",  
      "institutional\_view\_interview"  
    \]  
  }  
}  
---

# **CORE DESIGN PRINCIPLES**

1. Simulate structure, not chaos

2. One question at a time (mobile-first)

3. Controlled cognitive load

4. Measure delivery, not eloquence only

5. Separate content quality from performance delivery

6. Track resilience under difficulty

7. Gradually increase challenge

8. Avoid AI hallucinating “panel reactions”

---

# **1️⃣ INTERVIEW INTRO SCREEN**

Entry from:

* Dashboard

* Route screen

* Readiness gap

* Application gate

---

## **Structure**

{  
  "interview\_intro\_screen": {  
    "header": "Simulate Your Interview",  
    "route\_context": "Scholarship Path",  
    "estimated\_duration": "10–15 minutes",  
    "difficulty\_level": 2,  
    "description": "Structured mock interview aligned with your route.",  
    "cta\_primary": "Start Interview",  
    "cta\_secondary": "Configure Session"  
  }  
}  
---

# **2️⃣ INTERVIEW CONFIGURATION SCREEN**

Optional but powerful.

---

## **Configuration Options**

{  
  "interview\_configuration\_screen": {  
    "fields": \[  
      "Difficulty Level (1–5)",  
      "Question Focus (Narrative / Technical / Behavioral)",  
      "Time Pressure Mode (On/Off)",  
      "Strict Evaluation Mode (On/Off)"  
    \],  
    "cta": "Begin Session"  
  }  
}  
---

## **Behavioral Logic**

If anxiety\_score high:

Default difficulty \= 1–2.

If discipline high \+ multiple sessions:

Suggest increase.

If applying soon:

Recommend higher difficulty.

---

# **3️⃣ INTERVIEW LIVE SESSION SCREEN (CORE)**

This is the simulation environment.

---

## **Mobile Layout**

Single vertical layout:

{  
  "interview\_live\_session\_screen": {  
    "progress\_indicator": "Question 2 of 6",  
    "question\_card": {  
      "question\_text": "Why this program?",  
      "difficulty\_label": "Moderate"  
    },  
    "response\_input": {  
      "mode": "Text (V1)",  
      "timer\_visible": true  
    },  
    "actions": \[  
      "Submit Answer",  
      "Skip (limited)"  
    \]  
  }  
}  
---

## **Advanced Features (Future)**

* Voice input

* Video recording

* Real-time hesitation detection

* Filler word detection

---

# **TIME PRESSURE MODE**

If enabled:

* Countdown timer visible

* Visual urgency subtle

* No red flashing

Purpose:

Simulate mild stress.

---

# **4️⃣ MID-SESSION FEEDBACK MODAL (Optional V2)**

Triggered only in training mode.

{  
  "mid\_session\_feedback\_modal": {  
    "feedback\_type": "Clarity",  
    "message": "Try to structure your answer with a clear beginning and example.",  
    "cta": "Continue"  
  }  
}

Not used in strict mode.

---

# **5️⃣ INTERVIEW RESULTS SCREEN (PRIMARY POST-SESSION)**

This must feel analytical, not emotional.

---

## **Structure**

{  
  "interview\_results\_screen": {  
    "overall\_score": 68,  
    "resilience\_index": 72,  
    "confidence\_projection\_score": 60,  
    "difficulty\_level": 2,  
    "session\_duration": "12 min",  
    "summary\_message": "You demonstrate solid structure but can improve specificity.",  
    "cta\_primary": "View Detailed Breakdown",  
    "cta\_secondary": "Practice Again"  
  }  
}  
---

# **6️⃣ INTERVIEW DIMENSION BREAKDOWN SCREEN**

Granular scoring.

---

## **Dimensions**

* Content Clarity

* Structure

* Specificity

* Alignment with Route

* Confidence Projection

* Brevity

* Adaptability

* Resilience Under Pressure

---

## **Structure**

{  
  "dimension\_breakdown\_screen": {  
    "dimensions": \[  
      {  
        "name": "Content Clarity",  
        "score": 70,  
        "delta": "+5",  
        "feedback": "Clear but could reduce abstraction."  
      },  
      {  
        "name": "Confidence Projection",  
        "score": 60,  
        "feedback": "Tone suggests mild hesitation."  
      }  
    \],  
    "top\_3\_improvements": \[  
      "Provide more concrete examples",  
      "Avoid repeating phrases",  
      "Close answers with strong summary"  
    \]  
  }  
}  
---

# **7️⃣ INTERVIEW TRANSCRIPT SCREEN**

Full transparency.

---

## **Structure**

{  
  "interview\_transcript\_screen": {  
    "questions": \[  
      {  
        "question": "Why this program?",  
        "response\_text": "...",  
        "analysis\_summary": "Moderate alignment"  
      }  
    \]  
  }  
}  
---

Must:

* Allow user to review answers

* Highlight improvement suggestions inline

* Allow re-practice specific question

---

# **8️⃣ INTERVIEW HISTORY SCREEN**

Longitudinal growth tracking.

---

## **Structure**

{  
  "interview\_history\_screen": {  
    "session\_list": \[  
      {  
        "date": "2026-01-10",  
        "difficulty": 2,  
        "score": 62  
      },  
      {  
        "date": "2026-01-15",  
        "difficulty": 3,  
        "score": 68  
      }  
    \],  
    "trend\_graph": "score\_over\_time",  
    "resilience\_trend": "+8 over 30 days"  
  }  
}  
---

Purpose:

Reinforce growth.

---

# **9️⃣ DIFFICULTY PROGRESSION SCREEN**

Optional for motivated users.

---

## **Structure**

{  
  "difficulty\_progression\_screen": {  
    "current\_level": 2,  
    "recommended\_level": 3,  
    "criteria\_for\_upgrade": \[  
      "Score above 75 twice",  
      "Resilience index \> 70"  
    \],  
    "cta": "Increase Difficulty"  
  }  
}  
---

# **🔟 INTERVIEW RECOMMENDATION SCREEN**

Triggered by readiness gate or low score.

{  
  "interview\_recommendation\_screen": {  
    "reason": "Interview score below recommended threshold for competitiveness.",  
    "suggested\_action": "Complete 3 additional sessions at level 3.",  
    "cta": "Start Structured Practice Plan"  
  }  
}  
---

# **1️⃣1️⃣ INSTITUTIONAL VIEW (B2B)**

Coordinators see:

{  
  "institutional\_view\_interview": {  
    "student\_score": 68,  
    "resilience\_index": 72,  
    "trend": "+6 over 2 weeks",  
    "risk\_flag": "Below competitiveness median"  
  }  
}

No transcript visible unless consented.

---

# **PSYCHOLOGICAL ADAPTATION**

If anxiety high:

* Hide “confidence projection” wording

* Emphasize structure improvement

If confidence too high \+ low score:

* Show objective indicators

* Suggest strict mode

If discipline low:

* Recommend shorter sessions

* Micro-practice mode (1–2 questions)

---

# **MOBILE UX OPTIMIZATION**

* Large text area

* Visible timer

* Minimal scrolling

* Big tap CTA

* No cluttered analytics mid-session

---

# **DESKTOP ENHANCEMENTS**

* Split view: Question \+ Notes

* Side panel showing prior attempt comparison

* Difficulty toggle visible

* Multi-question navigation panel

---

# **PERFORMANCE REQUIREMENTS**

* No blocking on AI analysis

* Response evaluation async (with loader)

* Session auto-save if interrupted

* Max response processing time \< 5 seconds

---

# **ANALYTICS EVENTS**

* Interview started

* Interview completed

* Question skipped

* Difficulty increased

* Strict mode used

* Score delta \> 5

* Resilience improvement detected

---

# **INTEGRATION WITH OTHER ENGINES**

Interview scores feed:

* Readiness engine (weight factor)

* Risk index

* Submission gate

* Marketplace trigger (coaching)

* Institutional analytics

---

# **EDGE CASES**

No narrative created:

Add pre-interview reminder.

Multiple rejections:

Show structured improvement plan.

User stops mid-session:

Allow resume within 24h.

---

# **TONE & SAFETY RULES**

Never:

* “Poor performance”

* “You failed”

* “Weak answers”

Always:

* “Opportunity to strengthen”

* “Increase clarity”

* “Improve confidence projection”

---

# **STRATEGIC ROLE**

Interview Screens are:

* Reality simulator

* Pressure rehearsal

* Performance quantifier

* Confidence regulator

* Growth tracker

* Readiness gatekeeper

They prevent:

* False confidence

* Premature application

* Avoidable rejection

---

If you want next, we can:

* Go deep on 9️⃣ Application Management Screens

* Or map Narrative \+ Interview synergy interface

* Or design adaptive difficulty escalation engine logic

Choose the next descent.

Excellent.

Now we enter the **decision-to-action layer** of Compass.

If:

* Route \= structure

* Readiness \= intelligence

* Narrative \= positioning

* Interview \= performance

Then:

Application \= commitment.

This is the irreversible moment.

Application Screens must:

* Prevent reckless submission

* Reduce emotional impulsivity

* Structure decision-making

* Capture outcome data

* Enable iteration after rejection

* Track multiple parallel applications

* Integrate readiness \+ narrative \+ interview

* Support B2B oversight

* Stay calm under deadline pressure

If weak → chaos.

If too rigid → user frustration.

If too loose → failure.

Now we go deep.

---

# **9️⃣ APPLICATION SCREENS — FULL SYSTEM SPECIFICATION**

---

# **STRUCTURAL OVERVIEW**

{  
  "application\_domain": {  
    "screens": \[  
      "application\_list\_screen",  
      "application\_create\_screen",  
      "application\_detail\_screen",  
      "application\_document\_link\_screen",  
      "submission\_readiness\_gate\_screen",  
      "submission\_confirmation\_screen",  
      "application\_tracking\_screen",  
      "application\_outcome\_screen",  
      "rejection\_recalibration\_screen",  
      "acceptance\_transition\_screen",  
      "multi\_application\_dashboard",  
      "institutional\_application\_view"  
    \]  
  }  
}  
---

# **DESIGN PRINCIPLES**

1. Applications are strategic commitments

2. No blind submission

3. Readiness must be visible

4. Narrative version must be locked

5. Interview status must be visible

6. Deadlines must be clear

7. Outcome logging must be structured

8. Iteration must be guided

9. Multi-application parallel tracking must be simple

---

# **1️⃣ APPLICATION LIST SCREEN**

Primary entry point.

---

## **Mobile Structure**

{  
  "application\_list\_screen": {  
    "header": "Your Applications",  
    "filters": \["Active", "Submitted", "Awaiting Decision", "Rejected", "Accepted"\],  
    "application\_cards": \[\],  
    "cta": "Add New Application"  
  }  
}  
---

## **Application Card Structure**

{  
  "application\_card": {  
    "title": "DAAD Scholarship",  
    "country": "Germany",  
    "deadline": "2026-10-15",  
    "state\_badge": "PREPARING",  
    "readiness\_snapshot": 72,  
    "days\_remaining": 45,  
    "cta": "Open"  
  }  
}  
---

## **Visual Signals**

State badge types:

* PREPARING

* READY

* SUBMITTED

* AWAITING\_DECISION

* REJECTED

* ACCEPTED

* ARCHIVED

Deadline color logic:

* 30 days → neutral

* 15–30 → mild highlight

* \<15 → alert banner

* \<5 → sticky top alert

---

# **2️⃣ APPLICATION CREATE SCREEN**

Entry from:

* Route screen

* Application list

---

## **Structure**

{  
  "application\_create\_screen": {  
    "fields": \[  
      "Opportunity Name",  
      "Organization",  
      "Country",  
      "Deadline",  
      "Route Type (auto-suggested)",  
      "Competitiveness Estimate (optional)"  
    \],  
    "cta": "Create Application"  
  }  
}  
---

## **Backend Actions**

* Create application record

* Link to route

* Trigger readiness snapshot creation

* Initialize application\_state \= PREPARING

---

# **3️⃣ APPLICATION DETAIL SCREEN (CORE)**

This is the command center for a specific application.

---

## **Mobile Structure**

{  
  "application\_detail\_screen": {  
    "header": {  
      "title": "DAAD Scholarship",  
      "state": "PREPARING",  
      "deadline": "2026-10-15",  
      "days\_remaining": 45  
    },  
    "sections": \[  
      "readiness\_section",  
      "narrative\_section",  
      "interview\_section",  
      "document\_section",  
      "timeline\_section",  
      "decision\_section"  
    \]  
  }  
}  
---

# **3A. READINESS SECTION**

{  
  "readiness\_section": {  
    "score\_at\_current": 72,  
    "recommended\_threshold": 75,  
    "risk\_index": 28,  
    "cta": "View Readiness"  
  }  
}

Must show:

* If below recommended

* Improvement estimate

---

# **3B. NARRATIVE SECTION**

{  
  "narrative\_section": {  
    "linked\_document": "Motivation Letter v2",  
    "clarity\_score": 68,  
    "alignment\_score": 60,  
    "cta": "Edit Narrative"  
  }  
}

Must allow:

* Locking specific version for submission

* Changing version before submission

---

# **3C. INTERVIEW SECTION**

{  
  "interview\_section": {  
    "latest\_score": 65,  
    "recommended\_minimum": 70,  
    "difficulty\_level": 3,  
    "cta": "Practice Again"  
  }  
}  
---

# **3D. DOCUMENT SECTION**

{  
  "document\_section": {  
    "required\_documents": \[  
      "CV",  
      "Transcript",  
      "Recommendation Letters"  
    \],  
    "uploaded\_status": {  
      "CV": "Uploaded",  
      "Transcript": "Missing"  
    },  
    "cta": "Manage Documents"  
  }  
}  
---

# **3E. TIMELINE SECTION**

{  
  "timeline\_section": {  
    "deadline": "2026-10-15",  
    "submission\_window": "Opens 2026-09-01",  
    "milestones\_remaining": 3  
  }  
}  
---

# **3F. DECISION SECTION**

{  
  "decision\_section": {  
    "primary\_cta": "Prepare for Submission",  
    "secondary\_cta": "Archive Application"  
  }  
}  
---

# **4️⃣ APPLICATION DOCUMENT LINK SCREEN**

Used to manage uploads.

---

## **Structure**

{  
  "application\_document\_link\_screen": {  
    "documents": \[  
      {  
        "name": "CV",  
        "status": "Uploaded",  
        "version": "v3"  
      }  
    \],  
    "upload\_button": true  
  }  
}  
---

# **5️⃣ SUBMISSION READINESS GATE SCREEN**

Triggered when clicking “Submit.”

This is critical.

---

## **Structure**

{  
  "submission\_readiness\_gate\_screen": {  
    "readiness\_score": 72,  
    "recommended\_threshold": 75,  
    "blocking\_issues": \[  
      "Interview score below recommended",  
      "Narrative alignment incomplete"  
    \],  
    "risk\_message": "Submitting now reduces structured competitiveness.",  
    "options": \[  
      "Improve Before Submitting",  
      "Submit Anyway"  
    \]  
  }  
}  
---

Must:

* Avoid authoritarian tone

* Present trade-offs clearly

---

# **6️⃣ SUBMISSION CONFIRMATION SCREEN**

Once user confirms submission.

---

## **Structure**

{  
  "submission\_confirmation\_screen": {  
    "confirmation\_message": "Have you submitted externally?",  
    "checkbox": "I confirm I submitted this application.",  
    "cta": "Mark as Submitted"  
  }  
}

Backend:

* Lock readiness snapshot

* Lock narrative version

* Lock interview snapshot

* application\_state \= SUBMITTED

---

# **7️⃣ APPLICATION TRACKING SCREEN**

After submission.

---

## **Structure**

{  
  "application\_tracking\_screen": {  
    "state": "AWAITING\_DECISION",  
    "submitted\_on": "2026-09-10",  
    "expected\_response\_window": "Nov–Dec 2026",  
    "reminder\_option": true  
  }  
}  
---

# **8️⃣ APPLICATION OUTCOME SCREEN**

User manually logs outcome.

---

## **Structure**

{  
  "application\_outcome\_screen": {  
    "outcome\_options": \[  
      "Accepted",  
      "Rejected",  
      "Waitlisted"  
    \],  
    "cta": "Save Outcome"  
  }  
}  
---

# **9️⃣ REJECTION RECALIBRATION SCREEN**

Triggered if outcome \= REJECTED.

---

## **Structure**

{  
  "rejection\_recalibration\_screen": {  
    "snapshot\_at\_submission": {  
      "readiness": 72,  
      "interview\_score": 65,  
      "narrative\_score": 68  
    },  
    "gap\_analysis": \[  
      "Interview below competitiveness median",  
      "Financial gap unresolved"  
    \],  
    "suggested\_iteration\_plan": \[  
      "Increase interview difficulty to 4",  
      "Refine narrative alignment"  
    \],  
    "cta": "Start Iteration"  
  }  
}

Tone:

Calm.

Analytical.

Forward-focused.

---

# **🔟 ACCEPTANCE TRANSITION SCREEN**

Triggered if outcome \= ACCEPTED.

---

## **Structure**

{  
  "acceptance\_transition\_screen": {  
    "celebration\_message": "Congratulations\!",  
    "next\_phase\_options": \[  
      "Prepare Relocation Checklist",  
      "Financial Planning",  
      "Visa Preparation"  
    \],  
    "cta": "Start Relocation Phase"  
  }  
}

Route state changes to RELOCATING.

---

# **1️⃣1️⃣ MULTI-APPLICATION DASHBOARD**

For advanced users.

---

## **Structure**

{  
  "multi\_application\_dashboard": {  
    "comparison\_table": \[  
      {  
        "application": "DAAD",  
        "readiness": 72,  
        "deadline": 45,  
        "risk": 28  
      }  
    \],  
    "sort\_options": \[  
      "Closest Deadline",  
      "Highest Readiness",  
      "Highest Risk"  
    \]  
  }  
}  
---

# **1️⃣2️⃣ INSTITUTIONAL APPLICATION VIEW (B2B)**

Restricted.

---

## **Structure**

{  
  "institutional\_application\_view": {  
    "student\_name": "Anonymous ID",  
    "readiness\_at\_submission": 72,  
    "interview\_score": 65,  
    "outcome": "Rejected",  
    "trend\_comparison": "Above cohort average"  
  }  
}

No document access unless consented.

---

# **MOBILE UX PRINCIPLES**

* Clear hierarchy

* Sticky deadline banner

* One primary CTA per screen

* Avoid clutter

* Collapse sections by default

---

# **DESKTOP ENHANCEMENTS**

* Two-column layout

* Left: Overview

* Right: Readiness \+ Interview

* Application comparison grid

---

# **PERFORMANCE REQUIREMENTS**

* Load application detail \< 500ms

* Lock snapshots on submission

* No AI recalculation on submission screen

* Background job for outcome recalibration

---

# **ANALYTICS EVENTS**

* Application created

* Submission attempted

* Submission below threshold

* Outcome logged

* Rejection recalibration started

* Acceptance transition started

---

# **STRATEGIC ROLE**

Application Screens:

* Convert preparation into action

* Prevent premature submission

* Capture performance data

* Enable structured iteration

* Feed analytics dataset

* Feed institutional dashboard

* Enable long-term success modeling

They are the commitment engine.

---

If you want next, we can:

* Go deep on 🔟 Marketplace Screens

* Or design full rejection → iteration behavioral loop

* Or build full state machine for application lifecycle

Choose the next descent.

Excellent.

Now we enter the **human layer of Compass**.

Marketplace is not just:

“Find a coach.”

It is:

* A calibrated intervention layer

* A monetization engine

* A trust network

* A conversion lever

* A performance amplifier

* A B2B bridge

* A data flywheel

If poorly designed → spammy directory.

If too aggressive → predatory upsell.

If too hidden → under-monetized.

If too complex → abandoned.

Marketplace must feel:

Selective

Curated

Context-aware

Integrated

Calm

High-quality

Optional but strategic

Now we go deep.

---

# **🔟 MARKETPLACE SCREENS — FULL SYSTEM SPECIFICATION**

---

# **STRUCTURAL OVERVIEW**

{  
  "marketplace\_domain": {  
    "screens": \[  
      "marketplace\_home\_screen",  
      "contextual\_recommendation\_modal",  
      "provider\_category\_screen",  
      "provider\_list\_screen",  
      "provider\_profile\_screen",  
      "service\_detail\_screen",  
      "booking\_flow\_step\_1\_select\_time",  
      "booking\_flow\_step\_2\_confirmation",  
      "booking\_flow\_step\_3\_payment",  
      "booking\_success\_screen",  
      "booking\_management\_screen",  
      "provider\_dashboard\_screen",  
      "provider\_service\_management\_screen",  
      "provider\_earnings\_screen",  
      "review\_submission\_screen",  
      "institutional\_marketplace\_view"  
    \]  
  }  
}  
---

# **CORE DESIGN PRINCIPLES**

1. Context-driven recommendations

2. Never push services randomly

3. Show “why this is recommended”

4. Make provider quality visible

5. Integrate directly with readiness \+ interview \+ narrative

6. Protect user psychologically

7. Make booking friction minimal

8. Ensure provider accountability

---

# **1️⃣ MARKETPLACE HOME SCREEN (USER SIDE)**

Entry from:

* Bottom nav

* Contextual card

* Readiness gap

* Interview results

---

## **Mobile Structure**

{  
  "marketplace\_home\_screen": {  
    "header": "Support & Mentorship",  
    "contextual\_section": \[\],  
    "categories": \[  
      "Interview Coaching",  
      "Narrative Review",  
      "CV Optimization",  
      "Translation Services",  
      "Financial Advisory"  
    \],  
    "search\_bar": true,  
    "filters\_button": true  
  }  
}  
---

# **CONTEXTUAL SECTION (AI-FIRST)**

If triggered:

{  
  "contextual\_recommendation": {  
    "title": "Interview Resilience Support",  
    "reason": "Your resilience score is below recommended threshold.",  
    "recommended\_provider\_preview": \[\],  
    "cta": "Explore Coaches"  
  }  
}

Must always show:

“Based on your readiness data.”

---

# **2️⃣ PROVIDER CATEGORY SCREEN**

Example: Interview Coaching

---

## **Structure**

{  
  "provider\_category\_screen": {  
    "category\_name": "Interview Coaching",  
    "filters": \[  
      "Price Range",  
      "Language",  
      "Route Specialization",  
      "Rating",  
      "Country"  
    \],  
    "provider\_cards": \[\]  
  }  
}  
---

# **3️⃣ PROVIDER CARD STRUCTURE**

{  
  "provider\_card": {  
    "name": "Dr. Maria Silva",  
    "rating": 4.8,  
    "specialization": "Scholarship Interviews",  
    "experience\_years": 8,  
    "price\_from": "$60",  
    "cta": "View Profile"  
  }  
}  
---

# **4️⃣ PROVIDER PROFILE SCREEN**

Critical trust screen.

---

## **Structure**

{  
  "provider\_profile\_screen": {  
    "profile\_header": {  
      "name": "Dr. Maria Silva",  
      "rating": 4.8,  
      "total\_sessions": 320  
    },  
    "bio\_section": true,  
    "specializations": \[\],  
    "services\_list": \[\],  
    "availability\_calendar\_preview": true,  
    "reviews\_section": \[\],  
    "cta": "Book Session"  
  }  
}  
---

## **Trust Elements**

* Verified badge

* Route-specific tags

* Performance metric:

   “Average interview improvement \+8 points”

Must be real, data-based.

---

# **5️⃣ SERVICE DETAIL SCREEN**

When provider offers multiple services.

---

{  
  "service\_detail\_screen": {  
    "service\_name": "60-min Mock Interview \+ Feedback",  
    "duration": "60 minutes",  
    "price": "$80",  
    "delivery\_mode": "Zoom",  
    "includes": \[  
      "Live mock session",  
      "Structured feedback",  
      "Action plan"  
    \],  
    "cta": "Select Time"  
  }  
}  
---

# **6️⃣ BOOKING FLOW — STEP 1: SELECT TIME**

Mobile calendar optimized.

---

{  
  "booking\_step\_1": {  
    "calendar\_view": true,  
    "time\_slots": \[\],  
    "timezone\_indicator": true,  
    "cta": "Confirm Slot"  
  }  
}  
---

# **7️⃣ BOOKING FLOW — STEP 2: CONFIRMATION**

---

{  
  "booking\_step\_2": {  
    "service\_summary": {},  
    "provider\_summary": {},  
    "price\_breakdown": {  
      "service\_price": 80,  
      "platform\_fee": 8,  
      "total": 88  
    },  
    "cta": "Proceed to Payment"  
  }  
}  
---

# **8️⃣ BOOKING FLOW — STEP 3: PAYMENT**

Stripe integration.

---

{  
  "booking\_step\_3": {  
    "payment\_method\_input": true,  
    "secure\_notice": "Encrypted Payment via Stripe",  
    "cta": "Pay & Confirm"  
  }  
}  
---

# **9️⃣ BOOKING SUCCESS SCREEN**

---

{  
  "booking\_success\_screen": {  
    "confirmation\_message": "Session confirmed\!",  
    "calendar\_add\_option": true,  
    "next\_steps": \[  
      "Prepare Interview Questions",  
      "Review Narrative"  
    \],  
    "cta": "Return to Dashboard"  
  }  
}  
---

# **🔟 BOOKING MANAGEMENT SCREEN (USER SIDE)**

---

{  
  "booking\_management\_screen": {  
    "upcoming\_sessions": \[\],  
    "past\_sessions": \[\],  
    "cancel\_option": true,  
    "reschedule\_option": true  
  }  
}  
---

# **1️⃣1️⃣ REVIEW SUBMISSION SCREEN**

After session completion.

---

{  
  "review\_submission\_screen": {  
    "rating\_input": 1-5,  
    "feedback\_text": true,  
    "submit\_button": true  
  }  
}

Must be mandatory before rebooking discount.

---

# **PROVIDER SIDE SCREENS**

---

# **1️⃣ PROVIDER DASHBOARD**

{  
  "provider\_dashboard\_screen": {  
    "upcoming\_sessions": \[\],  
    "earnings\_summary": {},  
    "rating\_summary": {},  
    "recent\_reviews": \[\]  
  }  
}  
---

# **2️⃣ PROVIDER SERVICE MANAGEMENT**

{  
  "provider\_service\_management\_screen": {  
    "services\_list": \[\],  
    "add\_service\_button": true,  
    "edit\_pricing": true,  
    "availability\_manager": true  
  }  
}  
---

# **3️⃣ PROVIDER EARNINGS SCREEN**

{  
  "provider\_earnings\_screen": {  
    "monthly\_earnings": 1200,  
    "platform\_commission": 120,  
    "payout\_status": "Processed",  
    "export\_statement": true  
  }  
}  
---

# **CONTEXT-AWARE MARKETPLACE TRIGGERS**

Trigger examples:

* Interview score \< threshold → Interview coaching card

* Narrative alignment low → Narrative review suggestion

* Financial gap large → Funding advisor suggestion

* Multiple rejections → Strategic mentorship suggestion

Each must include:

“Why you are seeing this.”

---

# **B2B INTEGRATION**

Institutions may:

* Subsidize sessions

* Unlock discounted providers

* Approve recommended coaches

---

{  
  "institutional\_marketplace\_view": {  
    "approved\_providers": \[\],  
    "subsidy\_available": "$100 credit",  
    "usage\_limit": 3 sessions  
  }  
}  
---

# **PSYCHOLOGICAL SAFETY RULES**

Never:

* “You need professional help.”

* “Your performance is inadequate.”

Always:

* “Targeted support may accelerate improvement.”

* “Many users at your stage choose…”

---

# **MOBILE UX OPTIMIZATION**

* Swipeable provider cards

* Sticky bottom CTA

* Minimal payment friction

* Autofill user info

---

# **DESKTOP ENHANCEMENTS**

* Side-by-side provider comparison

* Expanded calendar

* Multi-provider comparison grid

* Earnings chart (provider side)

---

# **PERFORMANCE REQUIREMENTS**

* Marketplace load \< 600ms

* Provider search indexed

* Payment webhook robust

* Booking confirmation real-time

* Calendar sync API

---

# **ANALYTICS EVENTS**

* Marketplace viewed

* Provider profile viewed

* Booking started

* Booking completed

* Booking canceled

* Review submitted

* Marketplace-trigger conversion

* Revenue per route type

---

# **STRATEGIC ROLE**

Marketplace Screens:

* Monetize contextual need

* Reinforce Compass ecosystem

* Improve outcomes

* Create service data loop

* Enable B2B scaling

* Increase LTV

* Increase trust

They must never feel like ads.

They must feel like calibrated interventions.

---

If you want next, we can:

* Go deep on 1️⃣1️⃣ Subscription & Monetization Screens

* Or map full behavioral upsell logic across all screens

* Or design trust \+ quality assurance governance system for providers

Choose the next descent.

Excellent.

Now we enter the **economic architecture layer** of Compass.

Subscription Screens are not just:

“Upgrade to Pro.”

They are:

* Value framing systems

* Access governance layers

* Psychological pricing interfaces

* Revenue stabilizers

* Feature gating engines

* Behavioral conversion levers

If aggressive → distrust.

If vague → low conversion.

If confusing → churn.

If under-structured → revenue leaks.

Subscription screens must:

* Make value clear

* Show earned progression

* Tie upgrade to user context

* Avoid pressure tactics

* Support B2C \+ B2B

* Integrate seamlessly with feature gating

* Feel calm and premium

Now we go deep.

---

# **1️⃣1️⃣ SUBSCRIPTION SCREENS — FULL SYSTEM SPECIFICATION**

---

# **STRUCTURAL OVERVIEW**

{  
  "subscription\_domain": {  
    "screens": \[  
      "subscription\_overview\_screen",  
      "plan\_comparison\_screen",  
      "upgrade\_contextual\_screen",  
      "checkout\_screen",  
      "payment\_processing\_screen",  
      "upgrade\_success\_screen",  
      "downgrade\_flow\_screen",  
      "cancellation\_flow\_screen",  
      "reactivation\_screen",  
      "usage\_limits\_screen",  
      "invoice\_history\_screen",  
      "b2b\_subscription\_screen"  
    \]  
  }  
}  
---

# **CORE DESIGN PRINCIPLES**

1. Tie value to user progress

2. Upgrade after value moment

3. Make feature limits transparent

4. No dark patterns

5. Show ROI clearly

6. Allow downgrade easily

7. Prevent accidental churn

8. Support institutional overrides

---

# **1️⃣ SUBSCRIPTION OVERVIEW SCREEN**

Primary management screen.

---

## **Mobile Structure**

{  
  "subscription\_overview\_screen": {  
    "current\_plan\_card": {  
      "plan\_name": "Free",  
      "status": "Active",  
      "renewal\_date": null,  
      "usage\_summary": {}  
    },  
    "usage\_breakdown\_section": \[\],  
    "upgrade\_cta\_section": {},  
    "billing\_management\_section": {}  
  }  
}  
---

## **Example — Free Plan View**

{  
  "current\_plan\_card": {  
    "plan\_name": "Free",  
    "features\_unlocked": \[  
      "1 Route",  
      "Limited Interview Sessions",  
      "Basic Narrative Analysis"  
    \],  
    "limits": {  
      "interview\_sessions\_remaining": 1,  
      "narrative\_analysis\_remaining": 2  
    }  
  }  
}  
---

# **2️⃣ PLAN COMPARISON SCREEN**

This must be structured and transparent.

---

## **Structure**

{  
  "plan\_comparison\_screen": {  
    "plans": \[  
      {  
        "name": "Free",  
        "price": 0,  
        "features": \[\]  
      },  
      {  
        "name": "Pro",  
        "price": "$29/month",  
        "features": \[\]  
      },  
      {  
        "name": "Premium",  
        "price": "$59/month",  
        "features": \[\]  
      }  
    \],  
    "cta\_buttons": \["Upgrade to Pro", "Upgrade to Premium"\]  
  }  
}  
---

## **Feature Categories**

* Route Limits

* Interview Sessions

* Narrative Analysis Depth

* Scenario Simulation Access

* Marketplace Discounts

* AI Coaching Mode

* Institutional Features

---

# **3️⃣ CONTEXTUAL UPGRADE SCREEN (MOST IMPORTANT)**

Triggered when:

* User hits limit

* Submission gate requires Pro feature

* Interview strict mode locked

* Narrative competitiveness screen locked

---

## **Structure**

{  
  "upgrade\_contextual\_screen": {  
    "trigger\_reason": "You’ve reached your interview session limit.",  
    "value\_statement": "Unlimited practice increases confidence projection by an average of \+7 points.",  
    "plan\_recommendation": "Pro",  
    "cta\_primary": "Unlock Unlimited Practice",  
    "cta\_secondary": "Maybe Later"  
  }  
}  
---

Must show:

* What user already achieved

* What upgrade unlocks

* Not generic feature list

---

# **4️⃣ CHECKOUT SCREEN**

Stripe-based.

---

## **Structure**

{  
  "checkout\_screen": {  
    "plan\_summary": {},  
    "billing\_cycle\_toggle": \["Monthly", "Annual"\],  
    "price\_display": {},  
    "discount\_field": true,  
    "secure\_payment\_input": true,  
    "cta": "Confirm Upgrade"  
  }  
}  
---

## **UX Requirements**

* Transparent price

* Tax clarity

* Refund policy visible

* No hidden fees

---

# **5️⃣ PAYMENT PROCESSING SCREEN**

{  
  "payment\_processing\_screen": {  
    "loading\_indicator": true,  
    "message": "Processing secure payment..."  
  }  
}

Timeout handling required.

---

# **6️⃣ UPGRADE SUCCESS SCREEN**

---

{  
  "upgrade\_success\_screen": {  
    "confirmation\_message": "You’ve unlocked Pro features\!",  
    "unlocked\_features\_highlight": \[\],  
    "cta\_primary": "Start Interview Practice",  
    "cta\_secondary": "Return to Dashboard"  
  }  
}

Must redirect to feature that triggered upgrade.

---

# **7️⃣ DOWNGRADE FLOW SCREEN**

Triggered manually.

---

## **Structure**

{  
  "downgrade\_flow\_screen": {  
    "current\_plan": "Premium",  
    "impact\_summary": \[  
      "Unlimited Interviews → Limited",  
      "Advanced Scenario Simulation → Locked"  
    \],  
    "cta": "Confirm Downgrade"  
  }  
}  
---

No guilt messaging.

---

# **8️⃣ CANCELLATION FLOW SCREEN**

This must be respectful.

---

## **Structure**

{  
  "cancellation\_flow\_screen": {  
    "question": "Before you go, what’s the main reason?",  
    "options": \[  
      "Too expensive",  
      "Completed my goal",  
      "Not useful",  
      "Temporary break"  
    \],  
    "retention\_offer": null,  
    "cta\_primary": "Cancel Subscription",  
    "cta\_secondary": "Keep Subscription"  
  }  
}  
---

Optional retention logic:

If “Too expensive”:

Offer annual discount.

Never aggressive.

---

# **9️⃣ REACTIVATION SCREEN**

For expired subscription.

---

{  
  "reactivation\_screen": {  
    "message": "Your Pro access has expired.",  
    "previous\_benefits\_summary": \[\],  
    "cta": "Reactivate Pro"  
  }  
}  
---

# **🔟 USAGE LIMITS SCREEN**

Accessible anytime.

---

{  
  "usage\_limits\_screen": {  
    "interviews\_used": 3,  
    "interviews\_limit": 5,  
    "narrative\_analysis\_used": 4,  
    "narrative\_analysis\_limit": 5  
  }  
}  
---

Must show remaining clearly.

---

# **1️⃣1️⃣ INVOICE HISTORY SCREEN**

---

{  
  "invoice\_history\_screen": {  
    "past\_payments": \[  
      {  
        "date": "2026-01-01",  
        "amount": "$29",  
        "status": "Paid",  
        "download\_invoice": true  
      }  
    \]  
  }  
}  
---

# **1️⃣2️⃣ B2B SUBSCRIPTION SCREEN**

For institutions.

---

{  
  "b2b\_subscription\_screen": {  
    "organization\_name": "University X",  
    "seat\_limit": 50,  
    "seats\_used": 42,  
    "billing\_cycle": "Annual",  
    "cohort\_access": true  
  }  
}

Admin can:

* Increase seats

* Add credits

* View usage analytics

---

# **FEATURE GATING LOGIC**

Example:

{  
  "feature": "Interview Strict Mode",  
  "required\_plan": "Pro"  
}

Backend middleware enforces gating.

Frontend shows contextual upgrade screen.

---

# **PSYCHOLOGICAL DESIGN RULES**

Never:

* “Upgrade now or miss out.”

* Countdown fake timers.

* Fear-based pricing.

Always:

* Tie to user’s progress.

* Show value increase.

* Highlight improvement data.

* Keep tone calm.

---

# **MOBILE UX DETAILS**

* Sticky upgrade CTA

* Plan toggle easy

* Minimal scrolling

* Clear summary at top

---

# **DESKTOP ENHANCEMENTS**

* Side-by-side plan comparison

* Feature tooltip hover

* Savings calculation for annual

* Visual ROI explanation graph

---

# **ANALYTICS EVENTS**

* Upgrade page viewed

* Upgrade started

* Upgrade completed

* Cancellation started

* Cancellation completed

* Downgrade executed

* Reactivation completed

* Feature-limit-triggered conversion

---

# **STRATEGIC ROLE**

Subscription Screens:

* Monetize without manipulation

* Reward engagement

* Encourage serious commitment

* Tie payment to performance growth

* Sustain development

* Enable B2B scaling

They must feel like unlocking power, not paying a tax.

---

If you want next, we can:

* Go deep on 1️⃣2️⃣ ORGANIZATION (B2B) SCREENS

* Or design full feature gating matrix across plans

* Or map behavioral upgrade triggers across entire system

Choose the next descent.

Excellent.

Now we enter the **institutional intelligence layer** of Compass.

B2B is not just “group accounts.”

It is:

* Cohort governance

* Readiness analytics at scale

* Institutional risk management

* Program performance tracking

* Intervention orchestration

* Funding optimization

* Seat economics

* Data-controlled visibility

If shallow → schools won’t pay.

If invasive → students won’t trust.

If confusing → coordinators won’t use it.

If underpowered → no competitive edge.

Organization Screens must:

* Respect student autonomy

* Provide structured oversight

* Enable intervention without surveillance

* Show aggregated insights

* Support seat & billing management

* Scale to multiple cohorts

* Be administratively powerful but UX-clean

Now we go deep.

---

# **1️⃣2️⃣ ORGANIZATION SCREENS (B2B) — FULL SYSTEM SPECIFICATION**

---

# **STRUCTURAL OVERVIEW**

{  
  "organization\_domain": {  
    "roles": \[  
      "ORG\_ADMIN",  
      "COORDINATOR",  
      "ORG\_MEMBER"  
    \],  
    "screens": \[  
      "organization\_dashboard\_screen",  
      "cohort\_management\_screen",  
      "cohort\_detail\_screen",  
      "student\_list\_screen",  
      "student\_profile\_view\_screen",  
      "institutional\_readiness\_dashboard",  
      "institutional\_application\_dashboard",  
      "institutional\_intervention\_screen",  
      "seat\_management\_screen",  
      "organization\_settings\_screen",  
      "data\_visibility\_control\_screen",  
      "organization\_subscription\_screen"  
    \]  
  }  
}  
---

# **ROLE STRUCTURE**

| Role | Access |
| ----- | ----- |
| ORG\_ADMIN | Full analytics, seat management, billing |
| COORDINATOR | Student insights, cohort analytics |
| ORG\_MEMBER | Normal Compass \+ institutional overlay |

---

# **CORE DESIGN PRINCIPLES**

1. Institutional view ≠ surveillance

2. Show structured trends, not raw anxiety

3. Respect consent boundaries

4. Provide actionable insights

5. Avoid overwhelming dashboards

6. Make intervention strategic

7. Keep student ownership intact

---

# **1️⃣ ORGANIZATION DASHBOARD SCREEN (Primary Admin View)**

Entry point for ORG\_ADMIN / COORDINATOR.

---

## **Mobile Structure**

{  
  "organization\_dashboard\_screen": {  
    "header": {  
      "organization\_name": "University X",  
      "active\_students": 42,  
      "cohorts\_active": 3  
    },  
    "sections": \[  
      "cohort\_summary\_cards",  
      "institutional\_readiness\_summary",  
      "application\_outcomes\_summary",  
      "risk\_heatmap\_preview",  
      "intervention\_alerts",  
      "seat\_usage\_preview"  
    \]  
  }  
}  
---

# **COHORT SUMMARY CARDS**

{  
  "cohort\_summary\_card": {  
    "cohort\_name": "2026 Scholarship Cohort",  
    "students": 18,  
    "average\_readiness": 67,  
    "interview\_avg": 63,  
    "applications\_submitted": 12,  
    "acceptance\_rate": "33%"  
  }  
}

Tap → cohort\_detail\_screen.

---

# **2️⃣ COHORT MANAGEMENT SCREEN**

Manage student grouping.

---

{  
  "cohort\_management\_screen": {  
    "cohorts": \[  
      {  
        "name": "Scholarship 2026",  
        "students\_count": 18  
      }  
    \],  
    "cta": "Create New Cohort"  
  }  
}

Features:

* Assign students

* Remove students

* Rename cohort

* Archive cohort

---

# **3️⃣ COHORT DETAIL SCREEN**

Focused analytics per group.

---

{  
  "cohort\_detail\_screen": {  
    "header": {  
      "cohort\_name": "Scholarship 2026"  
    },  
    "analytics": {  
      "average\_readiness": 67,  
      "readiness\_distribution": {},  
      "interview\_trend": {},  
      "risk\_distribution": {}  
    },  
    "student\_table\_preview": \[\],  
    "cta": "View Students"  
  }  
}  
---

# **4️⃣ STUDENT LIST SCREEN**

Sortable table.

---

{  
  "student\_list\_screen": {  
    "filters": \[  
      "Risk Level",  
      "Readiness Range",  
      "Interview Score",  
      "Application Status"  
    \],  
    "students": \[  
      {  
        "name\_or\_id": "Student A",  
        "readiness": 72,  
        "interview": 65,  
        "risk": 28,  
        "applications": 2  
      }  
    \]  
  }  
}  
---

# **5️⃣ STUDENT PROFILE VIEW SCREEN (Institutional Perspective)**

This is sensitive.

---

## **Structure**

{  
  "student\_profile\_view\_screen": {  
    "student\_summary": {  
      "readiness": 72,  
      "interview\_score": 65,  
      "narrative\_score": 68,  
      "risk\_level": "Moderate"  
    },  
    "trend\_graphs": {},  
    "applications\_summary": {},  
    "intervention\_notes\_section": {}  
  }  
}  
---

Important:

Raw narrative text NOT visible by default.

Requires student consent toggle.

---

# **6️⃣ INSTITUTIONAL READINESS DASHBOARD**

Aggregate view.

---

{  
  "institutional\_readiness\_dashboard": {  
    "average\_readiness": 67,  
    "distribution\_chart": {},  
    "readiness\_trend\_over\_time": {},  
    "dimension\_weakness\_commonality": \[  
      "Financial preparedness low in 40%",  
      "Interview resilience low in 35%"  
    \]  
  }  
}  
---

Purpose:

Identify systemic gaps.

---

# **7️⃣ INSTITUTIONAL APPLICATION DASHBOARD**

Application performance tracking.

---

{  
  "institutional\_application\_dashboard": {  
    "applications\_total": 52,  
    "submitted": 38,  
    "accepted": 14,  
    "rejected": 20,  
    "acceptance\_rate": "36%",  
    "average\_readiness\_at\_submission": 70  
  }  
}

Advanced:

Compare acceptance vs readiness thresholds.

---

# **8️⃣ INSTITUTIONAL INTERVENTION SCREEN**

Strategic coordination tool.

---

{  
  "institutional\_intervention\_screen": {  
    "flagged\_students": \[  
      {  
        "student\_id": "A12",  
        "reason": "High risk \+ approaching deadline"  
      }  
    \],  
    "suggested\_actions": \[  
      "Recommend interview coaching",  
      "Schedule advisory meeting"  
    \]  
  }  
}  
---

Must allow:

* Add internal note

* Send institutional message

* Trigger marketplace credit

---

# **9️⃣ SEAT MANAGEMENT SCREEN**

ORG\_ADMIN only.

---

{  
  "seat\_management\_screen": {  
    "seat\_limit": 50,  
    "seats\_used": 42,  
    "pending\_invites": 3,  
    "invite\_student\_button": true,  
    "increase\_seat\_button": true  
  }  
}  
---

# **🔟 ORGANIZATION SETTINGS SCREEN**

{  
  "organization\_settings\_screen": {  
    "organization\_name\_edit": true,  
    "logo\_upload": true,  
    "default\_route\_type": "Scholarship",  
    "data\_retention\_policy": {},  
    "branding\_options": {}  
  }  
}

White-label readiness (future).

---

# **1️⃣1️⃣ DATA VISIBILITY CONTROL SCREEN**

Critical for trust.

---

{  
  "data\_visibility\_control\_screen": {  
    "student\_consent\_required": true,  
    "visible\_metrics": \[  
      "Readiness Score",  
      "Interview Score"  
    \],  
    "hidden\_metrics": \[  
      "Narrative Raw Text"  
    \]  
  }  
}

Student can:

Toggle visibility per metric.

---

# **1️⃣2️⃣ ORGANIZATION SUBSCRIPTION SCREEN**

For ORG\_ADMIN.

---

{  
  "organization\_subscription\_screen": {  
    "plan\_name": "Institutional Pro",  
    "seat\_limit": 50,  
    "billing\_cycle": "Annual",  
    "renewal\_date": "2026-12-01",  
    "analytics\_addon": true  
  }  
}  
---

# **INTERVENTION LOGIC**

Trigger examples:

* Student readiness \< 60 \+ deadline \< 14 days

* Interview score below institutional median

* Multiple rejections

Intervention types:

* Advisory email

* Suggested session credit

* Cohort workshop suggestion

---

# **PSYCHOLOGICAL SAFETY FOR STUDENTS**

Students must:

* See what institution sees

* Control consent

* Not feel surveilled

* Receive supportive tone

---

# **MOBILE UX**

* Compact dashboards

* Scrollable student lists

* Expandable analytics sections

---

# **DESKTOP ENHANCEMENTS**

* Heatmaps

* Multi-cohort comparison

* Export CSV

* Trend overlays

* Institutional KPI graphs

---

# **PERFORMANCE REQUIREMENTS**

* Cohort load \< 800ms

* Aggregated queries optimized

* Precomputed institutional metrics

* Role-based access control enforced server-side

---

# **ANALYTICS EVENTS**

* Cohort created

* Student assigned

* Institutional dashboard viewed

* Intervention triggered

* Seat increased

* Institutional acceptance rate updated

---

# **STRATEGIC ROLE**

Organization Screens:

* Convert Compass into institutional infrastructure

* Enable cohort-based performance optimization

* Drive B2B revenue

* Create data moat

* Improve collective success rates

* Reduce student failure risk

This transforms Compass from product → platform.

---

If you want next, we can:

* Map full multi-tenant permission matrix

* Or design behavioral governance between student & institution

* Or simulate full B2B lifecycle from contract → cohort launch → acceptance analytics

Choose the next descent.

Excellent.

Now we enter the **supply-side control layer** of Compass.

If Marketplace is the human intervention engine,

Provider Screens are the operational backbone of that engine.

Providers are not freelancers in a directory.

They are:

* Performance amplifiers

* Institutional collaborators

* Reputation carriers

* Revenue contributors

* Quality-sensitive assets

* Data-generating nodes

If provider UX is weak → poor service quality.

If too complex → provider churn.

If under-governed → platform trust collapse.

If opaque financially → disputes.

Provider Screens must:

* Be operationally efficient

* Feel professional

* Provide performance feedback

* Encourage quality

* Track earnings transparently

* Integrate tightly with Compass engines

* Scale for high-volume providers

Now we go deep.

---

# **1️⃣3️⃣ PROVIDER SCREENS — FULL SYSTEM SPECIFICATION**

---

# **STRUCTURAL OVERVIEW**

{  
  "provider\_domain": {  
    "screens": \[  
      "provider\_onboarding\_screen",  
      "provider\_verification\_screen",  
      "provider\_dashboard\_screen",  
      "provider\_calendar\_screen",  
      "provider\_session\_detail\_screen",  
      "provider\_feedback\_insight\_screen",  
      "provider\_service\_management\_screen",  
      "provider\_pricing\_screen",  
      "provider\_availability\_management\_screen",  
      "provider\_earnings\_screen",  
      "provider\_payout\_settings\_screen",  
      "provider\_reviews\_screen",  
      "provider\_performance\_analytics\_screen",  
      "provider\_profile\_public\_preview\_screen",  
      "provider\_account\_settings\_screen"  
    \]  
  }  
}  
---

# **CORE DESIGN PRINCIPLES**

1. Keep provider tools minimal but powerful

2. Surface quality metrics transparently

3. Protect provider reputation through structured feedback

4. Automate scheduling and payment

5. Tie provider impact to measurable outcomes

6. Maintain high quality bar

7. Avoid cognitive overload

---

# **1️⃣ PROVIDER ONBOARDING SCREEN**

Entry from Provider Landing.

---

## **Structure**

{  
  "provider\_onboarding\_screen": {  
    "fields": \[  
      "Full Name",  
      "Email",  
      "Primary Service Type",  
      "Years of Experience",  
      "Country",  
      "Short Bio"  
    \],  
    "documents\_required": \[  
      "Identity Verification",  
      "Professional Credential (optional)"  
    \],  
    "cta": "Submit Application"  
  }  
}  
---

## **Backend Flow**

* Create provider account (status \= pending)

* Admin review required

* Verification email after approval

* Provider dashboard unlocked

---

# **2️⃣ PROVIDER VERIFICATION SCREEN**

Status tracking.

{  
  "provider\_verification\_screen": {  
    "status": "Under Review",  
    "estimated\_review\_time": "48 hours",  
    "support\_contact": true  
  }  
}

If rejected:

Clear explanation \+ reapply option.

---

# **3️⃣ PROVIDER DASHBOARD SCREEN (Core Operational Hub)**

---

## **Mobile Structure**

{  
  "provider\_dashboard\_screen": {  
    "header": {  
      "greeting": "Welcome, Maria",  
      "status": "Active"  
    },  
    "sections": \[  
      "upcoming\_sessions\_card",  
      "earnings\_summary\_card",  
      "rating\_summary\_card",  
      "quick\_actions\_bar"  
    \]  
  }  
}  
---

## **Upcoming Sessions Card**

{  
  "upcoming\_sessions\_card": {  
    "sessions\_today": 2,  
    "next\_session\_time": "15:00",  
    "cta": "View Calendar"  
  }  
}  
---

# **4️⃣ PROVIDER CALENDAR SCREEN**

Operational scheduling.

---

{  
  "provider\_calendar\_screen": {  
    "calendar\_view": "Weekly",  
    "booked\_slots": \[\],  
    "available\_slots": \[\],  
    "block\_time\_button": true  
  }  
}

Features:

* Sync with Google Calendar

* Manual slot blocking

* Timezone detection

* Recurring availability

---

# **5️⃣ PROVIDER SESSION DETAIL SCREEN**

Access before and after session.

---

{  
  "provider\_session\_detail\_screen": {  
    "student\_summary": {  
      "route\_type": "Scholarship",  
      "readiness\_score": 68,  
      "interview\_score": 60  
    },  
    "session\_notes\_input": true,  
    "join\_meeting\_button": true,  
    "post\_session\_feedback\_submit": true  
  }  
}  
---

Provider sees structured student context, not raw narrative by default.

---

# **6️⃣ PROVIDER FEEDBACK INSIGHT SCREEN**

Post-session impact view.

---

{  
  "provider\_feedback\_insight\_screen": {  
    "session\_feedback\_submitted": true,  
    "student\_improvement\_delta": "+6 interview score",  
    "quality\_rating\_received": 5  
  }  
}

This reinforces provider performance accountability.

---

# **7️⃣ PROVIDER SERVICE MANAGEMENT SCREEN**

Manage services offered.

---

{  
  "provider\_service\_management\_screen": {  
    "services": \[  
      {  
        "name": "Mock Interview",  
        "price": "$80",  
        "duration": "60 min",  
        "route\_specialization": "Scholarship"  
      }  
    \],  
    "cta": "Add New Service"  
  }  
}  
---

# **8️⃣ PROVIDER PRICING SCREEN**

Adjust pricing.

---

{  
  "provider\_pricing\_screen": {  
    "base\_price": 80,  
    "suggested\_range": "$60–$120",  
    "platform\_commission": "10%",  
    "net\_earnings\_preview": "$72"  
  }  
}

Transparency is mandatory.

---

# **9️⃣ PROVIDER AVAILABILITY MANAGEMENT SCREEN**

---

{  
  "provider\_availability\_management\_screen": {  
    "recurring\_schedule": \[\],  
    "one\_time\_override": true,  
    "timezone\_setting": "UTC-3"  
  }  
}  
---

# **🔟 PROVIDER EARNINGS SCREEN**

Financial transparency.

---

{  
  "provider\_earnings\_screen": {  
    "monthly\_earnings": 1240,  
    "platform\_commission": 124,  
    "net\_payout": 1116,  
    "pending\_payout": 320,  
    "payout\_date": "2026-02-28"  
  }  
}

Includes:

* Earnings chart

* Export statement

* Tax documentation download

---

# **1️⃣1️⃣ PROVIDER PAYOUT SETTINGS SCREEN**

---

{  
  "provider\_payout\_settings\_screen": {  
    "bank\_account\_connected": true,  
    "stripe\_connect\_status": "Active",  
    "update\_bank\_button": true  
  }  
}

Secure reauthentication required.

---

# **1️⃣2️⃣ PROVIDER REVIEWS SCREEN**

---

{  
  "provider\_reviews\_screen": {  
    "average\_rating": 4.8,  
    "reviews": \[  
      {  
        "rating": 5,  
        "comment": "Very structured feedback."  
      }  
    \]  
  }  
}

Must allow:

* Report abusive review

* Respond publicly (optional)

---

# **1️⃣3️⃣ PROVIDER PERFORMANCE ANALYTICS SCREEN**

Advanced but critical.

---

{  
  "provider\_performance\_analytics\_screen": {  
    "average\_student\_score\_improvement": "+7",  
    "session\_completion\_rate": "98%",  
    "repeat\_booking\_rate": "65%",  
    "acceptance\_correlation": "Positive"  
  }  
}

Used for:

* Quality ranking

* Institutional partnerships

---

# **1️⃣4️⃣ PROVIDER PROFILE PUBLIC PREVIEW SCREEN**

How users see provider.

Preview editable.

---

{  
  "provider\_profile\_public\_preview\_screen": {  
    "bio\_preview": true,  
    "services\_preview": true,  
    "rating\_preview": true  
  }  
}  
---

# **1️⃣5️⃣ PROVIDER ACCOUNT SETTINGS SCREEN**

---

{  
  "provider\_account\_settings\_screen": {  
    "update\_profile\_info": true,  
    "change\_password": true,  
    "deactivate\_account": true  
  }  
}  
---

# **PROVIDER QUALITY CONTROL MECHANISMS**

* Minimum rating threshold

* Session completion rate threshold

* Performance delta monitoring

* Temporary suspension logic

* Flagged behavior reporting

---

# **PSYCHOLOGICAL RULES**

Providers must feel:

* Empowered

* Accountable

* Transparent

* Rewarded for quality

Avoid:

* Over-gamification

* Aggressive ranking pressure

* Hidden penalties

---

# **MOBILE UX**

* Fast access to calendar

* One-tap join session

* Simple earnings summary

* Minimal clutter

---

# **DESKTOP ENHANCEMENTS**

* Earnings charts

* Multi-session table view

* Analytics visualizations

* Performance trend lines

---

# **PERFORMANCE REQUIREMENTS**

* Calendar load \< 500ms

* Earnings calculation accurate and atomic

* Stripe Connect webhook resilient

* Booking updates real-time

---

# **ANALYTICS EVENTS**

* Provider onboarded

* Service created

* Price updated

* Session completed

* Review received

* Earnings paid

* Provider performance threshold crossed

---

# **STRATEGIC ROLE**

Provider Screens:

* Sustain marketplace quality

* Protect platform trust

* Enable monetization

* Provide institutional scalability

* Create outcome-linked reputation system

* Support hybrid model

This is the supply engine of Compass.

---

If you want next, we can:

* Map full trust \+ reputation governance system

* Or design marketplace ranking algorithm logic

* Or simulate full provider lifecycle from onboarding → high-performance provider

Choose the next descent.

Excellent.

Now we enter the **platform sovereignty layer** of Compass.

Admin Screens are not user-facing features.

They are:

* Governance control

* Risk containment

* Revenue oversight

* AI supervision

* Quality enforcement

* Multi-tenant orchestration

* Data infrastructure command

If underbuilt → chaos.

If overcomplicated → internal friction.

If unsafe → platform liability.

Admin Screens must:

* Be powerful

* Be auditable

* Be role-restricted

* Be system-aware

* Support scaling

* Enable intervention without breaking trust

This is the **control plane** of Compass.

Now we go deep.

---

# **1️⃣4️⃣ ADMIN SCREENS — FULL SYSTEM SPECIFICATION**

---

# **STRUCTURAL OVERVIEW**

{  
  "admin\_domain": {  
    "roles": \[  
      "SUPER\_ADMIN",  
      "OPS\_ADMIN",  
      "FINANCE\_ADMIN",  
      "AI\_ADMIN",  
      "SUPPORT\_ADMIN"  
    \],  
    "screens": \[  
      "admin\_dashboard\_screen",  
      "user\_management\_screen",  
      "organization\_management\_screen",  
      "provider\_management\_screen",  
      "subscription\_management\_screen",  
      "marketplace\_transaction\_screen",  
      "ai\_monitoring\_screen",  
      "readiness\_engine\_control\_screen",  
      "feature\_flag\_management\_screen",  
      "content\_management\_screen",  
      "support\_ticket\_screen",  
      "system\_health\_screen",  
      "audit\_log\_screen",  
      "data\_export\_control\_screen"  
    \]  
  }  
}  
---

# **ROLE HIERARCHY**

| Role | Scope |
| ----- | ----- |
| SUPER\_ADMIN | Full access |
| OPS\_ADMIN | User \+ Org \+ Provider ops |
| FINANCE\_ADMIN | Payments \+ Subscriptions |
| AI\_ADMIN | Model configs \+ prompt control |
| SUPPORT\_ADMIN | Tickets \+ manual adjustments |

All access enforced server-side with RBAC middleware.

---

# **1️⃣ ADMIN DASHBOARD SCREEN (Control Tower)**

Primary entry.

---

{  
  "admin\_dashboard\_screen": {  
    "kpis": {  
      "active\_users": 1245,  
      "active\_subscriptions": 430,  
      "mrr": "$12,470",  
      "active\_organizations": 18,  
      "active\_providers": 42  
    },  
    "alerts": \[\],  
    "system\_status\_preview": {},  
    "recent\_activity\_preview": {}  
  }  
}  
---

KPIs:

* MRR

* Churn rate

* Interview sessions per day

* Readiness recalculations

* Acceptance rate trend

---

# **2️⃣ USER MANAGEMENT SCREEN**

Searchable user table.

---

{  
  "user\_management\_screen": {  
    "filters": \[  
      "Plan",  
      "Organization",  
      "Risk Level",  
      "Last Active"  
    \],  
    "user\_table": \[  
      {  
        "user\_id": "U123",  
        "email": "user@email.com",  
        "plan": "Pro",  
        "organization": "University X",  
        "risk\_flag": false,  
        "status": "Active"  
      }  
    \]  
  }  
}  
---

Admin actions:

* Suspend account

* Reset password

* Change plan

* Impersonate (audited)

* Flag for review

All actions logged.

---

# **3️⃣ ORGANIZATION MANAGEMENT SCREEN**

---

{  
  "organization\_management\_screen": {  
    "org\_list": \[  
      {  
        "name": "University X",  
        "seats": 50,  
        "used": 42,  
        "plan": "Institutional Pro",  
        "status": "Active"  
      }  
    \]  
  }  
}

Actions:

* Adjust seat limit

* Change billing cycle

* Suspend organization

* View cohort analytics

---

# **4️⃣ PROVIDER MANAGEMENT SCREEN**

---

{  
  "provider\_management\_screen": {  
    "provider\_table": \[  
      {  
        "provider\_id": "P12",  
        "rating": 4.8,  
        "sessions\_completed": 320,  
        "status": "Active"  
      }  
    \]  
  }  
}

Admin actions:

* Approve provider

* Suspend provider

* Adjust commission

* Investigate complaint

---

# **5️⃣ SUBSCRIPTION MANAGEMENT SCREEN**

Finance-level view.

---

{  
  "subscription\_management\_screen": {  
    "filters": \["Plan Type", "Status"\],  
    "subscriptions\_table": \[\]  
  }  
}

Actions:

* Issue refund

* Extend subscription

* Apply manual credit

* Override billing

---

# **6️⃣ MARKETPLACE TRANSACTION SCREEN**

Audit payments.

---

{  
  "marketplace\_transaction\_screen": {  
    "transactions": \[  
      {  
        "transaction\_id": "T9821",  
        "amount": 88,  
        "provider\_cut": 72,  
        "platform\_fee": 16,  
        "status": "Completed"  
      }  
    \]  
  }  
}

Actions:

* Refund

* Investigate dispute

* Flag anomaly

---

# **7️⃣ AI MONITORING SCREEN (Critical)**

Oversee AI behavior.

---

{  
  "ai\_monitoring\_screen": {  
    "recent\_requests": \[  
      {  
        "engine": "Narrative",  
        "avg\_latency\_ms": 1200,  
        "error\_rate": "0.3%"  
      }  
    \],  
    "model\_version": "gpt-x.y",  
    "token\_usage\_today": 345000  
  }  
}

AI\_ADMIN can:

* Switch model version

* Update system prompts

* Adjust temperature

* Disable engine temporarily

All changes versioned.

---

# **8️⃣ READINESS ENGINE CONTROL SCREEN**

Parameter tuning.

---

{  
  "readiness\_engine\_control\_screen": {  
    "dimension\_weights": {  
      "academic": 0.25,  
      "interview": 0.20,  
      "narrative": 0.20,  
      "financial": 0.15,  
      "experience": 0.20  
    },  
    "threshold\_settings": {  
      "recommended\_submission\_score": 75  
    }  
  }  
}

Changes trigger:

* Versioned scoring model

* Historical preservation

---

# **9️⃣ FEATURE FLAG MANAGEMENT SCREEN**

Critical for safe rollout.

---

{  
  "feature\_flag\_management\_screen": {  
    "flags": \[  
      {  
        "name": "Interview Strict Mode",  
        "enabled": true,  
        "target\_group": "Pro"  
      }  
    \]  
  }  
}

Supports:

* A/B testing

* Plan-based toggling

* Org-based toggling

---

# **🔟 CONTENT MANAGEMENT SCREEN**

Manage:

* Public landing copy

* Route templates

* Milestone templates

* Help center articles

---

{  
  "content\_management\_screen": {  
    "editable\_sections": \[  
      "Route Templates",  
      "Milestone Descriptions",  
      "Public Pages"  
    \]  
  }  
}

Version controlled.

---

# **1️⃣1️⃣ SUPPORT TICKET SCREEN**

User support ops.

---

{  
  "support\_ticket\_screen": {  
    "tickets": \[  
      {  
        "ticket\_id": "S34",  
        "user\_id": "U123",  
        "status": "Open",  
        "category": "Billing"  
      }  
    \]  
  }  
}

Actions:

* Assign to staff

* Mark resolved

* Escalate

---

# **1️⃣2️⃣ SYSTEM HEALTH SCREEN**

Infrastructure view.

---

{  
  "system\_health\_screen": {  
    "api\_latency": "240ms",  
    "db\_status": "Healthy",  
    "queue\_backlog": 12,  
    "ai\_latency": "1.2s"  
  }  
}

Alerts:

* High error rate

* High latency

* Payment webhook failures

---

# **1️⃣3️⃣ AUDIT LOG SCREEN**

Compliance-critical.

---

{  
  "audit\_log\_screen": {  
    "events": \[  
      {  
        "timestamp": "2026-02-21T10:00",  
        "admin\_id": "A1",  
        "action": "Changed readiness threshold"  
      }  
    \]  
  }  
}

Immutable logs.

---

# **1️⃣4️⃣ DATA EXPORT CONTROL SCREEN**

GDPR-compliant.

---

{  
  "data\_export\_control\_screen": {  
    "export\_user\_data": true,  
    "export\_org\_data": true,  
    "delete\_user\_data": true  
  }  
}

Requires double confirmation.

---

# **SECURITY ENFORCEMENT**

All admin actions:

* Require MFA

* Logged with IP

* Rate limited

* Server-side RBAC

---

# **PERFORMANCE REQUIREMENTS**

* Admin dashboard load \< 1s

* Aggregations precomputed

* AI monitoring real-time

* Transactions paginated

* Export async job

---

# **STRATEGIC ROLE**

Admin Screens:

* Maintain platform stability

* Prevent abuse

* Control AI evolution

* Adjust economic levers

* Tune readiness engine

* Scale B2B safely

* Protect brand trust

This is Compass’s control plane.

Without this layer, the OS collapses under scale.

---

If you want next, we can:

* Design full RBAC matrix (deep permissions mapping)

* Or build system-wide state machine architecture

* Or map audit & compliance model for international scale

Choose the next descent.

Excellent.

Now we enter the **interaction micro-layer** of Compass.

Shared Modals are not minor UI elements.

They are:

* Decision interruption layers

* Behavioral nudging surfaces

* Risk containment checkpoints

* Cross-domain action bridges

* High-intent conversion triggers

* Trust reinforcement windows

If badly designed → friction.

If overused → fatigue.

If inconsistent → chaos.

If manipulative → distrust.

Shared Modals must:

* Be minimal

* Be purposeful

* Be state-aware

* Be consistent

* Be psychologically calibrated

* Be reusable across domains

They are the **cross-system glue layer**.

Now we go deep.

---

# **1️⃣5️⃣ SHARED MODALS — FULL SYSTEM SPECIFICATION**

---

# **STRUCTURAL OVERVIEW**

{

  "shared\_modals": \[

    "confirmation\_modal",

    "destructive\_action\_modal",

    "submission\_gate\_modal",

    "upgrade\_modal",

    "contextual\_recommendation\_modal",

    "deadline\_alert\_modal",

    "unsaved\_changes\_modal",

    "rejection\_reflection\_modal",

    "success\_celebration\_modal",

    "error\_modal",

    "permission\_request\_modal",

    "consent\_modal",

    "loading\_overlay\_modal",

    "ai\_processing\_modal",

    "rate\_experience\_modal"

  \]

}

---

# **GLOBAL MODAL DESIGN SYSTEM**

All modals must:

* Slide up (mobile)

* Centered (desktop)

* Dim background (60% opacity)

* Lock scroll

* Close via explicit action only (unless safe modal)

* Accessible (keyboard navigation)

* ARIA compliant

* Have max width constraint

* Respect dark/light mode

---

# **MODAL STATE MACHINE**

{

  "modal\_states": \[

    "closed",

    "opening",

    "active",

    "processing",

    "success",

    "error",

    "closing"

  \]

}

All modals must handle async safely.

---

# **1️⃣ CONFIRMATION MODAL**

Used for non-destructive but important decisions.

---

{

  "confirmation\_modal": {

    "title": "Confirm Action",

    "message": "Are you sure you want to mark this milestone as complete?",

    "cta\_primary": "Confirm",

    "cta\_secondary": "Cancel"

  }

}

Used in:

* Milestone completion

* Route switching

* Marking interview session complete

* Locking narrative version

---

# **2️⃣ DESTRUCTIVE ACTION MODAL**

For high-risk actions.

---

{

  "destructive\_action\_modal": {

    "title": "Delete Route?",

    "warning": "This action cannot be undone.",

    "cta\_primary": "Delete",

    "cta\_secondary": "Cancel"

  }

}

Features:

* Primary button red (only here)

* Optional re-authentication for account deletion

Used in:

* Delete route

* Delete application

* Delete account

* Remove provider service

---

# **3️⃣ SUBMISSION GATE MODAL**

Used when user attempts submission.

---

{

  "submission\_gate\_modal": {

    "title": "Readiness Check",

    "readiness\_score": 72,

    "recommended\_threshold": 75,

    "message": "Submitting now may reduce competitiveness.",

    "options": \[

      "Improve First",

      "Submit Anyway"

    \]

  }

}

Must:

* Show trade-offs clearly

* Avoid alarmist tone

---

# **4️⃣ UPGRADE MODAL (Contextual)**

Triggered by feature gate.

---

{

  "upgrade\_modal": {

    "title": "Unlock Unlimited Interview Practice",

    "trigger\_reason": "You’ve reached your free limit.",

    "benefit\_statement": "Unlimited sessions improve performance by an average of \+7 points.",

    "cta\_primary": "Upgrade to Pro",

    "cta\_secondary": "Maybe Later"

  }

}

Must show:

* What user has achieved

* What is unlocked

---

# **5️⃣ CONTEXTUAL RECOMMENDATION MODAL**

Marketplace integration.

---

{

  "contextual\_recommendation\_modal": {

    "title": "Targeted Support Recommended",

    "reason": "Interview resilience below recommended threshold.",

    "suggestion": "Book a structured coaching session.",

    "cta\_primary": "View Coaches",

    "cta\_secondary": "Dismiss"

  }

}

Must include:

“Based on your Compass data.”

---

# **6️⃣ DEADLINE ALERT MODAL**

Triggered when deadline \< 5 days.

---

{

  "deadline\_alert\_modal": {

    "title": "Deadline Approaching",

    "days\_remaining": 3,

    "readiness\_score": 70,

    "cta\_primary": "Review Readiness",

    "cta\_secondary": "Dismiss"

  }

}

Only show once per day.

---

# **7️⃣ UNSAVED CHANGES MODAL**

Protects user work.

---

{

  "unsaved\_changes\_modal": {

    "message": "You have unsaved changes.",

    "options": \[

      "Save and Exit",

      "Discard Changes",

      "Cancel"

    \]

  }

}

Used in:

* Narrative editor

* Route configuration

* Provider service editing

---

# **8️⃣ REJECTION REFLECTION MODAL**

Triggered after outcome logged as rejected.

---

{

  "rejection\_reflection\_modal": {

    "title": "Take a Structured Pause",

    "message": "Rejections are part of competitive processes.",

    "cta\_primary": "Start Recalibration",

    "cta\_secondary": "Close"

  }

}

Tone:

Calm.

Forward-focused.

---

# **9️⃣ SUCCESS CELEBRATION MODAL**

Used sparingly.

---

{

  "success\_celebration\_modal": {

    "title": "Milestone Completed\!",

    "message": "Your readiness improved by \+5 points.",

    "cta\_primary": "Continue",

    "visual\_effect": "Subtle confetti"

  }

}

No loud animations.

---

# **🔟 ERROR MODAL**

System error.

---

{

  "error\_modal": {

    "title": "Something went wrong",

    "message": "Please try again.",

    "cta\_primary": "Retry",

    "cta\_secondary": "Contact Support"

  }

}

Never show raw stack trace.

---

# **1️⃣1️⃣ PERMISSION REQUEST MODAL**

Used for:

* Microphone access

* Camera access

* Calendar sync

---

{

  "permission\_request\_modal": {

    "permission\_type": "Microphone",

    "reason": "Required for voice interview simulation.",

    "cta\_primary": "Allow Access",

    "cta\_secondary": "Not Now"

  }

}

---

# **1️⃣2️⃣ CONSENT MODAL**

Used in B2B visibility.

---

{

  "consent\_modal": {

    "title": "Institutional Data Visibility",

    "message": "Your organization can view your readiness score.",

    "toggle\_options": \[\],

    "cta\_primary": "Confirm"

  }

}

Must log consent version.

---

# **1️⃣3️⃣ LOADING OVERLAY MODAL**

Used for blocking operations.

---

{

  "loading\_overlay\_modal": {

    "message": "Processing...",

    "spinner": true

  }

}

Max display time: 8 seconds before fallback.

---

# **1️⃣4️⃣ AI PROCESSING MODAL**

Used during AI-heavy operations.

---

{

  "ai\_processing\_modal": {

    "title": "Analyzing your narrative...",

    "progress\_indicator": true

  }

}

Must:

* Not block entire app

* Allow cancellation if safe

---

# **1️⃣5️⃣ RATE EXPERIENCE MODAL**

Used after session or milestone.

---

{

  "rate\_experience\_modal": {

    "question": "Was this session helpful?",

    "rating\_input": true,

    "optional\_comment": true

  }

}

---

# **GLOBAL BEHAVIORAL RULES**

1. Only one modal active at a time

2. No modal stacking

3. No modal spam

4. Respect cooldown logic

5. Dismissal logged (for analytics)

---

# **PERFORMANCE REQUIREMENTS**

* Modal render \< 100ms

* Async safe

* No UI freeze

* Keyboard & accessibility compliant

* Escape key behavior configurable

---

# **ANALYTICS EVENTS**

* Modal triggered

* Modal confirmed

* Modal dismissed

* Modal CTA conversion

* Time-to-decision inside modal

---

# **STRATEGIC ROLE**

Shared Modals:

* Guard irreversible actions

* Trigger contextual monetization

* Contain risk

* Reduce panic

* Reinforce trust

* Guide behavior at key inflection points

* Connect engines seamlessly

They are the invisible choreography of Compass.

---

If you want next, we can:

* Build the global UI component system (buttons, cards, states, tokens)

* Or design the full cross-system state machine diagram

* Or define behavioral nudge orchestration logic

Choose the next descent.

