# PLAN: Gestión de Tareas (HU-08)

Este plan detalla la implementación del módulo de tareas (Cards) para Nexus-PM, permitiendo la creación, asignación y flujo de trabajo en el tablero Kanban.

## User Review Required

> [!IMPORTANT]
> **Formato de Identificador**: Las tareas usarán la `key` del proyecto + un número secuencial (ej: `NEX-1`, `NEX-2`). Para esto, añadiremos un contador interno al modelo `Project`.
> 
> **Reglas de Negocio Propuestas**:
> 1. **Asignación Crucial**: Una tarea solo puede asignarse a un usuario que sea miembro del proyecto.
> 2. **Integridad de Columnas**: Al crear una tarea, se asignará automáticamente a la primera columna (ej: "Por Hacer") si no se especifica.
> 3. **Validación de Movimiento**: No se puede mover una tarea a una columna que no pertenezca a su proyecto.

## Proposed Changes

### [Backend] - Aplicación `tasks`

#### [NEW] [models.py](file:///c:/Users/marti/Visual/Nexus%20PM/backend/apps/tasks/models.py)
- Definición del modelo `Task`:
    - `project`: ForeignKey a `Project`.
    - `column`: ForeignKey a `Column`.
    - `title`, `description`.
    - `key`: CharField (ej: NEX-1).
    - `type`: ChoiceField (Feature, Bug, Task, Story).
    - `priority`: ChoiceField (High, Medium, Low).
    - `status`: Proxy del nombre de la columna.
    - `assignee`: ForeignKey a `User` (opcional).
    - `story_points`: IntegerField.
    - `created_at`, `updated_at`.

#### [MODIFY] [models.py](file:///c:/Users/marti/Visual/Nexus%20PM/backend/apps/projects/models.py)
- Añadir `task_counter = models.PositiveIntegerField(default=0)` al modelo `Project` para gestionar la numeración secuencial.

#### [NEW] [serializers.py](file:///c:/Users/marti/Visual/Nexus%20PM/backend/apps/tasks/serializers.py)
- `TaskSerializer`: CRUD básico.
- Validación: Comprobar que `assignee` es miembro del proyecto y `column` pertenece al proyecto.

#### [NEW] [views.py](file:///c:/Users/marti/Visual/Nexus%20PM/backend/apps/tasks/views.py)
- `TaskViewSet`:
    - Filtrado por `project_id`.
    - Soporte para Drag & Drop (actualización de `column`).

---

## Task Breakdown

### Phase 1: Foundation & Models
- [ ] **T1.1**: Crear la aplicación `tasks` y registrarla en `settings.py`.
- [ ] **T1.2**: Actualizar modelo `Project` con `task_counter`.
- [ ] **T1.3**: Implementar modelo `Task` con sus validaciones.
- [ ] **T1.4**: Crear y aplicar migraciones.

### Phase 2: Business Logic
- [ ] **T2.1**: Crear `signals.py` en `tasks` para :
    - Incrementar el `task_counter` del proyecto.
    - Generar la `key` de la tarea (ej: `PROY-1`).
- [ ] **T2.2**: Validar que el `assignee` sea parte de la tabla `Member` del proyecto.

### Phase 3: API & Endpoints
- [ ] **T3.1**: Crear `TaskSerializer` con lógica de validación cruzada.
- [ ] **T3.2**: Implementar `TaskViewSet` con soporte para filtrado (DjangoFilter).
- [ ] **T3.3**: Configurar URLs y permisos.

---

## Verification Plan

### Automated Tests
- `python manage.py test apps/tasks`:
    - Verificar que la `key` se genera correctamente.
    - Verificar que no se puede asignar a alguien ajeno al proyecto.
    - Verificar que el `task_counter` se incrementa.

### Manual Verification
- Crear tarea vía Postman.
- Intentar mover tarea a una columna de otro proyecto (debe fallar).
