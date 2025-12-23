# INFERA WebNova - Intelligent OS for Sovereign Digital Platforms

## Overview
INFERA WebNova is a **Core Operating System** designed to act as a "digital platform factory." It autonomously generates and manages sovereign digital platforms without manual rebuilds, utilizing a Blueprint-First approach, Event-Driven Architecture, and Autonomous Governance with AI Orchestration. The system supports multi-tenant isolation and targets diverse sectors (Financial, Healthcare, Government, Education, Enterprise) with a focus on compliance (PCI-DSS, HIPAA, GDPR). Its purpose is to create a robust, self-managing ecosystem for digital platforms.

## User Preferences
I want iterative development.
Ask before making major changes.
I prefer detailed explanations.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
INFERA WebNova uses React, TypeScript, and Vite for the frontend; Express.js and Node.js for the backend; and PostgreSQL with Drizzle ORM. Styling is managed by Tailwind CSS and Shadcn UI, with TanStack Query for state management.

**UI/UX Decisions:**
Features include an AI Chat Interface, live preview with responsive controls, dark/light modes, pre-built UI components, bilingual support (Arabic/English), and Visual Git Version Control.

**Core System Architecture:**
*   **AI Orchestrator**: Uses Anthropic Claude for intent analysis, code generation, and platform optimization.
*   **Blueprint System**: Serves as the Single Source of Truth for platform specifications.
*   **Platform Orchestrator**: Manages the workflow from Blueprint creation to deployment and governance.
*   **PostgreSQL Event Store**: Implements durable event sourcing with tenant isolation.
*   **Extension Registry**: Provides scoped contexts for multi-tenant extension isolation.
*   **AI Sovereignty Layer**: A governance framework for owner-only AI control, enforcing rules, resource allocation, and human-in-the-loop decisions with immutable audit logs.
*   **Core Modules**: Include an Event Bus, Core Contracts (Zod schemas), Plugin System, Code Generation Engine, Runtime Layer, Versioning System, and Multi-Tenancy Core.
*   **Design Principles**: Modular, Event-Driven, Contract-First design using JSON Schemas, Plugin Architecture, and Multi-Tenancy.
*   **Service Providers Integration Hub**: Manages 14 built-in external providers across 8 categories (AI, Payment, Communication, Cloud, Analytics, Search, Media, Maps) with secure API key management, performance monitoring, cost tracking, failover, alerts, and audit logging.
*   **Sovereign User Management System**: Provides complete user governance with ROOT_OWNER controls, custom permissions, and audit trails.
*   **Resource Usage & Cost Tracking System**: Tracks user resource consumption with regional pricing and usage limits.
*   **Sovereign Infrastructure Management**: Offers cloud-agnostic infrastructure management via a Provider Abstraction Layer (PAL), supporting Hetzner, AWS, Google Cloud, Azure, and DigitalOcean.
*   **External Integration Gateway**: Securely manages technical partner access (Replit, GitHub Copilot).
*   **AI Smart Suggestions System**: Provides intelligent code analysis and improvement recommendations using Claude AI.
*   **One-Click Deployment System**: Streamlined deployment to Web, Mobile, or Desktop, supporting environment management, custom domains, auto-scaling, SSL/CDN, and deployment history with rollback.
*   **Backend Generator System**: AI-powered full backend code generation supporting multiple frameworks, databases, languages, API styles, and authentication.
*   **AI Copilot Assistant**: An intelligent coding assistant powered by Claude AI.
*   **Testing Generator**: Automatic generation of unit, integration, and E2E tests.
*   **Marketplace**: A platform for community extensions and templates.
*   **Real-time Collaboration**: Features live collaborators, role-based access, code comments, and activity tracking.
*   **Full-Stack Project Generator**: Supports 12 templates (e.g., React+Express, Next.js) generating complete project structures.
*   **Cloud Deployment Adapters**: Provider-agnostic deployment API supporting Vercel, Netlify, Railway, Render, Fly.io, and Hetzner.
*   **Sandbox Code Executor**: Securely executes code in Node.js, TypeScript, Python, PHP, Bash, Go, and Rust with security features like malicious code detection and resource limits.
*   **Secure Terminal System**: Provides a secure terminal with whitelist-based command execution and shell injection protection.
*   **Project Runtime Engine**: Manages project lifecycle with real filesystem operations, dependency installation, and process monitoring.
*   **Platform Linking Unit (INFERA Engine Federation)**: Registry for 30+ INFERA group platforms with hierarchy and sovereignty tiers. WebNova is registered as the ROOT platform.
*   **Security Model**: Implements Role-Based Access Control (ROOT_OWNER, sovereign, owner roles) with real-time database revalidation, session security, field protection, Zod validation, and a certificate hierarchy. Domain visibility and ownership are separated for system and user domains.
*   **Dynamic Page Telemetry System**: Tracks React component mounts, render times, API calls, response times, and aggregates daily performance scores with zero hardcoded values.
*   **Institutional Memory System**: Provides authenticated API endpoints for creating, listing, searching (semantic), updating, deleting, superseding, and linking memories. Features include lightweight semantic embeddings, bilingual support, keyword extraction, and version tracking.
*   **Execution Engine Enhancements**: Supports Docker container isolation for code execution in multiple languages (Node.js, Python, TypeScript, Go, PHP, Rust) with resource limits and network control.
*   **Integration Layer**: Includes Git API for repository management and CI/CD pipeline management.
*   **Infrastructure-as-Code**: Utilizes Terraform for Hetzner Cloud provisioning (network, firewall, nodes, load balancer) and Ansible for k3s cluster setup (UFW, fail2ban, Helm). Kubernetes manifests define deployments with HPA, resource quotas, and ingress with TLS.
*   **Secrets Vault Service**: Provides AES-256-GCM encrypted secret management with versioning, rotation policies, access control, and audit logging via a dedicated API.
*   **Nova Permissions System**: Offers 20+ granular permissions categorized by security levels (high/medium/low/danger) and audit logging.
*   **Service-to-Service Authentication**: HMAC-SHA256 signature validation via custom headers with timestamp windows and constant-time comparisons to prevent replay and timing attacks.

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