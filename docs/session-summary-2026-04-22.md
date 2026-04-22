# Resumen de Sesión - 22 de Abril, 2026

## Objetivo: Implementación del Módulo de Gestión de Tareas (HU-08)

En esta sesión se completó la infraestructura del backend para la gestión de tareas dentro de Nexus-PM, permitiendo la operatividad del tablero Kanban.

### 1. Cambios en Modelos
- **Proyecto**: Se añadió el campo `task_counter` para gestionar identificadores secuenciales por proyecto.
- **Tareas**: Creación del modelo `Task` en la nueva aplicación `apps.tasks`. Incluye campos para tipo (Bug/Feature), prioridad, puntos de historia y soporte para subtareas.

### 2. Lógica de Negocio Automática
- **Generación de Claves**: Implementación de un signal de Django (`pre_save`) con transacciones atómicas para generar llaves únicas como `NEX-1`, `NEX-2`, etc.
- **Validaciones de Seguridad**: Los serializadores ahora validan que los asignados sean miembros del proyecto y que las columnas pertenezcan al mismo tablero.

### 3. API REST (v1)
- **Endpoints**: `/api/v1/tasks/` funcional con CRUD completo.
- **Acción 'Move'**: Implementación de un endpoint dedicado para mover tareas entre columnas, optimizando el flujo del frontend.
- **Permisos**: Aplicación de `IsProjectMember` para asegurar el aislamiento de datos entre proyectos.

### 4. Infraestructura y DevOps
- Registro de la app en `settings.py`.
- Configuración de rutas en `urls.py`.
- Aplicación exitosa de migraciones a la base de datos.
- Verificación técnica mediante scripts de prueba.

---
**Nexus-PM - Advanced Agentic Coding**
