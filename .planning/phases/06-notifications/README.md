# Phase 6: Notifications

**Status:** ✅ 100%
**Requirements:** NTF-01 through NTF-04 (todos cumplidos)
**User Stories:** HU-28, HU-29, HU-30

## Goal
Los usuarios reciben notificaciones in-app para eventos relevantes y pueden configurar sus preferencias.

## Reality (verified 2026-08-11)
- [x] Notification model con tipos (task_assigned, task_moved, task_comment, custom_alert, expiration)
- [x] NotificationBell en el header
- [x] Stream SSE (`/stream/`) — mejor que el polling planeado originalmente
- [x] Settings de notificaciones (SettingsModal) con toggles por tipo
- [x] Triggers automáticos vía signals (tasks/signals.py)
- [x] Sprint expiration check (management command `check_sprint_expiration`)

## Notes
- Se implementó SSE en lugar del polling del plan original
- Supabase realtime está integrado pero desactivado (código comentado en KanbanPage)
