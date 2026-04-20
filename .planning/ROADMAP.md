# Roadmap: Nexus-PM

## Overview

Nexus-PM se construye como un MVP de capas incrementales: primero la infraestructura base (scaffold, DB, auth), luego la gestión de proyectos y equipos, después el sistema de backlog y sprints, el tablero Kanban interactivo, el agente IA integrado, las notificaciones, y finalmente los reportes y polish final. Cada fase entrega funcionalidad independientemente testeable.

La fase 5 (Agente IA) es el **diferenciador clave** — el "wow factor" que separa a Nexus-PM de cualquier clon de Jira.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3...): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Auth** — Scaffold frontend (React+Vite) y backend (Django+DRF), DB schema, JWT auth, responsive shell
- [ ] **Phase 2: Project Management** — CRUD de proyectos, invitaciones, miembros, roles, dashboard de proyectos
- [ ] **Phase 3: Backlog & Sprints** — Ítems de backlog CRUD, sprints, asignaciones, estimaciones, drag & drop priorización
- [ ] **Phase 4: Kanban Board** — Tablero interactivo, drag & drop entre columnas, detalle de tarea, columnas configurables, dark theme
- [ ] **Phase 5: AI Agent (Scrum Master)** — Generación de historias, backlog automático, recomendaciones, chat contextual, priorización
- [ ] **Phase 6: Notifications** — Sistema de notificaciones in-app, alertas de sprint, preferencias
- [ ] **Phase 7: Reports & Demo Polish** — Velocity chart, burndown, export CSV, dashboard de proyecto, polish final

## Phase Details

### Phase 1: Foundation & Auth
**Goal**: Developer puede ejecutar frontend y backend localmente, autenticación funciona end-to-end, layout responsive base se renderiza
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, UIX-02
**Success Criteria** (what must be TRUE):
  1. `npm run dev` inicia el frontend React en `localhost:5173` sin errores
  2. `python manage.py runserver` inicia Django en `localhost:8000` sin errores
  3. PostgreSQL tiene las tablas: users, projects, members, sprints, tasks, columns, comments, notifications
  4. Un usuario puede registrarse, hacer login y obtener un JWT token
  5. El token permite acceder a endpoints protegidos
  6. Layout base renderiza con sidebar (desktop) y bottom nav (mobile)
  7. Las variables de entorno están cargadas desde `.env` (Django) y `.env.local` (React)
  8. CORS está configurado para permitir requests del frontend
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — React scaffold (Vite + Tailwind + TypeScript), estructura de carpetas, design tokens, layout shell
- [ ] 01-02-PLAN.md — Django scaffold (DRF + SimpleJWT), modelos de datos, serializers, migraciones
- [ ] 01-03-PLAN.md — Auth endpoints (register, login, refresh, reset password), frontend auth pages (Login, Register, Forgot Password)
- [ ] 01-04-PLAN.md — Perfil de usuario (editar nombre, avatar upload), gestión de roles, seed data

---

### Phase 2: Project Management
**Goal**: Un usuario puede crear proyectos, invitar miembros, ver un dashboard con todos sus proyectos, y gestionar la información del proyecto
**Depends on**: Phase 1
**Requirements**: PRJ-01, PRJ-02, PRJ-03, PRJ-04, PRJ-05, PRJ-06
**Success Criteria** (what must be TRUE):
  1. "Nuevo Proyecto" abre un formulario modal/página. Crear genera la clave automáticamente (ej: "Nexus" → "NEX")
  2. El creador se asigna como Owner del proyecto automáticamente
  3. Se pueden invitar miembros por email con rol por defecto Developer
  4. Dashboard muestra grid de proyectos con nombre, clave, miembros, tareas pendientes, última actividad
  5. Solo Owner y Admin pueden editar proyecto
  6. Archivar proyecto lo oculta del dashboard (soft delete con restore)
  7. Vista de miembros muestra avatar, nombre, rol, con capacidad de cambiar roles (Admin)
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — API de proyectos (CRUD), modelo Project, serializers, auto-generación de clave, permisos por rol
- [ ] 02-02-PLAN.md — Frontend: dashboard de proyectos (grid/list), crear/editar proyecto, archivar/restaurar
- [ ] 02-03-PLAN.md — Sistema de invitaciones (email), gestión de miembros, roles, vista de equipo

---

### Phase 3: Backlog & Sprints
**Goal**: El equipo puede crear ítems de backlog, organizarlos, crear sprints, asignar tareas y estimar con story points
**Depends on**: Phase 1, Phase 2
**Requirements**: BKL-01 through BKL-09
**Success Criteria** (what must be TRUE):
  1. Crear ítem de backlog con todos los campos: título, descripción (Markdown), tipo, prioridad, etiquetas, asignado, story points
  2. Backlog muestra lista ordenable con drag & drop (React Beautiful DnD). Orden persiste.
  3. Filtros funcionan: por tipo, prioridad, asignado, etiqueta, texto libre
  4. Crear sprint con nombre auto-incrementado, fechas, objetivo
  5. Solo 1 sprint activo por proyecto a la vez
  6. Drag & drop de ítems del backlog al sprint planning
  7. Finalizar sprint: ítems "Hecho" se archivan, incompletos se reubican
  8. Story points visibles en sprint planning (total asignado vs capacidad)
  9. Editar ítem muestra historial de cambios y permite comentarios
**Plans**: 4 plans

Plans:
- [ ] 03-01-PLAN.md — API de backlog: modelo Task completo (tipo, prioridad, etiquetas, story points), CRUD endpoints, ordenamieto
- [ ] 03-02-PLAN.md — Frontend backlog: vista de lista, crear/editar ítem modal, Markdown preview, filtros avanzados
- [ ] 03-03-PLAN.md — API de sprints: modelo Sprint (fechas, objetivo, estado), crear/finalizar sprint, asignar ítems
- [ ] 03-04-PLAN.md — Frontend sprints: sprint planning board, drag & drop backlog→sprint, capacidad, historial de cambios, comentarios

---

### Phase 4: Kanban Board
**Goal**: Tablero Kanban interactivo con drag & drop, detalle de tarea inline, columnas personalizables. UI dark mode premium.
**Depends on**: Phase 1, Phase 3
**Requirements**: KBN-01 through KBN-06, UIX-01, UIX-03
**Success Criteria** (what must be TRUE):
  1. Tablero muestra columnas del sprint activo con tarjetas
  2. Drag & drop de tarjetas entre columnas actualiza estado en la BD
  3. Click en tarjeta abre panel lateral/modal con detalle completo sin salir del tablero
  4. Se pueden agregar, renombrar, reordenar y eliminar columnas
  5. Límite WIP por columna — se resalta visualmente cuando se excede
  6. Filtros: por asignado, tipo, prioridad, etiqueta. Búsqueda rápida.
  7. Dark mode "command center" aplicado en toda la UI
  8. Animaciones suaves: drag, entrada stagger, transiciones, loading skeletons
**Plans**: 3 plans

Plans:
- [ ] 04-01-PLAN.md — API de columnas: CRUD, reordenamiento, límite WIP. API de tareas: actualizar estado vía drag
- [ ] 04-02-PLAN.md — Frontend Kanban board: columnas, tarjetas, React Beautiful DnD, panel lateral de detalle
- [ ] 04-03-PLAN.md — Dark mode theme, glassmorphism, micro-animations, responsive polish, loading & empty states

---

### Phase 5: AI Agent (Scrum Master)
**Goal**: El agente IA genera historias de usuario, estructura backlogs, da recomendaciones contextuales y responde preguntas en un chat integrado
**Depends on**: Phase 3
**Requirements**: AIA-01 through AIA-06
**Success Criteria** (what must be TRUE):
  1. El usuario escribe un párrafo y el agente genera 3-5 historias de usuario formateadas
  2. Al crear un proyecto, el usuario puede describir el producto y el agente genera un backlog de 10-20 ítems
  3. Panel de recomendaciones muestra insights contextuales del sprint (progreso, bloqueos, carga)
  4. Chat funcional dentro del proyecto — el agente responde con contexto del backlog y sprint
  5. El agente sugiere un reorden de prioridades del backlog con justificación
  6. Al finalizar sprint, se genera resumen ejecutivo automático con métricas y recomendaciones
  7. Las llamadas a IA se procesan async vía Celery sin bloquear la API
  8. Rate limiting: max 10 llamadas IA por usuario por hora
**Plans**: 4 plans

Plans:
- [ ] 05-01-PLAN.md — Celery + Redis setup, Anthropic Claude client, prompt templates, task queue para IA
- [ ] 05-02-PLAN.md — API de generación: endpoint para historias de usuario, generación de backlog, priorización automática
- [ ] 05-03-PLAN.md — Chat contextual: modelo AIConversation, endpoint de chat, contexto del proyecto inyectado al prompt
- [ ] 05-04-PLAN.md — Frontend IA: panel de historias generadas (aprobar/editar/descartar), chat widget, panel de recomendaciones

---

### Phase 6: Notifications
**Goal**: Los usuarios reciben notificaciones in-app para eventos relevantes y pueden configurar sus preferencias
**Depends on**: Phase 1, Phase 3
**Requirements**: NTF-01 through NTF-04
**Success Criteria** (what must be TRUE):
  1. Bell icon en el header muestra badge con contador de notificaciones no leídas
  2. Dropdown/panel muestra lista de notificaciones con ícono, mensaje, timestamp, leída/no leída
  3. Notificación automática al ser asignado a una tarea
  4. Alerta cuando un sprint está a 2 días de vencer con tareas incompletas
  5. Notificación cuando el agente IA genera recomendaciones
  6. Settings del usuario tiene toggles por tipo de notificación
**Plans**: 2 plans

Plans:
- [ ] 06-01-PLAN.md — API de notificaciones: modelo Notification, triggers automáticos, endpoints (list, mark read, preferences)
- [ ] 06-02-PLAN.md — Frontend notificaciones: bell icon + dropdown, notification list, settings panel, polling

---

### Phase 7: Reports & Demo Polish
**Goal**: Dashboard de métricas del proyecto, charts de velocity y burndown, exportación, polish final para la demo
**Depends on**: Phase 3, Phase 4
**Requirements**: RPT-01 through RPT-04, UIX-04, UIX-05, UIX-06
**Success Criteria** (what must be TRUE):
  1. Velocity chart muestra story points completados por sprint (últimos 5)
  2. Burndown chart muestra progreso del sprint activo (ideal vs real)
  3. Exportar backlog genera un CSV descargable
  4. Dashboard de proyecto muestra KPIs resumen
  5. Empty states diseñados para cada vista vacía
  6. Toast notifications para todas las acciones (éxito/error)
  7. Loading skeletons en todas las vistas de datos
  8. La aplicación es demo-ready: flujo completo sin errores
**Plans**: 3 plans

Plans:
- [ ] 07-01-PLAN.md — API de reportes: endpoints para velocity, burndown, KPIs, exportación CSV
- [ ] 07-02-PLAN.md — Frontend reportes: velocity chart (Recharts), burndown chart, dashboard KPIs, export button
- [ ] 07-03-PLAN.md — Demo polish: empty states, toast system, error boundaries, final responsive testing, seed data de demo

---

## Progress

**Execution Order:**
Phases are mostly sequential, with some parallelization possible.

```
Phase 1 (Foundation + Auth)
    └──▶ Phase 2 (Projects)
              └──▶ Phase 3 (Backlog & Sprints)
                        ├──▶ Phase 4 (Kanban Board)
                        ├──▶ Phase 5 (AI Agent)
                        └──▶ Phase 6 (Notifications)
                                  └──▶ Phase 7 (Reports & Demo)
```

**Note:** Phases 4, 5, and 6 can be partially parallelized (different domains), but Phase 7 depends on all previous phases.

| Phase | Plans | Plans Complete | Status | Completed |
|-------|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 4 | 0/4 | 🔲 Next | — |
| 2. Project Management | 3 | 0/3 | ⏳ | — |
| 3. Backlog & Sprints | 4 | 0/4 | ⏳ | — |
| 4. Kanban Board | 3 | 0/3 | ⏳ | — |
| 5. AI Agent (Scrum Master) | 4 | 0/4 | ⏳ | — |
| 6. Notifications | 2 | 0/2 | ⏳ | — |
| 7. Reports & Demo Polish | 3 | 0/3 | ⏳ | — |
| **Total** | **23** | **0/23** | | |

---
*Roadmap defined: 2026-04-20*
