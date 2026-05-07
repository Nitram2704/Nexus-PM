# Walkthrough: Nexus Command Center (NCC)

Implemented an integrated command center for Nexus-PM that combines rapid application control via slash commands with contextual AI assistance.

## Key Accomplishments

### 1. Tactical Command Parser
The chat widget detects commands starting with `/` to execute local actions without backend latency:
- `/tarea [X]`: Opens task creation modal with title preset to [X].
- `/intel`: Instant navigation to the Insights Dashboard.
- `/backlog [X]`: Navigates to Backlog and triggers AI Story Generator with prompt [X].
- `/kanban`: Returns to the project board.
- `/help`: Lists available tactical commands.

### 2. Context-Aware AI Chat
When no slash command is used, input is sent to the backend where the AI receives real-time project metrics:
- Active Sprint status.
- Task distribution (Total, In Progress, Completed).
- Assistant adopts a "Tactical Scrum Master" persona.

### 3. "Midnight Void" UI Aesthetic
Consistent with the **Nexus identity**:
- Floating terminal widget with glassmorphism and scanline overlays.
- JetBrains Mono typography with Cyan and Amber accents.
- Staggered animations for message entry.

## Technical Details

### Backend
- **Models**: `AIConversation` (session) and `AIMessage` (history).
- **Endpoint**: `ChatView` handles context building and multi-turn persistence.
- **Logic**: Injected prompt template for tactical brevity.

### Frontend
- **State**: `projectStore` updated to support "UI Triggers" (passing titles between components).
- **Component**: `NexusChat.tsx` manages both command execution and API communication.

## Verification Result
- [x] Command `/intel` navigates correctly.
- [x] Command `/tarea "Fix CSS"` opens modal with title.
- [x] Natural query "Status" returns AI project summary.
- [x] History persists after logout/login.
