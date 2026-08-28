========================================
ENTITIES FOLDER - PURE BUSINESS LOGIC
========================================

WHAT GOES HERE:
- Pure functions for specific domains (image, pdf, video, file, audio, etc.)
- Reusable services that can be called by ANY tool
- Data models and types for each domain
- Domain-specific configuration

WHAT DOES NOT GO HERE:
- React components (go to shared/ or tools/)
- UI state (go to tools/hooks)
- Generic utilities (go to lib/)
- Pages or routing (go to pages/)

========================================
STANDARD STRUCTURE (For ANY Domain)
========================================

entities/{domain}/
├── canvas/                         <- Domain-specific canvas operations
│   ├── crop.ts                     <- Domain-specific crop logic
│   └── index.ts                    <- Export domain canvas operations
├── metadata/                       <- Metadata operations
│   ├── read/                       <- Read metadata functions
│   │   ├── dimensions.ts           <- Read dimensions (width, height, unit)
│   │   ├── dpi.ts                  <- Read DPI (dpi, unit)
│   │   └── index.ts                <- Export all read functions
│   ├── write/                      <- Write metadata functions
│   │   ├── dpi.ts                  <- Write DPI to image
│   │   └── index.ts                <- Export all write functions
│   └── index.ts                    <- Export all metadata operations
├── types/                          <- Domain types/interfaces
│   ├── crop.ts                     <- CropArea interface
│   ├── format.ts                   <- FormatResult interface
│   ├── metadata.ts                 <- MetadataResult interface
│   └── index.ts                    <- Export all types
├── detect.ts                       <- Format/detection logic
├── config.ts                       <- Domain configuration
└── index.ts                        <- Export everything from this domain

========================================
CURRENT DOMAINS
========================================

IMAGE DOMAIN (src/entities/image/):
  canvas/
    crop.ts         -> cropCanvas()        - Crop image to area
    (prepareCanvas and resizeCanvas are in lib/browser/ - generic helpers)
  metadata/
    read/
      dimensions.ts -> readDimensions()    - Read width, height, unit
      dpi.ts        -> readDpi()           - Read DPI, unit
    write/
      dpi.ts        -> writeDpi()          - Write DPI to image
  types/
    crop.ts         -> CropArea            - Crop area interface
    format.ts       -> FormatResult        - Format detection result
    metadata.ts     -> MetadataResult      - Metadata result interface
  detect.ts         -> detectFormatAndAlpha() - Detect format + alpha
  config.ts         -> IMAGE_CONFIG         - Shared image settings

FILE DOMAIN (src/entities/file/): (coming soon)
  metadata/
    read.ts         -> readFileMetadata()   - Read file metadata
    write.ts        -> writeFileMetadata()  - Write file metadata
  detect.ts         -> detectFileType()     - Detect file type
  config.ts         -> FILE_CONFIG          - File settings

PDF DOMAIN (src/entities/pdf/): (coming soon)
  metadata/
    read.ts         -> readPdfMetadata()    - Read PDF metadata
    write.ts        -> writePdfMetadata()   - Write PDF metadata
  merge.ts          -> mergePdfs()          - Merge multiple PDFs
  split.ts          -> splitPdf()           - Split PDF into pages

VIDEO DOMAIN (src/entities/video/): (coming soon)
  metadata/
    read.ts         -> readVideoMetadata()  - Read video info
  compress.ts       -> compressVideo()      - Compress video
  extract.ts        -> extractFrames()      - Extract frames from video

AUDIO DOMAIN (src/entities/audio/): (coming soon)
  metadata/
    read.ts         -> readAudioMetadata()  - Read audio info
  convert.ts        -> convertAudio()       - Convert audio format

========================================
DEPENDENCY RULES
========================================

✅ CAN import from: core/ (types only) and lib/
❌ CANNOT import from: shared/, tools/, pages/

This keeps entities as PURE business logic with no UI dependencies.

========================================
HOW TO ADD A NEW DOMAIN
========================================

STEP 1: Create domain folder
  src/entities/{new-domain}/

STEP 2: Create folders as needed
  src/entities/{new-domain}/canvas/    (if domain-specific canvas operations needed)
  src/entities/{new-domain}/metadata/  (if metadata read/write needed)
    ├── read/                          (read functions)
    └── write/                         (write functions)
  src/entities/{new-domain}/types/     (domain types/interfaces)

STEP 3: Add files
  // src/entities/{new-domain}/canvas/crop.ts
  export async function {operation}(params) {
    // Pure business logic only
    // No React, no UI
  }

  // src/entities/{new-domain}/metadata/read/dimensions.ts
  export async function readDimensions(file: File) {
    // Read dimensions logic
  }

  // src/entities/{new-domain}/metadata/read/dpi.ts
  export async function readDpi(file: File) {
    // Read DPI logic
  }

  // src/entities/{new-domain}/metadata/write/dpi.ts
  export async function writeDpi(file: File, dpi: number) {
    // Write DPI logic
  }

  // src/entities/{new-domain}/types/crop.ts
  export interface CropArea {
    x: number; y: number; width: number; height: number;
  }

  // src/entities/{new-domain}/detect.ts
  export async function detect{domain}(file: File) {
    // Detection logic
  }

  // src/entities/{new-domain}/config.ts
  export const {DOMAIN}_CONFIG = {
    // Configuration
  }

STEP 4: Create index.ts files
  // src/entities/{new-domain}/metadata/read/index.ts
  export * from './dimensions';
  export * from './dpi';

  // src/entities/{new-domain}/metadata/write/index.ts
  export { writeDpi } from './dpi';

  // src/entities/{new-domain}/metadata/index.ts
  export * from './read';
  export * from './write';

  // src/entities/{new-domain}/types/index.ts
  export * from './crop';
  export * from './format';
  export * from './metadata';

  // src/entities/{new-domain}/index.ts
  export * from './canvas';
  export * from './metadata';
  export * from './types';
  export { detect{domain} } from './detect';
  export { {DOMAIN}_CONFIG } from './config';

STEP 5: Done! Other tools can now import and use it.

========================================
HOW TO USE A SERVICE
========================================

// Import from the domain
import { readDimensions, readDpi, writeDpi } from '@/entities/image/metadata';
import { detectFormatAndAlpha } from '@/entities/image';
import { cropCanvas } from '@/entities/image/canvas';

// Import types
import type { CropArea, MetadataResult, FormatResult } from '@/entities/image';

// Use the pure functions
const dims = await readDimensions(file);    // { width, height, unit }
const dpi = await readDpi(file);            // { dpi, unit }
const blob = await writeDpi(file, 300);     // Blob with DPI
const format = await detectFormatAndAlpha(file); // { format, hasAlpha }
const cropped = await cropCanvas(blob, cropArea);

========================================
WHY THIS MATTERS
========================================

✅ REUSABLE     - One function, used by ALL tools
✅ TESTABLE     - Pure functions are easy to unit test
✅ MAINTAINABLE - Change once, update everywhere
✅ SCALABLE     - Add new domains without breaking existing code
✅ CLEAN        - Business logic stays separate from UI
✅ ORGANIZED    - canvas/, metadata/read/, metadata/write/, types/
✅ CONSISTENT   - Same structure for EVERY domain

========================================
RELATED FOLDERS
========================================

core/     -> UI primitives and foundation
shared/   -> Reusable components and wrappers
lib/      -> Generic helpers (loadImage, exportCanvas, prepareCanvas, resizeCanvas, etc.)
tools/    -> Feature modules that use these services
pages/    -> Routes and pages

========================================
REMEMBER
========================================

"entities" = PURE BUSINESS LOGIC ONLY
No React. No UI. No State. Just functions.

Each domain has its OWN structure:
  - canvas/  -> Domain-specific canvas operations (crop, etc.)
  - metadata/read/  -> Read metadata functions (dimensions, dpi)
  - metadata/write/ -> Write metadata functions (dpi)
  - types/   -> Domain types/interfaces
  - detect.ts -> Detection logic (if needed)
  - config.ts -> Configuration (if needed)

Generic helpers (prepareCanvas, resizeCanvas, loadImage, exportCanvas) 
go to lib/browser/ - they work for ANY domain.

========================================