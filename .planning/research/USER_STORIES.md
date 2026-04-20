# User Stories: Nexus-PM

**Proyecto:** Nexus-PM — Tablero Ágil con Agente Autónomo Integrado
**Fecha:** 2026-04-20
**Total:** 33 Historias de Usuario

---

## Módulo: Autenticación

### HU-01 — Registro con correo y contraseña
**Prioridad:** 🔴 Alta
**Módulo:** Autenticación

**Como** usuario nuevo,
**Quiero** registrarme con mi nombre, correo electrónico y contraseña,
**Para** poder acceder a la plataforma y crear/unirme a proyectos.

**Criterios de Aceptación:**
1. El formulario solicita: nombre completo, email y contraseña (con confirmación).
2. El email se valida con formato correcto. Se muestra error si el formato es inválido.
3. La contraseña requiere mínimo 8 caracteres, al menos una mayúscula y un número.
4. Si el email ya está registrado, se muestra un mensaje de error claro.
5. Tras registro exitoso, el usuario recibe un email de confirmación (o se loguea directamente en v1).
6. Se redirige al dashboard de proyectos.

**Notas técnicas:**
- Endpoint: `POST /api/v1/auth/register/`
- Modelo: Custom User (AbstractUser)
- JWT se emite tras registro exitoso

---

### HU-02 — Inicio de sesión con credenciales
**Prioridad:** 🔴 Alta
**Módulo:** Autenticación

**Como** usuario registrado,
**Quiero** iniciar sesión con mi correo y contraseña,
**Para** acceder a mis proyectos y tareas.

**Criterios de Aceptación:**
1. El formulario solicita email y contraseña.
2. Si las credenciales son inválidas, se muestra un error específico ("Credenciales incorrectas").
3. Tras login exitoso, se recibe un token JWT (access + refresh).
4. El token se almacena de forma segura (httpOnly cookie o localStorage).
5. Se redirige al dashboard de proyectos.
6. La sesión persiste al cerrar/abrir el navegador (refresh token).

**Notas técnicas:**
- Endpoint: `POST /api/v1/auth/login/`
- SimpleJWT: access token (5 min) + refresh token (24h)
- Axios interceptor para auto-refresh

---

### HU-03 — Recuperación de contraseña por correo
**Prioridad:** 🔴 Alta
**Módulo:** Autenticación

**Como** usuario que olvidó su contraseña,
**Quiero** recibir un enlace de recuperación por email,
**Para** poder restablecer mi contraseña y recuperar acceso a mi cuenta.

**Criterios de Aceptación:**
1. En la página de login existe un enlace "¿Olvidaste tu contraseña?".
2. Solicita el email del usuario. Si no existe, se muestra un mensaje genérico (seguridad).
3. Se envía un email con un token de reset (válido por 1 hora).
4. El enlace lleva a un formulario para nueva contraseña.
5. Tras resetear, se redirige al login con mensaje de éxito.

**Notas técnicas:**
- Endpoints: `POST /api/v1/auth/password-reset/`, `POST /api/v1/auth/password-reset/confirm/`
- En dev: Django `console.EmailBackend` (imprime el email en terminal)

---

### HU-04 — Editar perfil de usuario
**Prioridad:** 🟡 Media
**Módulo:** Autenticación

**Como** usuario autenticado,
**Quiero** editar mi nombre y foto de perfil,
**Para** que mi equipo me identifique fácilmente en el proyecto.

**Criterios de Aceptación:**
1. Existe una página "Mi perfil" accesible desde el avatar/menú del header.
2. Se puede editar: nombre completo, avatar (upload de imagen).
3. El email NO es editable en v1.
4. El avatar se muestra como thumbnail circular en las tarjetas del Kanban y listas de miembros.
5. Los cambios se guardan con feedback visual (toast de éxito).

**Notas técnicas:**
- Endpoint: `GET/PUT /api/v1/auth/profile/`
- Avatar: file upload, almacenamiento en filesystem (MEDIA_ROOT) en v1

---

### HU-05 — Gestionar roles del equipo
**Prioridad:** 🟡 Media
**Módulo:** Autenticación

**Como** Owner o Admin de un proyecto,
**Quiero** asignar roles a los miembros del equipo,
**Para** controlar quién puede editar, administrar o solo ver el proyecto.

**Criterios de Aceptación:**
1. Roles disponibles: Owner, Admin, Developer, Viewer.
2. Owner se asigna automáticamente al creador del proyecto.
3. Admin puede: todo excepto eliminar el proyecto o transferir ownership.
4. Developer puede: crear/editar tareas, mover tarjetas, comentar.
5. Viewer puede: ver todo, comentar. No puede crear ni editar.
6. Solo Owner y Admin pueden cambiar roles de otros miembros.
7. Un proyecto siempre debe tener al menos 1 Owner.

**Notas técnicas:**
- Modelo: `Member.role` (choices: owner, admin, developer, viewer)
- Custom permissions: `IsProjectOwner`, `IsProjectAdmin`, `IsProjectMember`

---

## Módulo: Proyectos

### HU-06 — Crear nuevo proyecto
**Prioridad:** 🔴 Alta
**Módulo:** Proyectos

**Como** usuario autenticado,
**Quiero** crear un nuevo proyecto con nombre y descripción,
**Para** empezar a gestionar las tareas de mi equipo.

**Criterios de Aceptación:**
1. Botón "Nuevo Proyecto" visible en el dashboard.
2. Formulario: nombre (requerido, max 100), descripción (opcional, max 500).
3. La clave del proyecto se auto-genera (ej: "Nexus PM" → "NEX").
4. El creador se asigna como Owner automáticamente.
5. Se crean 4 columnas Kanban por defecto: "Por Hacer", "En Progreso", "En Revisión", "Hecho".
6. Tras crear, se redirige al proyecto creado.

**Notas técnicas:**
- Endpoint: `POST /api/v1/projects/`
- Clave: primeras 3 letras del nombre, uppercase, verificar unicidad
- Signal para crear columnas por defecto

---

### HU-07 — Invitar miembros al proyecto
**Prioridad:** 🔴 Alta
**Módulo:** Proyectos

**Como** Owner o Admin de un proyecto,
**Quiero** invitar personas al proyecto por email,
**Para** que el equipo pueda colaborar.

**Criterios de Aceptación:**
1. Botón "Invitar" en la configuración del proyecto.
2. Ingreso: email del invitado + rol (default: Developer).
3. Si el usuario ya existe en la plataforma → se añade directamente.
4. Si no existe → se envía email de invitación (en v1: se muestra un aviso de que debe registrarse primero).
5. No se puede invitar a alguien que ya es miembro.
6. El nuevo miembro aparece inmediatamente en la lista del equipo.

**Notas técnicas:**
- Endpoint: `POST /api/v1/projects/{id}/invite/`
- En v1: solo agregar usuarios existentes (email lookup). Invitación por mail en v2.

---

### HU-08 — Ver listado de proyectos en dashboard
**Prioridad:** 🔴 Alta
**Módulo:** Proyectos

**Como** usuario autenticado,
**Quiero** ver todos mis proyectos en un dashboard,
**Para** acceder rápidamente al proyecto en el que estoy trabajando.

**Criterios de Aceptación:**
1. Dashboard muestra cards/grid con los proyectos del usuario.
2. Cada card muestra: nombre, clave, # miembros (avatar stack), sprint activo, última actividad.
3. Se puede alternar entre vista grid y vista lista.
4. Los proyectos están ordenados por última actividad (más reciente primero).
5. Click en un proyecto navega al detalle del proyecto.
6. Empty state diseñado cuando no hay proyectos.

**Notas técnicas:**
- Endpoint: `GET /api/v1/projects/`
- TanStack Query: cache + background refetch

---

### HU-09 — Editar información del proyecto
**Prioridad:** 🟡 Media
**Módulo:** Proyectos

**Como** Owner o Admin de un proyecto,
**Quiero** editar el nombre y la descripción del proyecto,
**Para** mantener la información del proyecto actualizada.

**Criterios de Aceptación:**
1. Accesible desde Settings del proyecto.
2. Campos editables: nombre, descripción.
3. La clave del proyecto NO es editable.
4. Solo Owner y Admin pueden acceder a esta sección.
5. Cambios se guardan con toast de confirmación.

---

### HU-10 — Archivar proyecto finalizado
**Prioridad:** 🟢 Baja
**Módulo:** Proyectos

**Como** Owner del proyecto,
**Quiero** archivar un proyecto que ya terminó,
**Para** que no aparezca en mi dashboard pero pueda consultarlo después.

**Criterios de Aceptación:**
1. Botón "Archivar" en Settings del proyecto (solo visible para Owner).
2. Confirmación modal: "¿Estás seguro? El proyecto se ocultará del dashboard."
3. El proyecto desaparece del dashboard pero es accesible vía filtro "Archivados".
4. Se puede restaurar un proyecto archivado.

---

## Módulo: Backlog

### HU-11 — Crear ítems en el backlog manualmente
**Prioridad:** 🔴 Alta
**Módulo:** Backlog

**Como** miembro del proyecto (Developer+),
**Quiero** crear ítems en el backlog con título, descripción, tipo y prioridad,
**Para** documentar los requisitos y tareas del proyecto.

**Criterios de Aceptación:**
1. Botón "Nuevo ítem" en la vista de backlog.
2. Formulario con: título (requerido), descripción (Markdown con preview), tipo (Historia/Bug/Tarea/Épica), prioridad (Crítica/Alta/Media/Baja), asignar a (selector de miembros), etiquetas, story points.
3. Se auto-genera una clave secuencial: PRJ-001, PRJ-002, etc.
4. El nuevo ítem aparece al final del backlog.
5. El creador se registra en el historial del ítem.

**Notas técnicas:**
- Endpoint: `POST /api/v1/projects/{pid}/backlog/`
- Task.number: auto-increment per project

---

### HU-12 — Crear sprints y asignar ítems
**Prioridad:** 🔴 Alta
**Módulo:** Backlog

**Como** Scrum Master (Owner/Admin),
**Quiero** crear un sprint y asignarle ítems del backlog,
**Para** planificar el trabajo de las próximas 2 semanas.

**Criterios de Aceptación:**
1. Botón "Nuevo Sprint" en la vista de backlog/sprint planning.
2. Datos del sprint: nombre (auto: "Sprint N"), fecha inicio, fecha fin (default 2 semanas), objetivo (texto libre).
3. Solo 1 sprint activo por proyecto a la vez.
4. Se pueden arrastrar ítems del backlog al sprint (drag & drop).
5. El sprint muestra total de story points asignados.
6. Sprint se puede iniciar (cambia estado a "active").

---

### HU-13 — Priorizar ítems del backlog
**Prioridad:** 🔴 Alta
**Módulo:** Backlog

**Como** miembro del proyecto,
**Quiero** reordenar los ítems del backlog arrastrándolos,
**Para** que los más importantes estén arriba.

**Criterios de Aceptación:**
1. Los ítems del backlog se pueden reordenar con drag & drop.
2. El nuevo orden se persiste en la base de datos.
3. La reordenación es fluida y animada.
4. El orden se mantiene entre sesiones.

---

### HU-14 — Filtrar el backlog
**Prioridad:** 🟡 Media
**Módulo:** Backlog

**Como** miembro del proyecto,
**Quiero** filtrar los ítems del backlog por tipo, prioridad o asignado,
**Para** encontrar rápidamente lo que busco.

**Criterios de Aceptación:**
1. Barra de filtros en la parte superior del backlog.
2. Filtros: tipo (multi-select), prioridad (multi-select), asignado (selector), etiqueta, texto libre.
3. Los filtros se combinan (AND logic).
4. Se muestra el conteo de resultados filtrados.
5. Botón "Limpiar filtros" para resetear.

---

### HU-15 — Finalizar sprint y mover ítems
**Prioridad:** 🟡 Media
**Módulo:** Backlog

**Como** Scrum Master (Owner/Admin),
**Quiero** finalizar un sprint y decidir qué hacer con los ítems incompletos,
**Para** cerrar el ciclo y planificar el siguiente.

**Criterios de Aceptación:**
1. Botón "Finalizar Sprint" visible cuando el sprint está activo.
2. Modal muestra: ítems completados vs incompletos.
3. Para ítems incompletos, opciones: mover al backlog o mover al siguiente sprint.
4. Ítems "Hecho" se archivan con el sprint.
5. El sprint se marca como "completed" con fecha de cierre.
6. Se genera un resumen automático (opcional con IA - HU-27).

---

### HU-16 — Agregar estimaciones (story points)
**Prioridad:** 🟢 Baja
**Módulo:** Backlog

**Como** miembro del proyecto,
**Quiero** asignar story points a los ítems del backlog,
**Para** estimar el esfuerzo y planificar la capacidad del sprint.

**Criterios de Aceptación:**
1. Cada ítem de backlog tiene un campo "Story Points".
2. Escala Fibonacci: 1, 2, 3, 5, 8, 13, 21.
3. Selector visual (no input libre): botones con los valores.
4. El total de story points se muestra en el sprint planning.
5. Los story points se muestran como badge en las tarjetas Kanban.

---

## Módulo: Kanban

### HU-17 — Ver tablero Kanban del sprint activo
**Prioridad:** 🔴 Alta
**Módulo:** Kanban

**Como** miembro del proyecto,
**Quiero** ver un tablero Kanban con las columnas y tarjetas del sprint activo,
**Para** visualizar el progreso del trabajo del equipo.

**Criterios de Aceptación:**
1. El tablero muestra las columnas del sprint (por defecto: Por Hacer, En Progreso, En Revisión, Hecho).
2. Cada tarjeta muestra: clave (mono), título, tipo (ícono), prioridad (borde de color), asignado (avatar), story points.
3. Las columnas se desplazan horizontalmente si hay muchas.
4. Si no hay sprint activo, se muestra empty state con CTA "Crear Sprint".
5. Header del tablero muestra: nombre del sprint, días restantes, progreso de story points.

---

### HU-18 — Mover tarjetas entre columnas
**Prioridad:** 🔴 Alta
**Módulo:** Kanban

**Como** miembro del proyecto (Developer+),
**Quiero** arrastrar tarjetas entre columnas del tablero,
**Para** actualizar el estado de las tareas.

**Criterios de Aceptación:**
1. Drag & drop funcional entre columnas.
2. Al soltar, el estado de la tarea se actualiza en la BD.
3. Animación fluida durante el drag (card se eleva y rota ligeramente).
4. Se puede reordenar tarjetas dentro de la misma columna.
5. Si la columna destino excede el WIP limit, se muestra warning visual.
6. Optimistic update: la UI se actualiza antes de la respuesta del servidor.

---

### HU-19 — Ver detalle de tarea desde tablero
**Prioridad:** 🔴 Alta
**Módulo:** Kanban

**Como** miembro del proyecto,
**Quiero** hacer click en una tarjeta del tablero y ver su detalle completo,
**Para** consultar la descripción, comentarios e historial sin salir del tablero.

**Criterios de Aceptación:**
1. Click en tarjeta abre panel lateral (slide-in desde la derecha) o modal.
2. Muestra todos los campos: clave, título, descripción (Markdown renderizado), tipo, prioridad, asignado, story points, etiquetas, sprint.
3. Sección de comentarios: hilo de conversación con avatar + nombre + timestamp.
4. Historial de cambios: quién hizo qué y cuándo.
5. Se puede editar cualquier campo desde el panel.
6. Cerrar panel vuelve al tablero sin perder estado de scroll.

---

### HU-20 — Personalizar columnas del tablero
**Prioridad:** 🟡 Media
**Módulo:** Kanban

**Como** Owner o Admin del proyecto,
**Quiero** agregar, renombrar y reordenar columnas del tablero,
**Para** adaptar el flujo de trabajo a las necesidades del equipo.

**Criterios de Aceptación:**
1. Botón "+" para agregar nueva columna.
2. Click en nombre de columna para renombrar (inline edit).
3. Drag & drop para reordenar columnas.
4. Eliminar columna: solo si está vacía.
5. Configurar WIP limit por columna.

---

### HU-21 — Filtrar tarjetas del tablero
**Prioridad:** 🟢 Baja
**Módulo:** Kanban

**Como** miembro del proyecto,
**Quiero** filtrar las tarjetas del tablero por asignado o prioridad,
**Para** enfocarme solo en las tareas relevantes.

**Criterios de Aceptación:**
1. Barra de filtros en el header del tablero.
2. Filtros: asignado (avatar selector), tipo, prioridad.
3. Búsqueda rápida por título.
4. Las tarjetas que no coinciden se atenúan (no desaparecen).

---

## Módulo: Agente IA

### HU-22 — Generar historias de usuario con IA
**Prioridad:** 🔴 Alta
**Módulo:** Agente IA

**Como** Product Owner (cualquier miembro),
**Quiero** escribir una descripción en lenguaje natural y que el agente genere historias de usuario,
**Para** convertir requerimientos vagos en tareas ejecutables sin esfuerzo manual.

**Criterios de Aceptación:**
1. Botón "Generar con IA" en la vista de backlog, abre un modal/panel.
2. Textarea donde el usuario escribe lo que necesita (mínimo 20 caracteres).
3. Al enviar, se muestra indicador de carga (typing animation).
4. El agente genera 3-5 historias de usuario con: título, descripción (Como... Quiero... Para...), criterios de aceptación, tipo, prioridad sugerida, story points sugeridos.
5. Cada historia generada se muestra como card editable.
6. El usuario puede: ✅ Aprobar (añadir al backlog), ✏️ Editar (修改 antes de añadir), ❌ Descartar.
7. Solo las historias aprobadas se crean en el backlog.

**Notas técnicas:**
- Endpoint: `POST /api/v1/projects/{pid}/ai/generate-stories/`
- Celery task async, resultado via polling
- Claude 3 Sonnet para calidad de generación

---

### HU-23 — Generar backlog inicial automáticamente
**Prioridad:** 🔴 Alta
**Módulo:** Agente IA

**Como** usuario que acaba de crear un proyecto,
**Quiero** describir mi producto y que el agente genere un backlog completo,
**Para** tener un punto de partida sin empezar de cero.

**Criterios de Aceptación:**
1. Al crear un nuevo proyecto, opción "Generar backlog con IA".
2. El usuario describe el proyecto en 2-3 párrafos.
3. El agente genera 10-20 historias de usuario organizadas por épica.
4. Vista de revisión: lista de historias agrupadas por épica.
5. El usuario puede aprobar/editar/descartar cada historia individualmente.
6. Botón "Aprobar todo" para añadir todas al backlog de una vez.

---

### HU-24 — Recibir recomendaciones del agente
**Prioridad:** 🔴 Alta
**Módulo:** Agente IA

**Como** miembro del proyecto,
**Quiero** recibir recomendaciones contextuales del agente IA,
**Para** tomar mejores decisiones sobre el sprint y el proyecto.

**Criterios de Aceptación:**
1. Panel de recomendaciones visible en el dashboard del proyecto (sidebar o card).
2. Recomendaciones generadas automáticamente al:
   - Iniciar un sprint (resumen de carga)
   - Cuando hay tareas bloqueadas (>3 días en misma columna)
   - Cuando el sprint está al 50% de tiempo con <30% completado
3. Cada recomendación tiene: ícono, título, descripción, acción sugerida.
4. Se pueden descartar recomendaciones ya vistas.
5. Badge de notificación cuando hay recomendaciones nuevas.

---

### HU-25 — Chat con el agente dentro del proyecto
**Prioridad:** 🟡 Media
**Módulo:** Agente IA

**Como** miembro del proyecto,
**Quiero** chatear con el agente IA dentro del contexto del proyecto,
**Para** hacerle preguntas sobre el sprint, tareas o recomendaciones.

**Criterios de Aceptación:**
1. Widget de chat floating (bottom-right) o vista dedicada.
2. El agente responde con contexto: accede al backlog, sprint, miembros, métricas.
3. Ejemplos de consultas soportadas:
   - "¿Cuál es el progreso del sprint actual?"
   - "¿Qué tareas están bloqueadas?"
   - "Genera criterios de aceptación para PRJ-015"
   - "¿Cómo va la velocidad del equipo?"
4. Historial de conversación se guarda por proyecto.
5. Typing indicator mientras el agente procesa.

---

### HU-26 — Sugerencia de priorización del backlog
**Prioridad:** 🟡 Media
**Módulo:** Agente IA

**Como** Product Owner,
**Quiero** que el agente sugiera cómo priorizar mi backlog,
**Para** optimizar el orden de las tareas basándose en dependencias y complejidad.

**Criterios de Aceptación:**
1. Botón "IA: Sugerir priorización" en la vista de backlog.
2. El agente analiza: dependencias implícitas, complejidad (story points), tipo (bugs primero?), antigüedad.
3. Muestra vista comparativa: "Tu orden actual" vs "Orden sugerido por IA".
4. Justificación por cada cambio de posición relevante.
5. Botón "Aplicar sugerencia" para adoptar el nuevo orden.
6. Botón "Ignorar" para mantener el orden actual.

---

### HU-27 — Resumen ejecutivo del sprint con IA
**Prioridad:** 🟢 Baja
**Módulo:** Agente IA

**Como** Scrum Master (Owner/Admin),
**Quiero** que el agente genere un resumen ejecutivo al finalizar un sprint,
**Para** documentar lo que se logró y qué mejorar en el siguiente sprint.

**Criterios de Aceptación:**
1. Al finalizar sprint (HU-15), opción "Generar resumen con IA".
2. El resumen incluye: métricas (velocity, completadas/planeadas, story points quemados), highlights (qué se logró), áreas de mejora, recomendaciones para el siguiente sprint.
3. El resumen se guarda vinculado al sprint.
4. Se puede exportar como texto o copiar al portapapeles.

---

## Módulo: Notificaciones

### HU-28 — Notificación al ser asignado a una tarea
**Prioridad:** 🟡 Media
**Módulo:** Notificaciones

**Como** miembro del proyecto,
**Quiero** recibir una notificación cuando me asignan una tarea,
**Para** enterarme inmediatamente y poder empezar a trabajar.

**Criterios de Aceptación:**
1. Bell icon en el header con badge de contador (no leídas).
2. Al ser asignado a una tarea, se crea una notificación: "Te asignaron PRJ-015: Diseñar landing page".
3. Click en la notificación navega directamente a la tarea.
4. Marcar como leída: click, o "Marcar todas como leídas".

---

### HU-29 — Alerta de sprint próximo a vencer
**Prioridad:** 🟡 Media
**Módulo:** Notificaciones

**Como** miembro del proyecto,
**Quiero** recibir una alerta cuando un sprint está por vencer con tareas pendientes,
**Para** tomar acciones antes de que termine el sprint.

**Criterios de Aceptación:**
1. Alerta automática cuando faltan 2 días para el fin del sprint Y hay tareas incompletas.
2. Mensaje: "Sprint 3 vence en 2 días. Quedan 5 tareas por completar (13 story points)."
3. Aparece en notificaciones y como banner en el dashboard del proyecto.
4. Se genera una sola vez (no se repite si ya se mostró).

---

### HU-30 — Configurar preferencias de notificaciones
**Prioridad:** 🟢 Baja
**Módulo:** Notificaciones

**Como** usuario de la plataforma,
**Quiero** configurar qué notificaciones deseo recibir,
**Para** no ser bombardeado con alertas que no me interesan.

**Criterios de Aceptación:**
1. Página de configuración en Settings del usuario.
2. Toggles por tipo: asignación de tarea, deadline de sprint, recomendaciones IA, menciones en comentarios.
3. Los cambios aplican inmediatamente.
4. Por defecto, todas activadas.

---

## Módulo: Reportes

### HU-31 — Reporte de velocidad del equipo
**Prioridad:** 🟡 Media
**Módulo:** Reportes

**Como** Scrum Master (Owner/Admin),
**Quiero** ver un gráfico con la velocidad del equipo por sprint,
**Para** entender la capacidad histórica y planificar mejor.

**Criterios de Aceptación:**
1. Velocity chart: gráfica de barras con story points completados por sprint.
2. Muestra los últimos 5 sprints (o todos los disponibles si menos).
3. Línea de tendencia / promedio.
4. Hover en barra muestra: nombre del sprint, story points completados, story points planeados.

---

### HU-32 — Burndown chart del sprint activo
**Prioridad:** 🟡 Media
**Módulo:** Reportes

**Como** miembro del proyecto,
**Quiero** ver un burndown chart del sprint activo,
**Para** saber si vamos al ritmo para completar todas las tareas.

**Criterios de Aceptación:**
1. Burndown chart: eje X = días del sprint, eje Y = story points restantes.
2. Línea ideal (diagonal de total a 0).
3. Línea real (actualizada según tareas completadas por día).
4. Visible en la tab "Reportes" dentro del proyecto.
5. Color coding: verde si vamos bien, rojo si vamos atrás.

---

### HU-33 — Exportar backlog a CSV
**Prioridad:** 🟢 Baja
**Módulo:** Reportes

**Como** Scrum Master (Owner/Admin),
**Quiero** exportar el backlog a un archivo CSV,
**Para** compartir el estado del proyecto con stakeholders esterni.

**Criterios de Aceptación:**
1. Botón "Exportar CSV" en la vista de backlog.
2. El CSV incluye columnas: clave, título, tipo, prioridad, estado, asignado, story points, sprint, fecha de creación.
3. Se descargan todos los ítems (no solo los filtrados).
4. Nombre del archivo: `{project_key}_backlog_{fecha}.csv`.

---

*User stories documented: 2026-04-20*
*Total: 33 HU across 7 modules*
