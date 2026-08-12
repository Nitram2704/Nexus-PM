# Roadmap: Nexus-PM

> **Reconciled 2026-08-11** — este roadmap refleja el estado REAL del código, no el plan original de 2026-04-20.

## Overview

El proyecto está ~80% completo. El backend está prácticamente terminado (5 apps funcionales).
El frontend tiene todas las páginas principales pero le falta la UI de gestión de proyectos
(crear/editar/archivar/invitar miembros) y el export CSV. Las fases restantes son:
**Completion** (cerrar gaps de UI), **Stabilization** (tests, deps, lint), y **Delivery** (CI/CD, deploy, demo).

## Phases

- [x] **Phase 1: Foundation & Auth** — ✅ Backend 100%, Frontend 90% (falta UI de perfil)
- [x] **Phase 2: Project Management** — ✅ Backend 100%, ❌ Frontend 30% (falta UI CRUD)
- [x] **Phase 3: Backlog & Sprints** — ✅ Backend 100%, Frontend 90%
- [x] **Phase 4: Kanban Board** — ✅ Backend 100%, Frontend 95%
- [x] **Phase 5: AI Agent** — ✅ 100% + extras (foresight, simulaciones, orquestación)
- [x] **Phase 6: Notifications** — ✅ 100% (SSE incluido)
- [ ] **Phase 7: Reports & Polish** — ⚠️ 75% (falta CSV export, empty states)
- [ ] **Phase 8: Completion & Gap Closing** — ❌Nuevo: UI de proyectos, perfil, CSV
- [ ] **Phase 9: Stabilization** — ❌ Nuevo: deps, tests, lint, .env.example
- [ ] **Phase 10: Delivery & Demo** — ❌ Nuevo: CI/CD, deploy, seed data, demo prep

---

### Phase 7: Reports & Demo Polish (remanente)
**Goal**: Completar lo que falta del plan original de reportes.
**Status**: Parcialmente done — velocity, burndown y AI summary ya existen.

**Remaining:**
- [ ] **RPT-03**: Exportar backlog a CSV (backend endpoint + botón frontend)
- [ ] **UIX-04**: Empty states diseñados para vistas vacías
- [ ] **UIX-05**: Loading skeletons consistentes en todas las vistas

---

### Phase 8: Completion & Gap Closing
**Goal**: Cerrar los gaps de UI que bloquean la demo. El usuario debe poder usar la app de principio a fin sin tocar la API directamente.
**Depends on**: Phase 2 backend (ya existe)
**Priority**: 🔴 CRÍTICO — sin esto la app no es usable end-to-end

**Plans:**
- [ ] **08-01-PLAN.md** — UI de gestión de proyectos: página de listado de proyectos (grid), modal de creación, edición, archivado. Rutas en App.tsx.
- [ ] **08-02-PLAN.md** — UI de miembros: invitar miembros por email, vista de equipo, cambio de roles, remover miembros.
- [ ] **08-03-PLAN.md** — UI de perfil de usuario: editar nombre, bio, avatar. Página de settings.
- [ ] **08-04-PLAN.md** — Export CSV: endpoint backend `GET /projects/<id>/export-csv/` + botón en BacklogPage.

**Success Criteria:**
1. Un usuario nuevo puede registrarse, crear un proyecto, invitar miembros y generar un backlog con IA sin salir de la UI
2. El dashboard muestra todos los proyectos del usuario con acciones (abrir, editar, archivar)
3. El backlog se puede exportar a CSV con un click
4. El perfil de usuario se puede editar

---

### Phase 9: Stabilization
**Goal**: Hacer el proyecto instalable, testeable y libre de errores.
**Depends on**: Phase 8
**Priority**: 🟡 ALTO

**Plans:**
- [ ] **09-01-PLAN.md** — Fix dependencies: agregar `google-generativeai` a requirements.txt, verificar `pip install -r requirements.txt` en fresh venv
- [ ] **09-02-PLAN.md** — Tests: expandir suite backend (auth, projects, tasks, intelligence), agregar tests básicos de frontend (Vitest)
- [ ] **09-03-PLAN.md** — Lint & typecheck: `npm run lint` y `npm run build` sin errores en frontend, `python manage.py check` sin warnings
- [ ] **09-04-PLAN.md** — Environment: crear `.env.example` para backend y frontend, documentar setup en README
- [ ] **09-05-PLAN.md** — Commit hygiene: revisar y commitear cambios pendientes (notifications, tasks signals, Navbar, SettingsModal)

**Success Criteria:**
1. `pip install -r requirements.txt && python manage.py migrate && python manage.py runserver` funciona desde cero
2. `npm install && npm run build` compila sin errores
3. `python manage.py test` pasa con >60% de cobertura en lógica core
4. No hay cambios sin commitear

---

### Phase 10: Delivery & Demo
**Goal**: Preparar la aplicación para la presentación académica de 20 minutos.
**Depends on**: Phase 9
**Priority**: 🟢 NORMAL

**Plans:**
- [ ] **10-01-PLAN.md** — Seed data: comando `python manage.py seed_demo` que crea usuario demo, proyecto con backlog, sprint activo y tareas en el kanban
- [ ] **10-02-PLAN.md** — CI/CD: GitHub Actions workflow (lint + typecheck + tests en PR)
- [ ] **10-03-PLAN.md** — Deploy: configurar deploy en Vercel (frontend) + Render/Railway (backend) o alternativa local
- [ ] **10-04-PLAN.md** — Demo prep: script de la demo de 20 min, flujo happy-path verificado, fallbacks para AI sin API key

**Success Criteria:**
1. La app corre con un solo comando o está deployada en una URL pública
2. Hay un usuario demo con datos precargados
3. CI pasa en verde
4. El flujo de demo (registro → crear proyecto → generar backlog con IA → kanban → insights) funciona sin errores

---

## Progress

| Phase | Status | Notes |
|-------|--------|-------|
| 1. Foundation & Auth | ✅ Done | Falta UI de perfil (movido a Phase 8) |
| 2. Project Management | ⚠️ Backend done | Frontend UI movido a Phase 8 |
| 3. Backlog & Sprints | ✅ Done | Tags/historial descopeados a v2 |
| 4. Kanban Board | ✅ Done | WIP limits descopeados a v2 |
| 5. AI Agent | ✅ Done+ | Foresight, simulaciones, orquestación |
| 6. Notifications | ✅ Done | SSE incluido |
| 7. Reports & Polish | ⚠️ 75% | CSV export pendiente |
| 8. Completion | 🔲 Next | **Prioridad crítica** |
| 9. Stabilization | ⏳ Waiting | |
| 10. Delivery & Demo | ⏳ Waiting | |

## Execution Order

```
Phase 7 remanente (CSV export)
    └──▶ Phase 8 (Completion: UI proyectos, miembros, perfil)
              └──▶ Phase 9 (Stabilization: deps, tests, lint)
                        └──▶ Phase 10 (Delivery: seed, CI/CD, deploy, demo)
```

**Nota:** Phase 8 es el blocker principal. Sin UI de creación de proyectos,
un usuario nuevo no puede usar la app sin intervención manual en la API/admin.

## Descoped a v2 (verificado que no existen)

| Feature | Requirement | Razón |
|---------|-------------|-------|
| Etiquetas/tags en tareas | BKL-01 | No hay campo en el modelo, agregarlo requiere migración + UI |
| Historial de cambios | BKL-09 | Requiere modelo de auditoría nuevo |
| Límites WIP | KBN-04 | No hay campo wip_limit en Column |
| Verificación de email | AUTH-01 | Requiere flujo de email real |
| Avatar upload | AUTH-04 | Actualmente solo URLField |

---
*Roadmap reconciled: 2026-08-11*
