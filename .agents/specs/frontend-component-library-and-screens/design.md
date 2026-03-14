# Design Document: Frontend Component Library and Screens

## Overview

This design specifies the complete frontend implementation for Olcan Compass, transforming the minimal scaffold into a production-ready MMXD (Metamodern Design System) interface. The system implements psychological state-driven UI adaptation, oscillating between "The Map" (high-density data visualization) and "The Forge" (minimalist focus mode), with Portuguese-first microcopy and an "Alchemical" voice that balances prophetic insight with ironic self-awareness.

The architecture supports 10 backend engines (auth, psychology, routes, narratives, interviews, applications, sprints, AI, marketplace, admin) with 30+ reusable components, 50+ screens, and real-time AI-driven feedback loops.

## Main Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[Pages/Screens] --> B[Layout Components]
        B --> C[UI Components]
        C --> D[Design Tokens]
    end
    
    subgraph "State Management"
        E[Zustand Stores] --> F[Auth Store]
        E --> G[Psych Store]
        E --> H[Route Store]
        E --> I[Editor Store]
        E --> J[UI Mode Store]
    end
    
    subgraph "Data Layer"
        K[React Query] --> L[API Client]
        L --> M[Backend APIs]
    end
    
    subgraph "Intelligence Layer"
        N[Psych Adapter] --> O[UI Mode Engine]
        N --> P[Microcopy Engine]
        N --> Q[Fear Reframe Engine]
    end
    
    A --> E
    A --> K
    N --> E
    O --> A
