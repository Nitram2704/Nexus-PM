# PLAN: Project Management API (Phase 2 - Backend)

Este plan detalla la implementación del backend para la gestión de proyectos, permitiendo a los usuarios crear espacios de trabajo, invitar colaboradores y personalizar sus tableros Kanban.

## Contexto y Decisiones
- **HU-06 (Crear Proyecto):** El usuario puede definir nombre, descripción y una **clave (slug)** personalizable (Nexus PM -> NEX).
- **HU-07 (Invitación):** Sistema de invitación básica por email.
- **HU-08 (Listado):** Endpoint para ver proyectos donde el usuario es miembro.
- **Columnas Editables:** Se crearán 4 por defecto mediante un `post_save` signal, pero el usuario podrá gestionarlas.

## Project Type: BACKEND (Standalone API)

## Success Criteria
- [ ] `POST /api/v1/projects/` crea el proyecto, la relación de miembro (Owner) y 4 columnas.
- [ ] La clave del proyecto es editable y única.
- [ ] `GET /api/v1/projects/` devuelve solo proyectos asociados al usuario actual.
- [ ] Permisos: Solo el `Owner` o `Admin` puede invitar nuevos miembros o editar el proyecto.

## Tech Stack
- **Framework:** Django 5.1 + Django REST Framework.
- **Auth:** SimpleJWT (ya implementado).
- **DB:** SQLite (local dev).

## File Structure
```text
backend/
├── apps/
│   └── projects/                # Nueva App
│       ├── models.py            # Project, Member, Column
│       ├── serializers.py
│       ├── views.py
│       ├── signals.py           # Creación de columnas por defecto
│       └── urls.py
└── nexus/
    └── urls.py                  # Registro de la nueva app
```

## Task Breakdown

### Phase 1: Foundation (Models & Permissions)
- **Task 1.1:** Crear app `projects` y definir modelos:
  - `Project`: name, key (unique), description, owner (FK), created_at.
  - `Member`: user (FK), project (FK), role (owner, admin, developer, viewer).
  - `Column`: name, project (FK), position (int), is_done_column (bool).
  - **Agent:** `database-architect`
- **Task 1.2:** Implementar permisos personalizados `IsProjectOwnerOrAdmin`.
  - **Agent:** `security-auditor`

### Phase 2: Core Logic (API & Signals)
- **Task 2.1:** Crear serializers para Proyecto y Miembros.
  - **Agent:** `backend-specialist`
- **Task 2.2:** Implementar `ProjectViewSet` con acciones para listar, crear (soft-key auto) y detallar.
  - **Agent:** `backend-specialist`
- **Task 2.3:** Configurar `signals.py` para crear las 4 columnas base al crear un proyecto.
  - **Agent:** `backend-specialist`

### Phase 3: Integration & Testing
- **Task 3.1:** Registrar URLs y configurar CORS para el nuevo endpoint.
- **Task 3.2:** Pruebas de integración con `pytest` o `manage.py test`.
- **Agent:** `test-engineer`

## Phase X: Verification
- [ ] Ejecutar `python manage.py makemigrations` y `migrate`.
- [ ] Probar creación de proyecto vía Postman/Curl y verificar creación de columnas en DB.
- [ ] Verificar que un usuario B no puede ver proyectos del usuario A.
- [ ] **Script Audit:** `python .agent/scripts/verify_all.py .`
