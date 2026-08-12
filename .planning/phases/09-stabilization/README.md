# Phase 9: Stabilization

**Status:** ⏳ Waiting
**Plans:** 0/5 completed
**Requirements:** Transversal (no mapeado a HU específicos)

## Goal
Hacer el proyecto instalable, testeable y libre de errores. Que un desarrollador nuevo
pueda clonar, instalar y correr todo sin errores.

## Why
- `google-generativeai` falta en requirements.txt → fresh install rompe las features IA
- Solo hay 1 archivo de tests (`projects/tests/test_analytics.py`)
- Hay cambios sin commitear que deben revisarse
- No hay `.env.example` → setup confuso

## Plans
- [ ] 09-01-PLAN.md — Fix dependencies (google-generativeai, fresh install verification)
- [ ] 09-02-PLAN.md — Tests (backend auth/projects/tasks/intelligence + frontend Vitest)
- [ ] 09-03-PLAN.md — Lint & typecheck limpio
- [ ] 09-04-PLAN.md — .env.example + README setup
- [ ] 09-05-PLAN.md — Commit hygiene (revisar y commitear cambios pendientes)

## Success Criteria
1. `pip install -r requirements.txt && python manage.py migrate && python manage.py runserver` funciona desde cero
2. `npm install && npm run build` compila sin errores
3. `python manage.py test` pasa con cobertura razonable en lógica core
4. No hay cambios sin commitear
