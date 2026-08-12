# Phase 3: Backlog & Sprints

**Status:** ✅ Backend 100% / Frontend 90%
**Requirements:** BKL-01 through BKL-09
**User Stories:** HU-11, HU-12, HU-13, HU-14, HU-15, HU-16

## Goal
El equipo puede crear ítems de backlog, organizarlos, crear sprints, asignar tareas y estimar con story points.

## Reality (verified 2026-08-11)
- [x] Task model completo (type, priority, story_points, acceptance_criteria, order, completed_at, ai_assignee)
- [x] Task CRUD + `/move/` action
- [x] Sprint model con validación de 1 sprint activo
- [x] Sprint `/start/`, `/complete/` (con manejo de tareas incompletas)
- [x] BacklogPage con drag & drop (@hello-pangea/dnd), filtros, sprint planning
- [x] Story points visibles
- [ ] Etiquetas/tags — modelo Task NO tiene campo tags (descopeado a v2)
- [ ] Historial de cambios de tarea (BKL-09) — no implementado (descopeado a v2)
