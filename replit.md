# BuilderAI - AI Website Builder Platform

## Overview

BuilderAI is an AI-powered website builder platform that allows users to create websites through natural language conversations. Users describe what they want, and the AI generates HTML, CSS, and JavaScript code in real-time. The platform features a chat-based interface, live preview functionality, project management, and pre-built templates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, React Context for UI state (theme)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Build Tool**: Vite with hot module replacement

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/` (Home, Builder, Projects, Templates)
- Reusable components in `client/src/components/`
- UI primitives in `client/src/components/ui/` (shadcn/ui)
- Custom hooks in `client/src/hooks/`
- Utilities and providers in `client/src/lib/`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **HTTP Server**: Node.js HTTP server
- **API Pattern**: RESTful JSON APIs under `/api/` prefix
- **Code Generation**: OpenAI GPT integration for AI-powered website generation

The server uses a modular structure:
- `server/index.ts` - Main entry point with middleware setup
- `server/routes.ts` - API route definitions
- `server/storage.ts` - Data access layer with in-memory storage (easily swappable to database)
- `server/openai.ts` - OpenAI integration for code generation
- `server/vite.ts` - Vite dev server integration
- `server/static.ts` - Static file serving for production

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` using Drizzle's type-safe schema builder
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Current Implementation**: In-memory storage class (`MemStorage`) that implements the `IStorage` interface

Database tables:
- `users` - User authentication
- `projects` - Website projects with HTML/CSS/JS code
- `messages` - Chat conversation history per project
- `templates` - Pre-built website templates

### Design System
The project follows detailed design guidelines documented in `design_guidelines.md`:
- Typography: Inter/DM Sans for UI, JetBrains Mono for code
- Color system: HSL-based CSS variables with light/dark mode support
- Layout: Three-panel app shell (sidebar, chat, preview)
- Components: Consistent spacing using Tailwind's scale (2, 4, 6, 8, 12, 16, 24)

## External Dependencies

### AI Services
- **OpenAI API**: Used for generating website code from natural language prompts. Requires `OPENAI_API_KEY` environment variable. Falls back to default placeholder code when not configured.

### Database
- **PostgreSQL**: Required for persistent data storage. Configured via `DATABASE_URL` environment variable. Drizzle ORM handles migrations and queries.

### Third-Party Libraries
- **Radix UI**: Headless UI primitives for accessible components
- **TanStack Query**: Data fetching and caching
- **date-fns**: Date formatting with Arabic locale support
- **class-variance-authority**: Component variant management
- **embla-carousel-react**: Carousel functionality
- **react-day-picker**: Calendar component
- **vaul**: Drawer component
- **react-resizable-panels**: Resizable panel layouts
- **cmdk**: Command palette component

### Build and Development
- **Vite**: Frontend bundling with React plugin
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development
- **Replit plugins**: Runtime error overlay, cartographer, dev banner (development only)