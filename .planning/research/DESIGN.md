# Design Identity: Nexus-PM

## Purpose

This document defines the **visual identity** for Nexus-PM to ensure the UI feels premium, unique, and distinctly NOT a generic AI-generated template. Every component should feel like it belongs to a professional-grade project management command center.

---

## Skills Applied

This design system draws from these Antigravity skills:
- **`antigravity-design-expert`** → Glassmorphism, floating elements, spatial depth
- **`frontend-ui-dark-ts`** → Dark theme design tokens, glass utilities, animation patterns
- **`design-spells`** → Micro-interactions that add "magic" and personality

---

## 1. Visual Identity: "Agile Command Center"

**Concept:** The UI should feel like a **strategic mission control room** — where a team orchestrates complex software delivery with AI assistance. Not a pretty SaaS template. Not a Vercel clone. A **purpose-built agile system** that conveys intelligence and precision.

### What Makes It Different

| ❌ Generic PM Tool Look | ✅ Nexus-PM Identity |
|------------------------|---------------------|
| White/light backgrounds | Deep space-dark backgrounds with depth layers |
| Flat pastel cards | Glass panels with subtle glow accents |
| Default system fonts | Inter for UI + JetBrains Mono for data |
| Static task lists | Animated Kanban with fluid drag & drop |
| Basic color badges | Glowing status indicators with ambient bleed |
| Standard sidebar | Sidebar with active state animations and project context |
| Plain loading spinners | Skeleton shimmer + stagger entrance animations |
| Generic empty states | Illustrated empty states with contextual CTAs |
| Standard chat bubble | AI chat with typing indicator, context badges, glowing accent |

---

## 2. Color Palette: "Neon Agile"

**NOT purple/violet** (banned per GEMINI.md rules). Instead: **Electric Blue as primary + Warm Amber as accent**.

```
Primary:       #3B82F6 (Electric Blue — represents intelligence, precision, trust)
Primary Light: #60A5FA (Lighter blue — hover states)
Primary Dark:  #2563EB (Deeper blue — active states, borders)

Accent:        #F59E0B (Warm Amber — AI elements, highlights, warnings)
Accent Light:  #FBBF24 (Light amber — hover)

Danger:        #EF4444 (Red — critical, blocked, overdue)
Success:       #10B981 (Emerald — done, completed, active)
Warning:       #F97316 (Orange — approaching deadline, WIP exceeded)
Info:          #06B6D4 (Cyan — informational, AI recommendations)

Background 1:  hsl(222, 20%, 7%)   — Deepest bg (body)
Background 2:  hsl(222, 18%, 10%)  — Cards, panels
Background 3:  hsl(222, 16%, 14%)  — Elevated surfaces, modals
Background 4:  hsl(222, 14%, 18%)  — Hover states, active items

Text Primary:  #F1F5F9
Text Secondary:#94A3B8
Text Muted:    #64748B

Border:        hsla(215, 25%, 50%, 0.12)
Glow Primary:  rgba(59, 130, 246, 0.15)   — Blue ambient glow
Glow AI:       rgba(245, 158, 11, 0.15)   — Amber glow (AI elements)
```

### Why This Palette
- **Electric Blue** evokes technology, trust, intelligence — perfect for a PM tool with AI
- **Amber** for AI elements creates a distinct visual language: "amber = AI is acting"
- **No purple** — avoids the #1 cliché of AI-generated dark themes
- **Deep navy-black** backgrounds feel more professional than pure black

### Priority Colors
Each priority level has a distinct color used for badges and card borders:
```
Critical: #EF4444 (Red)
Alta:     #F97316 (Orange)
Media:    #3B82F6 (Blue)
Baja:     #64748B (Slate/Gray)
```

### Task Type Colors
```
Historia: #3B82F6 (Blue) — Feature/Story
Bug:      #EF4444 (Red) — Bug report
Tarea:    #10B981 (Green) — Technical task
Épica:    #8B5CF6 (... wait, no purple → use #F59E0B Amber) — Epic
```

---

## 3. Typography

```
UI Text:     "Inter" (Google Fonts) — weights 400, 500, 600, 700
Data/Mono:   "JetBrains Mono" (Google Fonts) — weights 400, 500, 700
```

### Usage Rules
- Project names, labels, navigation, descriptions → **Inter**
- Task keys (PRJ-001), story points, dates, metrics, KPI values → **JetBrains Mono**
- AI-generated text → Inter but in a slightly distinct style (italic or with amber accent border)

### Scale
| Element | Font | Size | Weight |
|---------|------|------|--------|
| Page title | Inter | 24px | 700 |
| Section title | Inter | 18px | 600 |
| Card title | Inter | 15px | 600 |
| Body text | Inter | 14px | 400 |
| Label/caption | Inter | 12px | 500 |
| KPI number | JetBrains Mono | 32px | 700 |
| Story points | JetBrains Mono | 16px | 600 |
| Task key (PRJ-001) | JetBrains Mono | 12px | 500 |
| Timestamp | JetBrains Mono | 11px | 400 |

---

## 4. Glassmorphism & Depth

### Card Style

```css
.card-glass {
  background: linear-gradient(
    135deg,
    hsla(222, 18%, 14%, 0.8),
    hsla(222, 18%, 10%, 0.6)
  );
  backdrop-filter: blur(12px);
  border: 1px solid hsla(215, 25%, 50%, 0.1);
  border-radius: 12px;
  box-shadow:
    0 4px 30px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 hsla(215, 25%, 70%, 0.06);
}
```

### Kanban Card Style
```css
.kanban-card {
  background: hsla(222, 18%, 12%, 0.9);
  border: 1px solid hsla(215, 25%, 50%, 0.08);
  border-left: 3px solid var(--priority-color); /* Color by priority */
  border-radius: 8px;
  transition: all 0.2s ease;
}

.kanban-card:hover {
  transform: translateY(-2px);
  border-color: hsla(215, 25%, 50%, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.kanban-card.dragging {
  opacity: 0.8;
  transform: rotate(2deg) scale(1.02);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.2);
}
```

### AI Panel Style
```css
.ai-panel {
  background: linear-gradient(
    135deg,
    hsla(222, 18%, 14%, 0.9),
    hsla(222, 18%, 10%, 0.7)
  );
  border: 1px solid hsla(40, 80%, 50%, 0.15); /* Amber tint */
  box-shadow:
    0 4px 30px rgba(0, 0, 0, 0.3),
    0 0 60px rgba(245, 158, 11, 0.05); /* Subtle amber glow */
}
```

### Key Depth Rules
1. **Cards float** — subtle box-shadow creates Z-axis separation
2. **Inner glow** — `inset` border-top creates top-light illusion
3. **Never flat** — even inputs and buttons have micro-shadows
4. **Priority border** — Kanban cards have left-border color matching priority
5. **AI distinction** — AI-related panels have amber tinted borders and glow

---

## 5. Micro-Interactions (Design Spells)

### Kanban Board
- **Card hover:** Lifts 2px + border brightens + subtle shadow expansion
- **Card drag:** Slight rotation (2deg) + scale 1.02 + blue glow shadow
- **Card drop:** Brief pulse animation on the target column
- **Column WIP exceeded:** Column header gets a pulsing orange/red glow

### Backlog
- **Drag reorder:** Item compresses slightly, ghost follows cursor with opacity
- **New item added:** Slides in from top with fade + stagger
- **Priority change:** Badge does a brief scale-bounce animation

### AI Agent
- **Typing indicator:** Three dots with staggered bounce animation (amber color)
- **Story generated:** Cards appear one-by-one with stagger (0.1s delay each)
- **Recommendation appears:** Amber glow pulse on the recommendation panel
- **Chat message:** Slides in from bottom with ease-out

### Navigation & General
- **Page transition:** Content fades + slides up on route change
- **Tab switch:** Active indicator slides smoothly (not instant swap)
- **Toast notification:** Slides in from top-right, auto-dismiss with progress bar
- **Button click:** Scale down 0.98 for 100ms
- **Loading:** Skeleton shimmer (not spinner) for all data views

---

## 6. Unique Elements (Anti-Generic Tactics)

### Project Header (within a project)
```
◉ Nexus-PM  ·  Sprint 3  ·  7 días restantes  ·  12/18 story points
```
A live status bar showing project context at all times.

### AI Agent Badge
When the AI generates content, shown as:
```
🤖 Generado por Agente IA  ·  hace 2 min
```
Distinct amber-tinted card with a subtle glow.

### Kanban Column Header
```
EN PROGRESO                    3/5
[█████████░░░░░] WIP
```
Progress bar showing WIP usage.

### Sprint Countdown
```
Sprint 3  ·  🔥 7 días restantes  ·  Velocity: 24 pts
```

### Task Key Format
```
NEX-042  ·  Historia  ·  🔵 Alta  ·  5 pts
```
Monospace key + type icon + colored priority + story points

---

## 7. Animation Patterns (Framer Motion)

```typescript
// Stagger children entrance (for grids, lists)
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

// Card hover effect
export const cardHover = {
  whileHover: { y: -2, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 },
};

// AI content pulse (amber glow)
export const aiPulse = {
  initial: { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.4)' },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(245, 158, 11, 0.4)',
      '0 0 0 10px rgba(245, 158, 11, 0)',
      '0 0 0 0 rgba(245, 158, 11, 0)'
    ]
  },
  transition: { duration: 1.5, ease: 'easeOut' },
};

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

// Kanban card drag
export const dragVariants = {
  idle: { scale: 1, rotate: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
  dragging: {
    scale: 1.02,
    rotate: 2,
    boxShadow: '0 12px 40px rgba(59, 130, 246, 0.2)',
    transition: { duration: 0.15 }
  },
};

// Number count-up (for KPIs)
// Use motion.span + useMotionValue + useTransform
// Animate from 0 to target over 0.6s with spring physics
```

---

## 8. Checklist: Before Declaring a Component "Done"

- [ ] Uses `card-glass` or glass utilities, NOT flat `bg-gray-900`
- [ ] Data values use JetBrains Mono, NOT default font
- [ ] Has a hover micro-interaction (lift, glow, scale — pick one)
- [ ] Mount animation uses stagger pattern for grids
- [ ] Priority colors use the defined palette, NOT random colors
- [ ] AI-related elements have amber accent (border, glow, or badge)
- [ ] No raw Tailwind gray/slate backgrounds — use the custom HSL palette
- [ ] Buttons have tap feedback (scale 0.98)
- [ ] Loading states use skeleton with subtle shimmer, NOT spinner
- [ ] Empty states have designed illustrations + CTA, NOT just text
- [ ] Kanban cards have priority-colored left border

---

## 9. Key Screen Descriptions

### Dashboard de Proyectos
- Grid de project cards (2-3 columnas desktop)
- Cada card: nombre, clave, avatar stack de miembros, sprint activo, barra de progreso
- "Nuevo Proyecto" button con blue accent
- Empty state: ilustración + "Crea tu primer proyecto"

### Tablero Kanban
- Columnas horizontales scrollables
- Cards con: clave (mono), título, tipo (ícono), prioridad (borde izquierdo), asignado (avatar), story points (badge)
- Header de columna: nombre + WIP counter + progress bar
- Panel lateral derecho para detalle de tarea (slide-in)

### Chat del Agente IA
- Panel flotante (bottom-right) o vista completa
- Mensajes del usuario: alineados a la derecha, blue bubble
- Mensajes del agente: alineados a la izquierda, amber-tinted card con ícono 🤖
- Input con placeholder "Pregúntale al Scrum Master..."
- Typing indicator con dots animados

### Backlog
- Lista vertical con drag handles
- Cada ítem: drag handle + checkbox + clave (mono) + título + tipo tag + prioridad badge + avatar + story points
- Sprint planning section: sidebar con sprint info + drop zone

---

*Design identity defined: 2026-04-20*
*Skills: antigravity-design-expert, frontend-ui-dark-ts, design-spells*
