# BuilderAI - AI Website Builder Platform

## Overview
BuilderAI is an intelligent platform for building and publishing websites using AI. Users can describe their website requirements in natural language, and the AI generates the HTML, CSS, and JavaScript code automatically.

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **AI**: OpenAI API (GPT-5)
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: TanStack Query

## Project Structure
```
client/
  src/
    components/       # Reusable UI components
    pages/           # Page components (Home, Builder, Projects, Templates)
    lib/             # Utilities and query client
    hooks/           # Custom React hooks
server/
  routes.ts          # API endpoints
  storage.ts         # In-memory data storage
  openai.ts          # OpenAI integration
shared/
  schema.ts          # Data models and types
```

## Key Features
1. **AI Chat Interface**: Describe your website and AI generates code
2. **Live Preview**: Real-time preview with viewport controls (desktop/tablet/mobile)
3. **Code Editor**: View and copy generated HTML/CSS/JS
4. **Project Management**: Save, edit, and delete projects
5. **Templates**: Pre-built templates to start from
6. **Dark/Light Mode**: Theme switching support
7. **Export**: Download generated code as HTML file

## API Endpoints
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/templates` - List all templates
- `GET /api/templates/:id` - Get single template
- `POST /api/generate` - Generate code with AI

## Environment Variables
- `OPENAI_API_KEY` - Required for AI code generation

## Running the App
The app runs on port 5000 with `npm run dev`.

## Recent Changes
- Initial implementation of AI website builder
- Home page with gradient background and chat input
- Builder page with chat and preview panels
- Projects and Templates pages
- OpenAI integration for code generation
- Dark/light theme support
