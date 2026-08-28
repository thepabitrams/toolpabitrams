========================================
TOOLS FOLDER - FEATURE MODULES
========================================

WHAT GOES HERE:
- Complete feature modules (tools)
- Each tool is a self-contained feature
- Tools can be image processing, finance, utility, etc.
- Each tool has its own UI, logic, and state

WHAT DOES NOT GO HERE:
- Generic utilities (go to lib/)
- Domain-specific business logic (go to entities/)
- Reusable UI components (go to shared/components/)
- Reusable hooks (go to shared/hooks/)

========================================
STRUCTURE
========================================

tools/
├── {category}/                    <- Tool category (media, finance, etc.)
│   └── {tool-name}/               <- Individual tool
│       ├── index.tsx              <- Tool registry (exports Tool definition)
│       ├── {ToolName}.tsx         <- Main UI orchestrator
│       ├── canvas.tsx             <- Preview/editor component (if needed)
│       ├── controls.tsx           <- Controls UI (if needed)
│       ├── use{ToolName}.ts       <- Tool-specific logic hook
│       ├── components/            <- Tool-specific components (if needed)
│       ├── hooks/                 <- Tool-specific hooks (if needed)
│       ├── utils/                 <- Tool-specific utilities (if needed)
│       └── types/                 <- Tool-specific types (if needed)
└── index.ts                       <- (optional) Barrel export

========================================
CURRENT TOOLS
========================================

IMAGE TOOLS (src/tools/media/):
  flip-rotate/      - Rotate and flip images
  adjust-size/      - Compress/resize image file size
  add-text/         - Add text overlay to images
  background-remove/ - Remove image backgrounds
  convert-image/    - Convert image formats
  image-filters/    - Apply filters to images
  merge-images/     - Merge multiple images
  form-crop/        - Crop images with forms

PDF TOOLS: (coming soon)
  merge-pdf/        - Merge PDF files
  split-pdf/        - Split PDF files

FINANCE TOOLS (src/tools/finance/):
  split/            - Split expenses, calculate settlements

========================================
DEPENDENCY RULES
========================================

✅ CAN import from: entities/, lib/, shared/, core/
✅ CAN import from: other tools (if needed - avoid when possible)
❌ CANNOT import from: pages/

Each tool should be SELF-CONTAINED and not depend on other tools.

========================================
HOW TO ADD A NEW TOOL
========================================

STEP 1: Create tool folder
  src/tools/{category}/{new-tool}/

STEP 2: Create required files
  // index.tsx - Tool registry
  import { Tool } from '@/core/registry/toolRegistry';
  import { NewTool } from './NewTool';

  const toolDef: Tool = {
    id: 'new-tool',
    name: 'New Tool',
    description: 'What this tool does',
    category: 'category',
    input: 'single' | 'multiple',
    component: NewTool,
  };

  export default toolDef;

  // {NewTool}.tsx - Main UI orchestrator
  export function NewTool({ category, toolId }: NewToolProps) {
    // UI logic
  }

STEP 3: Add logic hook (if needed)
  // useNewTool.ts
  export function useNewTool() {
    // Tool-specific logic
  }

STEP 4: Register the tool
  Add to src/core/registry/toolRegistry.tsx or ensure dynamic import works.

STEP 5: Done! Tool appears in the catalog.

========================================
TOOL CATEGORIES
========================================

media/        -> Image, video, audio editing
finance/      -> Finance, split expenses, calculations
personalisation/ -> Wallpapers, themes, customization
houseandhome/ -> Tenant billing, home management

========================================
WHY THIS MATTERS
========================================

✅ ORGANIZED   - Each tool has its own folder
✅ SELF-CONTAINED - Each tool works independently
✅ SCALABLE   - Add new tools without breaking existing ones
✅ REUSABLE   - Tools can use shared entities and components
✅ CLEAN      - Separates UI from business logic

========================================
RELATED FOLDERS
========================================

entities/  -> Domain-specific pure logic
lib/       -> Generic helpers
shared/    -> Reusable components + hooks
core/      -> UI primitives + infrastructure
pages/     -> Routes

========================================
REMEMBER
========================================

"tools" = FEATURE MODULES ONLY
Each tool is a complete, self-contained feature.

Tools should be THIN - most logic should go in:
  - entities/ (business logic)
  - shared/ (reusable UI)
  - lib/ (generic helpers)

========================================