# PLAN: Intel & Analytics HUD (Phase 7)

## Goal
Transformar el "Operations Room" en un centro de mando dinámico y táctico (HUD) con métricas reales y alto rendimiento.

---

## Phase 1: Backend Foundation
- **[NEW]** `ProjectMetricSnapshot` model en `backend/apps/projects/models.py`.
- **[Lógica]** Función en `analytics.py` para calcular snapshots (Cycle Time, Throughput).
- **[API]** Endpoint `/api/v1/projects/[id]/analytics/hud/` que retorna el historial de snapshots.

## Phase 2: Frontend HUD Implementation
- **[UI]** Rediseño de `InsightsPage.tsx` con layout 2x2 tipo HUD.
- **[Comp]** `HUDChart.tsx` personalizado con Recharts (glow effect, line tension, no grids).
- **[Alerts]** Sistema de "Sector Blocked" basado en Cycle Time excedido.

## Phase 3: Integration & Testing
- **[Data]** Script de seed para poblar métricas históricas de demo.
- **[Tests]** Validar cálculos de Cycle Time en Backend.
- **[Audit]** Security scan y Lint audit.

---

## Agent Assignments
- `backend-specialist`: Modelos, lógica de cálculo y API.
- `frontend-specialist`: Dashboards, charts y estilos HUD.
- `test-engineer`: Pruebas unitarias de métricas y validación de API.
- `orchestrator`: Coordinación, reportes y auditoría final.
