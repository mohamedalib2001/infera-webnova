# INFERA WebNova - Intelligent OS for Sovereign Digital Platforms

## Overview
INFERA WebNova is a **Core Operating System** for building and operating sovereign digital platforms. It is NOT a website builder—it is a self-sufficient, architecturally complete "digital platform factory" capable of generating and managing multiple platforms autonomously without requiring rebuilds or refactoring.

### Core Concept
- **AI Orchestrator**: Central governing authority orchestrating all platform operations through monitoring, decision-making, planning, and optimization
- **Blueprint-First**: Single Source of Truth for all platform specifications
- **Event-Driven Architecture**: Zero direct coupling between modules—all communication via Event Bus
- **Autonomous Governance**: Self-healing, self-optimizing, and self-evolving capabilities
- **Multi-Tenant Isolation**: Complete tenant segregation at every layer

### Sovereign Platform Domains
- **Financial**: Digital banking, payment processing (PCI-DSS, AML, KYC compliant)
- **Healthcare**: Medical records, patient portals (HIPAA, GDPR compliant)
- **Government**: E-Government portals (WCAG 2.1, Data Sovereignty compliant)
- **Education**: Learning management systems (FERPA, COPPA compliant)
- **Enterprise**: Custom business platforms (ISO 27001, SOC 2 compliant)

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

**Core System Architecture:**
*   **AI Orchestrator**: Central decision-making authority using Anthropic Claude for intent analysis, code generation, and platform optimization
*   **Blueprint System**: Captures platform specifications, intents, compliance requirements, and deployment targets
*   **Platform Orchestrator**: Coordinates Blueprint → Code Generation → Runtime → Governance flows
*   **PostgreSQL Event Store**: Durable event sourcing with tenant isolation, snapshots, and dead letter queue
*   **Extension Registry**: Scoped contexts for multi-tenant extension isolation
*   **Multi-tier Subscriptions & Role Hierarchy**: Supports Free, Basic, Pro, Enterprise, Sovereign, and Owner tiers with distinct access levels

**Orchestration Flow:**
1. User → Describe Sovereign Platform Specifications
2. AI Orchestrator → Analyze Requirements & Create Blueprint
3. Code Generation Engine → Generate Sovereign Codebase
4. Runtime Layer → Deploy & Configure Platform
5. Autonomous Governance → Monitor, Heal, Optimize, Evolve

**Bilingual Support**: Comprehensive Arabic/English support integrated throughout the platform.

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
- Phase 8 Complete: Strategic Architectural Correction (Website Builder → Sovereign Platform OS)
  - Transformed UI from "Website Builder" to "Intelligent OS for Sovereign Platforms"
  - Added sovereign domain categories (Financial, Healthcare, Government, Education)
  - Implemented compliance standards selection (PCI-DSS, HIPAA, WCAG 2.1, etc.)
  - Created orchestration flow visualization component
  - Updated all translations to reflect sovereign platform terminology

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
