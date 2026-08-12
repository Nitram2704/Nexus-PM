# Project State

## Project Reference

See: .planning/PROJECT.md (reconciled 2026-08-11)

**Core value:** Un Product Owner describe requisitos en lenguaje natural y el Agente IA genera historias de usuario, prioriza el backlog y ofrece recomendaciones. El equipo gestiona sprints en un tablero Kanban con drag & drop.
**Current focus:** Fase de Finalización — completar gaps de UI y preparar la demo.

## Current Position

Phase: 8 — Completion & Gap Closing (ver ROADMAP.md)
Status: Funcionalidad core completa. Faltan features de UI y estabilización.
Last activity: 2026-08-11 — auditoría completa del codebase vs planificación.

Progress: [▓▓▓▓▓▓▓▓░░] ~80%

## Reality Check (auditoría 2026-08-11)

El plan original (`.planning/ROADMAP.md` de 2026-04-20) decía "Phase 1 Next, 0/23 planes".
**La realidad:** el backend está ~95% completo y el frontend ~80%. El proyecto avanzó
mucho más allá de lo registrado en los documentos de planificación.

### Lo que SÍ está implementado (verificado en código)

**Backend (5 apps, migraciones commiteadas):**
- `accounts`: registro, login con rate limiting (LoginAttempt), password reset, /me, dashboard personal, JWT con blacklist
- `projects`: CRUD completo, invite, analytics, hud_analytics, velocity, columnas (reorder, clear, move_all, reorder_tasks)
- `tasks`: CRUD, move, sprints (start/complete/burndown/AI summary), comments
- `intelligence`: generate-backlog, generate-user-stories, import-proposal, chat (+history), orchestrate (threading), foresight, simulate, prioritize, recommendations, proposed-actions
- `notifications`: list, mark-read, bulk-read, stream SSE, settings

**Frontend:**
- Páginas: Dashboard, Kanban (1013 líneas), Backlog, Insights, Login, Register, ForgotPassword, ResetPassword
- AI: BacklogGenerator, AIChatDrawer, NexusChat, RecommendationsPanel, AIPrioritizationModal
- Reports: VelocityReport, BurndownChart, SprintAISummary
- Intel: GlobalCommandDrawer, SimulationControls, ActionConfirmationHub, ForesightPanel
- Notifications: NotificationBell + SettingsModal
- Kanban: TaskDetailDrawer, ColumnMenu, AISuggestionModal, AgentOrchestrationModal, ConfirmDialog

### Lo que FALTA (gaps verificados)

**Críticos (bloquean la demo):**
1. **UI de creación de proyectos** — no hay `createProjectApi` ni página/modal para crear proyectos. El usuario no puede crear un proyecto desde la UI. (PRJ-01)
2. **UI de listado de proyectos** — solo mini-cards en dashboard. No hay página de proyectos con grid completo. (PRJ-03)
3. **UI de edición/archivado de proyectos** — API existe, sin frontend. (PRJ-04, PRJ-05)
4. **UI de invitación de miembros** — endpoint `/invite/` existe, sin frontend. (PRJ-02, PRJ-06)

**Importantes:**
5. **Exportar backlog a CSV** — sin backend ni frontend. (RPT-03)
6. **Editar perfil de usuario** — sin UI. (AUTH-04)
7. **`google-generativeai` no está en requirements.txt** — un fresh install rompe las features IA
8. **Cambios sin commitear** — notifications (models/serializers/urls/views), tasks signals, requirements.txt, Navbar modificados; SettingsModal.tsx untracked

**Menores / polish:**
9. **Etiquetas/tags en tareas** — el modelo Task no tiene campo tags. (BKL-01 parcial)
10. **Historial de cambios de tarea** — no implementado. (BKL-09)
11. **Límites WIP por columna** — el modelo Column no tiene wip_limit. (KBN-04)
12. **Verificación de email post-registro** — no implementada. (AUTH-01)
13. **Tests** — solo `projects/tests/test_analytics.py`. Sin tests de frontend.
14. **CI/CD** — no existe ningún workflow
15. **`.env.example`** — no existe para backend ni frontend
16. **Empty states y loading skeletons** — parcial

## Performance Metrics

**By Phase (estado real):**

| Phase | Backend | Frontend | Status |
|-------|---------|----------|--------|
| 1. Foundation & Auth | ✅ 100% | ⚠️ 90% (falta perfil) | Casi done |
| 2. Project Management | ✅ 100% | ❌ 30% (falta UI CRUD) | **Gap crítico** |
| 3. Backlog & Sprints | ✅ 100% | ✅ 90% | Casi done |
| 4. Kanban Board | ✅ 100% | ✅ 95% | Casi done |
| 5. AI Agent | ✅ 100%+ | ✅ 95% | Done + extras |
| 6. Notifications | ✅ 100% | ✅ 95% | Done |
| 7. Reports & Polish | ⚠️ 80% (falta CSV) | ⚠️ 70% | Parcial |

## Accumulated Context

### Key Decisions (reales, no las del plan original)

- **Frontend Stack:** React 19 + Vite 8 + Tailwind CSS 4 + TypeScript 6. Zustand 5. TanStack Query 5.
- **Backend Stack:** Django 5.1 + DRF + SimpleJWT (blacklist + rotación).
- **Database:** SQLite por defecto (fallback cuando no hay DB_HOST). PostgreSQL opcional.
- **AI:** Google Gemma 4 vía `google-generativeai`. Fallback a mock sin API key.
- **Async:** Llamadas IA síncronas. `threading.Thread` solo para orquestación de épicas. NO hay Celery/Redis.
- **Drag & Drop:** @hello-pangea/dnd (fork de react-beautiful-dnd).
- **Charts:** Recharts 3.
- **Realtime:** SSE para notificaciones. Supabase realtime desactivado (código comentado).
- **Design:** "Tactical Midnight" — dark bg #020617, cyan #22d3ee, zero border-radius, JetBrains Mono.

### Blockers/Concerns

- `google-generativeai` falta en requirements.txt — instalar manualmente
- `psycopg2-binary` comentado — solo si se usa PostgreSQL
- Email backend es console-only — los links de reset van a la consola del servidor
- CORS hardcodeado a `localhost:5173` por defecto
- Hay cambios sin commitear que deben revisarse y commitearse

## Session Continuity

Last session: 2026-08-11
Stopped at: Auditoría completa. ROADMAP actualizado con fases de finalización. Listo para ejecutar Phase 8 (Completion).
