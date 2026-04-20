# Nexus-PM: Tablero Ágil con Agente Autónomo Integrado

> Un sistema Kanban de gestión de proyectos donde un Agente de IA actúa como Scrum Master: genera backlogs automáticamente desde requerimientos vagos, detecta cuellos de botella en el flujo de trabajo y actualiza el estado de los tickets interpretando lenguaje natural a través de un chat.

## 🚀 Visión

Aplicación web de gestión de proyectos de software — similar a Jira — que permite a los equipos crear y administrar proyectos, sprints, backlogs y tareas desde una sola plataforma. A diferencia de las herramientas tradicionales, integra un **agente de inteligencia artificial** que automatiza la generación de historias de usuario, la estructuración del backlog y la producción de notas y recomendaciones.

## 🔧 Stack Tecnológico

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS |
| **State** | Zustand (global) + TanStack Query (server) |
| **Backend** | Django 5 + Django REST Framework |
| **Database** | PostgreSQL |
| **Auth** | JWT (SimpleJWT) |
| **AI** | Anthropic Claude API |
| **Async** | Celery + Redis |
| **DnD** | React Beautiful DnD |
| **Charts** | Recharts |

## 📋 Funcionalidades Principales

### 🔐 Autenticación
- Registro, login, recuperación de contraseña (JWT)
- Gestión de roles: Owner, Admin, Developer, Viewer

### 📁 Gestión de Proyectos
- CRUD de proyectos con clave auto-generada
- Invitación de miembros por email
- Dashboard con cards de proyectos

### 📝 Backlog & Sprints
- Crear ítems manualmente o **generarlos con IA**
- Drag & drop para priorizar
- Sprint planning con assignment visual
- Story points (Fibonacci)

### 📊 Tablero Kanban
- Drag & drop entre columnas
- WIP limits con indicadores visuales
- Panel lateral de detalle de tarea
- Columnas personalizables

### 🤖 Agente IA (Scrum Master)
- **Genera historias de usuario** desde lenguaje natural
- **Genera backlog completo** desde descripción de proyecto
- **Chat contextual** — el agente conoce tu sprint, tareas y equipo
- **Sugiere priorización** del backlog con justificación
- **Resumen de sprint** automático

### 🔔 Notificaciones
- Alertas in-app para asignaciones y deadlines
- Preferencias configurables por tipo

### 📈 Reportes
- Velocity chart (story points por sprint)
- Burndown chart (progreso diario)
- KPIs del proyecto
- Exportar backlog a CSV

## 🏗 Estado del Proyecto

**Fase actual:** Planificación completa — listo para implementación

| Fase | Status |
|------|--------|
| 1. Foundation & Auth (4 planes) | 🔲 Next |
| 2. Project Management (3 planes) | ⏳ |
| 3. Backlog & Sprints (4 planes) | ⏳ |
| 4. Kanban Board (3 planes) | ⏳ |
| 5. AI Agent (4 planes) | ⏳ |
| 6. Notifications (2 planes) | ⏳ |
| 7. Reports & Polish (3 planes) | ⏳ |

Ver `.planning/` para documentación completa del proyecto.

## 🎨 Design Identity

- **Concepto:** "Agile Command Center" — dark mode premium
- **Colores:** Electric Blue (#3B82F6) + Warm Amber (#F59E0B) para IA
- **Tipografía:** Inter (UI) + JetBrains Mono (datos)
- **Estilo:** Glassmorphism, micro-animations, responsive

## 📄 Licencia

Proyecto académico — Universidad / Ingeniería en Desarrollo de Software
