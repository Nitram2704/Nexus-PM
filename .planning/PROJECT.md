# Nexus-PM: Tablero Ágil con Agente Autónomo Integrado

## What This Is

Una aplicación web de gestión de proyectos de software — similar a Jira — que permite a los equipos crear y administrar proyectos, sprints, backlogs y tareas desde una sola plataforma. A diferencia de las herramientas tradicionales, integra un **agente de inteligencia artificial** que actúa como Scrum Master: automatiza la generación de historias de usuario desde requerimientos vagos, estructura el backlog automáticamente, detecta cuellos de botella en el flujo de trabajo, y actualiza el estado de los tickets interpretando lenguaje natural a través de un chat integrado.

## Core Value

Un Product Owner describe en lenguaje natural los requisitos de un proyecto y el Agente IA genera automáticamente las historias de usuario, las prioriza y las coloca en el backlog. El equipo arrastra tarjetas en un tablero Kanban, el agente detecta cuellos de botella, y cualquier miembro puede chatear con el agente para obtener recomendaciones contextuales sobre el sprint activo.

## Requirements

### Validated

(None yet — build to validate)

### Active

> Estado real verificado 2026-08-11. ✅ = implementado, ⚠️ = parcial, ❌ = falta.

**Autenticación & Usuarios**
- [x] Registro de usuarios con correo y contraseña
- [x] Inicio de sesión con credenciales (con rate limiting)
- [x] Recuperación de contraseña por correo (console backend)
- [ ] Editar perfil de usuario ❌ (sin UI)
- [x] Gestionar roles del equipo (Owner, Admin, Developer, Viewer)

**Gestión de Proyectos**
- [x] Crear nuevo proyecto (API ✅, sin UI ❌)
- [ ] Invitar miembros al proyecto (API ✅, sin UI ❌)
- [ ] Ver listado de proyectos en un dashboard ⚠️ (solo mini-cards en dashboard personal)
- [ ] Editar información del proyecto (API ✅, sin UI ❌)
- [ ] Archivar proyecto finalizado (API ✅, sin UI ❌)

**Backlog & Sprints**
- [x] Crear ítems en el backlog manualmente
- [x] Crear sprints y asignar ítems del backlog
- [x] Priorizar ítems del backlog (drag & drop + priorización IA)
- [ ] Filtrar ítems del backlog por etiquetas/prioridad ⚠️ (filtros básicos, sin etiquetas/tags)
- [x] Finalizar sprint y mover ítems incompletos
- [x] Agregar estimaciones (story points)

**Tablero Kanban**
- [x] Ver tablero Kanban del sprint activo
- [x] Mover tarjetas entre columnas (drag & drop)
- [x] Ver detalle de tarea desde el tablero (drawer lateral)
- [x] Personalizar columnas del tablero (crear, renombrar, reordenar, eliminar)
- [x] Filtrar tarjetas del tablero (texto + "mis tareas")

**Agente IA (Scrum Master)**
- [x] Generar historias de usuario con IA desde texto libre
- [x] Generar backlog inicial automáticamente
- [x] Recibir recomendaciones contextuales del agente
- [x] Chat con el agente dentro del proyecto (+ chat global)
- [x] Sugerencia de priorización del backlog
- [x] Resumen ejecutivo del sprint con IA
- [x] Extras: Foresight, simulaciones, orquestación de agentes, acciones propuestas (human-in-the-loop)

**Notificaciones**
- [x] Notificación al ser asignado a una tarea
- [x] Alerta de sprint próximo a vencer (management command)
- [x] Configurar preferencias de notificaciones (SettingsModal)
- [x] Stream SSE de notificaciones en tiempo real

**Reportes**
- [x] Reporte de velocidad del equipo (VelocityReport)
- [x] Burndown chart del sprint activo (BurndownChart)
- [ ] Exportar backlog a CSV ❌ (sin backend ni frontend)
- [x] Dashboard de métricas (InsightsPage con analytics HUD)

### Out of Scope (MVP)

- Integración con GitHub/GitLab (repos, commits, PRs)
- Integración con Slack/Discord
- Aplicación móvil nativa
- Facturación / planes de pago
- Multi-idioma (solo español en v1)
- Videoconferencia integrada
- Modo offline / PWA
- Time tracking avanzado
- Wikis / documentación de proyecto

## Context

- **Architecture:** React 19 (Vite 8) SPA + Django 5.1 REST Framework API. SQLite por defecto (fallback), PostgreSQL opcional.
- **AI Agent:** Google Gemma 4 (`google-generativeai`) para generación de historias, backlog, recomendaciones, chat, foresight y simulaciones. Fallback a mock data sin API key.
- **State Management:** Zustand 5 para estado global del frontend, TanStack Query 5 para server state.
- **Drag & Drop:** @hello-pangea/dnd (fork mantenido de react-beautiful-dnd) para Kanban y backlog.
- **Async Tasks:** Llamadas IA síncronas en el request. Solo orquestación de épicas usa `threading.Thread` (no hay Celery/Redis).
- **Realtime:** SSE (Server-Sent Events) para notificaciones vía `NotificationStreamView`. Supabase integrado en cliente pero el realtime está desactivado (código comentado en KanbanPage).
- **Data Model:** Users, Projects, Members, Sprints, Tasks, Columns, Comments, AIProposals, AIConversations, AIMessages, ProposedActions, AIRecommendations, Notifications, NotificationSettings, ProjectMetricSnapshots, LoginAttempts.
- **Presentation:** El MVP targets una demo de gestión de proyectos ágil con IA integrada.

## Constraints

- **Cost:** $0 en infraestructura — SQLite local, Google AI con free tier o créditos
- **Time:** Proyecto académico — MVP scope only
- **Platform:** Windows dev machine, cualquier navegador moderno
- **Stack:** React + Vite (frontend) + Django + DRF (backend). Separación clara front/back.
- **Complexity:** Debe ser demostrable en una presentación de 20 minutos

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Vite sobre Next.js | Separación limpia frontend/backend. Django maneja todo el server-side. | ✅ Implementado |
| Django + DRF como backend | Battle-tested, ORM potente, auth built-in, admin panel gratis | ✅ Implementado |
| Google Gemma 4 como IA | ~~Anthropic Claude~~ — se cambió a Gemma 4 durante implementación | ✅ Implementado |
| Llamadas IA síncronas + threading | ~~Celery + Redis~~ — simplificado: sync en request, thread solo para orquestación | ✅ Implementado |
| SQLite con fallback desde PostgreSQL | ~~PostgreSQL obligatorio~~ — SQLite por defecto para dev sin setup | ✅ Implementado |
| Zustand sobre Redux | Menor boilerplate, API más simple, suficiente para este MVP | ✅ Implementado |
| TanStack Query para server state | Cache automático, refetch, mutations — ideal para SPA con API REST | ✅ Implementado |
| @hello-pangea/dnd | ~~React Beautiful DnD~~ (deprecado) — fork mantenido con misma API | ✅ Implementado |
| Tailwind CSS 4 para estilos | Rapid prototyping, consistencia, dark mode built-in | ✅ Implementado |
| JWT Auth (SimpleJWT) | Stateless, se integra bien con React SPA. Blacklist + rotación activos | ✅ Implementado |
| SSE sobre WebSockets | ~~Polling~~ — se implementó SSE para notificaciones en tiempo real | ✅ Implementado |
| Supabase (auth/realtime complementario) | Añadido durante implementación. Realtime actualmente desactivado | ⚠️ Parcial |

---
*Last updated: 2026-08-11 — reconciliado con el estado real del código*
