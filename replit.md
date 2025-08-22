# Overview

DapsiWow is a comprehensive web platform offering 180+ free online tools across multiple categories including finance, PDF processing, image editing, text analysis, SEO optimization, and health calculators. The platform focuses on providing professional-grade utilities without requiring user registration, targeting both business and personal use cases. Key features include financial calculators (loan, mortgage, EMI, compound interest), currency converters, business loan calculators, and various specialized tools for different industries.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI elements
- **Routing**: Wouter for client-side routing, providing a lightweight alternative to React Router
- **State Management**: React hooks for local state, TanStack Query for server state management
- **UI Components**: Radix UI primitives with custom styling via class-variance-authority
- **Typography**: Inter font family for modern, clean appearance
- **Build Configuration**: Vite with React plugin, custom aliases for clean imports (@/, @shared/, @assets/)

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules
- **Development Setup**: tsx for TypeScript execution in development
- **Build Process**: esbuild for production bundling with platform-specific optimizations
- **Middleware**: Custom logging middleware for API request tracking
- **Error Handling**: Centralized error handling with status code management

## Database & ORM
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Configured for PostgreSQL with Neon serverless driver
- **Schema Management**: Centralized schema definitions in shared directory
- **Migrations**: Drizzle Kit for database migrations and schema synchronization
- **Validation**: Zod integration with Drizzle for type-safe schema validation

## Project Structure
- **Monorepo Architecture**: Client, server, and shared code in separate directories
- **Client**: React application with component-based architecture
- **Server**: Express.js API server with route registration system
- **Shared**: Common schemas, types, and utilities shared between client and server
- **Storage Layer**: Abstract storage interface with in-memory implementation (designed for easy database integration)

## Development & Build Pipeline
- **Development**: Hot reload with Vite dev server and tsx for server
- **Type Checking**: Strict TypeScript configuration across all modules
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer
- **Asset Handling**: Vite-based asset optimization and bundling
- **Environment**: Development/production environment detection and configuration

## External Dependencies

- **UI Framework**: Radix UI for accessible component primitives
- **Styling**: Tailwind CSS ecosystem with class utilities
- **Database**: PostgreSQL via Neon serverless platform
- **Search**: Fuse.js for client-side fuzzy search functionality
- **Date Handling**: date-fns for date manipulation and formatting
- **Development Tools**: Replit integration for cloud development environment
- **SEO**: react-helmet-async for dynamic meta tag management
- **Icons**: Font Awesome for comprehensive icon library
- **Session Management**: connect-pg-simple for PostgreSQL session storage