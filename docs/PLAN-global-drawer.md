# PLAN: Nexus Global Command Drawer

## 1. Objetivo
Centralizar la inteligencia agéntica en un panel lateral (Drawer) persistente y global. Nexus dejará de ser una página para convertirse en un acompañante constante que permite gestionar proyectos mediante lenguaje natural y autorización táctica desde cualquier sección de la app.

---

## 2. Decisiones Técnicas (PM Focus)

### 2.1 UI/UX: Command Center Overlay
- **Tipo:** Overlay lateral derecho (350px - 400px).
- **Estética:** "Glow-Void". Fondo negro profundo con 80% opacidad, bordes cian neón, tipografía mono-espaciada.
- **Interacción:** El drawer se superpone al contenido actual (Overlay) para evitar saltos de layout en componentes complejos como el Kanban.

### 2.2 Componentes de Integración
- **Zustand (`chatStore.ts`):** Gestionará la visibilidad (`isOpen`), el historial de mensajes y la cola de acciones pendientes global.
- **Action Hub:** Se desacoplará de `InsightsPage` para ser un sub-componente dentro del Drawer.

---

## 3. User Review Required

> [!IMPORTANT]
> **COMPORTAMIENTO OMNIPRESENTE:** El drawer mantendrá el contexto de la página donde se encuentre el usuario (ej: si estás en Kanban y preguntas "quién está libre", sabrá que hablas de ese proyecto).

> [!WARNING]
> **RECURSOS:** El polling de acciones ahora será global. Debemos asegurar que no sobrecargue el backend cuando el drawer esté cerrado.

---

## 4. Plan de Ejecución (Task Breakdown)

### Fase 1: Infraestructura de Estado (Frontend)
- [ ] **[NEW]** `frontend/src/store/uiStore.ts`: Control de visibilidad del Drawer y estados de carga.
- [ ] **[NEW]** `frontend/src/store/chatStore.ts`: Migrar lógica de mensajes desde componentes locales a un store global.

### Fase 2: Componente Drawer (Frontend)
- [ ] **[NEW]** `frontend/src/components/intel/GlobalCommandDrawer.tsx`: Contenedor principal con animaciones de Framer Motion.
- [ ] **[MODIFY]** `frontend/src/components/intel/ActionConfirmationHub.tsx`: Adaptar estilos para el ancho reducido del drawer.
- [ ] **[MODIFY]** `frontend/src/components/ai/NexusChat.tsx`: Refactorizar para funcionar dentro del Drawer.

### Fase 3: Integración Global (Layout)
- [ ] **[MODIFY]** `frontend/src/components/layout/MainLayout.tsx`: Inyectar el `GlobalCommandDrawer` y sincronizar con el botón de trigger.
- [ ] **[MODIFY]** `frontend/src/components/layout/Navbar.tsx`: Añadir trigger visual (icon de Nexus/IA) con indicador de acciones pendientes.

### Fase 4: Optimización Backend
- [ ] **[MODIFY]** `backend/apps/intelligence/views.py`: Mejorar el endpoint de acciones para soportar filtros por contexto de página actual enviado desde el front.

---

## 5. Verificación
1. **Navegación:** Abrir drawer en Dashboard -> Cambiar a Kanban -> Verificar que el drawer sigue abierto y con la historia intacta.
2. **Acción Agéntica:** Pedir creación de tarea en el Drawer -> Autorizar -> Verificar creación en el tablero Kanban en tiempo real.
3. **Responsividad:** Verificar que el overlay no oculte controles críticos en resoluciones pequeñas (móvil/tablet).

---

## 6. Agent Assignments
| Agent | Responsabilidad |
|-------|-----------------|
| `frontend-specialist` | Implementación del Drawer, Stores y animaciones UI. |
| `backend-specialist` | Refinamiento de filtros de contexto en la API de Inteligencia. |
