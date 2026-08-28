========================================
SHARED FOLDER - REUSABLE UI + WRAPPERS
========================================

WHAT GOES HERE:
- Reusable React components used by multiple tools
- Reusable React hooks combining entities + lib
- UI wrappers that make tools easier to build
- Shared UI utilities

WHAT DOES NOT GO HERE:
- Domain-specific business logic (go to entities/)
- Generic helpers (go to lib/)
- UI primitives (go to core/components/ui/)
- Tool-specific logic (go to tools/)

========================================
STRUCTURE
========================================

shared/
├── components/          <- Reusable UI components
│   ├── ActionButton.tsx
│   ├── ExportPanel.tsx
│   ├── FileCard.tsx
│   ├── FileDetails.tsx
│   ├── FilePreview.tsx
│   └── FileUpload.tsx
├── hooks/               <- Reusable React hooks
│   ├── useAction.ts
│   ├── useExportPanel.ts
│   └── useFileUpload.ts
└── index.ts             <- (optional) Barrel export

========================================
DEPENDENCY RULES
========================================

✅ CAN import from: entities/, lib/, core/
✅ CAN import from: other shared files
❌ CANNOT import from: tools/, pages/

========================================
HOW TO ADD A NEW SHARED COMPONENT
========================================

1. Create file: src/shared/components/{ComponentName}.tsx
2. Export the component
3. Import and use in any tool

========================================
RELATED FOLDERS
========================================

core/components/ui/ -> UI primitives (Button, Card, etc.)
entities/           -> Domain-specific pure logic
lib/                -> Generic helpers
tools/              -> Feature modules

========================================
REMEMBER
========================================

"shared" = REUSABLE UI + WRAPPERS ONLY
No business logic. No generic helpers.

If it's a UI primitive → core/components/ui/
If it's business logic → entities/
If it's generic helper → lib/
If it's tool-specific → tools/{tool}/

========================================