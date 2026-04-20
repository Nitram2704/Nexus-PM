# Requirements: Nexus-PM

**Defined:** 2026-04-20
**Core Value:** Un Product Owner describe requisitos en lenguaje natural y el Agente IA genera historias de usuario, prioriza el backlog y ofrece recomendaciones contextuales. El equipo gestiona sprints en un tablero Kanban con drag & drop.

## v1 Requirements

### Módulo 1: Autenticación & Usuarios (AUTH)

- [ ] **AUTH-01**: Registro de usuario con nombre, correo electrónico y contraseña. Validación de formato de email y fortaleza de contraseña (mínimo 8 caracteres, al menos una mayúscula, un número). Confirmación de email post-registro.
- [ ] **AUTH-02**: Inicio de sesión con email + contraseña. Respuesta JWT (access + refresh token). Manejo de errores: credenciales inválidas, cuenta no verificada.
- [ ] **AUTH-03**: Recuperación de contraseña vía email. Flujo: solicitar reset → email con token → formulario nueva contraseña → confirmación.
- [ ] **AUTH-04**: Editar perfil de usuario: nombre, avatar (upload), bio opcional. No se puede cambiar el email en v1.
- [ ] **AUTH-05**: Sistema de roles por proyecto: Owner (creador), Admin (invitado con permisos full), Developer (miembro estándar), Viewer (solo lectura). Los roles son por proyecto, no globales.

### Módulo 2: Gestión de Proyectos (PRJ)

- [ ] **PRJ-01**: Crear proyecto con: nombre (requerido, max 100 chars), descripción (opcional, max 500 chars), clave del proyecto (auto-generada, ej: "NEX" para "Nexus"). El creador se asigna como Owner automáticamente.
- [ ] **PRJ-02**: Invitar miembros al proyecto por email. Si el usuario existe → se añade directamente. Si no existe → se envía invitación por email. Rol por defecto: Developer.
- [ ] **PRJ-03**: Dashboard de proyectos: grid/list de proyectos del usuario con nombre, clave, # de miembros, # de tareas pendientes, último sprint activo, fecha de última actividad. Ordenable por actividad reciente.
- [ ] **PRJ-04**: Editar proyecto: nombre, descripción. Solo Owner y Admin pueden editar.
- [ ] **PRJ-05**: Archivar proyecto: soft-delete, no se muestra en el dashboard pero se puede restaurar. Solo el Owner puede archivar.
- [ ] **PRJ-06**: Vista de miembros del proyecto: lista de miembros con avatar, nombre, rol, fecha de ingreso. Admin puede cambiar roles y remover miembros.

### Módulo 3: Backlog & Sprints (BKL)

- [ ] **BKL-01**: Crear ítem de backlog con: título (requerido), descripción (Markdown), tipo (Historia, Bug, Tarea, Épica), prioridad (Crítica, Alta, Media, Baja), etiquetas personalizables, asignado a (miembro del proyecto o sin asignar), story points (fibonacci: 1, 2, 3, 5, 8, 13, 21).
- [ ] **BKL-02**: Vista de backlog: lista ordenable por prioridad con drag & drop. Cada ítem muestra: clave (PRJ-001), título, tipo (ícono+color), prioridad (badge), asignado (avatar), story points.
- [ ] **BKL-03**: Crear sprint con: nombre (auto: "Sprint 1", "Sprint 2"...), fecha inicio, fecha fin (default: 2 semanas), objetivo del sprint (texto libre). Solo 1 sprint activo por proyecto.
- [ ] **BKL-04**: Asignar ítems del backlog al sprint: drag & drop del backlog al sprint planning. Mostrar capacidad estimada vs story points asignados.
- [ ] **BKL-05**: Priorizar ítems del backlog: reordenar mediante drag & drop. El orden se persiste. Filtros: por tipo, prioridad, asignado, etiqueta.
- [ ] **BKL-06**: Filtrar backlog: por tipo (Historia/Bug/Tarea/Épica), prioridad, asignado, etiqueta, texto libre (busca en título y descripción).
- [ ] **BKL-07**: Finalizar sprint: ítems "Hecho" se archivan, ítems incompletos se mueven al backlog o al siguiente sprint (el usuario elige). Se genera un resumen del sprint.
- [ ] **BKL-08**: Story points: cada ítem puede tener estimación con escala fibonacci. Sumatorio visible en sprint planning y en el backlog.
- [ ] **BKL-09**: Editar ítem del backlog: todos los campos, historial de cambios visible (quién cambió qué y cuándo). Comentarios tipo hilo.

### Módulo 4: Tablero Kanban (KBN)

- [ ] **KBN-01**: Vista de tablero Kanban del sprint activo. Columnas por defecto: "Por Hacer", "En Progreso", "En Revisión", "Hecho". Cards muestran: clave, título, tipo (ícono), prioridad (color lateral), asignado (avatar), story points.
- [ ] **KBN-02**: Drag & drop de tarjetas entre columnas. Al mover, se actualiza el estado de la tarea en la BD. Animación fluida con React Beautiful DnD.
- [ ] **KBN-03**: Click en tarjeta → modal/panel lateral con detalle completo: todos los campos, comentarios, historial de cambios, adjuntos (v2). Sin salir del tablero.
- [ ] **KBN-04**: Personalizar columnas: agregar nuevas, renombrar, reordenar, eliminar (solo si vacía). Límite WIP configurable por columna (ej: max 3 tarjetas en "En Revisión").
- [ ] **KBN-05**: Filtrar tarjetas del tablero: por asignado, tipo, prioridad, etiqueta. Búsqueda rápida por título.
- [ ] **KBN-06**: Indicadores visuales en el tablero: columna con límite WIP excedido se resalta en rojo/amarillo. Tarjetas bloqueadas se muestran con borde especial.

### Módulo 5: Agente IA — Scrum Master (AIA)

- [ ] **AIA-01**: Generar historias de usuario con IA: el usuario escribe un párrafo describiendo lo que quiere (ej: "Necesito un sistema de login con Google y email") y el agente genera 3-5 historias de usuario formateadas con título, descripción, criterios de aceptación y prioridad sugerida. El usuario puede aprobar, editar o descartar cada historia antes de agregarla al backlog.
- [ ] **AIA-02**: Generar backlog inicial: cuando se crea un proyecto nuevo, el usuario puede describir el proyecto en texto libre y el agente genera un backlog completo con 10-20 historias de usuario priorizadas, categorizadas por épica.
- [ ] **AIA-03**: Recomendaciones del agente: panel contextual que muestra insights sobre el sprint activo. Ejemplos: "Sprint al 60% completado con 2 días restantes — considera reducir scope", "3 tareas sin asignar en el sprint", "La tarea PRJ-015 lleva 5 días en 'En Progreso' — posible bloqueo".
- [ ] **AIA-04**: Chat con el agente: interfaz de chat dentro del proyecto donde cualquier miembro puede hacer preguntas contextuales. El agente tiene acceso al backlog, sprint activo, métricas del equipo. Ejemplos de queries: "Resume el progreso del sprint actual", "¿Qué tareas debería priorizar?", "Genera criterios de aceptación para PRJ-010".
- [ ] **AIA-05**: Sugerencia de priorización: el agente analiza el backlog y sugiere un reorden basado en dependencias implícitas, complejidad estimada y valor de negocio inferido. El usuario puede aceptar o rechazar la sugerencia.
- [ ] **AIA-06**: Resumen ejecutivo del sprint: al finalizar un sprint, el agente genera un reporte con métricas (velocity, completadas vs planeadas, story points quemados), highlights y recomendaciones para el siguiente sprint.

### Módulo 6: Notificaciones (NTF)

- [ ] **NTF-01**: Notificación al ser asignado a una tarea. Aparece en el bell icon del header. Badge con contador de no leídas.
- [ ] **NTF-02**: Alerta cuando un sprint está a 2 días de vencer y hay tareas incompletas. Visible en notificaciones y en el dashboard del proyecto.
- [ ] **NTF-03**: Configurar preferencias: toggle por tipo de notificación (asignación, sprint deadline, recomendación IA, mención en comentario). Panel en settings del usuario.
- [ ] **NTF-04**: Notificación cuando el agente IA genera recomendaciones nuevas para tu proyecto.

### Módulo 7: Reportes & Analytics (RPT)

- [ ] **RPT-01**: Velocity chart: gráfica de barras mostrando story points completados por sprint (últimos 5 sprints). Línea de tendencia.
- [ ] **RPT-02**: Burndown chart del sprint activo: línea ideal vs línea real de story points restantes por día. Actualización diaria.
- [ ] **RPT-03**: Exportar backlog a CSV: descarga con columnas (clave, título, tipo, prioridad, estado, asignado, story points, sprint).
- [ ] **RPT-04**: Dashboard de proyecto: resumen con KPIs (tareas totales, completadas, en progreso, velocity promedio, miembros activos).

### Módulo 8: UI & Experiencia (UIX)

- [ ] **UIX-01**: Dark mode como tema principal. Estética "command center" profesional, no genérica.
- [ ] **UIX-02**: Layout responsive: desktop (sidebar + contenido), tablet (sidebar colapsable), mobile (bottom nav + contenido).
- [ ] **UIX-03**: Smooth animations: transiciones de página, drag & drop fluido, entrada staggered de cards, loading skeletons.
- [ ] **UIX-04**: Empty states diseñados: cuando no hay proyectos, cuando el backlog está vacío, cuando no hay sprint activo. Ilustraciones o íconos + CTA.
- [ ] **UIX-05**: Loading states: skeleton screens durante data fetch, spinners inline para acciones, optimistic updates en drag & drop.
- [ ] **UIX-06**: Toast notifications para acciones exitosas/errores (crear tarea, mover tarjeta, error de conexión).

## v2 Requirements (Post-MVP)

### Integraciones
- **V2-01**: Integración con GitHub (vincular repos, ver commits en tareas)
- **V2-02**: Integración con Slack (notificaciones, comandos slash)
- **V2-03**: Webhooks para integraciones custom

### Avanzado
- **V2-04**: Time tracking en tareas
- **V2-05**: Wikis de proyecto
- **V2-06**: Templates de proyectos (Scrum, Kanban puro, Bug tracking)
- **V2-07**: Roadmap de releases
- **V2-08**: Multi-idioma (EN/ES)
- **V2-09**: Modo offline con sincronización
- **V2-10**: Aplicación móvil nativa (React Native)

## Out of Scope

| Feature | Reason |
|---------|--------|
| GitHub/GitLab integration | Complejidad de OAuth + webhooks, no necesario para demo |
| Slack/Discord integration | Requiere bot deployment, v2 |
| Mobile native app | React Native, separate project |
| Payment / Billing | SaaS infrastructure, v2+ |
| Multi-language | Solo español para la demo académica |
| Real-time WebSockets | Polling con TanStack Query es suficiente para MVP |
| File attachments | Requiere S3/storage, diferido a v2 |
| Time tracking | Feature secundario, no core para la demo de IA |

## Traceability

| Requirement | Phase | HU | Status |
|-------------|-------|-----|--------|
| AUTH-01 | Phase 1 | HU-01 | Pending |
| AUTH-02 | Phase 1 | HU-02 | Pending |
| AUTH-03 | Phase 1 | HU-03 | Pending |
| AUTH-04 | Phase 1 | HU-04 | Pending |
| AUTH-05 | Phase 1 | HU-05 | Pending |
| PRJ-01 | Phase 2 | HU-06 | Pending |
| PRJ-02 | Phase 2 | HU-07 | Pending |
| PRJ-03 | Phase 2 | HU-08 | Pending |
| PRJ-04 | Phase 2 | HU-09 | Pending |
| PRJ-05 | Phase 2 | HU-10 | Pending |
| PRJ-06 | Phase 2 | — | Pending |
| BKL-01 | Phase 3 | HU-11 | Pending |
| BKL-02 | Phase 3 | HU-13 | Pending |
| BKL-03 | Phase 3 | HU-12 | Pending |
| BKL-04 | Phase 3 | HU-12 | Pending |
| BKL-05 | Phase 3 | HU-13 | Pending |
| BKL-06 | Phase 3 | HU-14 | Pending |
| BKL-07 | Phase 3 | HU-15 | Pending |
| BKL-08 | Phase 3 | HU-16 | Pending |
| BKL-09 | Phase 3 | HU-11 | Pending |
| KBN-01 | Phase 4 | HU-17 | Pending |
| KBN-02 | Phase 4 | HU-18 | Pending |
| KBN-03 | Phase 4 | HU-19 | Pending |
| KBN-04 | Phase 4 | HU-20 | Pending |
| KBN-05 | Phase 4 | HU-21 | Pending |
| KBN-06 | Phase 4 | — | Pending |
| AIA-01 | Phase 5 | HU-22 | Pending |
| AIA-02 | Phase 5 | HU-23 | Pending |
| AIA-03 | Phase 5 | HU-24 | Pending |
| AIA-04 | Phase 5 | HU-25 | Pending |
| AIA-05 | Phase 5 | HU-26 | Pending |
| AIA-06 | Phase 5 | HU-27 | Pending |
| NTF-01 | Phase 6 | HU-28 | Pending |
| NTF-02 | Phase 6 | HU-29 | Pending |
| NTF-03 | Phase 6 | HU-30 | Pending |
| NTF-04 | Phase 6 | — | Pending |
| RPT-01 | Phase 7 | HU-31 | Pending |
| RPT-02 | Phase 7 | HU-32 | Pending |
| RPT-03 | Phase 7 | HU-33 | Pending |
| RPT-04 | Phase 7 | — | Pending |
| UIX-01 | Phase 4 | — | Pending |
| UIX-02 | Phase 1 | — | Pending |
| UIX-03 | Phase 4 | — | Pending |
| UIX-04 | All | — | Pending |
| UIX-05 | All | — | Pending |
| UIX-06 | All | — | Pending |

**Coverage:**
- v1 requirements: 48 total
- Mapped to phases: 48
- Mapped to HU: 33 (de las capturas)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-20*
