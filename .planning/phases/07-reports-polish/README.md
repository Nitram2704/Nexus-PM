# Phase 7: Reports & Demo Polish

**Status:** ⚠️ 75% — velocity/burndown/AI summary done, falta CSV export y polish
**Requirements:** RPT-01 through RPT-04, UIX-04, UIX-05, UIX-06
**User Stories:** HU-31, HU-32, HU-33

## Goal
Dashboard de métricas del proyecto, charts de velocity y burndown, exportación, polish final para la demo.

## Reality (verified 2026-08-11)
- [x] Velocity chart (VelocityReport.tsx + `/velocity/` endpoint)
- [x] Burndown chart (BurndownChart.tsx + `/burndown/` endpoint)
- [x] Sprint AI summary (SprintAISummary.tsx + `/summary/` endpoint)
- [x] InsightsPage con analytics HUD, simulation, action confirmation
- [x] Toast notifications (react-hot-toast)
- [ ] **Exportar backlog a CSV (RPT-03)** — sin backend ni frontend → movido a Phase 8 (08-04)
- [ ] Empty states consistentes (UIX-04) — parcial
- [ ] Loading skeletons consistentes (UIX-05) — parcial
