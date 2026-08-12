# Phase 2: Project Management

**Status:** ✅ Backend 100% / ❌ Frontend 30%
**Requirements:** PRJ-01, PRJ-02, PRJ-03, PRJ-04, PRJ-05, PRJ-06
**User Stories:** HU-06, HU-07, HU-08, HU-09, HU-10

## Goal
Un usuario puede crear proyectos, invitar miembros, ver un dashboard con todos sus proyectos, y gestionar la información del proyecto.

## Reality (verified 2026-08-11)
**Backend (done):**
- [x] ProjectViewSet CRUD, auto Owner assignment, key generation
- [x] `/invite/` action (invita usuarios existentes por email)
- [x] `/analytics/`, `/hud_analytics/`, `/velocity/` actions
- [x] ColumnViewSet con reorder, clear_tasks, move_all, reorder_tasks
- [x] Permisos por rol (IsProjectMember, IsProjectOwnerOrAdmin)

**Frontend (gap crítico):**
- [ ] Página de listado de proyectos (grid completo)
- [ ] Modal de creación de proyecto
- [ ] UI de edición / archivado
- [ ] UI de invitación y gestión de miembros
- [x] Solo mini-cards de proyectos en DashboardPage

> ⚠️ **Todo el frontend faltante se movió a Phase 8 (08-01, 08-02).**
