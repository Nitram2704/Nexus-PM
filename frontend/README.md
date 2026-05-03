<div align="center">

```text
  _   _                       ____  __  __   (FRONTEND)
 | \ | | _____  ___   _ ___  |  _ \|  \/  |  ARCHITECTURE
 |  \| |/ _ \ \/ / | | / __| | |_) | |\/| |  [SYSTEM_V0.1]
 | |\  |  __/>  <| |_| \__ \_|  __/| |  | |
 |_| \_|\___/_/\_\\__,_|___(_)_|   |_|  |_|
```

**Tactical Command Center for Nexus-PM — Built with React, Tailwind v4, and Zustand.**

</div>

---

## ⚡ Frontend Overview

The Nexus-PM frontend is a high-performance **command-center interface** designed for Agile orchestration. It utilizes a "Tactical OS" aesthetic (Midnight Void & Cyan) with strict geometric proportions and mono-spaced data displays.

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript 6
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 (CSS-first configuration)
- **State Management:**
    - `Zustand`: Global UI state & Auth persistence.
    - `TanStack Query v5`: Server-state management & API caching.
- **Routing:** React Router 7
- **Visualization:** Recharts (Project insights & Velocity)
- **Interactions:** `@hello-pangea/dnd` for Kanban orchestration.

---

## 📁 Project Structure

```text
src/
├── api/            # Axios interceptors & endpoint-specific modules
├── components/
│   ├── ai/         # Specialized AI interaction components (BacklogGenerator)
│   ├── kanban/     # Logic for Board, Columns, and Task drawers
│   ├── layout/     # Persistent Global Navigation & Sidebar
│   └── ui/         # Base Tactical atomic components (TacticalCard, Buttons)
├── pages/          # Full-page views (Dashboard, Backlog, Insights, Auth)
├── store/          # Zustand global stores (authStore, projectStore)
├── types/          # Global TypeScript interfaces & contract definitions
├── lib/            # Utilities & helper functions (date-fns, supabase client)
├── App.tsx         # Route orchestrator & Global Providers
└── index.css       # Tactical Design Tokens & Global Styles (Grid background)
```

---

## 🚦 Getting Started

### 1. Environment Configuration

Create a `.env` file in this directory:

```env
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Installation & Execution

```bash
# Install dependencies
npm install

# Start Tactical Orchestrator (Development)
npm run dev

# Build for Production
npm run build
```

---

## 🎨 Design Guidelines (Tactical OS)

- **Colors:** Deep Void (`#020617`) background with Tactical Cyan (`#22d3ee`) accents.
- **Typography:** Inter for body text; Monospaced (JetBrains Mono) for numerical data and system status.
- **Geometry:** Zero `border-radius`. Use sutil `border-subtle` (`rgba(255,255,255,0.05)`) instead of shadows.
- **Background:** Subtle linear grid (`1px` lines every `40px`) to give a blueprint feel.

---

<div align="center">
  <i>Nexus-PM Frontend — Standardized Agile Command Center.</i>
</div>
