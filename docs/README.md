# docs/ — Planes históricos de implementación

> **Nota (2026-08-11):** Estos archivos son planes de implementación escritos DURANTE el desarrollo.
> La mayoría describen features que YA están implementadas. Se conservan como registro histórico.
> El plan activo y reconciliado está en `.planning/` (ver `.planning/ROADMAP.md`).

## Índice de planes y su estado real

| Plan | Feature | Estado |
|------|---------|--------|
| [PLAN-project-management-api.md](PLAN-project-management-api.md) | API de proyectos (Phase 2 backend) | ✅ Backend done. **Frontend UI falta → Phase 8** |
| [PLAN-task-management.md](PLAN-task-management.md) | Módulo de tareas / cards | ✅ Implementado |
| [PLAN-sprints-backlog.md](PLAN-sprints-backlog.md) | Sprints & backlog (Phase 3) | ✅ Implementado |
| [PLAN-dashboard-metrics.md](PLAN-dashboard-metrics.md) | Dashboard de métricas por proyecto | ✅ Implementado (InsightsPage) |
| [PLAN-personal-dashboard.md](PLAN-personal-dashboard.md) | Dashboard personal (home global) | ✅ Implementado (DashboardPage) |
| [PLAN-navbar.md](PLAN-navbar.md) | Top navbar + breadcrumbs | ✅ Implementado |
| [PLAN-ui-rework.md](PLAN-ui-rework.md) | UI/UX "Tactical OS" rework | ✅ Implementado (Tactical Midnight) |
| [PLAN-nexuschat.md](PLAN-nexuschat.md) | NexusChat asistente conversacional | ✅ Implementado |
| [PLAN-nexus-intelligence-hub.md](PLAN-nexus-intelligence-hub.md) | Intelligence Hub / chat global | ✅ Implementado |
| [PLAN-global-drawer.md](PLAN-global-drawer.md) | Global Command Drawer | ✅ Implementado |
| [PLAN-nexus-foresight.md](PLAN-nexus-foresight.md) | Foresight (predicción de riesgo) | ✅ Implementado |
| [PLAN-nexus-precrime.md](PLAN-nexus-precrime.md) | Pre-Crime (simulación what-if) | ✅ Implementado |
| [PLAN-ai-agent-orchestration.md](PLAN-ai-agent-orchestration.md) | Orquestación de agentes IA | ✅ Implementado |
| [PLAN-intel-analytics.md](PLAN-intel-analytics.md) | Intel & Analytics HUD | ✅ Implementado |
| [PLAN-realtime-notifications.md](PLAN-realtime-notifications.md) | Notificaciones en tiempo real | ✅ Implementado (SSE) |
| [PLAN-supabase-migration.md](PLAN-supabase-migration.md) | Migración híbrida Supabase | ⚠️ Parcial — Supabase integrado, realtime desactivado |
| [PLAN-system-audit.md](PLAN-system-audit.md) | System audit & debugging | ⚠️ Parcial — items pendientes movidos a Phase 9 |

## Planes activos (no están en esta carpeta)

El trabajo pendiente está en `.planning/phases/`:
- **Phase 8** — Completion: UI de proyectos, miembros, perfil, export CSV
- **Phase 9** — Stabilization: deps, tests, lint, env, commits
- **Phase 10** — Delivery: seed data, CI/CD, deploy, demo

Ver `.planning/ROADMAP.md` para el estado completo.
