# ToolsHub (DapsiWow) - Online Tools Platform

## Overview

DapsiWow is a comprehensive online tools platform providing 180+ free utilities across multiple categories including finance, PDF processing, image editing, text analysis, SEO optimization, and health monitoring. The platform is built as a modern React-based single-page application with a Node.js/Express backend, designed to deliver professional-grade tools without requiring user registration or payment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, modern UI
- **State Management**: TanStack React Query for server state and local React state for component state
- **Build Tool**: Vite for fast development and optimized production builds
- **Component Structure**: Modular architecture with reusable components (Header, Footer, ToolCard, etc.)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for both server and client code
- **API Design**: RESTful API structure with `/api` prefix for all endpoints
- **Storage Interface**: Abstracted storage layer with in-memory implementation (MemStorage) and interface for future database integration
- **Development Server**: Integrated Vite development server for hot module replacement

### Database Architecture
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: PostgreSQL (via Neon serverless) with connection pooling
- **Schema Management**: Centralized schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations and schema changes
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple

### Project Structure
- **Monorepo Layout**: Single repository with separate client, server, and shared directories
- **Client**: React application in `/client` directory with component-based architecture
- **Server**: Express.js API server in `/server` directory
- **Shared**: Common TypeScript types, schemas, and utilities in `/shared` directory
- **Path Aliases**: Configured absolute imports using `@/` for client code and `@shared/` for shared utilities

### Tool Categories and Features
- **Finance Tools**: 30+ calculators including loan, mortgage, EMI, compound interest, currency conversion
- **PDF Tools**: Document processing and conversion utilities
- **Image Tools**: Photo editing, background removal, format conversion
- **Text Tools**: Writing assistance, grammar checking, word counting
- **SEO Tools**: Website optimization and analysis utilities
- **Health Tools**: BMI, calorie, fitness, and medical calculators

### Development Workflow
- **Type Safety**: Full TypeScript coverage across client, server, and shared code
- **Code Quality**: ESLint and TypeScript compiler checks
- **Hot Reload**: Vite's fast refresh for development
- **Build Process**: Separate client (Vite) and server (esbuild) build pipelines
- **Environment Management**: Environment-specific configurations for development and production

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Helmet Async for SEO
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Font Awesome 6.4.0 for comprehensive icon library

### Data Management
- **Database**: Neon PostgreSQL serverless database (@neondatabase/serverless)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Validation**: Zod for runtime type validation and schema definitions
- **Query Management**: TanStack React Query for server state management

### Developer Experience
- **Build Tools**: Vite for frontend bundling, esbuild for backend bundling
- **TypeScript**: Full TypeScript support with strict type checking
- **Development**: tsx for TypeScript execution in development
- **Utilities**: Various utility libraries (clsx, date-fns, etc.)

### Specialized Libraries
- **Search**: Fuse.js for fuzzy search functionality across tools
- **UI Enhancements**: Embla Carousel for carousels, cmdk for command palette
- **Form Handling**: React Hook Form with Hookform Resolvers for validation
- **Routing**: Wouter for lightweight client-side routing

### Deployment and Infrastructure
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Environment**: Node.js runtime with ES modules support
- **Replit Integration**: Custom Vite plugins for Replit development environment