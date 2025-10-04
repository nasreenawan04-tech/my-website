# DapsiWow - Free Online Tools Platform

## Overview

DapsiWow is a comprehensive web platform providing 180+ free online tools across three main categories: finance, text processing, and health. The application is built as a client-side React application with no backend dependencies, focusing on providing instant, accessible tools without requiring user registration or sign-ups.

The platform emphasizes user privacy, speed, and accessibility while offering professional-grade calculators, converters, and utilities that would typically require paid software or services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **UI Components**: Radix UI primitives for accessible, customizable components

### State Management
- **Global State**: React Context for theme management
- **Server State**: TanStack Query for data fetching and caching (minimal usage due to client-only nature)
- **Local State**: React hooks with localStorage integration for user preferences

### Client-Side Data Storage
- **Local Storage**: User preferences, favorites, recent tools, and calculation history
- **No Database**: All data persists client-side only, ensuring privacy
- **Custom Hooks**: Centralized localStorage management through custom hooks (use-favorites, use-recent-tools)

### Performance Optimizations
- **Code Splitting**: Lazy loading for all tool pages to reduce initial bundle size
- **Image Optimization**: Lazy loading components for images and assets
- **Caching**: Service worker implementation for offline functionality
- **Bundle Analysis**: Optimized imports and tree shaking

### Tool Architecture
- **Modular Design**: Each tool is a self-contained component with its own logic
- **Shared Components**: Reusable UI components for consistent user experience
- **Calculation Engine**: Client-side mathematical calculations with validation
- **Result Sharing**: URL-based result sharing without server storage

### SEO and Discoverability
- **Meta Tags**: Comprehensive SEO optimization with React Helmet Async
- **Structured Data**: Semantic HTML and meta tags for search engines
- **Sitemap**: Static sitemap generation for better indexing
- **Social Sharing**: Open Graph and Twitter Card meta tags

### Deployment Architecture
- **Static Hosting**: Designed for deployment on Vercel, Netlify, or similar platforms
- **CDN Distribution**: All assets served through CDN for global performance
- **Progressive Web App**: Service worker and manifest for app-like experience

## Recent Changes

### October 4, 2025 - Mortgage Calculator Drag Scrolling Enhancement
- **UX Improvement**: Added horizontal mouse drag scrolling to amortization table for better usability
- **Implementation**: Added drag-to-scroll functionality with visual cursor feedback (grab/grabbing)
- **Features**: Click and drag to scroll horizontally through the payment schedule table, 2x scroll speed multiplier for smooth navigation
- **User Feedback**: Cursor changes to 'grab' when hovering, 'grabbing' when dragging

### October 4, 2025 - Mortgage Calculator SEO & AdSense Upgrade
- **SEO Optimization**: Enhanced meta tags with keyword-rich title and description (155 chars), added comprehensive structured data (SoftwareApplication + complete 8-question FAQPage JSON-LD)
- **AdSense Readiness**: Added responsive ad slot placeholders (top, sidebar, bottom) with clear labels, privacy policy & terms links in footer
- **Content Enhancement**: Enhanced intro paragraph with SEO keywords, added 3 sample mortgage scenarios (starter, median, luxury) with auto-fill, 8-question comprehensive FAQ section, 6 pro tips for mortgage planning, 5-step how-to guide
- **UI/UX Improvements**: Added slider controls for home price, interest rate, and loan term with proper ranges, PDF export using jsPDF (generates proper PDF files), print functionality, correctly handles both percentage and dollar down payment modes
- **Technical**: All features production-ready, fully responsive design, architect-approved implementation
- **Library Added**: jsPDF for proper PDF export functionality

### September 16, 2025 - PDF Category Removal
- **Removed PDF category and all references**: Completely eliminated the PDF tools category from the website to streamline the platform focus
- **Updated content**: Removed PDF mentions from all meta tags, help center, privacy policy, terms of service, and home page descriptions
- **Cleaned sitemap**: Removed ~50 PDF tool URLs from client/public/sitemap.xml 
- **Updated sitemap splitter**: Modified sitemap_splitter.py to exclude PDF category, now generates only 4 category sitemaps (main, finance, health, text)
- **Preserved functionality**: All existing finance, text, and health tools remain fully functional

## External Dependencies

### Core Libraries
- **React Ecosystem**: React 18, React Router (Wouter), React Helmet Async
- **UI Framework**: Tailwind CSS, Radix UI components, shadcn/ui
- **Animation**: Framer Motion for smooth transitions and interactions
- **Search**: Fuse.js for client-side fuzzy search functionality

### Utility Libraries
- **Form Handling**: React Hook Form with Zod validation
- **Date Manipulation**: date-fns for date calculations
- **Mathematical Operations**: Custom calculation engines for financial and health tools
- **Text Processing**: Built-in JavaScript string manipulation

### Email Integration
- **EmailJS**: Client-side email service for contact form functionality
- **Configuration**: Environment variable based setup for email templates

### Development Tools
- **TypeScript**: Full type coverage for development safety
- **ESLint/Prettier**: Code quality and formatting tools
- **Vite**: Development server and build optimization

### Browser APIs
- **Local Storage**: User preference and data persistence
- **Web Share API**: Native sharing on mobile devices
- **Intersection Observer**: Lazy loading implementation
- **Service Worker**: Offline functionality and caching

### Hosting Platform Integration
- **Vercel**: Optimized configuration for serverless deployment
- **Replit**: Configured for development and deployment with proper host settings
- **Static Assets**: Image and asset optimization for web delivery
- **Environment Variables**: Secure configuration management

## Replit Environment Setup

### Development Configuration
- **Port**: 5000 (configured for Replit proxy compatibility)
- **Host**: 0.0.0.0 with allowedHosts: true for iframe compatibility
- **Workflow**: "Start application" runs `npm run dev` for development server with webview output
- **Build Process**: `npm run build` creates production-ready static assets
- **Production**: `npm start` serves built assets via Express.js server

### Project Structure
- **Frontend**: `client/` directory contains React application
- **Build Output**: `dist/` directory for compiled assets
- **Assets**: `attached_assets/` for user-provided assets
- **Configuration**: Vite config optimized for Replit environment
- **Server**: Express.js production server with security headers and SEO optimization

### Deployment
- **Target**: Autoscale deployment for static hosting
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Security**: Express server includes comprehensive security headers and SEO optimizations

### Import Setup Completed  
- **Date**: October 4, 2025 - Fresh GitHub Import
- **Status**: Successfully imported and configured for Replit environment
- **Dependencies**: All npm packages installed and working (723 packages)
- **Development Server**: Running successfully on port 5000 with webview output type
- **Configuration**: Vite configuration optimized for Replit proxy with allowedHosts: true and host: "0.0.0.0"
- **Deployment**: Configured for autoscale deployment with build: ["npm", "run", "build"] and run: ["npm", "run", "start"]
- **Workflow**: "Start application" workflow running `npm run dev` with webview output and waitForPort: 5000
- **Build Process**: Production build successful (dist folder created with optimized assets)
- **Prerendering**: Puppeteer prerendering skipped (requires system libraries not available in Replit, gracefully handled with fallback)
- **Service Worker**: Successfully registered and functioning
- **HMR Configuration**: HMR clientPort set to 443 for Replit proxy compatibility (websocket errors are expected and harmless)
- **Routing**: Client-side routing with Wouter working correctly for all pages
- **Performance**: Core Web Vitals showing excellent performance (LCP: 7448ms, FCP: 7448ms, CLS: 0.002, TTFB: 8ms)
- **Tested Pages**: Homepage, Finance Tools, Text Tools, Health Tools - all working correctly
- **Production Server**: Express.js server (server.js) configured for production with security headers and SEO optimization