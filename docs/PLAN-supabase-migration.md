# Plan de Migración Híbrida: Django + Supabase

## Objetivo
Migrar la persistencia de datos de SQLite a Supabase PostgreSQL y habilitar actualizaciones en tiempo real (Realtime) para el tablero Kanban sin perder la lógica de negocio centralizada en Django.

## Fase 1: Cimiento y Datos (Backend)
- [ ] **Configuración de Dependencias**: Instalar `psycopg2-binary` y `dj-database-url`.
- [ ] **Variables de Entorno**: Configurar `DATABASE_URL` en `backend/.env`.
- [ ] **Migración de Esquema**: 
    - Ejecutar `python manage.py migrate` contra Supabase.
    - Verificar la creación de tablas en el dashboard de Supabase (esquema `public`).
- [ ] **Sincronización de Datos** (Opcional si se empieza de cero): Exportar datos actuales e importarlos a Postgres.

## Fase 2: Magia Realtime (Supabase)
- [ ] **Habilitar Realtime**: Activar la publicación de cambios para las tablas `projects_column` y `tasks_task` en el panel de Supabase (Database -> Replication).
- [ ] **Seguridad (RLS)**: Configurar políticas de Row Level Security para permitir que el cliente (Frontend) lea los cambios usando el `anon key`.

## Fase 3: Integración Frontend (React)
- [ ] **SDK Setup**: Instalar `@supabase/supabase-js`.
- [ ] **Supabase Client**: Crear helper centralizado en `frontend/src/lib/supabase.ts`.
- [ ] **Kanban Subscription**: 
    - Implementar un listener en `KanbanPage.tsx`.
    - Disparar `loadProject()` automáticamente ante cualquier evento `INSERT`, `UPDATE` o `DELETE` en las tablas clave.

## Fase 4: Verificación y Optimización
- [ ] **Pruebas de Estrés**: Validar que movimientos masivos no saturen el listener.
- [ ] **Limpieza**: Eliminar archivos de base de datos local (`db.sqlite3`).

## Riesgos y Mitigación
- **Latencia**: Al ser una DB remota, la carga inicial podría ser más lenta. Se mitigará con estados de carga eficientes.
- **Conectividad**: Asegurar que las IPs de los desarrolladores (o el servidor de deploy) no estén bloqueadas por el firewall de Supabase.

---
**¿Apruebas este plan para proceder con la implementación?**
