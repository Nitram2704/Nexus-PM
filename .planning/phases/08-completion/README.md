# Phase 8: Completion & Gap Closing

**Status:** 🔲 Next — PRIORIDAD CRÍTICA
**Plans:** 0/4 completed
**Requirements:** PRJ-01, PRJ-02, PRJ-03, PRJ-04, PRJ-05, PRJ-06, AUTH-04, RPT-03
**User Stories:** HU-06, HU-07, HU-08, HU-09, HU-10, HU-04, HU-33

## Goal
Cerrar los gaps de UI que bloquean la demo. El usuario debe poder usar la app de principio a fin sin tocar la API directamente. El backend para todo esto YA existe — es trabajo casi 100% de frontend.

## Why Critical
Sin UI de creación de proyectos, un usuario nuevo no puede usar la app sin intervención manual en `/admin` o la API. Este es el único gap que rompe el flujo end-to-end.

## Plans
- [ ] 08-01-PLAN.md — UI de gestión de proyectos: listado (grid), crear, editar, archivar
- [ ] 08-02-PLAN.md — UI de miembros: invitar por email, vista de equipo, roles, remover
- [ ] 08-03-PLAN.md — UI de perfil de usuario: editar nombre, bio, avatar
- [ ] 08-04-PLAN.md — Export CSV: endpoint backend + botón en BacklogPage

## Success Criteria
1. Usuario nuevo puede registrarse, crear un proyecto, invitar miembros y generar backlog con IA sin salir de la UI
2. El dashboard muestra todos los proyectos del usuario con acciones (abrir, editar, archivar)
3. El backlog se puede exportar a CSV con un click
4. El perfil de usuario se puede editar

## Available Backend (ya implementado, no tocar)
- `POST /api/v1/projects/` — crear proyecto
- `GET /api/v1/projects/` — listar proyectos del usuario
- `PATCH /api/v1/projects/<id>/` — editar
- `DELETE /api/v1/projects/<id>/` — eliminar
- `POST /api/v1/projects/<id>/invite/` — invitar miembro (email + role)
- `GET /api/auth/me/` — perfil actual
- Project model tiene `is_archived` para soft-delete
