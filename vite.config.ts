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
    target: "esnext",
    minify: "esbuild",
    cssMinify: "lightningcss",
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // Reduced for better caching/CDN efficiency
    rollupOptions: {
      output: {
        // PERFORMANCE OPTIMIZATION: Aggressive code-splitting for better caching
        manualChunks: (id) => {
          // Core React libraries - changes rarely
          if (id.includes('react-dom')) return 'react-dom';
          if (id.includes('react') && !id.includes('react-dom')) return 'react';
          
          // Router - changes rarely
          if (id.includes('wouter')) return 'router';
          
          // React Query - changes rarely
          if (id.includes('@tanstack/react-query')) return 'query';
          
          // UI components by category - better granularity
          if (id.includes('@radix-ui/react-dialog') || id.includes('@radix-ui/react-alert-dialog')) return 'ui-dialog';
          if (id.includes('@radix-ui/react-dropdown-menu') || id.includes('@radix-ui/react-menubar')) return 'ui-menu';
          if (id.includes('@radix-ui/react-tabs') || id.includes('@radix-ui/react-accordion')) return 'ui-tabs';
          if (id.includes('@radix-ui/react-select')) return 'ui-select';
          if (id.includes('@radix-ui/react-slider') || id.includes('@radix-ui/react-progress')) return 'ui-slider';
          if (id.includes('@radix-ui')) return 'ui-misc';
          
          // Form libraries - used on many tool pages
          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers')) return 'form';
          if (id.includes('zod')) return 'zod';
          
          // Heavy libraries - separate for better caching
          if (id.includes('recharts')) return 'charts';
          if (id.includes('jspdf')) return 'pdf';
          if (id.includes('html2canvas')) return 'canvas';
          if (id.includes('qrcode') || id.includes('jsqr')) return 'qr';
          if (id.includes('firebase')) return 'firebase';
          if (id.includes('marked')) return 'markdown';
          
          // Icons - used everywhere
          if (id.includes('lucide-react')) return 'icons';
          
          // Utilities - small, frequently used
          if (id.includes('clsx') || id.includes('tailwind-merge')) return 'utils-style';
          if (id.includes('framer-motion')) return 'utils-motion';
          if (id.includes('date-fns')) return 'utils-date';
          
          // SEO/Meta
          if (id.includes('react-helmet-async')) return 'helmet';
          
          // Vendor fallback for other node_modules
          if (id.includes('node_modules')) return 'vendor';
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
      }
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500 // Reduced for better bundle size awareness
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
  }
});
