# PLAN: Navegación Superior (Top Navbar)

## Objetivo
Implementar una barra de navegación superior (Top Navbar) constante en las rutas protegidas de Nexus PM, junto con facilidades tipo "breadcrumbs" (migas de pan) para permitirle al usuario moverse rápidamente por la aplicación sin usar los controles del navegador.

## 1. Diseño de Arquitectura
- **Componente Navbar Global:** Crearemos un componente `<Navbar />` que se integrará dentro de un `<MainLayout />`.
- **Layout Route:** Agruparemos todas las "Protected Routes" en `App.tsx` bajo este nuevo `<MainLayout />` para que la barra persista.
- **Breadcrumbs Contextuales:** El Navbar usará la ruta actual (react-router-dom `useLocation` o lectura de `useParams`) para mostrar en qué proyecto y sección (ej. Kanban, Backlog) está el usuario y brindar links de regreso.

## 2. Componentes a crear / modificar

### 2.1 `frontend/src/components/layout/Navbar.tsx`
- **Sección Izquierda:** Logo de Nexus PM, botón `Inicio` o `Mis Proyectos`. Si está dentro de un proyecto, mostrar `Proyecto > [Sección]`.
- **Sección Derecha:** Botón "Cerrar sesión" y/o "Mi Perfil" (con un ícono `User`).

### 2.2 `frontend/src/components/layout/MainLayout.tsx`
- Layout principal que envuelva el contenido hijo (Outlet).
- Estructura:
```tsx
<div className="min-h-screen bg-slate-900 flex flex-col">
  <Navbar />
  <main className="flex-1 overflow-auto">
    <Outlet />
  </main>
</div>
```

### 2.3 `frontend/src/App.tsx`
- Actualizar el enrutamiento para envolver las rutas protegidas (`/dashboard`, `/project/:projectId/kanban`, etc.) dentro del nuevo `<MainLayout />`.

## 3. Comportamiento Esperado
- El Navbar siempre es visible una vez iniciada la sesión.
- Facilita hacer clic en "Inicio" para regresar a la página de selección de proyectos sin usar "Atrás". 

## 4. Agentes a Involucrar (Fase 2)
- **`frontend-specialist`:** Construcción de UI adaptativa, estilado con TailwindCSS, enrutamiento y micro-interacciones.

## Siguientes Pasos
Esperar validación del usuario para proceder a la Fase 2 (Implementación de Archivos React).
