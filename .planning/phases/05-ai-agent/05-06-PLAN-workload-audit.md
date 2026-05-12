---
phase: 05-ai-agent
plan: 06
type: execute
wave: 14
depends_on: [05-05]
files_modified:
  - backend/apps/intelligence/views.py
  - backend/apps/intelligence/client.py
  - frontend/src/components/ai/NexusChat.tsx
autonomous: true

must_haves:
  truths:
    - "AI responds to 'audit workload' or similar keywords with data-driven summary"
    - "Context builder includes per-user task counts and state (In Progress / Overdue)"
    - "AI provides specific re-assignment recommendations"
    - "Markdown formatting for analytical tables in chat"
---

# Plan 05-06: AI Workload Audit (NCC v2)

## Objective
Transform Nexus AI into a proactive advisor by feeding it deep analytical data about team workload and project bottlenecks.

## Tasks

### Task 1: Enhanced Analytical Context (Backend)
1. `apps/intelligence/views.py`:
   - Extend `_build_context` to calculate:
     - Tasks per user (assigned_to).
     - Cycle time estimates (if data exists).
     - Count of tasks past due date (if field exists).
     - Column distribution (Bottleneck detection).
2. `apps/intelligence/client.py`:
   - Update `System Prompt` to specifically handle "Audit Request" mode.
   - Instruct AI to look for imbalances in workload.

### Task 2: NLP Intent Detection (Frontend/Backend)
1. Detect natural language triggers in `NexusChat.tsx` (e.g. "cómo va el equipo", "auditoría").
2. Ensure backend recognizes these as high-priority analytical queries.

### Task 3: UI Polish for Reports
1. Ensure `NexusChat.tsx` renders Markdown tables/lists correctly (using react-markdown if installed, or raw formatting).
2. Add "Audit Mode" visual indicator in chat when analyzing.

## Verification
1. Type "Audit team workload" in NCC.
2. AI returns table with: User | Tasks | Status.
3. AI identifies if one user has 2x more tasks than others.
4. AI suggests moving tasks to free members.
