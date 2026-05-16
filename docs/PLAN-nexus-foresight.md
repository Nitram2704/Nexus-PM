# PLAN: Nexus Foresight (Predictive Project Management)

Implementación de un motor de predicción proactivo que analice el ritmo de trabajo y la carga del equipo para alertar sobre riesgos de incumplimiento en el Sprint.

## Contexto y Alcance
Nexus Foresight transforma los datos pasivos del "Insights HUD" en alertas accionables. El sistema evaluará el "Burn Rhythm" vs. el tiempo restante del Sprint para calcular un índice de riesgo.

- **Foco**: Salud del Sprint y sobrecarga de miembros.
- **Visualización**: Indicadores tácticos en Kanban/Backlog + HUD detallado.

---

## Criterios de Éxito
- [ ] Cálculo dinámico del "Risk Index" por Sprint.
- [ ] Alertas visuales (Cyan/Amber/Red) en el Kanban Board.
- [ ] Detección de "Member Burnout" (más de 5 tareas activas).
- [ ] Endpoint de IA que proporcione una breve explicación del riesgo detectado.

---

## Tech Stack
- **Backend**: Django REST Framework + `google-genai` (Gemma 4).
- **Frontend**: React (Zustand para estado de foresight) + Lucide Icons.
- **Data Viz**: CSS-driven risk rings y colores de estado.

---

## Estructura de Archivos (Propuesta)
```text
backend/apps/intelligence/
├── foresight.py            # Lógica de cálculo de riesgo
└── views.py                # Nuevo endpoint /foresight/
frontend/src/
├── hooks/
│   └── useForesight.ts     # Hook para fetching y lógica de UI
├── components/
│   └── feedback/
│       └── RiskBadge.tsx   # Componente de alerta visual
└── store/
    └── foresightStore.ts   # Estado global de predicciones
```

---

## Plan de Ejecución

### Fase 1: Backend Foundation (P0)
**Agente**: `backend-specialist` | **Skill**: `api-patterns`

1. **[ ] Implementar Foresight Engine**: Crear `foresight.py` con lógica para comparar `completed_points` vs `ideal_burndown`.
   - **Verification**: Tests unitarios con diferentes escenarios de retraso.
2. **[ ] Endpoint de Predicción IA**: Integrar consulta a Gemma 4 para generar una frase corta de recomendación (p. ej: "Increase velocity by 10% to meet deadline").
   - **Verification**: `POST /api/v1/intelligence/foresight/` retorna JSON con risk_level y recomendación.

### Fase 2: Store & Logic Frontend (P1)
**Agente**: `frontend-specialist` | **Skill**: `zustand-store-ts`

1. **[ ] Zustand Foresight Store**: Manejar el estado global de alertas para evitar refetching innecesario.
   - **Verification**: Store accesible desde cualquier componente.
2. **[ ] Hook `useForesight`**: Lógica para determinar qué color de alerta mostrar basado en el índice de riesgo.

### Fase 3: UI Táctica (P2)
**Agente**: `frontend-specialist` | **Skill**: `frontend-design`

1. **[ ] Risk Indicators en Kanban**: Añadir un pequeño badge de riesgo en la cabecera del Sprint y en tarjetas con alto tiempo de permanencia.
   - **Verification**: El badge cambia de color (Cyan -> Amber -> Red).
2. **[ ] HUD de Riesgo en Insights**: Añadir un "Risk Panel" que resuma los motivos del retraso proyectado.

---

## Fase X: Verificación Final
- [ ] **Lint**: `npm run lint`
- [ ] **Security**: `python .agent/scripts/security_scan.py .`
- [ ] **UX Audit**: Verificar legibilidad de los colores de alerta sobre el fondo oscuro (Midnight Void).
- [ ] **E2E**: Simular un Sprint retrasado y verificar que la alerta roja aparece.

---

## ✅ Recomendación de Agentes
- **Backend**: `@backend-specialist` para el motor matemático.
- **Frontend**: `@frontend-specialist` para la integración visual "Cyber UI".
