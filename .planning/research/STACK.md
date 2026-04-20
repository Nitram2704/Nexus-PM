# Stack: Nexus-PM

## Core

| Technology | Purpose | Why This One |
|-----------|---------|-------------|
| **React 18** | Frontend SPA | Component-based, massive ecosystem, ideal for interactive UIs (Kanban, drag & drop) |
| **Vite** | Build tool | Fastest dev server, HMR instantáneo, mejor DX que CRA/Webpack |
| **TypeScript** | Type safety | Catches bugs early, better autocompletion, mandatory for professional projects |
| **Django 5** | Backend framework | Battle-tested, ORM potente, admin panel gratis, auth built-in, DRF ecosystem |
| **Django REST Framework** | API framework | Serializers, viewsets, permissions, throttling — todo lo que necesitamos |
| **PostgreSQL** | Database | Relaciones complejas, full-text search, JSON fields, concurrencia, industry standard |
| **Tailwind CSS** | Styling | Utility-first, rapid prototyping, dark mode, consistent design language |

## State Management & Data Fetching

| Technology | Purpose | Why This One |
|-----------|---------|-------------|
| **Zustand** | Global state (frontend) | Minimal boilerplate vs Redux, simple API, TypeScript-native, smaller bundle |
| **TanStack Query** | Server state | Auto-caching, background refetch, mutations, optimistic updates. Ideal para SPA + REST API |

## UI Libraries

| Technology | Purpose | Why This One |
|-----------|---------|-------------|
| **React Beautiful DnD** | Drag & drop | Mature, accessible, smooth animations. For Kanban board and backlog reordering |
| **Framer Motion** | Animations | Production-grade, React-native, stagger animations, layout transitions |
| **Lucide React** | Icons | Lightweight, consistent, tree-shakeable, modern icon set |
| **Recharts** | Charts | React-native charting (velocity, burndown). Lighter than Chart.js, simpler API |
| **React Markdown** | Markdown render | For task descriptions with rich formatting |
| **React Hot Toast** | Notifications | Lightweight, beautiful toast notifications, accessible |

## Authentication

| Technology | Purpose | Why This One |
|-----------|---------|-------------|
| **SimpleJWT** | JWT tokens | Django-native JWT. Access + Refresh tokens. Stateless auth for SPA. |
| **django-cors-headers** | CORS | Required for React (5173) ↔ Django (8000) cross-origin requests |

## AI & Async

| Technology | Purpose | Why This One |
|-----------|---------|-------------|
| **Anthropic Claude API** | AI engine | Superior text generation, structured output, competitive pricing. Claude 3 Haiku for speed. |
| **Celery** | Task queue | Django-native async. AI calls take 2-5s — can't block the API request. |
| **Redis** | Message broker | Fast, reliable broker for Celery. Also usable for caching later. |

## Dev & Quality

| Technology | Purpose | Why This One |
|-----------|---------|-------------|
| **npm** | Package manager (frontend) | Standard for React projects |
| **pip + venv** | Package manager (backend) | Standard for Django. requirements.txt for deps. |
| **ESLint + Prettier** | Linting & formatting | Standard JS/TS tooling |
| **Black + isort** | Python formatting | Django community standard |
| **clsx + tailwind-merge** | Class management | Conditional Tailwind classes without conflicts |
| **Axios** | HTTP client | Better API than fetch for SPA. Interceptors for JWT token refresh. |

## Project Structure

```
Nexus PM/
├── .planning/               # Planning docs (this directory)
├── .agent/                  # Antigravity Kit config
│
├── frontend/                # React SPA
│   ├── src/
│   │   ├── main.tsx         # Entry point
│   │   ├── App.tsx          # Router setup
│   │   ├── api/             # API client (Axios instances, endpoints)
│   │   │   ├── client.ts    # Axios instance with JWT interceptors
│   │   │   ├── auth.ts      # Auth endpoints
│   │   │   ├── projects.ts  # Projects endpoints
│   │   │   ├── tasks.ts     # Tasks/backlog endpoints
│   │   │   └── ai.ts        # AI agent endpoints
│   │   ├── components/
│   │   │   ├── ui/          # Reusable UI primitives (Button, Modal, Card, etc.)
│   │   │   ├── layout/      # Shell, Sidebar, Header, BottomNav
│   │   │   ├── auth/        # LoginForm, RegisterForm, ForgotPassword
│   │   │   ├── projects/    # ProjectCard, ProjectForm, MemberList
│   │   │   ├── backlog/     # BacklogItem, BacklogList, SprintPlanning
│   │   │   ├── kanban/      # KanbanBoard, KanbanColumn, KanbanCard, TaskDetail
│   │   │   ├── ai/          # ChatWidget, StoryGenerator, RecommendationPanel
│   │   │   ├── reports/     # VelocityChart, BurndownChart, KPICard
│   │   │   └── notifications/ # NotificationBell, NotificationList
│   │   ├── hooks/           # Custom hooks (useAuth, useProject, useDragDrop)
│   │   ├── stores/          # Zustand stores (authStore, projectStore, uiStore)
│   │   ├── pages/           # Route pages
│   │   │   ├── auth/        # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── dashboard/   # ProjectsDashboard
│   │   │   ├── project/     # ProjectDetail (tabs: Backlog, Board, Reports, Settings)
│   │   │   └── settings/    # UserSettings, NotificationPreferences
│   │   ├── lib/             # Utilities
│   │   │   ├── utils.ts     # cn(), formatDate(), etc.
│   │   │   └── constants.ts # Enums, config values
│   │   └── types/           # TypeScript interfaces
│   │       ├── auth.ts
│   │       ├── project.ts
│   │       ├── task.ts
│   │       └── api.ts
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.local           # API_URL, etc.
│
├── backend/                 # Django API
│   ├── manage.py
│   ├── nexuspm/             # Django project config
│   │   ├── settings.py      # DB, CORS, JWT, Celery, etc.
│   │   ├── urls.py          # Root URL config
│   │   ├── celery.py        # Celery app config
│   │   └── wsgi.py
│   ├── accounts/            # App: Auth & Users
│   │   ├── models.py        # Custom User model
│   │   ├── serializers.py   # User, Register, Login serializers
│   │   ├── views.py         # Auth viewsets
│   │   ├── urls.py
│   │   └── permissions.py   # Custom permissions
│   ├── projects/            # App: Projects & Members
│   │   ├── models.py        # Project, Member
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── permissions.py   # IsOwner, IsAdmin, IsMember
│   ├── boards/              # App: Backlog, Sprints, Tasks, Columns
│   │   ├── models.py        # Sprint, Task, Column, Comment, Label
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── signals.py       # Auto-create default columns on sprint
│   ├── intelligence/        # App: AI Agent
│   │   ├── models.py        # AIConversation, AIMessage
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── tasks.py         # Celery tasks (generate_stories, generate_backlog, chat)
│   │   ├── prompts.py       # Prompt templates for Claude
│   │   └── client.py        # Anthropic API client wrapper
│   ├── notifications/       # App: Notifications
│   │   ├── models.py        # Notification, NotificationPreference
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── signals.py       # Auto-notify on task assign, sprint deadline
│   └── reports/             # App: Analytics & Reports
│       ├── views.py         # Velocity, burndown, export endpoints
│       ├── serializers.py
│       └── urls.py
│
├── docker-compose.yml       # PostgreSQL + Redis (optional, for easy setup)
├── requirements.txt         # Python dependencies
└── README.md
```

## Dependency Decisions

| Decision | Rationale |
|----------|-----------|
| React + Vite over Next.js | Separación limpia front/back. Django maneja SSR si se necesita. Vite es más rápido. |
| Django over FastAPI | ORM completo, admin panel, auth integrado, ecosistema maduro para PM tools |
| SimpleJWT over Session auth | SPA necesita tokens stateless. Refresh tokens para persist session. |
| Zustand over Redux | Menos boilerplate (~70% menos código), API minimal, tipado excelente |
| TanStack Query over SWR | Mutations, optimistic updates, cache invalidation — más features para CRUD pesado |
| React Beautiful DnD over dnd-kit | Más maduro, mejor documentado, animations built-in |
| Celery over Django background tasks | Industry standard, Redis broker, monitoring con Flower |
| Claude over GPT-4 | Mejor en seguir instrucciones estructuradas, input/output más largo, pricing similar |
| PostgreSQL over MySQL | JSON fields nativos, full-text search, Django ORM optimizado para Postgres |
| Recharts over Chart.js | React-native, declarative API, more idiomatic with React components |
| Axios over fetch | Interceptors (JWT refresh), request cancellation, error handling built-in |

## API Architecture

```
Backend API (Django REST Framework)
├── /api/v1/auth/
│   ├── POST   /register/          # Create account
│   ├── POST   /login/             # Get JWT tokens
│   ├── POST   /token/refresh/     # Refresh access token
│   ├── POST   /password-reset/    # Request reset email
│   ├── POST   /password-reset/confirm/  # Set new password
│   └── GET/PUT /profile/          # User profile
│
├── /api/v1/projects/
│   ├── GET    /                    # List user's projects
│   ├── POST   /                    # Create project
│   ├── GET    /{id}/               # Project detail
│   ├── PUT    /{id}/               # Update project
│   ├── DELETE /{id}/               # Archive project
│   ├── POST   /{id}/invite/       # Invite member
│   ├── GET    /{id}/members/      # List members
│   └── PUT    /{id}/members/{uid}/ # Update member role
│
├── /api/v1/projects/{pid}/backlog/
│   ├── GET    /                    # List backlog items
│   ├── POST   /                    # Create item
│   ├── GET    /{id}/               # Item detail
│   ├── PUT    /{id}/               # Update item
│   ├── DELETE /{id}/               # Delete item
│   ├── POST   /reorder/           # Reorder backlog (drag & drop)
│   └── GET    /export/csv/        # Export to CSV
│
├── /api/v1/projects/{pid}/sprints/
│   ├── GET    /                    # List sprints
│   ├── POST   /                    # Create sprint
│   ├── GET    /{id}/               # Sprint detail
│   ├── PUT    /{id}/               # Update sprint
│   ├── POST   /{id}/start/        # Start sprint
│   ├── POST   /{id}/complete/     # Complete sprint
│   └── POST   /{id}/assign/       # Assign items to sprint
│
├── /api/v1/projects/{pid}/board/
│   ├── GET    /                    # Get board (columns + cards)
│   ├── POST   /columns/           # Create column
│   ├── PUT    /columns/{id}/      # Update column
│   ├── DELETE /columns/{id}/      # Delete column
│   ├── POST   /columns/reorder/   # Reorder columns
│   └── POST   /cards/move/        # Move card between columns
│
├── /api/v1/projects/{pid}/ai/
│   ├── POST   /generate-stories/  # Generate user stories from text
│   ├── POST   /generate-backlog/  # Generate full backlog from description
│   ├── POST   /suggest-priorities/ # AI priority suggestion
│   ├── POST   /sprint-summary/    # Generate sprint summary
│   ├── GET    /recommendations/   # Get contextual insights
│   ├── POST   /chat/              # Send message to AI agent
│   └── GET    /chat/history/      # Get chat history
│
├── /api/v1/notifications/
│   ├── GET    /                    # List notifications
│   ├── POST   /mark-read/         # Mark notification(s) as read
│   ├── GET    /preferences/       # Get notification preferences
│   └── PUT    /preferences/       # Update preferences
│
└── /api/v1/reports/{pid}/
    ├── GET    /velocity/           # Velocity chart data
    ├── GET    /burndown/           # Burndown chart data
    └── GET    /dashboard/          # Project KPIs
```

---
*Stack defined: 2026-04-20*
