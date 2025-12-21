# INFERA WebNova - Intelligent OS for Sovereign Digital Platforms

## Overview
INFERA WebNova is a **Core Operating System** designed for building and operating sovereign digital platforms. It functions as a "digital platform factory," autonomously generating and managing multiple platforms without requiring rebuilds or refactoring. The system prioritizes a Blueprint-First approach, uses an Event-Driven Architecture, and incorporates Autonomous Governance with AI Orchestration. It supports multi-tenant isolation and targets diverse sovereign platform domains including Financial, Healthcare, Government, Education, and Enterprise, ensuring compliance with relevant industry standards (e.g., PCI-DSS, HIPAA, GDPR). The project envisions creating a robust, self-managing ecosystem for digital platforms.

## User Preferences
I want iterative development.
Ask before making major changes.
I prefer detailed explanations.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
INFERA WebNova is built using React, TypeScript, and Vite for the frontend, Express.js and Node.js for the backend, and PostgreSQL with Drizzle ORM for database management. Styling is handled by Tailwind CSS and Shadcn UI, with TanStack Query managing state.

**UI/UX Decisions:**
The platform features an AI Chat Interface, a live preview with responsive viewport controls, dark/light mode, pre-built UI components and templates, and full bilingual support (Arabic/English). Visual Git Version Control provides a visual interface for Git operations including branch management, commit history, and quick actions.

**Core System Architecture:**
*   **AI Orchestrator**: Utilizes Anthropic Claude for intent analysis, code generation, and platform optimization.
*   **Blueprint System**: Serves as the Single Source of Truth for all platform specifications.
*   **Platform Orchestrator**: Manages the workflow from Blueprint creation to Code Generation, Runtime deployment, and Autonomous Governance.
*   **PostgreSQL Event Store**: Implements durable event sourcing with tenant isolation.
*   **Extension Registry**: Provides scoped contexts for multi-tenant extension isolation.
*   **Multi-tier Subscriptions & Role Hierarchy**: Supports various access levels.
*   **AI Sovereignty Layer**: A governance framework for owner-only AI control, enforcing constitutional rules, resource allocation, and human-in-the-loop for critical decisions with immutable audit logs.
*   **Core Modules**: Includes an Event Bus, Core Contracts (Zod schemas), Plugin System, Code Generation Engine, Runtime Layer, Versioning System, and Multi-Tenancy Core.
*   **Orchestration Flow**: User specifications lead to AI Orchestrator analysis, Blueprint creation, Code Generation, Runtime deployment, and Autonomous Governance.
*   **Design Principles**: Modular, Event-Driven, Contract-First design using JSON Schemas, Plugin Architecture, and Multi-Tenancy.
*   **Service Providers Integration Hub**: Manages 14 built-in external providers across 8 categories (AI, Payment, Communication, Cloud, Analytics, Search, Media, Maps) with secure API key management, performance monitoring, cost tracking, failover, alerts, and audit logging.
*   **Sovereign User Management System**: Provides complete user governance with ROOT_OWNER controls, including status management (ACTIVE, SUSPENDED, BANNED), custom permissions, and audit trails.
*   **Resource Usage & Cost Tracking System**: Tracks user resource consumption with regional pricing, usage limits, pricing models, and owner analytics.
*   **Sovereign Infrastructure Management**: Offers cloud-agnostic infrastructure management via a Provider Abstraction Layer (PAL), supporting Hetzner, AWS, Google Cloud, Azure, and DigitalOcean for server, deployment, backup, and cost management.
*   **External Integration Gateway**: Securely manages technical partner access (Replit, GitHub Copilot) with session-based access, permission systems, digital signatures, and sandbox mode.
*   **AI Smart Suggestions System**: Provides intelligent code analysis and improvement recommendations across categories like Performance, Security, and Best Practices using Claude AI, with scoring, bilingual support, auto-apply, and history tracking.
*   **One-Click Deployment System**: Streamlined deployment to Web, Mobile, or Desktop, supporting environment management, custom domains, auto-scaling, SSL/CDN, and deployment history with rollback.
*   **Backend Generator System**: AI-powered full backend code generation supporting multiple frameworks, database options, languages, API styles (REST/GraphQL), and authentication (JWT).
*   **AI Copilot Assistant**: An intelligent coding assistant powered by Claude AI offering autocomplete, code explanation, error fixing, and chat mode.
*   **Testing Generator**: Automatic generation of unit, integration, and E2E tests, including edge cases and mock support, with coverage reports and execution.
*   **Marketplace**: A platform for community extensions and templates, including pre-built templates and reusable plugins.
*   **Real-time Collaboration**: Features live collaborators, an invite system with role-based access, code comments, and activity tracking.

## External Dependencies
*   **Database**: PostgreSQL
*   **ORM**: Drizzle ORM
*   **AI**: Anthropic Claude API
*   **Payment Gateways**: Stripe, PayPal, Tap, mada, Apple Pay, Google Pay, STC Pay, Bank Transfer, Crypto
*   **Communication**: Twilio, SendGrid
*   **Cloud Providers**: AWS, Cloudflare, Hetzner, Google Cloud, Microsoft Azure, DigitalOcean
*   **Analytics**: Google Analytics
*   **Search**: Algolia
*   **Media**: Cloudinary
*   **Maps**: Google Maps
*   **Development Tools**: Replit, GitHub Copilot

## Integration Status (Updated: Dec 21, 2025)

### Active Integrations (Configured)
| Integration | Status | Secret Key |
|-------------|--------|------------|
| Anthropic Claude | ✅ Active | ANTHROPIC_API_KEY |
| Hetzner Cloud | ✅ Active | HETZNER_API_TOKEN |
| PostgreSQL | ✅ Active | DATABASE_URL |
| Session Management | ✅ Active | SESSION_SECRET |
| Stripe | ✅ Added (Replit Integration) | Via Replit Connector |

### Pending Configuration (Features Inactive)
| Integration | Status | Required Secrets | Affected Features |
|-------------|--------|------------------|-------------------|
| SMTP Email | ⚠️ Not Configured | SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL | OTP/2FA, Email Notifications |
| Namecheap | ⚠️ Not Configured | NAMECHEAP_API_USER, NAMECHEAP_API_KEY, NAMECHEAP_USERNAME | Domain Registration |
| OpenAI | ⚠️ Optional | OPENAI_API_KEY | Some AI features (Anthropic available) |

**Note:** User declined SendGrid integration (Dec 20, 2025). To enable email features later, configure SMTP secrets manually.

## Platform Development System (Updated: Dec 21, 2025)

### Full-Stack Project Generator
Located at: `shared/core/kernel/fullstack-generator.ts`

**Supported Templates (12 total):**
1. **react-express** - React + Express + PostgreSQL
2. **nextjs-fullstack** - Next.js App Router + PostgreSQL
3. **vue-fastify** - Vue 3 + Fastify + PostgreSQL
4. **svelte-express** - SvelteKit + Express + PostgreSQL
5. **static-site** - Static site with TailwindCSS
6. **api-only** - Pure REST/GraphQL API
7. **mobile-pwa** - Progressive Web App
8. **ecommerce** - Full eCommerce platform (products, cart, orders)
9. **saas-starter** - SaaS with auth, billing, dashboard
10. **blog-cms** - Blog/CMS with posts, categories, tags
11. **dashboard** - Admin dashboard with analytics
12. **landing-page** - Marketing landing page

**Generated Files:**
- `package.json` with appropriate dependencies
- `tsconfig.json` for TypeScript
- Database schema (`src/db/schema.ts`)
- API routes (Express or Next.js API routes)
- Frontend pages and components
- `.env.example` with required variables
- `README.md` (bilingual support)

### Cloud Deployment Adapters
Located at: `shared/core/kernel/cloud-deploy-adapters.ts`

**Supported Providers:**
| Provider | Status | Features |
|----------|--------|----------|
| Vercel | Interface Ready | Edge functions, Static hosting |
| Netlify | Interface Ready | Serverless functions, Forms |
| Railway | Interface Ready | Full-stack hosting, PostgreSQL |
| Render | Interface Ready | Docker, Static, Web services |
| Fly.io | Interface Ready | Global edge deployment |
| Hetzner | Interface Ready | VPS, Docker, Kubernetes |

**Unified Deployment Service:**
- Provider-agnostic deployment API
- Automatic rollback support
- Status monitoring
- Environment variable management

### Sandbox Code Executor
Located at: `shared/core/kernel/sandbox-executor.ts`

**Supported Languages:**
- Node.js, TypeScript
- Python
- PHP
- Bash
- Go
- Rust

**Security Features:**
- Malicious code detection (system commands, network calls, file operations)
- Resource limits (CPU, memory, disk, timeout)
- Blocked command filtering
- Execution isolation

### Secure Terminal System (Updated: Dec 21, 2025)
Located at: `server/isds-routes.ts`

**Security Model:**
- Strict whitelist-based command execution
- Project/workspace ownership verification before token issuance
- Shell injection protection (blocking `;|&\`$(){}`)
- Timeout and buffer limits

**Allowed Command Prefixes:**
```
ls, pwd, cat, head, tail, echo, grep, find, wc,
npm, npx, node, yarn, pnpm,
python, python3, pip, pip3,
git status, git log, git branch, git diff, git show,
clear, help, mkdir, touch, cp, mv,
date, whoami, which
```

**Terminal API Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/owner/isds/terminal/token` | POST | Generate secure WebSocket token (with ownership check) |
| `/api/owner/isds/terminal/execute` | POST | Execute command (REST fallback) |

### AI Orchestrator (Updated: Dec 21, 2025)
Located at: `shared/core/kernel/ai-orchestrator.ts`

**Capabilities:**
- Natural language to application transformation
- Intent analysis and project type detection
- Blueprint synthesis with architecture planning
- Intelligent code generation with Claude AI
- Iterative refinement and validation

**AI API Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/platform/ai/orchestrate` | POST | Full pipeline: prompt to complete project |
| `/api/platform/ai/analyze-intent` | POST | Analyze user intent from description |
| `/api/platform/ai/generate-blueprint` | POST | Create architecture blueprint |
| `/api/platform/ai/generate-code` | POST | Generate code from blueprint |

### Project Runtime Engine (Updated: Dec 21, 2025)
Located at: `shared/core/kernel/project-runtime.ts`

**Features (Real Execution):**
- Project lifecycle management (initialize, build, run, stop)
- Real filesystem operations (create, update, delete, rename files)
- Real process spawning with child_process
- Real command execution with execAsync
- Dependency installation with npm/yarn/pnpm
- Process log collection and monitoring
- Resource tracking and cleanup

**Execution Capabilities:**
- `applyFileOperations`: Creates/updates/deletes files on actual filesystem
- `installDependencies`: Runs real npm/yarn/pnpm install commands
- `build`: Executes actual build commands with artifact detection
- `run`: Spawns real dev server processes
- `stop`: Kills running processes with SIGTERM/SIGKILL
- `executeCommand`: Runs arbitrary commands with timeout protection

**Health Check:**
Located at: `shared/core/kernel/health-check.ts`
- System component validation
- Environment variable verification
- Latency measurement for each component

**Runtime API Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/platform/runtime/initialize` | POST | Initialize project runtime |
| `/api/platform/runtime/:id/state` | GET | Get runtime state |
| `/api/platform/runtime/:id/build` | POST | Build project |
| `/api/platform/runtime/:id/run` | POST | Run project |
| `/api/platform/runtime/:id/stop` | POST | Stop project |
| `/api/platform/runtime/:id/execute` | POST | Execute command |
| `/api/platform/runtime/active` | GET | List active runtimes |

### Platform API Endpoints
Registered at: `/api/platform/*`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/templates` | GET | List all available templates |
| `/templates/:id` | GET | Get template details |
| `/generate` | POST | Generate full project from spec |
| `/generate/prompt` | POST | AI-powered generation from description |
| `/deployment/deploy` | POST | Deploy project to cloud provider |
| `/deployment/status` | GET | Get deployment status |
| `/deployment/rollback` | POST | Rollback to previous deployment |
| `/execution/run` | POST | Execute code in sandbox |
| `/execution/command` | POST | Run shell command |
| `/execution/install-package` | POST | Install package |
| `/projects` | GET | List user's projects |
| `/projects/:id` | GET | Get project details |