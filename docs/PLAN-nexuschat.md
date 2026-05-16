# PLAN: NexusChat (Asistente Interactivo Conversacional)

## 1. Context & Objective
**Objective:** Integrar un asistente de inteligencia artificial conversacional (NexusChat) persistente en el dashboard del proyecto, cumpliendo con la historia de usuario HU-25. Este chat permitirá a los Project Managers y usuarios del equipo consultar métricas, solicitar división de tareas, obtener sugerencias de bloqueos y controlar partes del proyecto mediante una interfaz de lenguaje natural.

**Rationale:** Actualmente el sistema Ops-Room permite orquestaciones "one-shot" a partir de un modal de épica. NexusChat cierra la brecha ofreciendo interacción continua y memoria contextual sobre el estado actual del proyecto, tickets asignados y sprints.

---

## 2. Architecure & Components

### 2.1 Backend (Python/Django)
- **Modelos de Memoria Caching/DB:** 
  - Necesitamos guardar el historial de mensajes por `project_id`. El modelo de IA funciona mejor si se le pasa el historial de la conversación. (Ya existe `ChatHistoryView`, requiere revisión de persistencia usando PostgreSQL o Cache en Redis).
- **Controlador Principal (`ChatView`):** 
  - Ajustar el endpoint para que recupere contexto del proyecto (Sprints activos, tareas bloqueadas, velocidad) antes de inyectarlo en el prompt genérico del Agente.

### 2.2 Frontend (React/TypeScript)
- **Global Context/Store:**
  - `useChatStore` (Zustand) para manejar el estado abierto/cerrado del cajón lateral (Drawer) de NexusChat a nivel global y mantener el historial de mensajes sin que se pierdan al navegar.
- **Componentes UI (`NexusChatDrawer.tsx`):**
  - Un drawer persistente o un panel colapsable en la derecha/abajo de la pantalla.
  - Componente `MessageBubble` para distinguir IA vs Humano.
  - Estado de `isTyping` con animaciones tipo *glassmorphism* y el aura cyan/azul del proyecto.
- **Integración API (`ai.ts`):** 
  - Consumir la actual `sendMessageApi`.

---

## 3. Task Breakdown (Phase Execution)

### Fase 1: Fundamento Backend y Estado
- [ ] Revisar tabla/modelo temporal para guardar Historial de Chat por sesión/usuario (`AIMessage`).
- [ ] Actualizar `ChatView` para incorporar un System Prompt más poderoso que sepa que está asistiendo en un proyecto Kanban.
- [ ] Testear con POSTman / cURL de que NexusChat tiene memoria de 3-4 iteraciones.

### Fase 2: Componentes UI
- [ ] Crear el estado Zustand (`chatStore.ts`) para almacenar mensajes localmente.
- [ ] Diseñar el `NexusChatDrawer.tsx` (estética comando cibernético, bordes angulares 0px radius, scroll oscuro).
- [ ] Agregar el botón de trigger global en el layout principal (`MainLayout` o `Navbar`).

### Fase 3: Integración y UX Edge Cases
- [ ] Conectar Chat con la API (mostrar loader/typing).
- [ ] Añadir atajo de teclado (`Cmd + J` o `Ctrl + J`) para desplegar rápidamente.
- [ ] Añadir auto-scroll al recibir nuevos mensajes.
- [ ] Implementar degradado elegante "fade to top" para mensajes viejos.

---

## 4. 🛑 Socratic Gate (Preguntas Abiertas para el Usuario)

Antes de iniciar la ejecución de este plan, necesitamos definir ciertas reglas del negocio:
1. **Memoria del Chat:** ¿Queremos que el chat guarde el historial permanentemente en la base de datos (PostgreSQL), o basta con memoria temporal (Redis) hasta que recargue la página?
2. **Capacidad de Ejecución:** ¿El chat solo "opina" y da consejos, o quieres que el chat pueda ejecutar mutaciones (ej. si el usuario le pide "Crea la tarea de login", el chat la inserta en base de datos)? La segunda opción requiere Function Calling o Tool Use en GenAI.
3. **Persistencia Visual:** ¿Debe el chat estar en una "Página de Inteligencia" separada dentro del menú, o debe ser un panel flotante (Drawer/Botón en esquina) disponible en TODO momento?

---
*Este plan espera validación antes de proceder con el comando `/create`.*
