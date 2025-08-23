# CalcMate

## Overview

CalcMate is a comprehensive web application that provides 180+ free online tools for business and personal use. The platform focuses on financial calculators, PDF tools, image processing, text analysis, SEO optimization, and health monitoring utilities. The application follows a modern, responsive design with a clean UI built using React and Tailwind CSS. It's designed to be a one-stop solution for various calculation and conversion needs without requiring user registration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with file-based route organization
- **UI Components**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: React hooks with TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation for type-safe form schemas

### Backend Architecture
- **Server**: Express.js with TypeScript in ESM format
- **API Design**: RESTful API architecture with `/api` prefix for all endpoints
- **Middleware**: Custom logging middleware for request tracking and performance monitoring
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Development**: Hot module replacement via Vite integration for seamless development experience

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL for production deployment
- **Development Storage**: In-memory storage implementation for development/testing

### Authentication and Authorization
- **Session Management**: PostgreSQL-based sessions using connect-pg-simple
- **User Schema**: Simple username/password authentication with UUID primary keys
- **Security**: Password hashing and secure session handling

### File Structure and Organization
- **Monorepo Structure**: Shared types and schemas between client and server
- **Component Organization**: Feature-based component structure with reusable UI components
- **Tool Implementation**: Individual calculator pages with shared calculation logic
- **Asset Management**: Static assets and fonts served through Vite's asset pipeline

### Search and Filtering
- **Search Engine**: Fuse.js for fuzzy search across tool names, descriptions, and categories
- **Category Filtering**: Client-side filtering with URL state management
- **Tool Discovery**: Smart search suggestions and category-based browsing

### Performance Optimizations
- **Build Process**: ESBuild for server bundling and Vite for client optimization
- **Code Splitting**: Route-based code splitting for optimal loading performance
- **Caching**: TanStack Query for intelligent data caching and synchronization
- **Development**: Runtime error overlay and cartographer integration for Replit environment

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive accessible component library for dropdowns, dialogs, forms
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variant management

### Data and API
- **Drizzle ORM**: Type-safe PostgreSQL ORM with automatic migrations
- **Neon Database**: Serverless PostgreSQL hosting service
- **TanStack Query**: Server state management and data synchronization
- **Zod**: Schema validation for forms and API data

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast build tool with HMR and optimized production builds
- **ESBuild**: High-performance bundler for server-side code
- **React Helmet Async**: SEO management for dynamic meta tags

### Search and Analytics
- **Fuse.js**: Client-side fuzzy search implementation
- **Date-fns**: Date manipulation and formatting utilities

### Deployment and Hosting
- **Replit Integration**: Custom plugins for development environment
- **Environment Variables**: Configuration management for database connections
- **Static Asset Serving**: Vite-based asset pipeline with CDN integration

### Financial Data Sources
- **Currency Exchange**: Integration ready for live exchange rate APIs
- **Calculation Libraries**: Custom mathematical formulas for financial calculations
- **Chart Data**: Prepared for integration with charting libraries for visualizations