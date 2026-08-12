# Nexus-PM — Agent Instructions

Full-stack project management app with AI Scrum Master. Django REST backend + React SPA frontend + Supabase.

## Architecture

- **Backend** (`backend/`): Django 5.1, DRF, SimpleJWT auth, SQLite (fallback) or PostgreSQL
- **Frontend** (`frontend/`): React 19, Vite 8, TypeScript 6, Tailwind CSS 4, Zustand state, TanStack Query
- **AI** (`backend/apps/intelligence/`): Google Gemma 4 integration — falls back to mock data when no API key
- **Supabase**: Supplementary auth + realtime on client side (not primary data store)

Backend apps: `accounts`, `projects`, `tasks`, `intelligence`, `notifications`

## Commands

### Backend (from `backend/`)

```bash
python manage.py migrate
python manage.py runserver
```

Requires a virtualenv: `python -m venv .venv` then activate it.

Backend `.env` variables:
- `SECRET_KEY`, `DEBUG=True`, `ALLOWED_HOSTS=localhost,127.0.0.1`
- `GOOGLE_API_KEY` (optional — mock mode if omitted)
- PostgreSQL vars optional — omit `DB_HOST` to use SQLite

### Frontend (from `frontend/`)

```bash
npm install
npm run dev        # Vite dev server on :5173
npm run build      # tsc -b && vite build
npm run lint       # eslint .
```

Frontend `.env` variables:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (defaults to `http://localhost:8000/api`)

## Key Conventions

### Path Alias

`@/` maps to `frontend/src/`. Use `@/components/...`, `@/store/...`, etc. — never relative `../../`.

### API Routing

- Vite proxies `/api` → `http://localhost:8000` (configured in `vite.config.ts`)
- `apiClient.ts` attaches JWT from Zustand store; auto-refreshes on 401
- Backend routes: `/api/auth/` (accounts), `/api/v1/` (projects, tasks, intelligence, notifications)

### Auth Flow

- JWT stored in `authStore` (Zustand + persist to localStorage as `nexus-auth`)
- `apiClient` handles token refresh automatically — never manually manage tokens
- `ProtectedRoute` / `GuestRoute` in `frontend/src/components/ProtectedRoute.tsx`

### Database

- Custom User model: `AUTH_USER_MODEL = "accounts.User"` — **User PK is an auto-increment INTEGER** (AbstractUser default)
- Project/Task/Sprint/Column/Member/Comment PKs are UUIDs; only `User` uses integer PK — don't assume `user_id` is a UUID
- `task_counter` on Project model generates sequential task IDs (e.g., NEX-1, NEX-2)
- Language: `es`, timezone: `America/Bogota`

### Design System

- "Tactical Midnight" aesthetic: dark bg (#020617), cyan accent (#22d3ee), zero border-radius
- Design tokens in `frontend/src/index.css` — use CSS variables, not hardcoded colors
- Fonts: Inter (sans), JetBrains Mono (mono)
- Utility classes: `.card-premium`, `.tactical-panel`, `.data-label`, `.text-gradient`
- Tailwind CSS 4 — uses `@import "tailwindcss"` (not v3 `@tailwind` directives)

### State Management

- Auth state: `useAuthStore` (Zustand with persist)
- Project state: `useProjectStore`
- Server state: TanStack Query hooks (staleTime 30s, retry 1)

## Testing

No formal test runner configured. Standalone test scripts in `backend/` (e.g., `test_ai_backlog.py`, `test_db.py`).

## Gotchas

- `psycopg2-binary` is commented out in requirements.txt — install manually if using PostgreSQL
- `google-generativeai` not in requirements.txt — install separately for AI features
- Backend uses `python-decouple` for env config, not `os.environ` directly
- CORS allows `localhost:5173` by default — update `CORS_ALLOWED_ORIGINS` for other ports
- Email backend is console-only (`console.EmailBackend`) — no real SMTP configured
