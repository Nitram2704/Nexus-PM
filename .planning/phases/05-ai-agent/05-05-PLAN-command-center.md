---
phase: 05-ai-agent
plan: 05
type: execute
wave: 13
depends_on: [05-03, 05-04]
files_modified:
  - backend/apps/intelligence/models.py
  - backend/apps/intelligence/views.py
  - backend/apps/intelligence/urls.py
  - frontend/src/components/ai/NexusChat.tsx
  - frontend/src/components/layout/MainLayout.tsx
  - frontend/src/api/ai.ts
  - frontend/src/store/projectStore.ts
autonomous: true

must_haves:
  truths:
    - "Floating chat widget visible in all protected routes"
    - "Slash commands (/tarea, /intel, /backlog, /kanban) execute local actions"
    - "Natural language queries send to backend and return AI response"
    - "Chat UI follows Tactical Terminal aesthetic (JetBrains Mono, Cyan/Amber accents)"
---

# Plan 05-05: Nexus Command Center (NCC)

## Objective
Implement a floating command-line interface (chatbot) that serves as the "Agile Command Center" hub. It integrates local app control via slash commands and contextual AI assistance.

## Tasks

### Task 1: Backend Chat Persistence & Logic
1. `apps/intelligence/models.py`:
   - `AIConversation`: project, user, created_at.
   - `AIMessage`: conversation, role (user/assistant), content, created_at.
2. `apps/intelligence/views.py`:
   - `ChatView`:
     - POST `/api/v1/intelligence/projects/{id}/chat/`
     - Save user message.
     - Call Gemini with project context.
     - Save assistant message.
     - Return response.
   - `ChatHistoryView`: GET history for project convo.
3. `apps/intelligence/urls.py`:
   - Register endpoints.

### Task 2: Frontend API & Store
1. `api/ai.ts`:
   - `chatApi`: `sendMessage`, `getHistory`.
2. `store/projectStore.ts`:
   - Add actions for global UI triggers (e.g., `openTaskModalWithTitle`, `setSearchTerm`).

### Task 3: NexusChat Component Implementation
1. `components/ai/NexusChat.tsx`:
   - Floating bubble bottom-right.
   - Expandable terminal menu.
   - Input field with command auto-completion UI (CSS only for now).
   - Message list with terminal scroll effect.
   - Style: Glassmorphism + heavy Cyan/Amber scanline effect.
2. `CommandParser.ts` (helper):
   - Regex for `/` commands.
   - Map:
     - `/tarea (.*)` -> store.openTaskModal($1)
     - `/intel` -> navigate('/insights')
     - `/kanban` -> navigate('/kanban')
     - `/backlog (.*)` -> openAISuggestion($1)

### Task 4: Layout Integration
1. `components/layout/MainLayout.tsx`:
   - Import and render `NexusChat`.

## Verification
1. Open chat -> Type `/intel` -> App navigates to Insights.
2. Type `/tarea Nueva fix` -> Task creation modal opens with "Nueva fix".
3. Type "Resumen del proyecto" -> AI returns summary using context.
