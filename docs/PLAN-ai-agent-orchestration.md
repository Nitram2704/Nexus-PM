# Plan: AI Agent Orchestration (Agency Agents Integration)

## 🛑 Phase 0: Socratic Gate / Open Questions
Antes de pasar a `@[/create]`, por favor aclara estos puntos de diseño:
1. **Grado de Autonomía:** ¿Queremos que los agentes (ej: `UI Designer`, `Backend Architect`) creen directamente las tareas en la base de datos (Kanban) o preferimos que generen un borrador ("Proposed") que requiere aprobación humana?
2. **Arquitectura:** ¿Estos agentes vivirán en `apps/intelligence/client.py` como diferentes prompts/clases, o se conectarán a servidores MCP (Model Context Protocol) externos?
3. **Roles en DB:** ¿Debemos crear "usuarios" fantasma en la tabla de usuarios para representar a estos agentes, de modo que puedan ser asignados visualmente a las tareas en el frontend?

---

## 1. Overview
Integrar el ecosistema de agentes especializados (Agency Agents) en Nexus PM. Esto permitirá que cuando se alimente una historia de usuario ("Epic"), un panel de agentes de diferentes disciplinas (Ingeniería, Diseño) analice la historia, debata y produzca automáticamente los tickets de trabajo individuales para poblar el Backlog/Kanban.

## 2. Project Type
**WEB / BACKEND** (Énfasis en la lógica del Backend en Django y un pequeño ajuste en la UI).

## 3. Success Criteria
- [ ] Existe un endpoint que coordina la comunicación secuencial/paralela entre múltiples agentes IA.
- [ ] Los tickets de trabajo (Tasks) son generados basándose en los resultados de la orquestación.
- [ ] En la UI, los agentes pueden aparecer como "Asignados" o "Revisores".
- [ ] Notificaciones SSE despachan eventos cuando un agente termina su análisis.

## 4. Tech Stack
- **Django Backend:** Ampliación de `apps/intelligence/client.py`.
- **Integraciones:** Google GenAI SDK (para invocar a los modelos Gemini bajo distintas "System Instructions" de agentes).
- **Frontend React:** Añadir a la interfaz del Backlog un botón tipo "Ask Agents" o "Run Agent Orchestration".

## 5. File Structure
```text
backend/
  apps/intelligence/
    agents/                  # Nueva carpeta organizando a los agentes individuales
      __init__.py
      orchestrator.py        # Controlador maestro
      frontend_expert.py     # Prompt y lógica para el frontend
      backend_expert.py      # Prompt y lógica para el backend
      pm_expert.py           # Agente de producto (divide épicas)

frontend/
  src/
    components/intelligence/
      AgentOrchestrationPanel.tsx  # Modal o panel lateral para lanzar la IA
```

## 6. Task Breakdown

### Task 1: Refactor UI & Models para Agentes Fantasma
- **Agent:** `database-architect`
- **Skill:** `database-schema`
- **INPUT:** Necesitamos que un Agente pueda ser dueño o participante de un ticket.
- **OUTPUT:** Crear usuarios falsos (is_agent=True) o un modelo `AIAgent` separado y modificar el modelo `Task` permitiendo "AI assignee".
- **VERIFY:** En la DB se puede asignar a un "Bot Backend" a un ticket.

### Task 2: Master Orchestrator Client
- **Agent:** `backend-specialist`
- **Skill:** `api-patterns`
- **INPUT:** Un motor que corra llamadas LLM en cadena (PM -> Backend/Frontend).
- **OUTPUT:** `orchestrator.py` en la app `intelligence` que maneja el paso a paso comunicándose con el SDK de Google GenAI.
- **VERIFY:** Ejecutar un test en `test_ai_backlog.py` que devuelva un array complejo segmentado por disciplina.

### Task 3: Integración con Notificaciones (Motor SSE)
- **Agent:** `backend-specialist`
- **Skill:** `event-driven`
- **INPUT:** La orquestación es lenta, necesitamos avisarle al usuario cuando termine.
- **OUTPUT:** Inyectar una llamada al modelo `Notification` usando el hook de la Fase 06.
- **VERIFY:** Levantar una orquestación en background, y ver el Bell animándose en el front-end cuando termine.

### Task 4: UI de Lanzamiento "Ops-Room"
- **Agent:** `frontend-specialist`
- **Skill:** `react-patterns`
- **INPUT:** Endpoint `/api/intelligence/orchestrate/`
- **OUTPUT:** Componente en el Kanban/Backlog para trigger la orquestación visualizando qué agente está "pensando".
- **VERIFY:** Al hundir el botón arranca un loader y la campana notifica al completarse.

## 7. Phase X: Verification
- [ ] Backend: Unit tests de orquestación corriendo correctamente.
- [ ] Mocks: Interacciones a la API GenAI controladas correctamente para no gastar tokens.
- [ ] Frontend: Comportamiento visual de "Agents thinking...".
