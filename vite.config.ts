import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { splitVendorChunkPlugin } from "vite";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    cssMinify: true,
    rollupOptions: {
      plugins: [splitVendorChunkPlugin()],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'app-vendor': ['wouter', '@tanstack/react-query', 'lucide-react'],
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'wouter',
      '@tanstack/react-query',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'clsx',
      'tailwind-merge',
    ],
    exclude: ['@replit/vite-plugin-cartographer'],
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      clientPort: 443,
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
