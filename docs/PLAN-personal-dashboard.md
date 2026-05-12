# PLAN: Personal Dashboard (Home Global)

Transformación del Dashboard inicial en un Centro de Mando personal que agrega información de todos los proyectos donde el usuario es miembro.

## 🎯 Objetivos
- Reducir el tiempo de navegación entre proyectos.
- Centralizar las tareas pendientes del usuario.
- Mostrar alertas críticas de forma inmediata.

---

## 🛠️ Desglose de Tareas

### Fase 1: Backend (Agregación Global)
- [ ] **Task 1.1:** Crear endpoint `GET /api/me/dashboard/`.
- [ ] **Task 1.2:** Lógica para obtener:
    - Tareas asignadas al `request.user` (excluyendo terminadas).
    - Lista de proyectos recientes (basado en `updated_at` de membresía o actividad).
    - Conteo de tareas por prioridad (global).
- [ ] **Task 1.3:** Serializer para "MyTask" (incluyendo nombre de proyecto y clave).

### Fase 2: Frontend (Estructura Dashboard)
- [ ] **Task 2.1:** Rediseñar `DashboardPage.tsx` con layout de rejilla (CSS Grid).
- [ ] **Task 2.2:** Crear componente `GlobalSummary.tsx` (Cards superiores con números clave).
- [ ] **Task 2.3:** Crear componente `GlobalTaskList.tsx` (Lista de tareas con filtros rápidos: Por hacer, En curso).

### Fase 3: Navegación y Acceso Rápido
- [ ] **Task 3.1:** Crear componente `RecentProjectCards.tsx` para salto rápido.
- [ ] **Task 3.2:** Añadir indicadores visuales de "Vencido" o "Prioridad Crítica".

---

## 👥 Asignación de Agentes
- **Backend Specialist**: Fase 1 (API de Usuario).
- **Frontend Specialist**: Fase 2 y 3 (Rediseño Dashboard).

---

## ✅ Lista de Verificación (Verification)
- [ ] El dashboard carga tareas de múltiples proyectos.
- [ ] No se muestran tareas que ya están en la columna "Done".
- [ ] Los enlaces de los proyectos llevan directamente al Kanban del proyecto.
- [ ] El tiempo de carga del resumen global es <300ms.
