# INFERA WebNova - AI Website Builder Platform

## Overview
INFERA WebNova is the flagship platform in the 22-platform INFERA Engine ecosystem. It's an AI-powered website builder with comprehensive bilingual support (Arabic/English), natural language website generation, multi-tier subscription system, Owner Control Panel for platform-wide administration, and AI Development Assistants that execute owner instructions autonomously.

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI API (GPT-5)
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: TanStack Query

## Project Structure
```
client/
  src/
    components/       # Reusable UI components
      - chat-input.tsx        # Chat input with actions
      - chat-message.tsx      # Chat message display
      - code-preview.tsx      # Live preview with tabs
      - component-library.tsx # Drag-and-drop components
      - empty-state.tsx       # Empty state displays
      - gradient-background.tsx # Animated gradient
      - project-card.tsx      # Project card component
      - share-dialog.tsx      # Share link management
      - template-card.tsx     # Template card component
      - theme-toggle.tsx      # Dark/light mode toggle
      - version-history.tsx   # Version history management
    pages/
      - home.tsx              # Landing page
      - builder.tsx           # Project builder with chat
      - projects.tsx          # Projects list
      - templates.tsx         # Templates gallery
      - preview.tsx           # Public share preview
    lib/             # Utilities and query client
    hooks/           # Custom React hooks
server/
  db.ts              # Database connection
  routes.ts          # API endpoints
  storage.ts         # Database storage implementation
  openai.ts          # OpenAI integration
shared/
  schema.ts          # Data models and types (Drizzle schemas)
```

## Key Features
1. **AI Chat Interface**: Describe your website and AI generates code
2. **Live Preview**: Real-time preview with viewport controls (desktop/tablet/mobile)
3. **Code Editor**: View and copy generated HTML/CSS/JS
4. **Project Management**: Save, edit, and delete projects
5. **Templates**: Pre-built templates to start from
6. **Dark/Light Mode**: Theme switching support
7. **Export**: Download generated code as HTML file
8. **Version History**: Save snapshots and restore previous versions
9. **Project Sharing**: Create shareable preview links
10. **Component Library**: Pre-built UI components (buttons, cards, forms, sections)
11. **Framework Support**: Components for vanilla CSS, Tailwind, and Bootstrap
12. **Bilingual Support**: Full Arabic/English with language toggle
13. **Multi-tier Subscriptions**: Free/Basic/Pro/Enterprise/Sovereign/Owner tiers
14. **Owner Dashboard**: Platform-wide administration with AI workforce management
15. **AI Development Assistants**: Autonomous AI workers (Nova Developer, Designer, Content, Analyst, Security) that execute owner instructions
16. **Sovereign Dashboard**: Advanced tenant governance for enterprise clients
17. **Chatbot Builder**: AI-powered chatbot creation
18. **SEO Optimizer**: Website optimization tools
19. **White Label**: Branding customization for enterprise/sovereign users

## Database Tables
- `users` - User accounts with role hierarchy (free/basic/pro/enterprise/sovereign/owner)
- `projects` - Website projects with HTML/CSS/JS code
- `messages` - Chat history for each project
- `templates` - Pre-built website templates
- `project_versions` - Version history snapshots
- `share_links` - Shareable preview links
- `components` - Reusable UI components
- `ai_assistants` - AI workforce configuration (Nova Developer, Designer, Content, Analyst, Security)
- `assistant_instructions` - Commands and tasks for AI assistants with execution tracking
- `audit_logs` - Platform activity logging for owner oversight
- `owner_settings` - Platform-wide configuration
- `sovereign_settings` - Tenant-level governance settings

## API Endpoints
### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Templates
- `GET /api/templates` - List all templates
- `GET /api/templates/:id` - Get single template

### Messages
- `GET /api/projects/:projectId/messages` - Get project chat history
- `POST /api/messages` - Create message

### AI Generation
- `POST /api/generate` - Generate code with AI

### Version History
- `GET /api/projects/:projectId/versions` - Get version history
- `POST /api/projects/:projectId/versions` - Save version snapshot
- `POST /api/projects/:projectId/restore/:versionId` - Restore version

### Sharing
- `GET /api/projects/:projectId/shares` - Get share links
- `POST /api/projects/:projectId/share` - Create share link
- `GET /api/share/:shareCode` - Get shared project (public)
- `DELETE /api/shares/:id` - Deactivate share link

### Components
- `GET /api/components` - List all components
- `GET /api/components?category=Buttons` - Filter by category
- `GET /api/components/:id` - Get single component

### Owner Routes (Owner role only)
- `GET /api/owner/assistants` - Get all AI assistants
- `POST /api/owner/assistants` - Create AI assistant
- `GET /api/owner/instructions` - Get all instructions
- `POST /api/owner/instructions` - Create instruction for AI assistant
- `POST /api/owner/instructions/:id/execute` - Execute instruction with Claude AI
- `GET /api/owner/settings` - Get owner settings
- `POST /api/owner/settings` - Update owner settings
- `GET /api/owner/logs` - Get audit logs
- `POST /api/owner/initialize-assistants` - Initialize default AI workforce

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - Required for AI code generation
- `SESSION_SECRET` - Session encryption key

## Running the App
The app runs on port 5000 with `npm run dev`.

Database migrations: `npm run db:push`

## Role Hierarchy
- **Owner**: Supreme platform administrator with AI workforce control
- **Sovereign**: Multi-tenant governance and advanced customization
- **Enterprise**: Full feature access with white-label capabilities
- **Pro**: Advanced features and priority support
- **Basic**: Essential website building features
- **Free**: Limited access for evaluation

## AI Assistants (Nova Workforce)
The Owner can command specialized AI assistants:
- **Nova Developer**: Code generation, bug fixing, API integration
- **Nova Designer**: UI/UX design, styling, responsive layouts
- **Nova Content**: Copywriting, translation, SEO content
- **Nova Analyst**: Data analysis, metrics, business intelligence
- **Nova Security**: Security audits, vulnerability checks, compliance

## Recent Changes
- Added PostgreSQL database with Drizzle ORM
- Implemented version history system
- Added project sharing with shareable preview links
- Created component library with drag-and-drop UI components
- Added support for Tailwind and Bootstrap styled components
- Preview page for shared projects (/preview/:shareCode)
- Added Owner Dashboard with AI Workforce Console
- Implemented AI Development Assistants with Claude AI integration
- Added instruction execution system with priority queuing
- Created audit logging for platform governance
- Bilingual support (Arabic/English) throughout the platform
