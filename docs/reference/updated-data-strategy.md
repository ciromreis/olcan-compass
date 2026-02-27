# I will give you a **full backend logical data structure**, expressed as a **JSON-like structural schema map**, designed for:

* PostgreSQL (relational core)

* Python / FastAPI backend

* Event-driven architecture

* AI-integrated system

* Multi-tenant (B2C \+ B2B ready)

* Marketplace-ready

* Analytics-ready

* Audit-safe

* Horizontally scalable

This is a **deployment-grade logical data map**, not marketing.

Your current frontend is minimal (React \+ Radix UI    , static shell  ).

Everything meaningful must live in backend.

Below is the **complete logical backend schema map**.

---

# **OLcan Compass — Full Backend Logical Data Structure (V1 \+ B2B-Ready)**

{  
  "system": {  
    "architecture": "modular\_monolith",  
    "database": "postgresql",  
    "id\_strategy": "uuid\_v4",  
    "soft\_delete": true,  
    "multi\_tenant": true,  
    "event\_sourced\_analytics": true,  
    "ai\_structured\_outputs\_only": true  
  },

  "core\_domains": {

    "identity\_psychological": {

      "users": {  
        "id": "uuid",  
        "email": "string\_unique",  
        "password\_hash": "string",  
        "role": "enum\[END\_USER, PROVIDER, SUPER\_ADMIN, ORG\_ADMIN, COORDINATOR\]",  
        "organization\_id": "uuid\_nullable",  
        "subscription\_id": "uuid\_nullable",  
        "geo\_country": "string",  
        "created\_at": "timestamp",  
        "active\_flag": "boolean"  
      },

      "user\_profiles": {  
        "user\_id": "uuid\_fk\_users",  
        "education\_level": "string",  
        "field\_of\_study": "string",  
        "years\_experience": "int",  
        "career\_stage": "string",  
        "languages\_json": "jsonb",  
        "financial\_band": "enum",  
        "mobility\_urgency": "enum"  
      },

      "psych\_profiles": {  
        "user\_id": "uuid\_fk\_users\_unique",  
        "confidence\_index": "int\_0\_100",  
        "anxiety\_score": "int\_0\_100",  
        "discipline\_score": "int\_0\_100",  
        "risk\_tolerance\_score": "int\_0\_100",  
        "loss\_sensitivity\_index": "int\_0\_100",  
        "decision\_latency\_score": "int\_0\_100",  
        "narrative\_self\_efficacy\_score": "int\_0\_100",  
        "interview\_anxiety\_score": "int\_0\_100",  
        "momentum\_index": "int\_0\_100",  
        "psychological\_state": "enum\[UNCERTAIN, STRUCTURING, BUILDING\_CONFIDENCE, EXECUTING, RESILIENT\]",  
        "version": "int",  
        "updated\_at": "timestamp"  
      },

      "psych\_assessment\_sessions": {  
        "id": "uuid",  
        "user\_id": "uuid\_fk\_users",  
        "version": "int",  
        "answers\_json": "jsonb",  
        "computed\_scores\_json": "jsonb",  
        "created\_at": "timestamp"  
      }  
    },

    "route\_lifecycle": {

      "route\_templates": {  
        "id": "uuid",  
        "organization\_id": "uuid\_nullable",  
        "route\_type": "enum\[SCHOLARSHIP, JOB, RESEARCH, STARTUP, EXCHANGE\]",  
        "version": "int",  
        "financial\_model\_type": "string",  
        "interview\_likelihood\_score": "int",  
        "competitiveness\_index": "int",  
        "active\_flag": "boolean"  
      },

      "route\_template\_milestones": {  
        "id": "uuid",  
        "route\_template\_id": "uuid\_fk\_route\_templates",  
        "milestone\_type": "enum",  
        "dimension": "enum\[READINESS, NARRATIVE, TEST, FINANCIAL, APPLICATION\]",  
        "dependency\_ids": "uuid\_array",  
        "weight": "float",  
        "mandatory\_flag": "boolean"  
      },

      "routes": {  
        "id": "uuid",  
        "user\_id": "uuid\_fk\_users",  
        "organization\_id": "uuid\_nullable",  
        "route\_template\_id": "uuid",  
        "mobility\_state": "enum\[EXPLORING, PREPARING, APPLYING, AWAITING, ITERATING, RELOCATING\]",  
        "progress\_percentage": "float",  
        "risk\_index": "float",  
        "timeline\_pressure\_index": "float",  
        "start\_date": "timestamp",  
        "active\_flag": "boolean"  
      },

      "route\_milestones": {  
        "id": "uuid",  
        "route\_id": "uuid\_fk\_routes",  
        "template\_milestone\_id": "uuid",  
        "status": "enum\[NOT\_STARTED, IN\_PROGRESS, COMPLETED, BLOCKED\]",  
        "completed\_at": "timestamp\_nullable",  
        "evidence\_ref\_id": "uuid\_nullable"  
      }  
    },

    "readiness\_engine": {

      "readiness\_snapshots": {  
        "id": "uuid",  
        "user\_id": "uuid",  
        "route\_id": "uuid",  
        "overall\_score": "float",  
        "dimension\_scores\_json": "jsonb",  
        "risk\_index": "float",  
        "estimated\_success\_probability": "float",  
        "created\_at": "timestamp"  
      },

      "readiness\_gaps": {  
        "id": "uuid",  
        "route\_id": "uuid",  
        "gap\_type": "string",  
        "severity": "float",  
        "priority\_rank": "int",  
        "resolved\_flag": "boolean"  
      }  
    },

    "narrative\_engine": {

      "narrative\_documents": {  
        "id": "uuid",  
        "user\_id": "uuid",  
        "route\_id": "uuid",  
        "document\_type": "enum\[MOTIVATION, SOP, CV\_SUMMARY, PROPOSAL\]",  
        "active\_flag": "boolean"  
      },

      "narrative\_versions": {  
        "id": "uuid",  
        "document\_id": "uuid",  
        "version\_number": "int",  
        "raw\_text": "text\_encrypted",  
        "word\_count": "int",  
        "created\_at": "timestamp"  
      },

      "narrative\_analysis": {  
        "id": "uuid",  
        "version\_id": "uuid",  
        "scores\_json": "jsonb",  
        "improvement\_actions\_json": "jsonb",  
        "ai\_prompt\_version": "int",  
        "model\_used": "string",  
        "created\_at": "timestamp"  
      }  
    },

    "interview\_engine": {

      "interview\_sessions": {  
        "id": "uuid",  
        "user\_id": "uuid",  
        "route\_id": "uuid",  
        "difficulty\_level": "int",  
        "overall\_score": "float",  
        "resilience\_index": "float",  
        "created\_at": "timestamp"  
      },

      "interview\_questions": {  
        "id": "uuid",  
        "route\_type": "enum",  
        "difficulty\_level": "int",  
        "question\_type": "enum",  
        "text": "text"  
      },

      "interview\_responses": {  
        "id": "uuid",  
        "session\_id": "uuid",  
        "question\_id": "uuid",  
        "response\_text": "text\_encrypted",  
        "analysis\_json": "jsonb"  
      }  
    },

    "application\_management": {

      "opportunities": {  
        "id": "uuid",  
        "title": "string",  
        "organization\_name": "string",  
        "country": "string",  
        "route\_type": "enum",  
        "competitiveness\_index": "float",  
        "deadline": "timestamp",  
        "document\_requirements\_json": "jsonb"  
      },

      "applications": {  
        "id": "uuid",  
        "user\_id": "uuid",  
        "route\_id": "uuid",  
        "opportunity\_id": "uuid",  
        "application\_state": "enum",  
        "readiness\_snapshot\_id": "uuid",  
        "narrative\_version\_id": "uuid",  
        "submission\_date": "timestamp\_nullable",  
        "outcome": "enum\[ACCEPTED, REJECTED, WAITLISTED, NULL\]"  
      }  
    },

    "marketplace": {

      "providers": {  
        "id": "uuid",  
        "name": "string",  
        "provider\_type": "enum",  
        "rating\_average": "float",  
        "commission\_percentage": "float",  
        "active\_flag": "boolean"  
      },

      "provider\_services": {  
        "id": "uuid",  
        "provider\_id": "uuid",  
        "service\_type": "enum",  
        "route\_specialization": "enum",  
        "base\_price": "float",  
        "delivery\_mode": "enum"  
      },

      "bookings": {  
        "id": "uuid",  
        "user\_id": "uuid",  
        "provider\_id": "uuid",  
        "service\_id": "uuid",  
        "session\_datetime": "timestamp",  
        "status": "enum\[PENDING, CONFIRMED, COMPLETED, CANCELLED\]"  
      },

      "transactions": {  
        "id": "uuid",  
        "booking\_id": "uuid",  
        "gross\_amount": "float",  
        "platform\_commission": "float",  
        "provider\_payout": "float",  
        "currency": "string",  
        "payment\_status": "enum"  
      }  
    },

    "monetization": {

      "subscriptions": {  
        "id": "uuid",  
        "user\_id": "uuid",  
        "plan\_type": "enum\[FREE, PRO, PREMIUM\]",  
        "status": "enum\[ACTIVE, PAST\_DUE, CANCELLED\]",  
        "stripe\_subscription\_id": "string",  
        "start\_date": "timestamp",  
        "end\_date": "timestamp\_nullable"  
      },

      "digital\_products": {  
        "id": "uuid",  
        "name": "string",  
        "price": "float",  
        "route\_type": "enum\_nullable"  
      },

      "product\_access": {  
        "id": "uuid",  
        "user\_id": "uuid",  
        "product\_id": "uuid",  
        "purchase\_date": "timestamp"  
      }  
    },

    "ai\_layer": {

      "ai\_prompts": {  
        "id": "uuid",  
        "task\_type": "string",  
        "version": "int",  
        "system\_prompt": "text",  
        "user\_template": "text",  
        "output\_schema\_json": "jsonb",  
        "active\_flag": "boolean"  
      },

      "ai\_logs": {  
        "id": "uuid",  
        "task\_type": "string",  
        "user\_id": "uuid",  
        "prompt\_version": "int",  
        "model\_used": "string",  
        "token\_usage": "int",  
        "latency\_ms": "int",  
        "status": "enum\[SUCCESS, FAILED\]",  
        "created\_at": "timestamp"  
      }  
    },

    "b2b\_extension": {

      "organizations": {  
        "id": "uuid",  
        "name": "string",  
        "organization\_type": "enum",  
        "subscription\_plan": "string",  
        "active\_flag": "boolean"  
      },

      "organization\_users": {  
        "id": "uuid",  
        "organization\_id": "uuid",  
        "user\_id": "uuid",  
        "role": "enum\[ORG\_ADMIN, COORDINATOR, MEMBER\]"  
      },

      "cohorts": {  
        "id": "uuid",  
        "organization\_id": "uuid",  
        "name": "string"  
      },

      "cohort\_members": {  
        "id": "uuid",  
        "cohort\_id": "uuid",  
        "user\_id": "uuid"  
      }  
    },

    "analytics\_layer": {

      "analytics\_events": {  
        "id": "uuid",  
        "event\_type": "string",  
        "user\_id\_hash": "string",  
        "organization\_id": "uuid\_nullable",  
        "metadata\_json": "jsonb",  
        "created\_at": "timestamp"  
      },

      "application\_outcomes\_dataset": {  
        "id": "uuid",  
        "route\_type": "enum",  
        "competitiveness\_index": "float",  
        "readiness\_at\_submission": "float",  
        "interview\_score\_at\_submission": "float",  
        "outcome": "enum",  
        "created\_at": "timestamp"  
      }  
    },

    "audit\_security": {

      "audit\_logs": {  
        "id": "uuid",  
        "actor\_id": "uuid",  
        "actor\_role": "string",  
        "action\_type": "string",  
        "resource\_type": "string",  
        "resource\_id": "uuid",  
        "timestamp": "timestamp",  
        "ip\_address": "string"  
      }  
    }

  }  
}  
---

# **What This Structure Achieves**

* Fully normalized relational core

* Event-driven analytics

* AI governance

* Marketplace separation

* Multi-tenant B2B readiness

* Psychological adaptation persistence

* Versioned narrative & interview storage

* Outcome dataset for predictive modeling

* Audit-safe operations

This is deployable.

It aligns with:

* Your deep PRD \#2

* All 6 core engines

* Marketplace

* Monetization

* B2B expansion

* AI isolation

* Analytics intelligence moat

---

Good.

Now we move from logical JSON map to a **true relational architecture blueprint**.

Below is a **deployment-grade ER structure**, written in a diagram-friendly format (entity blocks \+ relationships \+ cardinalities \+ keys). This is structured so it can be directly converted into:

* PostgreSQL DDL

* dbdiagram.io

* Draw.io

* Mermaid ER

* Or fed to an LLM for schema generation

I will:

* Separate bounded contexts

* Define PK/FK explicitly

* Define cardinality

* Clarify optionality

* Mark tenant-aware tables

* Mark high-sensitivity tables

No repetition. Only structural clarity.

---

# **OLcan Compass — Full ER Diagram Structure**

---

# **1\. IDENTITY & ACCESS DOMAIN**

---

## **ENTITY: users**

users  
\-----  
PK id : uuid  
email : varchar UNIQUE  
password\_hash : varchar  
role : enum  
organization\_id : uuid FK → organizations.id NULL  
subscription\_id : uuid FK → subscriptions.id NULL  
geo\_country : varchar  
active\_flag : boolean  
created\_at : timestamp

### **Relationships:**

* 1 user → 1 user\_profile

* 1 user → 1 psych\_profile

* 1 user → many routes

* 1 user → many applications

* 1 user → many interview\_sessions

* 1 user → many narrative\_documents

* 1 user → many bookings

* 1 user → many audit\_logs

* 0..1 user → 1 organization

---

## **ENTITY: user\_profiles**

user\_profiles  
\-------------  
PK user\_id : uuid FK → users.id  
education\_level : varchar  
field\_of\_study : varchar  
years\_experience : int  
career\_stage : varchar  
languages\_json : jsonb  
financial\_band : enum  
mobility\_urgency : enum

Cardinality:

* 1:1 with users (mandatory)

---

## **ENTITY: psych\_profiles**

psych\_profiles  
\--------------  
PK user\_id : uuid FK → users.id  
confidence\_index : int  
anxiety\_score : int  
discipline\_score : int  
risk\_tolerance\_score : int  
loss\_sensitivity\_index : int  
decision\_latency\_score : int  
narrative\_self\_efficacy\_score : int  
interview\_anxiety\_score : int  
momentum\_index : int  
psychological\_state : enum  
version : int  
updated\_at : timestamp

Cardinality:

* 1:1 with users (mandatory)

High-sensitivity.

---

## **ENTITY: psych\_assessment\_sessions**

psych\_assessment\_sessions  
\-------------------------  
PK id : uuid  
user\_id : uuid FK → users.id  
version : int  
answers\_json : jsonb  
computed\_scores\_json : jsonb  
created\_at : timestamp

Cardinality:

* 1 user → many assessment\_sessions

---

# **2\. ROUTE & LIFECYCLE DOMAIN**

---

## **ENTITY: route\_templates**

route\_templates  
\---------------  
PK id : uuid  
organization\_id : uuid FK → organizations.id NULL  
route\_type : enum  
version : int  
financial\_model\_type : varchar  
interview\_likelihood\_score : int  
competitiveness\_index : int  
active\_flag : boolean

Cardinality:

* 1 route\_template → many route\_template\_milestones

* 1 route\_template → many routes

---

## **ENTITY: route\_template\_milestones**

route\_template\_milestones  
\-------------------------  
PK id : uuid  
route\_template\_id : uuid FK → route\_templates.id  
milestone\_type : enum  
dimension : enum  
dependency\_ids : uuid\[\] (logical)  
weight : float  
mandatory\_flag : boolean

Cardinality:

* 1 template → many template\_milestones

---

## **ENTITY: routes**

routes  
\------  
PK id : uuid  
user\_id : uuid FK → users.id  
organization\_id : uuid FK → organizations.id NULL  
route\_template\_id : uuid FK → route\_templates.id  
mobility\_state : enum  
progress\_percentage : float  
risk\_index : float  
timeline\_pressure\_index : float  
start\_date : timestamp  
active\_flag : boolean

Cardinality:

* 1 user → many routes

* 1 route → many route\_milestones

* 1 route → many readiness\_snapshots

* 1 route → many narrative\_documents

* 1 route → many interview\_sessions

* 1 route → many applications

---

## **ENTITY: route\_milestones**

route\_milestones  
\----------------  
PK id : uuid  
route\_id : uuid FK → routes.id  
template\_milestone\_id : uuid FK → route\_template\_milestones.id  
status : enum  
completed\_at : timestamp NULL  
evidence\_ref\_id : uuid NULL

Cardinality:

* 1 route → many route\_milestones

---

# **3\. READINESS ENGINE DOMAIN**

---

## **ENTITY: readiness\_snapshots**

readiness\_snapshots  
\-------------------  
PK id : uuid  
user\_id : uuid FK → users.id  
route\_id : uuid FK → routes.id  
overall\_score : float  
dimension\_scores\_json : jsonb  
risk\_index : float  
estimated\_success\_probability : float  
created\_at : timestamp

Cardinality:

* 1 route → many readiness\_snapshots

Immutable snapshots.

---

## **ENTITY: readiness\_gaps**

readiness\_gaps  
\--------------  
PK id : uuid  
route\_id : uuid FK → routes.id  
gap\_type : varchar  
severity : float  
priority\_rank : int  
resolved\_flag : boolean

Cardinality:

* 1 route → many gaps

---

# **4\. NARRATIVE INTELLIGENCE DOMAIN**

---

## **ENTITY: narrative\_documents**

narrative\_documents  
\-------------------  
PK id : uuid  
user\_id : uuid FK → users.id  
route\_id : uuid FK → routes.id  
document\_type : enum  
active\_flag : boolean

Cardinality:

* 1 route → many narrative\_documents

* 1 narrative\_document → many narrative\_versions

---

## **ENTITY: narrative\_versions**

narrative\_versions  
\------------------  
PK id : uuid  
document\_id : uuid FK → narrative\_documents.id  
version\_number : int  
raw\_text : text (encrypted)  
word\_count : int  
created\_at : timestamp

Cardinality:

* 1 document → many versions

---

## **ENTITY: narrative\_analysis**

narrative\_analysis  
\------------------  
PK id : uuid  
version\_id : uuid FK → narrative\_versions.id  
scores\_json : jsonb  
improvement\_actions\_json : jsonb  
ai\_prompt\_version : int  
model\_used : varchar  
created\_at : timestamp

Cardinality:

* 1 version → 1 analysis (V1 constraint)

   (Expandable to many if re-analysis allowed)

---

# **5\. INTERVIEW INTELLIGENCE DOMAIN**

---

## **ENTITY: interview\_sessions**

interview\_sessions  
\------------------  
PK id : uuid  
user\_id : uuid FK → users.id  
route\_id : uuid FK → routes.id  
difficulty\_level : int  
overall\_score : float  
resilience\_index : float  
created\_at : timestamp

Cardinality:

* 1 route → many sessions

---

## **ENTITY: interview\_questions**

interview\_questions  
\-------------------  
PK id : uuid  
route\_type : enum  
difficulty\_level : int  
question\_type : enum  
text : text

Reusable across sessions.

---

## **ENTITY: interview\_responses**

interview\_responses  
\-------------------  
PK id : uuid  
session\_id : uuid FK → interview\_sessions.id  
question\_id : uuid FK → interview\_questions.id  
response\_text : text (encrypted)  
analysis\_json : jsonb

Cardinality:

* 1 session → many responses

---

# **6\. APPLICATION MANAGEMENT DOMAIN**

---

## **ENTITY: opportunities**

opportunities  
\-------------  
PK id : uuid  
title : varchar  
organization\_name : varchar  
country : varchar  
route\_type : enum  
competitiveness\_index : float  
deadline : timestamp  
document\_requirements\_json : jsonb  
---

## **ENTITY: applications**

applications  
\------------  
PK id : uuid  
user\_id : uuid FK → users.id  
route\_id : uuid FK → routes.id  
opportunity\_id : uuid FK → opportunities.id  
application\_state : enum  
readiness\_snapshot\_id : uuid FK → readiness\_snapshots.id  
narrative\_version\_id : uuid FK → narrative\_versions.id  
submission\_date : timestamp NULL  
outcome : enum NULL

Cardinality:

* 1 route → many applications

* 1 opportunity → many applications

---

# **7\. MARKETPLACE DOMAIN**

---

## **ENTITY: providers**

providers  
\---------  
PK id : uuid  
name : varchar  
provider\_type : enum  
rating\_average : float  
commission\_percentage : float  
active\_flag : boolean  
---

## **ENTITY: provider\_services**

provider\_services  
\-----------------  
PK id : uuid  
provider\_id : uuid FK → providers.id  
service\_type : enum  
route\_specialization : enum  
base\_price : float  
delivery\_mode : enum

Cardinality:

* 1 provider → many services

---

## **ENTITY: bookings**

bookings  
\--------  
PK id : uuid  
user\_id : uuid FK → users.id  
provider\_id : uuid FK → providers.id  
service\_id : uuid FK → provider\_services.id  
session\_datetime : timestamp  
status : enum  
---

## **ENTITY: transactions**

transactions  
\------------  
PK id : uuid  
booking\_id : uuid FK → bookings.id  
gross\_amount : float  
platform\_commission : float  
provider\_payout : float  
currency : varchar  
payment\_status : enum

1:1 booking → transaction (recommended)

---

# **8\. MONETIZATION DOMAIN**

---

## **ENTITY: subscriptions**

subscriptions  
\-------------  
PK id : uuid  
user\_id : uuid FK → users.id  
plan\_type : enum  
status : enum  
stripe\_subscription\_id : varchar  
start\_date : timestamp  
end\_date : timestamp NULL

1:1 user → subscription

---

## **ENTITY: digital\_products**

digital\_products  
\----------------  
PK id : uuid  
name : varchar  
price : float  
route\_type : enum NULL  
---

## **ENTITY: product\_access**

product\_access  
\--------------  
PK id : uuid  
user\_id : uuid FK → users.id  
product\_id : uuid FK → digital\_products.id  
purchase\_date : timestamp

Many-to-many users ↔ digital\_products

---

# **9\. B2B DOMAIN**

---

## **ENTITY: organizations**

organizations  
\-------------  
PK id : uuid  
name : varchar  
organization\_type : enum  
subscription\_plan : varchar  
active\_flag : boolean  
---

## **ENTITY: organization\_users**

organization\_users  
\------------------  
PK id : uuid  
organization\_id : uuid FK → organizations.id  
user\_id : uuid FK → users.id  
role : enum

Many-to-many users ↔ organizations (constrained to 1 active per user in V1 logic)

---

## **ENTITY: cohorts**

cohorts  
\-------  
PK id : uuid  
organization\_id : uuid FK → organizations.id  
name : varchar  
---

## **ENTITY: cohort\_members**

cohort\_members  
\--------------  
PK id : uuid  
cohort\_id : uuid FK → cohorts.id  
user\_id : uuid FK → users.id  
---

# **10\. AI GOVERNANCE DOMAIN**

---

## **ENTITY: ai\_prompts**

ai\_prompts  
\----------  
PK id : uuid  
task\_type : varchar  
version : int  
system\_prompt : text  
user\_template : text  
output\_schema\_json : jsonb  
active\_flag : boolean  
---

## **ENTITY: ai\_logs**

ai\_logs  
\-------  
PK id : uuid  
task\_type : varchar  
user\_id : uuid FK → users.id  
prompt\_version : int  
model\_used : varchar  
token\_usage : int  
latency\_ms : int  
status : enum  
created\_at : timestamp  
---

# **11\. ANALYTICS DOMAIN**

---

## **ENTITY: analytics\_events**

analytics\_events  
\----------------  
PK id : uuid  
event\_type : varchar  
user\_id\_hash : varchar  
organization\_id : uuid NULL  
metadata\_json : jsonb  
created\_at : timestamp

Append-only.

---

## **ENTITY: application\_outcomes\_dataset**

application\_outcomes\_dataset  
\----------------------------  
PK id : uuid  
route\_type : enum  
competitiveness\_index : float  
readiness\_at\_submission : float  
interview\_score\_at\_submission : float  
outcome : enum  
created\_at : timestamp

Denormalized analytical table.

---

# **12\. AUDIT DOMAIN**

---

## **ENTITY: audit\_logs**

audit\_logs  
\----------  
PK id : uuid  
actor\_id : uuid  
actor\_role : varchar  
action\_type : varchar  
resource\_type : varchar  
resource\_id : uuid  
timestamp : timestamp  
ip\_address : varchar

Append-only.

---

# **STRUCTURAL OBSERVATIONS**

This ER model ensures:

* Clear domain separation

* Proper cardinality control

* B2C/B2B compatibility

* Immutable historical tracking

* AI auditability

* Marketplace isolation

* Multi-version narrative/interview tracking

* Predictive dataset foundation

No circular dependencies.

No implicit state mutation.

No cross-domain leakage.

---

Below is a **complete Mermaid ER diagram code** representing the full Compass backend structure (V1 \+ B2B-ready), aligned with the ER specification we defined.

You can paste this into:

* https://mermaid.live

* Notion (with Mermaid support)

* GitHub Markdown

* Obsidian

* Or any Mermaid-compatible renderer

---

erDiagram

%% \=========================  
%% IDENTITY & ACCESS  
%% \=========================

users {  
    uuid id PK  
    varchar email  
    varchar password\_hash  
    enum role  
    uuid organization\_id FK  
    uuid subscription\_id FK  
    varchar geo\_country  
    boolean active\_flag  
    timestamp created\_at  
}

user\_profiles {  
    uuid user\_id PK, FK  
    varchar education\_level  
    varchar field\_of\_study  
    int years\_experience  
    varchar career\_stage  
    jsonb languages\_json  
    enum financial\_band  
    enum mobility\_urgency  
}

psych\_profiles {  
    uuid user\_id PK, FK  
    int confidence\_index  
    int anxiety\_score  
    int discipline\_score  
    int risk\_tolerance\_score  
    int loss\_sensitivity\_index  
    int decision\_latency\_score  
    int narrative\_self\_efficacy\_score  
    int interview\_anxiety\_score  
    int momentum\_index  
    enum psychological\_state  
    int version  
    timestamp updated\_at  
}

psych\_assessment\_sessions {  
    uuid id PK  
    uuid user\_id FK  
    int version  
    jsonb answers\_json  
    jsonb computed\_scores\_json  
    timestamp created\_at  
}

%% \=========================  
%% ROUTES & LIFECYCLE  
%% \=========================

route\_templates {  
    uuid id PK  
    uuid organization\_id FK  
    enum route\_type  
    int version  
    varchar financial\_model\_type  
    int interview\_likelihood\_score  
    int competitiveness\_index  
    boolean active\_flag  
}

route\_template\_milestones {  
    uuid id PK  
    uuid route\_template\_id FK  
    enum milestone\_type  
    enum dimension  
    float weight  
    boolean mandatory\_flag  
}

routes {  
    uuid id PK  
    uuid user\_id FK  
    uuid organization\_id FK  
    uuid route\_template\_id FK  
    enum mobility\_state  
    float progress\_percentage  
    float risk\_index  
    float timeline\_pressure\_index  
    timestamp start\_date  
    boolean active\_flag  
}

route\_milestones {  
    uuid id PK  
    uuid route\_id FK  
    uuid template\_milestone\_id FK  
    enum status  
    timestamp completed\_at  
}

%% \=========================  
%% READINESS  
%% \=========================

readiness\_snapshots {  
    uuid id PK  
    uuid user\_id FK  
    uuid route\_id FK  
    float overall\_score  
    jsonb dimension\_scores\_json  
    float risk\_index  
    float estimated\_success\_probability  
    timestamp created\_at  
}

readiness\_gaps {  
    uuid id PK  
    uuid route\_id FK  
    varchar gap\_type  
    float severity  
    int priority\_rank  
    boolean resolved\_flag  
}

%% \=========================  
%% NARRATIVE  
%% \=========================

narrative\_documents {  
    uuid id PK  
    uuid user\_id FK  
    uuid route\_id FK  
    enum document\_type  
    boolean active\_flag  
}

narrative\_versions {  
    uuid id PK  
    uuid document\_id FK  
    int version\_number  
    text raw\_text  
    int word\_count  
    timestamp created\_at  
}

narrative\_analysis {  
    uuid id PK  
    uuid version\_id FK  
    jsonb scores\_json  
    jsonb improvement\_actions\_json  
    int ai\_prompt\_version  
    varchar model\_used  
    timestamp created\_at  
}

%% \=========================  
%% INTERVIEW  
%% \=========================

interview\_sessions {  
    uuid id PK  
    uuid user\_id FK  
    uuid route\_id FK  
    int difficulty\_level  
    float overall\_score  
    float resilience\_index  
    timestamp created\_at  
}

interview\_questions {  
    uuid id PK  
    enum route\_type  
    int difficulty\_level  
    enum question\_type  
    text text  
}

interview\_responses {  
    uuid id PK  
    uuid session\_id FK  
    uuid question\_id FK  
    text response\_text  
    jsonb analysis\_json  
}

%% \=========================  
%% APPLICATION MANAGEMENT  
%% \=========================

opportunities {  
    uuid id PK  
    varchar title  
    varchar organization\_name  
    varchar country  
    enum route\_type  
    float competitiveness\_index  
    timestamp deadline  
    jsonb document\_requirements\_json  
}

applications {  
    uuid id PK  
    uuid user\_id FK  
    uuid route\_id FK  
    uuid opportunity\_id FK  
    enum application\_state  
    uuid readiness\_snapshot\_id FK  
    uuid narrative\_version\_id FK  
    timestamp submission\_date  
    enum outcome  
}

%% \=========================  
%% MARKETPLACE  
%% \=========================

providers {  
    uuid id PK  
    varchar name  
    enum provider\_type  
    float rating\_average  
    float commission\_percentage  
    boolean active\_flag  
}

provider\_services {  
    uuid id PK  
    uuid provider\_id FK  
    enum service\_type  
    enum route\_specialization  
    float base\_price  
    enum delivery\_mode  
}

bookings {  
    uuid id PK  
    uuid user\_id FK  
    uuid provider\_id FK  
    uuid service\_id FK  
    timestamp session\_datetime  
    enum status  
}

transactions {  
    uuid id PK  
    uuid booking\_id FK  
    float gross\_amount  
    float platform\_commission  
    float provider\_payout  
    varchar currency  
    enum payment\_status  
}

%% \=========================  
%% MONETIZATION  
%% \=========================

subscriptions {  
    uuid id PK  
    uuid user\_id FK  
    enum plan\_type  
    enum status  
    varchar stripe\_subscription\_id  
    timestamp start\_date  
    timestamp end\_date  
}

digital\_products {  
    uuid id PK  
    varchar name  
    float price  
    enum route\_type  
}

product\_access {  
    uuid id PK  
    uuid user\_id FK  
    uuid product\_id FK  
    timestamp purchase\_date  
}

%% \=========================  
%% B2B  
%% \=========================

organizations {  
    uuid id PK  
    varchar name  
    enum organization\_type  
    varchar subscription\_plan  
    boolean active\_flag  
}

organization\_users {  
    uuid id PK  
    uuid organization\_id FK  
    uuid user\_id FK  
    enum role  
}

cohorts {  
    uuid id PK  
    uuid organization\_id FK  
    varchar name  
}

cohort\_members {  
    uuid id PK  
    uuid cohort\_id FK  
    uuid user\_id FK  
}

%% \=========================  
%% AI GOVERNANCE  
%% \=========================

ai\_prompts {  
    uuid id PK  
    varchar task\_type  
    int version  
    text system\_prompt  
    text user\_template  
    jsonb output\_schema\_json  
    boolean active\_flag  
}

ai\_logs {  
    uuid id PK  
    varchar task\_type  
    uuid user\_id FK  
    int prompt\_version  
    varchar model\_used  
    int token\_usage  
    int latency\_ms  
    enum status  
    timestamp created\_at  
}

%% \=========================  
%% ANALYTICS  
%% \=========================

analytics\_events {  
    uuid id PK  
    varchar event\_type  
    varchar user\_id\_hash  
    uuid organization\_id  
    jsonb metadata\_json  
    timestamp created\_at  
}

application\_outcomes\_dataset {  
    uuid id PK  
    enum route\_type  
    float competitiveness\_index  
    float readiness\_at\_submission  
    float interview\_score\_at\_submission  
    enum outcome  
    timestamp created\_at  
}

%% \=========================  
%% AUDIT  
%% \=========================

audit\_logs {  
    uuid id PK  
    uuid actor\_id  
    varchar actor\_role  
    varchar action\_type  
    varchar resource\_type  
    uuid resource\_id  
    timestamp timestamp  
    varchar ip\_address  
}

%% \=========================  
%% RELATIONSHIPS  
%% \=========================

users ||--|| user\_profiles : has  
users ||--|| psych\_profiles : has  
users ||--o{ psych\_assessment\_sessions : completes  
users ||--o{ routes : owns  
users ||--o{ narrative\_documents : creates  
users ||--o{ interview\_sessions : performs  
users ||--o{ applications : submits  
users ||--o{ bookings : books  
users ||--|| subscriptions : subscribes  
users ||--o{ product\_access : purchases

route\_templates ||--o{ route\_template\_milestones : defines  
route\_templates ||--o{ routes : instantiated\_by  
routes ||--o{ route\_milestones : contains  
routes ||--o{ readiness\_snapshots : generates  
routes ||--o{ narrative\_documents : includes  
routes ||--o{ interview\_sessions : includes  
routes ||--o{ applications : produces

narrative\_documents ||--o{ narrative\_versions : versioned\_as  
narrative\_versions ||--|| narrative\_analysis : analyzed\_by

interview\_sessions ||--o{ interview\_responses : contains  
interview\_questions ||--o{ interview\_responses : asked\_in

opportunities ||--o{ applications : applied\_to  
readiness\_snapshots ||--o{ applications : referenced\_by

providers ||--o{ provider\_services : offers  
provider\_services ||--o{ bookings : booked\_as  
bookings ||--|| transactions : generates

organizations ||--o{ organization\_users : includes  
organizations ||--o{ cohorts : contains  
cohorts ||--o{ cohort\_members : groups  
organization\_users }o--|| users : links  
cohort\_members }o--|| users : includes

users ||--o{ ai\_logs : triggers  
organizations ||--o{ analytics\_events : scopes  
users ||--o{ audit\_logs : produces  
---

This diagram now:

* Fully represents all Compass engines

* Is B2C \+ B2B ready

* Supports AI governance

* Supports marketplace monetization

* Supports analytics dataset evolution

* Maintains clean relational integrity

* Avoids circular dependency

* Supports long-term scaling

---

