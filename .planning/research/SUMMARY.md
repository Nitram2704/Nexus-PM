# Research Summary: Nexus-PM

## Purpose

This document summarizes the research findings that informed the architectural and design decisions for Nexus-PM.

---

## 1. Competitive Analysis: PM Tools with AI

### Tools Analyzed

| Tool | AI Features | Pricing | Weakness for Us |
|------|------------|---------|-----------------|
| **Jira** | Atlassian Intelligence (summaries, auto-assign) | $8.15/user/mo | Bloated, slow, overkill for MVP demo |
| **Linear** | AI project updates, auto-labels | $8/user/mo | Closed ecosystem, no self-hosting |
| **Notion** | Notion AI (Q&A, summaries) | $10/user/mo | Not specialized for Scrum/Kanban |
| **ClickUp** | ClickUp AI (subtask gen, summaries) | $7/user/mo | Complex UI, steep learning curve |
| **Shortcut** | No AI | $8.50/user/mo | No AI differentiation |
| **Plane.so** | No AI (open source Jira clone) | Free (OS) | Good base but no AI agent |
| **Taiga** | No AI (open source, agile-focused) | Free (OS) | No AI, outdated UI |

### Our Differentiation
All existing tools treat AI as a **feature** (generate text, summarize). Nexus-PM treats AI as an **autonomous agent** (Scrum Master persona) that:
1. **Proactively** detects problems (not just when asked)
2. **Generates complete backlogs** from vague descriptions (not just individual stories)
3. **Chats contextually** with project data access (not just general conversation)
4. **Suggests priority reordering** with justification (not just random sorting)

---

## 2. Technology Research

### Frontend: React + Vite vs Next.js

| Factor | React + Vite | Next.js |
|--------|-------------|---------|
| Separation | ✅ Clean SPA, backend-agnostic | ❌ Tied to Node.js server |
| DX Speed | ✅ Vite HMR <100ms | ⚠️ Good but heavier |
| Django integration | ✅ Pure API client | ❌ Redundant server layer |
| Bundle size | ✅ Smaller | ⚠️ RSC overhead |
| SEO | ❌ SPA (not needed for PM tool) | ✅ SSR (overkill here) |

**Decision:** React + Vite. PM tools don't need SSR. Clean separation with Django API.

### Backend: Django vs FastAPI vs Express

| Factor | Django + DRF | FastAPI | Express |
|--------|-------------|---------|---------|
| ORM | ✅ Best-in-class | ❌ SQLAlchemy (more manual) | ❌ Need Prisma/Sequelize |
| Auth | ✅ Built-in + SimpleJWT | ⚠️ Manual | ⚠️ Passport.js |
| Admin panel | ✅ Free | ❌ None | ❌ None |
| Async tasks | ✅ Celery integration | ✅ Native async | ⚠️ Bull/BullMQ |
| Maturity | ✅ 18+ years | ⚠️ 5 years | ✅ 15 years |
| Ecosystem for PM | ✅ django-filter, permissions | ⚠️ Less tooling | ⚠️ Less tooling |

**Decision:** Django + DRF. Admin panel alone saves weeks. ORM handles complex relations.

### AI Provider: Claude vs GPT-4 vs Open Source

| Factor | Claude 3 (Anthropic) | GPT-4o (OpenAI) | Llama 3.1 (Local) |
|--------|---------------------|-----------------|-------------------|
| Structured output | ✅ Excellent | ✅ Good | ⚠️ Less reliable |
| Context window | ✅ 200K tokens | ✅ 128K tokens | ⚠️ 32K-128K |
| Pricing (MVP) | ✅ Haiku = $0.25/1M | ⚠️ $2.50/1M | ✅ Free (but GPU) |
| Follow instructions | ✅ Best | ✅ Good | ⚠️ Variable |
| API reliability | ✅ 99.9% | ✅ 99.9% | ❌ Self-hosted |
| Latency | ✅ 1-3s (Haiku) | ⚠️ 2-5s | ❌ 5-15s (CPU) |

**Decision:** Claude 3 Haiku for speed/cost. Claude 3 Sonnet for complex generation (backlogs).

### Drag & Drop: React Beautiful DnD vs dnd-kit vs Pragmatic DnD

| Factor | React Beautiful DnD | dnd-kit | @atlassian/pragmatic-drag-and-drop |
|--------|-------------------|---------|-----------------------------------|
| Maturity | ✅ Very mature | ✅ Modern | ⚠️ Newer |
| Kanban patterns | ✅ Built-in | ⚠️ Manual setup | ✅ Atlassian knows Kanban |
| Animations | ✅ Built-in fluid | ⚠️ Manual | ✅ Good |
| Accessibility | ✅ Excellent | ✅ Good | ✅ Good |
| Bundle size | ⚠️ 30KB | ✅ 15KB | ✅ 12KB |
| Documentation | ✅ Extensive examples | ✅ Good | ⚠️ Less |

**Decision:** React Beautiful DnD. Most proven for Kanban boards. Best documentation and examples.

---

## 3. Database Schema Research

### Core Entities

```
User (1) ──── (M) Member (M) ──── (1) Project
                                        │
                                   Sprint (M) ──── (M) Task
                                        │                │
                                   Column (M)        Comment (M)
                                                         │
                                                    Label (M-M)

Project (1) ──── (M) AIConversation ──── (M) AIMessage
Project (1) ──── (M) Notification
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Custom User model (AbstractUser) | Django best practice. Allows avatar, bio fields. |
| Member as join table (not ManyToMany) | Stores role, join_date per project-user pair |
| Task.order as float (not integer) | Allows insertion between items without reordering all |
| Column.wip_limit as nullable integer | NULL = no limit, integer = WIP restriction |
| Soft deletes (is_archived) | Projects and sprints are archived, not deleted |
| Sprint.status enum | 'planning', 'active', 'completed' — only 1 active per project |
| Task unique constraint | (project, number) — auto-incrementing per project |

---

## 4. AI Prompt Engineering Research

### Prompt Structure for User Story Generation

```
Sistema: Eres un Scrum Master experto. Generas historias de usuario en formato estándar.

Contexto del proyecto:
- Nombre: {project_name}
- Descripción: {project_description}
- Historias existentes: {existing_stories_summary}

Input del usuario: "{user_input}"

Genera 3-5 historias de usuario con este formato JSON:
[
  {
    "title": "Título corto y descriptivo",
    "description": "Como [rol], quiero [acción] para [beneficio]",
    "acceptance_criteria": ["Criterio 1", "Criterio 2", "Criterio 3"],
    "type": "story|bug|task",
    "priority": "critical|high|medium|low",
    "estimated_points": 1|2|3|5|8|13
  }
]
```

### Key Findings on AI for PM
1. **Structured JSON output** works best — Claude follows JSON schemas reliably
2. **Context injection** is critical — the AI needs project context to give useful output
3. **Rate limiting** needed — 10 AI calls/hour/user prevents abuse and cost spikes
4. **Async processing** mandatory — AI calls take 2-5s, must not block API

---

*Research completed: 2026-04-20*
