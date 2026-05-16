# PLAN: System Audit & Debugging (Stability Phase)

## Goal
Realizar un audit integral del sistema tras la implementación del Analytics HUD para asegurar la integridad de los datos, la estabilidad del frontend y la eliminación de ruidos técnicos (lints/warnings).

---

## Phase 1: Backend Integrity Audit
- **[Validation]** Verificar el cálculo de `cycle_time` en `analytics.py` con edge cases (tareas creadas y completadas el mismo día).
- **[Data Check]** Audit de la tabla `ProjectMetricSnapshot` para detectar duplicados o vacíos inusuales.
- **[Technical Debt]** Migrar/Actualizar `google.generativeai` a `google.genai` para eliminar el `FutureWarning`.

## Phase 2: Frontend Stability & UX
- **[Notifications]** Prueba de humo real: Disparar una notificación desde Django Admin y verificar recepción en el HUD.
- **[Performance]** Auditoría de re-renders en `InsightsPage.tsx` usando React DevTools (simulado).
- **[UI Polish]** Resolver los lints residuales en los archivos de la API.

## Phase 3: Automated Safety Net
- **[NEW] [Tests]** `backend/apps/projects/tests/test_analytics.py`: Tests unitarios para el motor de analíticas.
- **[NEW] [Tests]** `frontend/src/api/__tests__/notifications.test.ts`: Test simple para validar prefijos de URL.

---

## Agent Assignments
- `debugger`: Identificación de fallos lógicos en cálculos.
- `backend-specialist`: Refactor de librerías deprecated y optimización de DB.
- `frontend-specialist`: Optimización de renders y limpieza de lints.
- `test-engineer`: Creación de la suite de pruebas básica.

## Verification Checklist
- [ ] `FutureWarning` de Google AI eliminado.
- [ ] Notificaciones 200 OK (v1 prefix verificado).
- [ ] `cycle_time` no devuelve valores negativos o nulos erróneos.
- [ ] `npm run lint` retorna 0 errores en frontend.
