---
phase: 06-notifications
plan: 01
type: execute
wave: 15
depends_on: [05-06]
files_modified:
  - backend/apps/notifications/models.py
  - backend/apps/notifications/views.py
  - backend/apps/notifications/urls.py
  - backend/apps/tasks/signals.py
autonomous: true

must_haves:
  truths:
    - "Model stores: user, content, type (assignment, alert, update), is_read, link"
    - "Signals trigger notifications on Task create/save"
    - "API allows marking as read and bulk fetching"
---

# Plan 06-01: Notification API & Triggers

## Objective
Establish the foundation for the notification system.

## Tasks

### Task 1: Notification Model (Backend)
1. Create `backend/apps/notifications` app (if not exists).
2. Define `Notification` model:
   - `id`: UUID.
   - `user`: ForeignKey to User.
   - `type`: ChoiceField (task_assigned, task_moved, custom_alert).
   - `title`: CharField.
   - `content`: TextField.
   - `link`: CharField (URL to navigate).
   - `is_read`: Boolean.
   - `created_at`: DateTime.

### Task 2: Automated Triggers (Signals)
1. `apps/tasks/signals.py`:
   - Create post_save signal for `Task`.
   - If `assignee` changed, create Task Assigned notification for the assignee.
   - If `column` changed, create notification for the project owner/assignee.

### Task 3: API Endpoints
1. `apps/notifications/views.py`:
   - `NotificationListView`: GET user notifications.
   - `NotificationReadView`: POST mark as read.
2. Register in `notifications/urls.py` and global `urls.py`.

## Verification
1. Run migrations.
2. Assign a task to a user via admin or API.
3. Check `notifications/` endpoint: entry exists for the user.
