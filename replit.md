# Overview

CalcEasy (internally named "DapsiWow") is a comprehensive online tools platform offering 180+ free utilities across multiple categories including finance, PDF processing, image manipulation, text analysis, SEO optimization, and health monitoring. The application provides professional-grade calculators and converters without requiring user registration, focusing on simplicity and accessibility.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript in SPA mode
- **Styling**: Tailwind CSS with Shadcn/ui component library
- **Routing**: Wouter for client-side navigation
- **State Management**: React hooks with TanStack Query for server state
- **Build Tool**: Vite with hot module replacement and runtime error overlay

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Module System**: ES modules throughout the stack
- **API Design**: RESTful endpoints prefixed with `/api`
- **Middleware**: Custom logging, JSON parsing, and error handling
- **Storage Interface**: Abstracted storage layer with in-memory implementation

## Component Architecture
- **UI Components**: Radix UI primitives with custom styling via class-variance-authority
- **Layout**: Responsive design with mobile-first approach
- **Search**: Fuse.js for fuzzy search across tools and categories
- **Tool Cards**: Reusable components with category-based theming
- **Form Handling**: React Hook Form with Zod validation

## Data Management
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Schema**: User management with UUID primary keys and validation
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless database integration

## Tool Categories
The system organizes tools into six main categories:
- **Finance**: 30+ calculators (loan, mortgage, EMI, ROI, currency conversion)
- **PDF**: Document processing and conversion tools
- **Image**: Background removal, format conversion, editing
- **Text**: Content analysis, grammar checking, AI writing
- **SEO**: Keyword analysis, backlink checking, meta tag generation
- **Health**: BMI, calorie, pregnancy, and fitness calculators

## Development Setup
- **TypeScript**: Strict configuration with path mapping
- **ESLint/Prettier**: Code formatting and linting
- **Hot Reload**: Vite development server with middleware mode
- **Asset Handling**: Static file serving with proper caching headers

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **TypeScript**: Full type safety with strict compiler options
- **Vite**: Modern build tool with plugin ecosystem
- **TanStack Query**: Server state management and caching

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives (@radix-ui/react-*)
- **Shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library for UI elements

## Database and ORM
- **PostgreSQL**: Primary database (configured for Neon serverless)
- **Drizzle ORM**: Type-safe database operations
- **@neondatabase/serverless**: Serverless database driver

## Search and Data Processing
- **Fuse.js**: Fuzzy search implementation
- **Date-fns**: Date manipulation and formatting
- **Zod**: Runtime type validation and schema parsing

## Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server
- **React Helmet Async**: SEO meta tag management

## Replit Integration
- **@replit/vite-plugin-cartographer**: Development tooling integration
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting