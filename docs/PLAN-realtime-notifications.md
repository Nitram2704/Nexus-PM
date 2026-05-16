# Plan: Real-time Notifications Engine

## 🛑 Phase 0: Socratic Gate / Open Questions
Before we merge or execute this plan, please confirm the following:
1. **Transport Protocol:** Should we use WebSockets (e.g., `socket.io` or pure WS) or Server-Sent Events (SSE)? SSE is simpler for one-way notifications, but WebSockets allow for two-way (e.g., dismissing alerts from the client instantly).
2. **Persistence:** Do we need to store historical notifications in the database after they are dismissed, or just keep active alerts?

---

## 1. Overview
Implement a real-time notification engine for Nexus PM. This will power the NotificationBell in the Navbar, broadcasting AI risk alerts, kanban updates, and task assignments asynchronously to connected clients.

## 2. Project Type
**WEB** (Backend API + Frontend React)

## 3. Success Criteria
- [ ] Users receive a push event without refreshing when a relevant activity occurs.
- [ ] The `NotificationBell` displays an unread count and animates dynamically.
- [ ] Notifications can be dismissed (marked as read).
- [ ] AI alerts are correctly routed to the Operations Room / Dashboard state.

## 4. Tech Stack
- **Backend:** Node.js/Express (assuming backend is JS/TS) or Django/Python (depending on current stack - *Note: The Nexus PM seems to have Python in `backend/apps` based on recent open files*). So, **Python/Django Channels** or simply **SSE in Django**.
- **Frontend:** React, Zustand (store), TailwindCSS.

## 5. File Structure
```text
backend/
  apps/notifications/
    models.py       # Notification models (User, Type, IsRead)
    views.py        # SSE / WS Endpoints
    signals.py      # Hooks to trigger notifications on model save

frontend/
  src/
    components/notifications/   # UI components
    store/notificationStore.ts  # Zustand store for active notifications
    hooks/useRealtimeTasks.ts   # WS/SSE connection hook
```

## 6. Task Breakdown

### Task 1: Backend Notification Models & Signals
- **Agent:** `backend-specialist`
- **Skill:** `api-patterns`
- **INPUT:** Need a DB structure to save notifications and a Django signal to trigger them.
- **OUTPUT:** `models.py` with `Notification` model and `signals.py` for dispatch.
- **VERIFY:** Can create a Notification via Python shell and trigger the signal without errors.

### Task 2: Real-time Transport Layer (Backend)
- **Agent:** `backend-specialist`
- **Skill:** `api-patterns`
- **INPUT:** Need a way to push data to the frontend.
- **OUTPUT:** SSE stream endpoint or Channels WS consumer.
- **VERIFY:** Using `curl` or a test script connects to the stream and receives events.

### Task 3: Frontend Client Connection & Store
- **Agent:** `frontend-specialist`
- **Skill:** `react-patterns`, `fp-react`
- **INPUT:** Backend SSE/WS endpoint.
- **OUTPUT:** `notificationStore.ts` and connection hook that updates state on message.
- **VERIFY:** DevTools show Zustand state updating when a backend event is forced.

### Task 4: Notification UI & Bell Integration
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **INPUT:** Notification data in Zustand store.
- **OUTPUT:** Update `Navbar.tsx` and `NotificationBell.tsx` to handle dynamic unread count and dropdown list.
- **VERIFY:** Bell counter goes up, clicking it shows the list with "mark read" buttons.

## 7. Phase X: Verification
- [ ] Lint: ✅ Pass
- [ ] Security: ✅ No critical issues
- [ ] Build: ✅ Success
- [ ] Playwright / Manual test: Notifications appear across two browser windows automatically.
