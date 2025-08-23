# Replit.md - DapsiWow Tools Platform

## Overview

DapsiWow is a comprehensive web platform offering 180+ free online tools across six main categories: Finance, PDF, Image, Text, SEO, and Health. The platform provides professional-grade calculators and utilities without requiring user registration, focusing on accessibility and ease of use. Built as a modern React application with a Node.js/Express backend, the platform emphasizes clean UI design, responsive layouts, and tool discoverability through search and categorization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing 
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: React Query (TanStack Query) for server state and caching
- **Build Tool**: Vite for fast development and optimized production builds
- **Component Structure**: Modular components with clear separation between layout (Header, Footer), sections (HeroSection, CategorySection), and reusable elements (ToolCard)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Development**: tsx for TypeScript execution in development
- **Production Build**: esbuild for fast backend bundling
- **Middleware**: Custom logging middleware for API request tracking

### Database & ORM
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless database provider
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: @neondatabase/serverless for optimized serverless connections

### UI/UX Design System
- **Design Philosophy**: Clean, modern interface with soft shadows and rounded corners
- **Color Scheme**: Neutral base with category-specific accent colors (blue for finance, red for PDF, green for image, etc.)
- **Typography**: Inter font family for readability across all devices
- **Responsive Design**: Mobile-first approach with tailored experiences for desktop, tablet, and mobile
- **Accessibility**: Focus on semantic HTML and ARIA attributes

### Tool Organization & Discovery
- **Category System**: Six main categories with color-coded visual distinction
- **Search Functionality**: Fuse.js for fuzzy search across tool names, descriptions, and categories
- **Tool Routing**: Dynamic routing with tool-specific pages and SEO-friendly URLs
- **Navigation**: Sticky header with category navigation and global search

### Performance Optimizations
- **Code Splitting**: Route-based code splitting for optimal loading
- **Asset Optimization**: Vite's built-in optimizations for CSS and JavaScript
- **Caching Strategy**: React Query for intelligent data caching and background updates
- **Development Experience**: Hot module replacement and error overlays for development

### SEO & Meta Management
- **Meta Tags**: React Helmet Async for dynamic meta tag management
- **Structured Data**: JSON-LD schema markup for search engine optimization
- **Canonical URLs**: Proper canonical URL structure for SEO
- **Open Graph**: Complete Open Graph meta tags for social media sharing

## External Dependencies

### Development & Build Tools
- **Vite**: Primary build tool with React plugin and runtime error overlay
- **TypeScript**: Static type checking with strict configuration
- **ESBuild**: Production backend bundling for optimal performance
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

### UI Component Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives including dialogs, dropdowns, forms, and navigation components
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Class Variance Authority**: Type-safe component variant management
- **Lucide React**: Modern icon library for consistent iconography

### Data Management
- **TanStack React Query**: Server state management with caching, background updates, and optimistic updates
- **Fuse.js**: Fuzzy search library for tool discovery and filtering
- **Zod**: Schema validation library integrated with Drizzle ORM

### Form Management
- **React Hook Form**: Performant forms with minimal re-renders
- **Hookform Resolvers**: Validation resolvers for React Hook Form

### Database & Storage
- **Drizzle ORM**: Type-safe database operations with PostgreSQL support
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Connect PG Simple**: PostgreSQL session store for Express sessions

### Utility Libraries
- **Date-fns**: Modern date utility library for date calculations in financial tools
- **clsx & tailwind-merge**: Conditional className utilities
- **Nanoid**: Secure URL-friendly unique ID generator

### Development Environment
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Font Awesome**: Icon library for tool categorization and visual elements
- **Runtime Error Overlay**: Development error handling and debugging

### Platform Services
- **Replit Hosting**: Development and deployment platform
- **Environment Variables**: Secure configuration management for database connections
- **Session Management**: Server-side session handling with PostgreSQL storage