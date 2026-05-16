# PLAN: UI/UX Tactical Rework

Rework visual profundo de Nexus PM para abandonar la estética genérica y adoptar un estilo "Tactical OS / System Architect" basado en las referencias de Human-Stack, con un enfoque mate, sobrio y minimalista-elaborado.

## User Review Required

> [!IMPORTANT]
> - **Tipografía:** Se propone el cambio global a una fuente monospaced para etiquetas de datos. ¿Confirmas el uso de JetBrains Mono o prefieres otra?
> - **Bordes:** Se eliminarán los `rounded-lg` por esquinas rectas o cortes geométricos sutiles.

## Proposed Changes

### 1. Design System & Global Styles [FRONTEND]

#### [MODIFY] [index.css](file:///c:/Users/marti/Visual/Nexus%20PM/frontend/src/index.css)
- Implementar una grilla de fondo sutil basada en CSS `linear-gradient`.
- Definir tokens de color:
  - `--bg-primary`: #020617 (Deep Void)
  - `--accent-primary`: #22d3ee (Tactical Cyan)
  - `--border-subtle`: rgba(255, 255, 255, 0.05)
- Sustituir sombras genéricas por bordes técnicos definidos.

### 2. Layout & Global Components

#### [MODIFY] [Navbar.tsx](file:///c:/Users/marti/Visual/Nexus%20PM/frontend/src/components/layout/Navbar.tsx)
- Transformar la barra superior en un panel modular con etiquetas de "SYSTEM STATUS".
- Añadir micro-interacciones de hover con líneas tácticas.

#### [NEW] [TacticalCard.tsx](file:///c:/Users/marti/Visual/Nexus%20PM/frontend/src/components/ui/TacticalCard.tsx)
- Un wrapper reutilizable que implemente el estilo de "panel de comando" (esquinas rectas, glassmorphism mate).

### 3. Dashboard Rework

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/marti/Visual/Nexus%20PM/frontend/src/pages/Dashboard.tsx)
- Reorganizar los widgets para que utilicen `TacticalCard`.
- Implementar etiquetas de depuración visual (ej: `[OPS_MODULE]`, `// INIT_COMPLETE`).

## Tasks Breakdown

- [ ] **Etapa 1: Foundation**
  - [ ] Configurar variables CSS en `index.css`.
  - [ ] Implementar la grilla sutil de fondo.
  - [ ] Integrar tipografía Monospace (JetBrains Mono).
- [ ] **Etapa 2: Components**
  - [ ] Rework completo de la Navbar.
  - [ ] Creación del componente `TacticalCard`.
  - [ ] Aplicar estilo mate/sobrio a los botones principales.
- [ ] **Etapa 3: Pages**
  - [ ] Rework del Dashboard principal.
  - [ ] Añadir micro-animaciones de entrada (fade-in + slide técnico).

## Verification Plan

### Automated Checks
- `python .agent/scripts/ux_audit.py` para asegurar contraste y jerarquía.
- Verificación visual de los cortes geométricos en diferentes viewports.

### Manual Verification
- Comparativa visual contra las referencias enviadas (Human-Stack).
