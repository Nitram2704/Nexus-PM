# Phase 5: AI Agent (Scrum Master)

**Status:** ✅ 100% + extras
**Requirements:** AIA-01 through AIA-06 (todos cumplidos)
**User Stories:** HU-22, HU-23, HU-24, HU-25, HU-26, HU-27

## Goal
El agente IA genera historias de usuario, estructura backlogs, da recomendaciones contextuales y responde preguntas en un chat integrado.

## Reality (verified 2026-08-11)
**Core (done):**
- [x] Generate user stories + backlog (AIA-01, AIA-02)
- [x] Recommendations panel (AIA-03)
- [x] Chat contextual por proyecto + chat global (AIA-04)
- [x] Priorización de backlog con IA (AIA-05)
- [x] Sprint AI summary (AIA-06)

**Extras beyond plan:**
- [x] Foresight engine (`foresight.py`) — predicción de riesgo de sprint
- [x] Simulation API (`/simulate/`) — what-if de capacidad/scope/deadline
- [x] Agent orchestration (`/orchestrate/`) — descomposición de épicas con threading
- [x] Proposed actions (human-in-the-loop) — EXEC_ACTION detection + confirmación
- [x] AIRecommendation model con status tracking

## Notes
- Usa Google Gemma 4, no Anthropic Claude (decisión cambiada durante implementación)
- Llamadas síncronas; solo orquestación usa threading
- Fallback a mock data sin GOOGLE_API_KEY
