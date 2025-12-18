# INFERA WebNova - AI Website Builder Platform

## Overview
INFERA WebNova is an AI-powered website builder platform within the INFERA Engine ecosystem. It offers comprehensive bilingual support (Arabic/English), natural language website generation, and a multi-tier subscription system. A key feature is the Owner Control Panel for platform-wide administration, leveraging AI Development Assistants for autonomous task execution. The platform aims to provide a complete ecosystem for AI-driven web development, including an AI App Builder for full-stack application generation and a Cloud IDE.

## User Preferences
I want iterative development.
Ask before making major changes.
I prefer detailed explanations.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
INFERA WebNova is built with a modern web stack: React + TypeScript + Vite for the frontend, Express.js + Node.js for the backend, and PostgreSQL with Drizzle ORM for the database. Tailwind CSS and Shadcn UI handle styling, while TanStack Query manages state.

**UI/UX Decisions:**
The platform features an AI Chat Interface for natural language interaction, a live preview with responsive viewport controls, and a dark/light mode toggle. It includes pre-built UI components and templates for rapid development, with full bilingual support across the interface.

**Technical Implementations & Feature Specifications:**
*   **AI-Powered Generation**: Utilizes Anthropic Claude for generating website code and full-stack applications from natural language prompts.
*   **Project Management**: Includes functionalities for saving, editing, deleting, exporting, and managing version history of projects.
*   **Sharing & Collaboration**: Allows creation of shareable preview links.
*   **Component Library**: Provides pre-built UI components with support for vanilla CSS, Tailwind, and Bootstrap.
*   **Multi-tier Subscriptions & Role Hierarchy**: Supports Free, Basic, Pro, Enterprise, Sovereign, and Owner tiers with distinct access levels.
*   **Owner Control Panel**: A central dashboard for platform administration, managing AI workforce, payment gateways, and authentication methods.
*   **AI Development Assistants (Nova Workforce)**: Specialized AI agents (Developer, Designer, Content, Analyst, Security) can be commanded by the Owner for autonomous task execution.
*   **Sovereign AI Assistants**: Platform-level autonomous AI agents (Governor, Architect, Operations Commander, Security Sentinel, Revenue Strategist) with constrained autonomy, command approval workflows, reversible operations, and audit trails.
*   **Cloud IDE**: A full-featured cloud development environment with Monaco editor, multi-file project support, runtime execution for Node.js, Python, HTML, React, and live preview. It incorporates a robust security model for REST API protection, WebSocket token authentication, and command execution safety.
*   **Sovereign Control Center**: A hidden administrative panel for absolute platform governance.
*   **Bilingual Support**: Comprehensive Arabic/English support integrated throughout the platform.

## External Dependencies
*   **Database**: PostgreSQL
*   **ORM**: Drizzle ORM
*   **AI**: Anthropic Claude API
*   **Payment Gateways**: Stripe, PayPal, Tap, mada, Apple Pay, Google Pay, STC Pay, Bank Transfer, Crypto

## Cloud IDE Features (Current Status)

### Completed Features
- **Monaco Editor**: Full Monaco editor integration with syntax highlighting
- **Multi-Tab Support**: Open multiple files simultaneously with tab switching and content preservation
- **File Management**: Create, edit, delete, rename files and folders
- **Terminal Execution**: Execute Node.js, Python, npm commands with real output
- **Package Management**: npm install/uninstall with search functionality
- **Git Integration**: init, commit, status, log with real git operations
- **Deployment Pipeline**: Deploy projects with version tracking
- **AI Code Assistant**: AI-powered code help and generation
- **Database Schema Builder**: Visual table/column creation with auto API generation
- **Live Preview**: Real-time preview of HTML/CSS/JS projects
- **Bilingual UI**: Arabic/English toggle in Cloud IDE

### Security Model
- REST API protection with requireAuth middleware
- Token-based WebSocket authentication (one-time use, 5-minute expiry)
- Command whitelist for terminal execution
- Project ownership checks
- Input sanitization for SQL and command injection prevention

## Recent Development Progress (December 2024)
- Phase 1 Complete: Secure terminal service, real file execution, live preview
- Phase 2 Complete: Schema Builder with auto API generation
- Phase 3 Complete: Package Manager with npm CLI integration
- Phase 4 Complete: Git Integration with init/commit/status/log
- Phase 5 Complete: Deployment pipeline with version tracking
- Phase 6 Complete: Multi-tab editor support
- Phase 7 Complete: Platform Architecture Redesign (Modular + Event-Driven)

## Core Platform Architecture

The platform has been redesigned as a **Core Operating System** for building sovereign digital platforms.

### Core Modules (Implemented)
Located in `shared/core/`:
- **Event Bus**: Central event-driven communication (`event-bus.ts`)
- **Core Contracts**: Zod schemas for all entities (`contracts.ts`)
- **Plugin System**: Extensible plugin architecture (`plugin-system.ts`)
- **Blueprint System**: Product intent capture (`modules/blueprint-system.ts`)
- **Code Generation Engine**: AI-powered generation (`modules/code-generation-engine.ts`)
- **Runtime Layer**: Sandboxed execution (`modules/runtime-layer.ts`)
- **AI Orchestrator**: Task routing & management (`modules/ai-orchestrator.ts`)
- **Versioning System**: Version control (`modules/versioning-system.ts`)
- **Multi-Tenancy Core**: Tenant isolation (`modules/multi-tenancy.ts`)

### Extension Points (Interfaces Only)
Located in `shared/core/modules/extensions/`:
- Data Lake, API Gateway, Observability
- Compliance, Security & Risk
- Deployment Pipelines, Command Center

### Design Principles
- **Modular + Event-Driven**: No direct coupling between modules
- **Contract-First**: JSON Schemas + Event Contracts
- **Plugin Architecture**: Sandboxed third-party extensions
- **Multi-Tenant**: Tier-based quotas and isolation

See `docs/ARCHITECTURE.md` for full documentation.
