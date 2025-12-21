# INFERA WebNova - Intelligent OS for Sovereign Digital Platforms

## Overview
INFERA WebNova is a **Core Operating System** designed for building and operating sovereign digital platforms. It acts as a "digital platform factory," autonomously generating and managing multiple platforms without requiring manual rebuilds or refactoring. The system adopts a Blueprint-First approach, utilizes an Event-Driven Architecture, and integrates Autonomous Governance with AI Orchestration. It supports multi-tenant isolation and targets diverse sovereign platform domains such as Financial, Healthcare, Government, Education, and Enterprise, ensuring compliance with relevant industry standards (e.g., PCI-DSS, HIPAA, GDPR). The project aims to create a robust, self-managing ecosystem for digital platforms.

## User Preferences
I want iterative development.
Ask before making major changes.
I prefer detailed explanations.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
INFERA WebNova is built with React, TypeScript, and Vite for the frontend; Express.js and Node.js for the backend; and PostgreSQL with Drizzle ORM for database management. Styling is handled by Tailwind CSS and Shadcn UI, with TanStack Query managing state.

**UI/UX Decisions:**
The platform offers an AI Chat Interface, a live preview with responsive viewport controls, dark/light modes, pre-built UI components and templates, full bilingual support (Arabic/English), and Visual Git Version Control for operations like branch management and commit history.

**Core System Architecture:**
*   **AI Orchestrator**: Leverages Anthropic Claude for intent analysis, code generation, and platform optimization.
*   **Blueprint System**: Serves as the Single Source of Truth for all platform specifications.
*   **Platform Orchestrator**: Manages the workflow from Blueprint creation to Code Generation, Runtime deployment, and Autonomous Governance.
*   **PostgreSQL Event Store**: Implements durable event sourcing with tenant isolation.
*   **Extension Registry**: Provides scoped contexts for multi-tenant extension isolation.
*   **AI Sovereignty Layer**: A governance framework for owner-only AI control, enforcing constitutional rules, resource allocation, and human-in-the-loop decisions with immutable audit logs.
*   **Core Modules**: Includes an Event Bus, Core Contracts (Zod schemas), Plugin System, Code Generation Engine, Runtime Layer, Versioning System, and Multi-Tenancy Core.
*   **Design Principles**: Modular, Event-Driven, Contract-First design using JSON Schemas, Plugin Architecture, and Multi-Tenancy.
*   **Service Providers Integration Hub**: Manages 14 built-in external providers across 8 categories (AI, Payment, Communication, Cloud, Analytics, Search, Media, Maps) with secure API key management, performance monitoring, cost tracking, failover, alerts, and audit logging.
*   **Sovereign User Management System**: Provides complete user governance with ROOT_OWNER controls, including status management, custom permissions, and audit trails.
*   **Resource Usage & Cost Tracking System**: Tracks user resource consumption with regional pricing, usage limits, and analytics.
*   **Sovereign Infrastructure Management**: Offers cloud-agnostic infrastructure management via a Provider Abstraction Layer (PAL), supporting Hetzner, AWS, Google Cloud, Azure, and DigitalOcean.
*   **External Integration Gateway**: Securely manages technical partner access (Replit, GitHub Copilot) with session-based access, permission systems, and sandbox mode.
*   **AI Smart Suggestions System**: Provides intelligent code analysis and improvement recommendations (Performance, Security, Best Practices) using Claude AI.
*   **One-Click Deployment System**: Streamlined deployment to Web, Mobile, or Desktop, supporting environment management, custom domains, auto-scaling, SSL/CDN, and deployment history with rollback.
*   **Backend Generator System**: AI-powered full backend code generation supporting multiple frameworks, databases, languages, API styles, and authentication.
*   **AI Copilot Assistant**: An intelligent coding assistant powered by Claude AI offering autocomplete, code explanation, error fixing, and chat mode.
*   **Testing Generator**: Automatic generation of unit, integration, and E2E tests, including edge cases and mock support.
*   **Marketplace**: A platform for community extensions and templates.
*   **Real-time Collaboration**: Features live collaborators, an invite system with role-based access, code comments, and activity tracking.
*   **Full-Stack Project Generator**: Supports 12 templates (e.g., React+Express, Next.js, Vue+Fastify, SvelteKit) generating complete project structures.
*   **Cloud Deployment Adapters**: Provider-agnostic deployment API supporting Vercel, Netlify, Railway, Render, Fly.io, and Hetzner.
*   **Sandbox Code Executor**: Securely executes code in Node.js, TypeScript, Python, PHP, Bash, Go, and Rust with security features like malicious code detection and resource limits.
*   **Secure Terminal System**: Provides a secure terminal with whitelist-based command execution, project ownership verification, and shell injection protection.
*   **Project Runtime Engine**: Manages project lifecycle (initialize, build, run, stop) with real filesystem operations, dependency installation, and process monitoring.

## External Dependencies
*   **Database**: PostgreSQL
*   **ORM**: Drizzle ORM
*   **AI**: Anthropic Claude API
*   **Payment Gateways**: Stripe, PayPal, Tap, mada, Apple Pay, Google Pay, STC Pay, Bank Transfer, Crypto
*   **Communication**: Twilio
*   **Cloud Providers**: AWS, Cloudflare, Hetzner, Google Cloud, Microsoft Azure, DigitalOcean
*   **Analytics**: Google Analytics
*   **Search**: Algolia
*   **Media**: Cloudinary
*   **Maps**: Google Maps
*   **Development Tools**: Replit, GitHub Copilot