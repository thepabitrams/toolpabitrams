import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import fs from 'fs';

function findToolFolders(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let folders: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (fs.existsSync(path.join(fullPath, 'index.tsx'))) {
        folders.push(fullPath);
      } else {
        folders = folders.concat(findToolFolders(fullPath));
      }
    }
  }
  return folders;
}

export default defineConfig({
  plugins: [
    {
      name: 'auto-generate-tool-manifest',
      buildStart() {
        const toolsDir = path.resolve(__dirname, 'src/tools');
        if (!fs.existsSync(toolsDir)) {
          return;
        }

        const toolPaths = findToolFolders(toolsDir);
        const manifest = toolPaths.map((fullPath) => {
          const folder = path.basename(fullPath);
          const toolPath = path.join(fullPath, 'index.tsx');
          let description = 'A powerful tool to handle your tasks.';
          let category = 'file';

          if (fs.existsSync(toolPath)) {
            const content = fs.readFileSync(toolPath, 'utf-8');
            const descMatch = content.match(/description:\s*['"](.+?)['"]/);
            if (descMatch) description = descMatch[1];
            const catMatch = content.match(/category:\s*['"](.+?)['"]/);
            if (catMatch) category = catMatch[1];
          }

          return {
            id: folder,
            name: folder
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
            description: description,
            category: category,
          };
        });

        const outputPath = path.resolve(__dirname, 'public/manifest.json');
        fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
      },
    },
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'ToolPabitraMS',
        short_name: 'ToolPabitraMS',
        description: 'Privacy-first image processing toolkit',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react') || id.includes('react-dom') || id.includes('zustand')) {
            return 'vendor-core';
          }
          if (id.includes('react-dropzone') || id.includes('react-easy-crop') || id.includes('react-icons')) {
            return 'vendor-ui';
          }
          if (id.includes('@huggingface') || id.includes('onnxruntime')) {
            return 'vendor-ml-heavy';
          }
        },
      },
    },
  },
});