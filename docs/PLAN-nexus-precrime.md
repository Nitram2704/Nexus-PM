# PLAN: Nexus Pre-Crime (Predictive Simulation Module)

## 1. Objetivo
Permitir a los PMs realizar análisis de "Qué pasaría si..." (What-if analysis) mediante simulaciones basadas en IA y datos históricos.

---

## 2. Componentes

### 2.1 UI: Simulation Hub (`InsightsPage.tsx`)
- **Panel Lateral de Control:** Sliders para:
    - **Carga de Trabajo:** (+/- % tareas).
    - **Capacidad de Equipo:** (+/- % velocidad/puntos).
    - **Deadline:** Mover fecha meta.
- **Gráfico Comparativo:** Superponer "Estado Actual" vs "Escenario Simulado" (Burn Rhythm).
- **IA Prediction Banner:** Texto generado en tiempo real describiendo riesgos específicos del escenario.

### 2.2 Backend: Foresight Sandbox
- **[MODIFY] `ForesightEngine`:** Añadir método `simulate_sprint(params)` que no use datos reales sino multiplicadores basados en los parámetros de entrada.
- **[NEW] `SimulationView`:** API endpoint que recibe parámetros y devuelve el análisis comparativo.

### 2.3 IA Agent: The Oracle
- **Prompt Logic:** Inyectar el escenario simulado. La IA debe predecir cuellos de botella específicos (ej: "Si quitas un desarrollador, el QA se convertirá en un bloqueo crítico en la semana 3").

---

## 3. User Review Required
> [!IMPORTANT]
> **Modelo de Datos:** La simulación será puramente matemática basada en velocidad media. ¿Quieres que los cambios se puedan "guardar" como un escenario de referencia o solo sean volátiles?
> **Respuesta Sugerida:** Volátiles (Sandbox), con opción de exportar reporte.

---

## 4. Plan de Ejecución

### Fase 1: Motor de Simulación (Backend)
- [ ] **[MODIFY]** `backend/apps/intelligence/foresight.py`: Implementar lógica de simulación matemática.
- [ ] **[NEW]** `backend/apps/intelligence/views.py`: `SimulationView`.

### Fase 2: Nexus Insights Refactor (Frontend)
- [ ] **[MODIFY]** `frontend/src/pages/InsightsPage.tsx`: Integrar controles de simulación.
- [ ] **[NEW]** `frontend/src/components/intel/SimulationControls.tsx`.

### Fase 3: AI Oracle Integration
- [ ] **[MODIFY]** `backend/apps/intelligence/client.py`: Añadir método `get_simulation_analysis`.
- [ ] **[MODIFY]** `frontend/src/api/ai.ts`: Interface para simulación.

---

## 5. Verificación
1. **Stress Test:** Reducir capacidad al 10%. Verificar que el riesgo suba a "CRITICAL".
2. **AI Logic:** Verificar que la IA nombre a los desarrolladores más afectados en el reporte simulado.
