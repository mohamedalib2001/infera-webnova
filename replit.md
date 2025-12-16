# BuilderAI - AI Website Builder Platform

## Overview
BuilderAI is an intelligent platform for building and publishing websites using AI. Users can describe their website requirements in natural language, and the AI generates the HTML, CSS, and JavaScript code automatically.

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

## Database Tables
- `users` - User accounts
- `projects` - Website projects with HTML/CSS/JS code
- `messages` - Chat history for each project
- `templates` - Pre-built website templates
- `project_versions` - Version history snapshots
- `share_links` - Shareable preview links
- `components` - Reusable UI components

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

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - Required for AI code generation
- `SESSION_SECRET` - Session encryption key

## Running the App
The app runs on port 5000 with `npm run dev`.

Database migrations: `npm run db:push`

## Recent Changes
- Added PostgreSQL database with Drizzle ORM
- Implemented version history system
- Added project sharing with shareable preview links
- Created component library with drag-and-drop UI components
- Added support for Tailwind and Bootstrap styled components
- Preview page for shared projects (/preview/:shareCode)
