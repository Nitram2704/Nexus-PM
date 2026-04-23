# PLAN: Sprints & Backlog Implementation (Phase 3)

Este plan detalla la implementación del ciclo de vida de los Sprints y su vinculación con las tareas para completar el flujo ágil de Nexus-PM.

## User Review Required

> [!IMPORTANT]
> **Ubicación del Modelo**: He decidido colocar el modelo `Sprint` dentro de la aplicación `apps.tasks` para mantener los contenedores de estructura juntos. Dado que las tareas viven allí y están íntimamente ligadas a los Sprints, es lo más limpio.
> 
> **Regla de Oro**: Solo puede haber **un Sprint activo** por proyecto a la vez.

## Proposed Changes

### [Backend] - App `tasks`

#### [MODIFY] [models.py](file:///c:/Users/marti/Visual/Nexus%20PM/backend/apps/tasks/models.py)
- **Añadir Clase `Sprint`**:
    - `id` (UUID), `project` (FK), `name`, `goal`, `status` (planning/active/completed).
    - `start_date`, `end_date`, `created_at`.
- **Actualizar `Task`**:
    - Añadir FK `sprint` (null=True, blank=True).

#### [NEW] [serializers.py](file:///c:/Users/marti/Visual/Nexus%20PM/backend/apps/tasks/serializers.py) (Updates)
- `SprintSerializer`: Gestión de CRUD y validación de estado.
- `TaskSerializer`: Incluir campo `sprint_id`.

#### [NEW] [views.py](file:///c:/Users/marti/Visual/Nexus%20PM/backend/apps/tasks/views.py) (Updates)
- `SprintViewSet`: Endpoint para `/api/v1/projects/{id}/sprints/`.
- Acciones personalizadas: `@action start` y `@action complete`.

## Task Breakdown

### Fase 1: Base de Datos & Modelos [COMPLETADA]
- [x] **T1.1**: Crear modelo `Sprint` en `apps.tasks.models`.
- [x] **T1.2**: Añadir relación `sprint` en el modelo `Task`.
- [x] **T1.3**: Generar y aplicar migraciones (`makemigrations`, `migrate`).

### Fase 2: Lógica de Negocio (Backend) [COMPLETADA]
- [x] **T2.1**: Implementar validación en `Sprint.save()` para evitar múltiples sprints activos.
- [x] **T2.2**: Lógica de cierre: Implementada acción `complete` en ViewSet para mover tareas al backlog.

### Fase 3: API & Frontend Integration [COMPLETADA]
- [x] **T3.1**: Registrar URLs de Sprints en `urls.py`.
- [x] **T3.2**: Crear types y servicios API en el frontend (`frontend/src/api/sprints.ts`).

### Fase 4: UI Components (Backlog & Planning) [SIGUIENTE]
- [ ] **T4.1**: Crear componentes base: `SprintList`, `BacklogList`, `SprintCard`.
- [ ] **T4.2**: Implementar lógica de Drag & Drop para asignar tareas a Sprints.
- [ ] **T4.3**: Modales para creación de Sprints y Tareas.
- [ ] **T4.4**: Acciones de ciclo de vida (Iniciar/Completar Sprint) con feedback visual.

## Verification Plan

### Automated Tests
- `python manage.py test apps.tasks`:
    - Test de concurrencia de sprints activos.
    - Test de asignación de tareas a sprint.

---
**Agentes Responsables:**
- Backend & DB: `backend-specialist`, `database-architect`
- Test: `test-engineer`
- AI Strategy: `caveman-mode` (Terse & token-efficient communication for Scrum Master)
