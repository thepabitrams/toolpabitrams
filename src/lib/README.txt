========================================
LIB FOLDER - GENERIC HELPERS
========================================

WHAT GOES HERE:
- Generic utilities that work across ANY domain
- Browser API helpers (loadImage, exportCanvas, etc.)
- Date/Time helpers (formatDate, timeAgo, etc.)
- String helpers (capitalize, slugify, truncate, etc.)
- Array/Object helpers (groupBy, pick, omit, etc.)
- Math helpers (clamp, round, etc.)
- Validation helpers (isEmail, isUrl, etc.)

WHAT DOES NOT GO HERE:
- Domain-specific logic (go to entities/)
- React components (go to shared/components/)
- React hooks (go to shared/hooks/)
- UI state (go to tools/hooks/)

========================================
STRUCTURE
========================================

lib/
├── browser/          <- Browser API helpers
│   ├── loadImage.ts
│   ├── exportCanvas.ts
│   ├── prepareCanvas.ts
│   ├── resizeCanvas.ts
│   └── index.ts
├── date/             <- Date/Time helpers
│   ├── formatDate.ts
│   ├── timeAgo.ts
│   └── index.ts
├── string/           <- String helpers
│   ├── capitalize.ts
│   ├── slugify.ts
│   ├── truncate.ts
│   └── index.ts
├── array/            <- Array helpers
│   ├── groupBy.ts
│   ├── unique.ts
│   └── index.ts
├── object/           <- Object helpers
│   ├── pick.ts
│   ├── omit.ts
│   └── index.ts
├── math/             <- Math helpers
│   ├── clamp.ts
│   ├── round.ts
│   └── index.ts
├── validation/       <- Validation helpers
│   ├── isEmail.ts
│   ├── isUrl.ts
│   └── index.ts
└── index.ts          <- Barrel export (exports everything)

========================================
DEPENDENCY RULES
========================================

✅ CAN be imported by: entities/, shared/, tools/, pages/
✅ CAN import from: lib/ only (self-contained)
❌ CANNOT import from: entities/, shared/, tools/, pages/

This keeps lib as a GENERIC, SELF-CONTAINED layer.

========================================
HOW TO ADD A NEW UTILITY
========================================

STEP 1: Create a new folder (if needed)
  lib/{category}/

STEP 2: Create the utility file
  // lib/{category}/{helper}.ts
  export function {helper}(params) {
    // Generic logic only
    // No domain-specific logic
    // No React
  }

STEP 3: Create index.ts in the folder
  // lib/{category}/index.ts
  export { helper } from './helper';

STEP 4: Add to lib/index.ts
  // lib/index.ts
  export * from './{category}';

STEP 5: Import and use anywhere!
  import { helper } from '@/lib/{category}';

========================================
EXAMPLES
========================================

BROWSER HELPERS (lib/browser/):
  loadImage(file)        - Load image into HTMLImageElement
  exportCanvas(canvas)   - Export canvas to blob
  prepareCanvas(canvas)  - Prepare canvas with bg
  resizeCanvas(canvas)   - Resize canvas dimensions

DATE HELPERS (lib/date/):
  formatDate(date)       - Format date to string
  timeAgo(date)          - Get relative time (e.g., "2 hours ago")

STRING HELPERS (lib/string/):
  capitalize(str)        - Capitalize first letter
  slugify(str)           - Convert to URL-friendly slug
  truncate(str, n)       - Truncate string to n characters

ARRAY HELPERS (lib/array/):
  groupBy(arr, key)      - Group array by key
  unique(arr)            - Get unique values

OBJECT HELPERS (lib/object/):
  pick(obj, keys)        - Pick specific keys
  omit(obj, keys)        - Omit specific keys

MATH HELPERS (lib/math/):
  clamp(num, min, max)   - Clamp number between min and max
  round(num, decimals)   - Round to decimal places

VALIDATION HELPERS (lib/validation/):
  isEmail(str)           - Check if string is email
  isUrl(str)             - Check if string is URL

========================================
WHY THIS MATTERS
========================================

✅ REUSABLE   - One helper, used by ALL domains
✅ TESTABLE   - Pure functions are easy to test
✅ MAINTAINABLE - Change once, update everywhere
✅ SCALABLE   - Add new helpers without breaking existing code
✅ CLEAN      - Separates generic logic from domain logic

========================================
RELATED FOLDERS
========================================

entities/  -> Domain-specific pure logic
shared/    -> UI components + React wrappers
tools/     -> Feature modules
core/      -> UI primitives

========================================
REMEMBER
========================================

"lib" = GENERIC HELPERS ONLY
No domain logic. No React. No UI.

If it's SPECIFIC to images → entities/image/
If it's GENERIC (works anywhere) → lib/
If it's a REACT COMPONENT → shared/components/
If it's a REACT HOOK → shared/hooks/

========================================