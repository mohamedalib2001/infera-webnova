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
20. **AI App Builder**: Full-stack application builder that works like Replit Agent - builds complete apps from natural language
21. **Cloud IDE**: Full Replit-equivalent cloud development environment with Monaco editor, multi-file projects, runtime execution, and live preview
22. **Sovereign Control Center**: Hidden admin panel (Shift+Ctrl+Alt+S) for owner-only absolute platform governance

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
- `payment_methods` - Payment gateway configurations (Stripe, PayPal, Tap, mada, Apple Pay, Google Pay, STC Pay, Bank Transfer, Crypto)
- `payment_transactions` - Payment transaction history and tracking
- `dev_projects` - Cloud IDE development projects
- `dev_project_files` - Files within development projects
- `dev_runtime_instances` - Runtime execution instances
- `dev_console_logs` - Console output for development projects

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

### Payment Methods (Owner role only)
- `GET /api/owner/payment-methods` - Get all payment methods
- `POST /api/owner/payment-methods` - Create payment method
- `PATCH /api/owner/payment-methods/:id` - Update payment method
- `PATCH /api/owner/payment-methods/:id/toggle` - Toggle payment method active status
- `DELETE /api/owner/payment-methods/:id` - Delete payment method
- `POST /api/owner/initialize-payment-methods` - Initialize default payment gateways
- `GET /api/owner/payment-transactions` - Get payment transactions
- `GET /api/owner/payment-analytics` - Get payment analytics
- `GET /api/payment-methods/active` - Get active payment methods (public for checkout)

### Authentication Methods (Owner role only)
- `GET /api/owner/auth-methods` - Get all authentication methods
- `POST /api/owner/auth-methods` - Create authentication method
- `PATCH /api/owner/auth-methods/:id` - Update authentication method
- `PATCH /api/owner/auth-methods/:id/toggle` - Toggle authentication method active status
- `PATCH /api/owner/auth-methods/:id/visibility` - Toggle authentication method visibility
- `DELETE /api/owner/auth-methods/:id` - Delete authentication method
- `POST /api/owner/initialize-auth-methods` - Initialize default authentication methods
- `GET /api/auth/methods` - Get visible authentication methods (public for login page)

### Cloud IDE Routes
- `GET /api/dev-projects` - List all development projects
- `GET /api/dev-projects/:id` - Get single development project
- `POST /api/dev-projects` - Create development project
- `PATCH /api/dev-projects/:id` - Update development project
- `DELETE /api/dev-projects/:id` - Delete development project
- `GET /api/dev-projects/:projectId/files` - Get all project files
- `POST /api/dev-projects/:projectId/files` - Create new file
- `PATCH /api/dev-projects/:projectId/files/:fileId` - Update file content
- `DELETE /api/dev-projects/:projectId/files/:fileId` - Delete file
- `GET /api/dev-projects/:projectId/runtime` - Get runtime status
- `POST /api/dev-projects/:projectId/runtime/start` - Start runtime
- `POST /api/dev-projects/:projectId/runtime/stop` - Stop runtime
- `POST /api/dev-projects/:projectId/runtime/restart` - Restart runtime
- `GET /api/dev-projects/:projectId/logs` - Get console logs
- `DELETE /api/dev-projects/:projectId/logs` - Clear console logs

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

## Sovereign AI Assistants
Platform-level autonomous AI agents that execute the owner's strategic intent:
- **AI Governor**: Platform policies, compliance rules, governance decisions
- **Platform Architect**: System design, infrastructure changes, optimization
- **Operations Commander**: Resource management, deployment, monitoring
- **Security Sentinel**: Threat detection, access control, incident response
- **Revenue Strategist**: Pricing optimization, subscription management, financial insights

### Sovereign Assistant Database Tables
- `sovereign_assistants` - Platform-level AI agents with 5 types and constrained autonomy
- `sovereign_commands` - Multi-step commands with approval workflow and reversibility
- `sovereign_actions` - Individual actions within commands with governance constraints
- `sovereign_action_logs` - Immutable audit trail for all sovereign agent actions

### Sovereign Assistant API Endpoints (Owner role only)
- `GET /api/owner/sovereign-assistants` - Get all sovereign assistants
- `POST /api/owner/initialize-sovereign-assistants` - Initialize default 5 sovereign assistants
- `PATCH /api/owner/sovereign-assistants/:id/toggle` - Toggle active status
- `PATCH /api/owner/sovereign-assistants/:id/autonomy` - Toggle autonomy mode
- `GET /api/owner/sovereign-commands` - Get pending commands
- `POST /api/owner/sovereign-commands/:id/approve` - Approve command execution
- `POST /api/owner/sovereign-commands/:id/cancel` - Cancel pending command
- `POST /api/owner/sovereign-commands/:id/rollback` - Rollback executed command
- `GET /api/owner/sovereign-action-logs` - Get action audit logs

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
- Added Payment Orchestration System with owner-controlled payment gateways
- Implemented Payment Control Center in Owner Dashboard with analytics
- Added support for 9 payment providers: Stripe, PayPal, Tap, mada, Apple Pay, Google Pay, STC Pay, Bank Transfer, Crypto
- Payment method toggle (activate/deactivate) with transaction tracking
- Added Sovereign AI Assistants with 5 specialized platform-level agents
- Implemented command approval workflow with governance constraints
- Added reversible operations and immutable audit trails
- Full bilingual support (Arabic/English) for all sovereign features
- Added AI App Builder with full-stack application generation from natural language
- AI App Builder includes: planning service, execution engine, artifact management, and progress tracking
- Database tables: ai_build_sessions, ai_build_tasks, ai_build_artifacts
- New route: /ai-builder with complete bilingual UI
- Added Cloud IDE with Monaco editor, file tree, and runtime execution
- Cloud IDE supports Node.js, Python, HTML, React, and Full Stack projects
- Implemented Sovereign Control Center for absolute platform governance (Shift+Ctrl+Alt+S)
- New routes: /ide for project list, /ide/:id for Cloud IDE, /sovereign-control for admin panel
