import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
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
    target: ["es2022", "chrome89", "firefox89", "safari15"],
    minify: "esbuild",
    cssMinify: "lightningcss",
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 8192, // Increased for better performance (8KB threshold)
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunk for React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor';
          }
          // UI libraries chunk
          if (id.includes('@radix-ui') || id.includes('framer-motion')) {
            return 'ui-libs';
          }
          // Form handling chunk
          if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
            return 'forms';
          }
          // Utilities chunk
          if (id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('date-fns')) {
            return 'utils';
          }
          // Large individual libraries
          if (id.includes('recharts')) {
            return 'charts';
          }
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          // Default chunk for other node_modules
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500,
    // Additional optimizations
    modulePreload: {
      polyfill: false // Reduce bundle size for modern browsers
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
    legalComments: "none", // Remove license comments in production
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
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
      "tailwind-merge",
      "framer-motion",
      "date-fns"
    ],
    exclude: ["@vite/client", "@vite/env"],
    force: true // Pre-bundle heavy dependencies for better performance
  },
});
