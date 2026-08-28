========================================
CORE FOLDER - FOUNDATION & INFRASTRUCTURE
========================================

WHAT GOES HERE:
- UI primitives (Button, Card, Input, etc.)
- Layout components (Header, Footer, ToolViewer, etc.)
- Motion/Animation system
- State management (stores)
- Service layer (IndexedDB, OPFS, etc.)
- Tool registry
- Hooks that power the core

WHAT DOES NOT GO HERE:
- Reusable tool components (go to shared/components/)
- Domain logic (go to entities/)
- Generic helpers (go to lib/)

========================================
STRUCTURE
========================================

core/
├── components/
│   ├── layout/          <- Layout components
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── ToolHub.tsx
│   │   └── ToolViewer.tsx
│   └── ui/              <- UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── ... (20+ components)
├── hooks/               <- Core hooks
│   ├── useFilteredTools.ts
│   ├── useTools.ts
│   └── useToolUsage.ts
├── motion/              <- Animation system
│   ├── motion.tsx
│   ├── tokens.ts
│   ├── compositions/
│   ├── core/
│   ├── interactions/
│   └── presets/
├── registry/            <- Tool registry
│   └── toolRegistry.tsx
├── services/            <- Infrastructure services
│   ├── indexeddb.ts
│   ├── opfs.ts
│   └── toolDB.ts
└── store/               <- Global state
    ├── fileStore.ts
    ├── themeStore.ts
    └── toolStore.ts

========================================
DEPENDENCY RULES
========================================

✅ CAN import from: lib/, core/ only
❌ CANNOT import from: entities/, shared/, tools/, pages/

Core is the FOUNDATION - everything else builds on it.

========================================
RELATED FOLDERS
========================================

lib/      -> Generic helpers
shared/   -> Reusable UI + wrappers
entities/ -> Domain logic
tools/    -> Feature modules

========================================
REMEMBER
========================================

"core" = FOUNDATION ONLY
No business logic. No tool-specific code.

Everything in core is shared and foundational.
========================================