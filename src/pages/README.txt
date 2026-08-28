========================================
PAGES FOLDER - ROUTE SCREENS
========================================

WHAT GOES HERE:
- Top-level route components that represent entire pages/screens
- Page-level composition of tools, layouts, and shared components
- Routing logic and page-specific layout configurations
- Each file typically corresponds to a route in the app

WHAT DOES NOT GO HERE:
- Tool-specific logic (go to tools/)
- Reusable components (go to shared/ or core/)
- Business logic (go to entities/)
- Generic helpers (go to lib/)

========================================
STRUCTURE
========================================

pages/
├── HomePage.tsx              <- Landing page / tool catalog
├── ToolPage.tsx              <- Individual tool page
└── (future pages)            <- AboutPage.tsx, SettingsPage.tsx, etc.

========================================
DEPENDENCY RULES
========================================

✅ CAN import from: core/, shared/, tools/, entities/, lib/
❌ CANNOT import from: other pages

Pages orchestrate everything below them but should remain THIN.

========================================
HOW TO ADD A NEW PAGE
========================================

1. Create file: src/pages/{PageName}.tsx
2. Compose layouts, tools, and shared components
3. Add route mapping in your router configuration
4. Done!

========================================
RELATED FOLDERS
========================================

tools/    -> Feature modules used by pages
shared/   -> Reusable components and hooks
core/     -> UI primitives and infrastructure
entities/ -> Business logic
lib/      -> Generic helpers

========================================
REMEMBER
========================================

"pages" = ROUTE SCREENS ONLY
Keep pages THIN. Most logic belongs in tools/, shared/, or entities/.

========================================