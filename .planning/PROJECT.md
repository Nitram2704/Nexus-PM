# Nexus-PM: Tablero Ágil con Agente Autónomo Integrado

## What This Is

Una aplicación web de gestión de proyectos de software — similar a Jira — que permite a los equipos crear y administrar proyectos, sprints, backlogs y tareas desde una sola plataforma. A diferencia de las herramientas tradicionales, integra un **agente de inteligencia artificial** que actúa como Scrum Master: automatiza la generación de historias de usuario desde requerimientos vagos, estructura el backlog automáticamente, detecta cuellos de botella en el flujo de trabajo, y actualiza el estado de los tickets interpretando lenguaje natural a través de un chat integrado.

## Core Value

Un Product Owner describe en lenguaje natural los requisitos de un proyecto y el Agente IA genera automáticamente las historias de usuario, las prioriza y las coloca en el backlog. El equipo arrastra tarjetas en un tablero Kanban, el agente detecta cuellos de botella, y cualquier miembro puede chatear con el agente para obtener recomendaciones contextuales sobre el sprint activo.

## Requirements

### Validated

(None yet — build to validate)

### Active

**Autenticación & Usuarios**
- [ ] Registro de usuarios con correo y contraseña
- [ ] Inicio de sesión con credenciales
- [ ] Recuperación de contraseña por correo
- [ ] Editar perfil de usuario
- [ ] Gestionar roles del equipo (Admin, Developer, Viewer)

**Gestión de Proyectos**
- [ ] Crear nuevo proyecto con nombre, descripción y equipo
- [ ] Invitar miembros al proyecto vía email
- [ ] Ver listado de proyectos en un dashboard
- [ ] Editar información del proyecto
- [ ] Archivar proyecto finalizado

**Backlog & Sprints**
- [ ] Crear ítems en el backlog manualmente
- [ ] Crear sprints y asignar ítems del backlog
- [ ] Priorizar ítems del backlog (drag & drop)
- [ ] Filtrar ítems del backlog por etiquetas/prioridad
- [ ] Finalizar sprint y mover ítems incompletos
- [ ] Agregar estimaciones (story points)

**Tablero Kanban**
- [ ] Ver tablero Kanban del sprint activo
- [ ] Mover tarjetas entre columnas (drag & drop)
- [ ] Ver detalle de tarea desde el tablero
- [ ] Personalizar columnas del tablero
- [ ] Filtrar tarjetas del tablero

**Agente IA (Scrum Master)**
- [ ] Generar historias de usuario con IA desde texto libre
- [ ] Generar backlog inicial automáticamente
- [ ] Recibir recomendaciones contextuales del agente
- [ ] Chat con el agente dentro del proyecto
- [ ] Sugerencia de priorización del backlog
- [ ] Resumen ejecutivo del sprint con IA

**Notificaciones**
- [ ] Notificación al ser asignado a una tarea
- [ ] Alerta de sprint próximo a vencer
- [ ] Configurar preferencias de notificaciones

**Reportes**
- [ ] Reporte de velocidad del equipo
- [ ] Burndown chart del sprint activo
- [ ] Exportar backlog a CSV

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

- **Architecture:** React (Vite) SPA + Django REST Framework API. PostgreSQL database.
- **AI Agent:** Anthropic Claude API para generación de historias de usuario, recomendaciones y chat contextual.
- **State Management:** Zustand para estado global del frontend, TanStack Query para server state.
- **Drag & Drop:** React Beautiful DnD para tablero Kanban y backlog.
- **Async Tasks:** Celery + Redis para tareas de IA (generación de backlogs, resúmenes).
- **Data Model:** Users, Projects, Members, Sprints, Tasks (backlog items), Columns, Comments, AIConversations, Notifications.
- **Presentation:** El MVP targets una demo de gestión de proyectos ágil con IA integrada.

## Constraints

- **Cost:** $0 en infraestructura — PostgreSQL local, Redis local, Anthropic API con free tier o créditos
- **Time:** Proyecto académico — MVP scope only
- **Platform:** Windows dev machine, cualquier navegador moderno
- **Stack:** React + Vite (frontend) + Django + DRF (backend). Separación clara front/back.
- **Complexity:** Debe ser demostrable en una presentación de 20 minutos

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Vite sobre Next.js | Separación limpia frontend/backend. Django maneja todo el server-side. | ✅ Decided |
| Django + DRF como backend | Battle-tested, ORM potente, auth built-in, admin panel gratis | ✅ Decided |
| Anthropic Claude como IA | Superior en generación de texto estructurado, pricing competitivo | ✅ Decided |
| Celery + Redis para async | Las llamadas a IA son lentas (2-5s), no pueden bloquear la API | ✅ Decided |
| PostgreSQL sobre SQLite | Relaciones complejas, full-text search, concurrencia | ✅ Decided |
| Zustand sobre Redux | Menor boilerplate, API más simple, suficiente para este MVP | ✅ Decided |
| TanStack Query para server state | Cache automático, refetch, mutations — ideal para SPA con API REST | ✅ Decided |
| React Beautiful DnD | Solución madura para drag & drop, accesibilidad incluida | ✅ Decided |
| Tailwind CSS para estilos | Rapid prototyping, consistencia, dark mode built-in | ✅ Decided |
| JWT Auth (SimpleJWT) | Stateless, se integra bien con React SPA | Pending |
| No WebSockets en v1 | Polling para notificaciones es suficiente para el MVP | Pending |

---
*Last updated: 2026-04-20 after brainstorming*
