# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-20)

**Core value:** Un Product Owner describe requisitos en lenguaje natural y el Agente IA genera historias de usuario, prioriza el backlog y ofrece recomendaciones. El equipo gestiona sprints en un tablero Kanban con drag & drop.
**Current focus:** Phase 1 — Foundation & Auth

## Current Position

Phase: 1 — Foundation & Auth (Ready to Begin)
Plan: 0 of 23 total plans across all phases
Status: Planning complete. Ready to begin Phase 1.
Last activity: 2026-04-20 — project planning, requirements documentation, and roadmap definition.

Progress: [▓▓▓░░░░░░░] 30%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Execution strategy: Sequential phases (Current focus on Phase 3: Backlog & Sprints)
- Result: Backend infrastructure for Sprints and Tasks completed.

**By Phase:**

| Phase | Plans | Status |
|-------|-------|--------|
| 1. Foundation & Auth | 1/4 | ▓ In Progress |
| 2. Project Management | 1/3 | ✅ Done |
| 3. Backlog & Sprints | 1/4 | ▓ In Progress (BE ✅) |
| 4. Kanban Board | 0/3 | ⏳ Waiting |
| 5. AI Agent (Scrum Master) | 0/4 | ⏳ Waiting |
| 6. Notifications | 0/2 | ⏳ Waiting |
| 7. Reports & Demo Polish | 0/3 | ⏳ Waiting |

## Accumulated Context

### Key Decisions

- **Frontend Stack:** React 18 + Vite + Tailwind CSS + TypeScript. Zustand for global state. TanStack Query for server state.
- **Backend Stack:** Django 5 + Django REST Framework + SimpleJWT for auth.
- **Database:** PostgreSQL (local)
- **AI:** Anthropic Claude API via Celery async tasks
- **Drag & Drop:** React Beautiful DnD for Kanban and backlog
- **Charts:** Recharts for velocity/burndown charts
- **Auth:** JWT (access + refresh tokens) via SimpleJWT
- **Async Tasks:** Celery + Redis for AI processing
- **Notifications:** In-app polling (no WebSockets in v1)
- **Design:** Dark mode "command center" aesthetic. No purple/violet.

### User Stories Catalog (from captures)

| ID | Title | Module | Priority |
|----|-------|--------|----------|
| HU-01 | Registro con correo y contraseña | Autenticación | Alta |
| HU-02 | Inicio de sesión con credenciales | Autenticación | Alta |
| HU-03 | Recuperación de contraseña por correo | Autenticación | Alta |
| HU-04 | Editar perfil de usuario | Autenticación | Media |
| HU-05 | Gestionar roles del equipo | Autenticación | Media |
| HU-06 | Crear nuevo proyecto | Proyectos | Alta |
| HU-07 | Invitar miembros al proyecto | Proyectos | Alta |
| HU-08 | Ver listado de proyectos en dashboard | Proyectos | Alta |
| HU-09 | Editar información del proyecto | Proyectos | Media |
| HU-10 | Archivar proyecto finalizado | Proyectos | Baja |
| HU-11 | Crear ítems en el backlog manualmente | Backlog | Alta |
| HU-12 | Crear sprints y asignar ítems | Backlog | Alta |
| HU-13 | Priorizar ítems del backlog | Backlog | Alta |
| HU-14 | Filtrar el backlog | Backlog | Media |
| HU-15 | Finalizar sprint y mover ítems | Backlog | Media |
| HU-16 | Agregar estimaciones (story points) | Backlog | Baja |
| HU-17 | Ver tablero Kanban del sprint activo | Kanban | Alta |
| HU-18 | Mover tarjetas entre columnas | Kanban | Alta |
| HU-19 | Ver detalle de tarea desde tablero | Kanban | Alta |
| HU-20 | Personalizar columnas del tablero | Kanban | Media |
| HU-21 | Filtrar tarjetas del tablero | Kanban | Baja |
| HU-22 | Generar historias de usuario con IA | Agente IA | Alta |
| HU-23 | Generar backlog inicial automáticamente | Agente IA | Alta |
| HU-24 | Recibir recomendaciones del agente | Agente IA | Alta |
| HU-25 | Chat con el agente dentro del proyecto | Agente IA | Media |
| HU-26 | Sugerencia de priorización del backlog | Agente IA | Media |
| HU-27 | Resumen ejecutivo del sprint con IA | Agente IA | Baja |
| HU-28 | Notificación al ser asignado a una tarea | Notificaciones | Media |
| HU-29 | Alerta de sprint próximo a vencer | Notificaciones | Media |
| HU-30 | Configurar preferencias de notificaciones | Notificaciones | Baja |
| HU-31 | Reporte de velocidad del equipo | Reportes | Media |
| HU-32 | Burndown chart del sprint activo | Reportes | Media |
| HU-33 | Exportar backlog a CSV | Reportes | Baja |

### Pending Todos / Next Steps

- Begin Phase 1 implementation
- Scaffold React + Vite frontend project
- Scaffold Django + DRF backend project
- Design and deploy PostgreSQL schema
- Implement JWT authentication end-to-end

### Blockers/Concerns

- Anthropic Claude API: need API key (free tier or credits for academic use)
- PostgreSQL: must be installed locally
- Redis: needed for Celery workers (Phase 5)
- CORS configuration between React (5173) and Django (8000)
- Email sending for password reset: may use console backend for dev

## Session Continuity

Last session: 2026-04-20
Stopped at: Planning documentation complete. Ready for Phase 1 execution.
