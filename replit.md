# Overview

DapsiWow is a comprehensive online tools platform that provides 180+ free utilities for business and personal use. The application is built as a full-stack web application featuring finance calculators, PDF tools, image processors, text analyzers, SEO utilities, and health monitoring tools. The platform emphasizes accessibility with no registration requirements and provides a professional, responsive interface for users to perform various calculations and data processing tasks.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and component-based development
- **Routing**: Wouter for lightweight client-side routing without complex dependencies
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: React hooks for local state, TanStack Query for server state management
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js for REST API endpoints
- **Language**: TypeScript for type safety across the entire stack
- **Development**: Hot module replacement and live reloading via Vite integration
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development

## Database Design
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured but not currently used extensively)
- **Migrations**: Drizzle Kit for database schema management
- **Schema**: User table with basic authentication fields defined in shared schema

## Component Architecture
- **UI Components**: Radix UI primitives with custom styling via shadcn/ui
- **Layout**: Responsive design with mobile-first approach
- **Component Structure**: Header, Footer, Hero sections, Tool cards, and category-based organization
- **Search**: Fuse.js integration for fuzzy search across tools and categories

## Data Management
- **Tool Catalog**: Static data structure defining 180+ tools across 6 categories
- **Categories**: Finance, PDF, Image, Text, SEO, and Health tools
- **Search & Filter**: Client-side filtering and search functionality
- **Routing**: Dynamic routing for individual tool pages and category pages

# External Dependencies

## UI and Styling
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built component library built on Radix UI and Tailwind
- **Lucide React**: Icon library for consistent iconography

## Database and ORM
- **Neon Database**: Serverless PostgreSQL for production database hosting
- **Drizzle ORM**: Type-safe ORM for database operations
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type checking and enhanced development experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Plugins**: Development environment integration for Replit platform

## Search and Utility
- **Fuse.js**: Fuzzy search library for tool discovery
- **TanStack Query**: Data fetching and caching for API interactions
- **React Helmet Async**: SEO optimization and meta tag management
- **Wouter**: Lightweight routing library for React

## Form Handling
- **React Hook Form**: Form state management and validation
- **Hookform Resolvers**: Validation schema integration
- **Zod**: Runtime type validation and schema definition

## Production Considerations
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Dynamic class name generation
- **clsx**: Conditional class name utility
- **Tailwind Merge**: Intelligent Tailwind class merging