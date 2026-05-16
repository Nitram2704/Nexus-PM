# PLAN: Nexus Intelligence Hub (NexusChat Global)

## 1. Objetivo
Convertir el chat experimental en un Hub de Inteligencia centralizado. Accesible desde cualquier parte de la app, consciente del contexto y capaz de ejecutar acciones en el proyecto.

---

## 2. Decisiones Técnicas (PM Focus)

### 2.1 UI/UX: Global "Command" Drawer
- **Ubicación:** Drawer lateral derecho persistente en `MainLayout`.
- **Efecto:** Al abrirse, "empuja" el contenido de la página principal.
- **Estética:** Cyber-tactical, mono-spaced, bordes angulares 0px, scanlines.

### 2.2 Memoria y Estado
- **Zustand (`chatStore.ts`):** Guardará historial local, estado de visibilidad y filtros de contexto actual.
- **PostgreSQL (`AIMessage`):** Persistencia permanente de hilos de conversación.

### 2.3 Capacidad Agéntica (Tool Use)
- **Modo:** El backend detectará intenciones (Intents) y retornará una estructura de acción.
- **Acciones iniciales:** `CREATE_TASK`, `MOVE_TASK`, `ASSIGN_TASK`.
- **Flujo:** 
    1. Usuario pide acción.
    2. IA retorna texto + Metadata de Acción.
    3. Frontend ejecuta acción vía API y refresca `projectStore`.

---

## 3. User Review Required
> [!IMPORTANT]
> **AUTONOMÍA DE ACCIÓN:** ¿IA pide confirmación antes de mutar o lo hace directo?
> **RESPUESTA:** Se añadirá **Confirmation Hub** en chat para acciones críticas (Aprobar/Editar).

---

## 4. Plan de Ejecución

### Fase 1: Fundamento Front-end (UI Global)
- [ ] **[NEW]** `frontend/src/store/chatStore.ts`: Estado global del chat.
- [ ] **[MODIFY]** `frontend/src/components/layout/MainLayout.tsx`: Integrar Drawer.
- [ ] **[MODIFY]** `frontend/src/components/ai/NexusChat.tsx`: Limpiar lógica local. Nuevo modo "Drawer".

### Fase 2: Action Engine (Backend)
- [ ] **[MODIFY]** `backend/apps/intelligence/client.py`: Inyectar "System Tools".
- [ ] **[MODIFY]** `backend/apps/intelligence/views.py`: 
    - `ChatView` procesar `project_id` opcional.
    - Respuesta estructurada (JSON action + params).
- [ ] **[MODIFY]** `backend/apps/intelligence/serializers.py`: Soporte metadata.

### Fase 3: Integración y Refresco UI
- [ ] **[MODIFY]** `frontend/src/api/ai.ts`: Actualizar interfaces.
- [ ] **[MODIFY]** `frontend/src/components/ai/NexusChat.tsx`: Listener ejecutor de acciones.
- [ ] **[MODIFY]** `frontend/src/components/layout/Navbar.tsx`: Trigger visual de actividad.

---

## 5. Verificación
1. **Chat Manual:** Probar en Dashboard y Kanban.
2. **Action Test:** "Crea tarea TEST". Verificar en DB.
3. **Persistencia:** Navegar sin cerrar Drawer. Historia intacta.
