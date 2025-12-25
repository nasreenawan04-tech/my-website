import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { visualizer } from "rollup-plugin-visualizer";
import { injectGTMPlugin } from "./client/vite-plugin-inject-gtm";

export default defineConfig(({ mode }) => {
  // Load env file from client directory (Vite's root directory)
  // This ensures .env files are loaded from client/.env as per Vite conventions
  const env = loadEnv(mode, path.resolve(__dirname, "client"), '');
  
  return {
    base: "/",
    plugins: [
      react(),
      injectGTMPlugin(env),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [runtimeErrorOverlay()]
      : []),
    // Bundle analyzer for production builds
    ...(process.env.ANALYZE 
      ? [visualizer({
          filename: 'dist/bundle-report.html',
          open: false,
          gzipSize: true,
          brotliSize: true
        })]
      : []),
    // Temporarily disable cartographer plugin due to Babel traverse compatibility issue
    // ...(process.env.NODE_ENV !== "production" &&
    // process.env.REPL_ID !== undefined
    //   ? [
    //       await import("@replit/vite-plugin-cartographer").then((m) =>
    //         m.cartographer(),
    //       ),
    //     ]
    //   : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    target: "esnext",
    minify: "esbuild",
    cssMinify: "lightningcss",
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 8192, // Increased for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Heavy PDF libraries should NOT be in main vendor chunk
          // They will be dynamically imported, so exclude them from pre-bundling
          
          // Core vendor libraries
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor';
          }
          
          // Routing
          if (id.includes('node_modules/wouter/')) {
            return 'router';
          }
          
          // Data fetching
          if (id.includes('node_modules/@tanstack/react-query/')) {
            return 'query';
          }
          
          // UI - only include core Radix UI components
          if (id.includes('node_modules/@radix-ui/')) {
            return 'ui';
          }
          
          // Forms
          if (id.includes('node_modules/react-hook-form/') || 
              id.includes('node_modules/@hookform/') ||
              id.includes('node_modules/zod/')) {
            return 'form';
          }
          
          // Charts - large library, could be further split
          if (id.includes('node_modules/recharts/')) {
            return 'charts';
          }
          
          // Icons
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons';
          }
          
          // SEO/Helmet
          if (id.includes('node_modules/react-helmet-async/')) {
            return 'helmet';
          }
          
          // Utilities and animations
          if (id.includes('node_modules/clsx/') ||
              id.includes('node_modules/tailwind-merge/') ||
              id.includes('node_modules/framer-motion/') ||
              id.includes('node_modules/date-fns/')) {
            return 'utils';
          }
          
          // IMPORTANT: Don't bundle PDF libraries - they'll be dynamically imported
          // This prevents jsPDF (387KB) and html2canvas (200KB) from being in main bundle
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 5000
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    hmr: {
      protocol: 'wss',
      host: process.env.REPLIT_DOMAINS || undefined,
      clientPort: 443,
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  optimizeDeps: {
    include: [
      "react", 
      "react-dom", 
      "wouter", 
      "@tanstack/react-query",
      "lucide-react",
      "react-helmet-async",
      "clsx",
      "tailwind-merge"
    ],
    exclude: ["@vite/client", "@vite/env"]
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
};
});
