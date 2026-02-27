To elevate Pillar 3 to a McKinsey-grade standard, we must recognize that ambition and psychological readiness (Pillars 1 and 2\) are useless without **Execution Kinetic State**.

Most EdTech or career platforms fail here because they treat "progress" linearly (e.g., "Watch Module 1, then Module 2"). But internationalization is non-linear. A user might know exactly which Master's program they want in Germany (High Target Clarity) but possess a terrible, Brazilian-formatted CV (Low Asset Maturity) and only have 2 hours a week to work on it (Low Bandwidth).

To be strictly MECE, Pillar 3 cannot just ask "Are you ready?" It must decompose the mechanics of *motion* into independent variables that the SaaS can use to dynamically generate, pace, and lock/unlock Sprints in the FIND, DECIDE, and BUILD modules.

Here is the architectural breakdown of Pillar 3, the extraction mechanics, and the backend data model.

---

### **The Refined Pillar 3: Execution Kinetic State (The "Motion" Gates)**

We divide the user's execution state into 4 mutually exclusive dimensions. This tells the software exactly *where* to drop the user in the journey and *how fast* to push them.

#### **1\. Target Resolution (The "Where")**

* **The Variables:** Nebulous $\\rightarrow$ Directional $\\rightarrow$ Locked.  
* **Why it’s MECE:** Isolates the destination from the assets. You can have a perfect global CV but zero idea of where to send it.  
* **What we want to get:** Do we need to force this user into the FIND module (Opportunity Database), or do we lock FIND and force them into BUILD (Execution) to prevent them from endlessly browsing programs as a form of productive procrastination?

#### **2\. Asset Maturity (The "What")**

* **The Variables:** Non-Existent $\\rightarrow$ Localized (Domestic Format) $\\rightarrow$ Drafted (Global Format) $\\rightarrow$ Review-Ready.  
* **Why it’s MECE:** Isolates the tangible deliverables (CVs, Motivation Letters, Portfolios). A domestic CV translated directly to English is still a "Localized" asset and will be rejected by ATS (Applicant Tracking Systems).  
* **What we want to get:** How much heavy lifting does the BUILD editor need to do? Do they start from a blank Olcan Template, or do they paste an existing draft for the AI to critique against the Olcan Score rubric?

#### **3\. System Literacy (The "Rules")**

* **The Variables:** Novice $\\rightarrow$ Aware $\\rightarrow$ Fluent.  
* **Why it’s MECE:** Isolates their understanding of the *game mechanics* (e.g., ATS algorithms, the STAR method for interviews, visa sponsorship nuances, the difference between a CV and a Resume).  
* **What we want to get:** Does the software need to inject educational micro-lessons before letting them write a document?

#### **4\. Execution Bandwidth (The "Pacing")**

* **The Variables:** Constrained (\<2h/week) $\\rightarrow$ Moderate (2-5h/week) $\\rightarrow$ Abundant (5h+/week).  
* **Why it’s MECE:** This is the most critical and often ignored variable. Time is an independent physical constraint.  
* **What we want to get:** This dictates the *Sprint Engine*. If a user works 60 hours a week in a Brazilian corporate job, assigning them a Sprint with 12 tasks will cause immediate churn. The system must adapt its velocity to their reality.

---

### **The "How-To": Extracting Data Gracefully (Behavioral Proxies)**

Self-reporting on execution is notoriously unreliable. Users overestimate their assets and underestimate the time required. We must extract this data using **Behavioral Proxies** and **Micro-Assessments** during onboarding.

**1\. Extracting Target Resolution (Combatting Productive Procrastination)**

* *UI Copy:* "If someone offered to review your application right now, what could you show them?"  
* *Option A:* "Nothing yet, I'm still figuring out my options." $\\rightarrow$ *(Scores: Nebulous. Action: Unlocks FIND module).*  
* *Option B:* "I know the country and industry, but don't have specific links." $\\rightarrow$ *(Scores: Directional. Action: Triggers Semantic Opportunity Matching).*  
* *Option C:* "I have the exact links and deadlines saved." $\\rightarrow$ *(Scores: Locked. Action: Bypasses FIND, drops user straight into BUILD).*

**2\. Extracting System Literacy (The Micro-Quiz)**

* *UI Copy:* "Which of the following international hiring concepts are you completely comfortable navigating? (Select all that apply)."  
* *Checkboxes:* ATS Optimization | The STAR Interview Method | Sponsorship vs. Work Authorization | CV vs. Resume Differences.  
* *The Payoff:* For every unchecked box, the SaaS quietly queues a specific micro-lesson in their upcoming Sprints. If they score Novice, the UI surfaces tooltips heavily in the BUILD editor.

**3\. Extracting Asset Maturity & Bandwidth (The Reality Check)**

* *UI Copy:* "We build your Sprints based on your actual routine. Be brutally honest: how much focused, uninterrupted time can you dedicate to this project per week?"  
* *Options:* "Less than 2 hours (I'm swamped)" | "2-5 hours" | "5+ hours (I'm making this my part-time job)".  
* *The Payoff:* This directly programs the Inngest background jobs for Sprint nudges.

---

### **The "How-To": Categorizing for Software Development**

In your backend (Supabase), Pillar 3 data is highly dynamic. Unlike Pillar 1 (which rarely changes) or Pillar 2 (which changes slowly), Pillar 3 updates constantly as the user completes Sprints.

**Database Schema (Table: execution\_state)**

* target\_resolution (Integer, 0-2)  
* asset\_maturity (Integer, 0-3)  
* system\_literacy (Integer, 0-3)  
* weekly\_bandwidth (Enum: CONSTRAINED, MODERATE, ABUNDANT)  
* last\_momentum\_update (Timestamp): Used by the Nudge Engine to detect stalled users.

---

### **The Strategic Value: The Autonomous Sprint Engine**

By combining Pillar 1 (Feasibility), Pillar 2 (Psychology), and Pillar 3 (Motion), Compass can now perform **Dynamic Task Orchestration**. The SaaS stops acting like a static checklist and starts acting like an elite executive coach.

**Example of the Engine in Action:**

* **The "Blind Executor" (High Asset, Low Target, Abundant Bandwidth):**  
  * *Data:* asset\_maturity \= 3 (Has a great global CV), target\_resolution \= 0 (No idea where to apply).  
  * *SaaS Prescription:* The software locks the BUILD module. The Sprint generated is 100% focused on the FIND module. *Sprint Task 1: "You have the assets, but no aim. Use the Opportunity Database to shortlist 5 Tech Visas in Europe. You have 5 hours this week, so we are setting a hard deadline for Friday."*  
* **The "Overwhelmed Dreamer" (High Target, Low Asset, Constrained Bandwidth, High Systematic Need):**  
  * *Data:* target\_resolution \= 2 (Knows they want a specific German Master's), asset\_maturity \= 0 (No documents), weekly\_bandwidth \= CONSTRAINED, cog\_ambiguity \= \-1.0 (Needs systematic rules).  
  * *SaaS Prescription:* The software realizes this user is at massive risk of churn due to overwhelm. It generates **Micro-Sprints**.  
  * *Sprint Task 1:* *"Do not write the whole essay. You only have 2 hours this week. Your only task is to open the Olcan Tiptap Editor and write 3 bullet points about your past job using our prompt. That's it."*

### **Strategic Summary for the Developer Handoff**

1. **Algorithmic Pacing:** Your developers can use the weekly\_bandwidth variable to cap the number of tasks injected into the active Sprint. If CONSTRAINED, max\_active\_tasks \= 2. This guarantees the user feels a sense of completion (dopamine hit) rather than guilt.  
2. **Smart Context for Mentors:** When this user clicks "I need a human here", the Mentor Brief includes: *"User has High Target Resolution but Low System Literacy. They are applying for a UK Visa but don't understand ATS. Explain ATS briefly before reviewing their CV."*  
3. **The Ultimate Aha-Moment:** The paywall now shows the user the ultimate matrix: **"You have the credentials (Pillar 1). You have the ambition (Pillar 2). But your execution velocity is stalled because you are using a Brazilian CV format for global ATS systems (Pillar 3). Unlock Compass Core to fix your assets."**

