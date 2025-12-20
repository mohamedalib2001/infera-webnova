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

## Integration Status (Updated: Dec 20, 2025)

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