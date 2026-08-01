# ToolPabitraMS

A personal, client-side image processing and utility toolkit built with React, TypeScript, and Vite.

All operations run entirely in the browser. No servers, no uploads, no data leaves your machine.

---

## Features

- Browser-based image processing with local file storage
- Extensible tool architecture for adding new operations
- Progressive Web App support for offline usage
- Clean, responsive UI with dark mode support

---

## Technology Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- React Router
- IndexedDB / OPFS
- Workbox

---

## Architecture Overview

The codebase follows a layered architecture designed for scalability and maintainability.

### Core Layers

- **Core** – UI primitives, layout components, global state
- **Shared** – Reusable components used across tools
- **Entities** – Domain logic and data models
- **Tools** – Self-contained feature modules
- **Lib** – Generic helpers extracted when used in multiple places
- **Pages** – Route screens

### Dependency Flow

```
Pages → Tools → Shared → Core
           ↓        ↓
        Entities   Lib
```

- Core has no dependencies.
- Shared imports from Core and Lib only.
- Entities imports from Core (types) and Lib only.
- Tools import from any layer except Pages.

This hierarchy prevents circular dependencies and keeps the codebase predictable.

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

```bash
git clone https://github.com/thepabitrams/toolpabitrams.git
cd toolpabitrams
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## How to Add a New Tool

1. Create folder: `src/tools/<category>/<tool-name>/`

2. Create `index.tsx` exporting a `Tool` object:

```ts
import { Tool } from '@/core/registry/toolRegistry';

const toolDef: Tool = {
  id: 'my-tool',
  name: 'My Tool',
  description: 'Does something useful',
  category: 'image',
  input: 'single',
  component: MyToolComponent,
};

export default toolDef;
```

3. Implement the component.

4. Use existing layers (Core, Shared, Entities, Lib) as needed.

5. The tool auto-registers via dynamic imports.

---

## Folder Structure

```
src/
├── core/          # Foundation: UI primitives, layout, global state
├── shared/        # Reusable components
├── entities/      # Domain logic and data models
├── tools/         # All tools: each feature in its own folder
├── lib/           # Generic helpers
└── pages/         # Route screens
```

---

## Contributing

This is a personal toolkit. For forks or adaptations:

1. Fork the repository.
2. Create a feature branch.
3. Commit changes with clear messages.
4. Open a pull request.

---

## License

MIT License – see [LICENSE](./LICENSE) file.

---

## Acknowledgments

Built with a modular, scalable architecture for maintainability and developer experience.
