# PLAN: Dashboard de Métricas por Proyecto

Implementación de un panel de analíticas dentro de cada proyecto utilizando Django Rest Framework para la agregación de datos y Recharts para la visualización en el frontend.

## 🎯 Objetivos
- Proporcionar visibilidad del progreso del Sprint (Burndown).
- Analizar la salud del backlog mediante distribución de prioridades.
- Equilibrar la carga de trabajo entre los miembros del equipo.

---

## 🛠️ Desglose de Tareas

### Fase 1: Backend (Agregación de Datos)
- [ ] **Task 1.1:** Crear endpoint `GET /api/projects/{id}/analytics/`.
- [ ] **Task 1.2:** Implementar lógica de Burndown (comparar Story Points completados vs. fecha de fin del sprint).
- [ ] **Task 1.3:** Agrupar tareas por `priority` y `assignee` para las gráficas de distribución y carga.
- [ ] **Task 1.4:** Unit tests para los cálculos de métricas.

### Fase 2: Frontend (Estructura y Datos)
- [ ] **Task 2.1:** Instalar dependencia `recharts`.
- [ ] **Task 2.2:** Crear servicio de API en frontend para consumir el nuevo endpoint de analíticas.
- [ ] **Task 2.3:** Crear componente base `AnalyticsContainer.tsx` para alojar las gráficas.

### Fase 3: Visualización (Recharts)
- [ ] **Task 3.1:** Implementar `BurndownChart.tsx` (AreaChart con línea de guía ideal).
- [ ] **Task 3.2:** Implementar `PriorityPieChart.tsx` (PieChart con colores estandarizados: Rojo para High, etc.).
- [ ] **Task 3.3:** Implementar `WorkloadBarChart.tsx` (BarChart mostrando tareas por usuario).

### Fase 4: Integración UI/UX
- [ ] **Task 4.1:** Añadir pestaña "Métricas" o "Insights" en la navegación del Proyecto.
- [ ] **Task 4.2:** Asegurar que el diseño sea responsive y mantenga la estética Dark Mode de Nexus-PM.
- [ ] **Task 4.3:** Implementar estados de carga (skeletons) y manejo de errores.

---

## 👥 Asignación de Agentes
- **Backend Specialist**: Fase 1 (DRF & Aggregations).
- **Frontend Specialist**: Fase 2, 3 y 4 (React & Recharts).

---

## ✅ Lista de Verificación (Verification)
- [ ] El endpoint de analíticas responde en menos de 200ms.
- [ ] El Burndown Chart refleja correctamente el cambio al completar una tarea.
- [ ] Las gráficas son legibles en dispositivos móviles.
- [ ] Si un proyecto no tiene tareas, se muestra un estado "Empty" elegante.
