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
*   **Platform Linking Unit (INFERA Engine Federation)**: Registry for 30+ INFERA group platforms with hierarchy (root_ca -> platform_ca -> service_cert -> user_cert), sovereignty tiers (root/platform/tenant/user), and platform types (central/sovereign/builder/commercial). WebNova is registered as ROOT platform (code: INFERA-WEBNOVA-001, isSystemPlatform: true).

## Security Model
*   **Role-Based Access Control**: ROOT_OWNER, sovereign, owner roles with real-time database revalidation on every request
*   **Session Security**: Middleware always fetches fresh user data from storage, preventing privilege escalation via stale sessions
*   **Field Protection**: Protected fields (isSystemPlatform, code, id, platformId, isDefaultProvider) cannot be modified via API
*   **Zod Validation**: All POST routes validated with Zod schemas, PATCH routes use explicit field allowlists
*   **Certificate Hierarchy**: Root CA uniqueness enforced, subordinate certs require parent certificate
*   **Domain Visibility & Ownership Separation**:
    - System domains (INFERA Engine): Only visible to ROOT_OWNER/sovereign users
    - User domains: Visible only to their owners
    - Defensive `isSystemDomainCheck()` helper handles legacy and new schema fields
    - Pattern matching on hostnames (infera, webnova, inferatrain, inferasmartdocs) as fallback
    - `/api/domains` filters by role, `/api/domains/system` (ROOT_OWNER only), `/api/domains/my` (user's own domains)
    - Domain registration open to all authenticated users, but system domains require sovereign role

## Recent Changes (December 2025)

### Institutional Memory System (Phase 2 Complete)
*   **10 Authenticated API Endpoints**:
    - `POST /api/memory` - Create memory with auto-embedding generation
    - `GET /api/memory` - List with filtering (projectId, nodeType, status, importance)
    - `GET /api/memory/:id` - Get single with related memories
    - `POST /api/memory/search` - Semantic search with cosine similarity
    - `PATCH /api/memory/:id` - Update with automatic re-embedding
    - `DELETE /api/memory/:id` - Soft delete (archive)
    - `POST /api/memory/:id/supersede` - Version replacement pattern
    - `POST /api/memory/:id/link` - Bidirectional relationship linking
    - `GET /api/memory/stats` - Statistics by type/status/importance
    - `POST /api/memory/analyze` - AI analysis with Claude
*   **Features**:
    - Lightweight 256-dim semantic embeddings (no external vector DB)
    - Bilingual support (Arabic/English titles, content, errors)
    - Keyword extraction with stop word filtering
    - Version tracking via supersede/supersededBy pattern
    - Typed helpers (`prepareMemoryInsert/Update`) for Drizzle JSONB type safety

### Execution Engine Enhancements (Phase 1 Complete)
*   **Docker Container Isolation**: Added `executeWithIsolation()` function supporting 6 languages (Node.js, Python, TypeScript, Go, PHP, Rust) with Docker container security:
    - No privileged mode
    - Network disabled by default
    - Resource limits (memory, CPU)
    - Automatic fallback to local execution when Docker unavailable
*   **Compiled Language Support**: Rust and Go now properly compile before execution with read-write volume mounts for build artifacts
*   **API Updates**: `/api/execution/run` accepts `useDocker` flag; response includes `isolationType` ("docker" | "local")
*   **Status Endpoint**: `/api/execution/status` now shows Docker availability, configured images per language, and available isolation modes

### Database Schema Additions (Phase 0 Complete)
*   Added 8 new tables: `execution_runtimes`, `execution_jobs`, `execution_artifacts`, `institutional_memory`, `infrastructure_inventory`, `integration_credentials`, `deployment_manifests`, `secrets_vault_entries`
*   Seeded 10 default runtime configurations

### Integration Layer (Phase 3 Complete)
*   **Git API**: 18+ endpoints for repository management, branches, commits, files
*   **CI/CD Pipeline**: 5 endpoints at `/api/cicd/pipelines/*` for pipeline management
*   **Hetzner Client**: Full server management with audit logging (listServers, powerOn/Off, reboot, metrics)

### Infrastructure-as-Code (Phase 4 Complete)
*   **Terraform Configuration** (`infrastructure/terraform/`):
    - Hetzner Cloud provider with network (10.0.0.0/16)
    - Firewall rules (SSH, HTTP, HTTPS, k3s API, NodePort)
    - Master and worker node provisioning
    - Load balancer with health checks
    - 50GB data volumes per worker
*   **Ansible Playbooks** (`infrastructure/ansible/`):
    - k3s cluster setup with UFW and fail2ban
    - Helm installation (cert-manager, ingress-nginx, Longhorn)
    - INFERA namespace creation with labels
*   **Kubernetes Manifests** (`infrastructure/k3s/`):
    - Deployment with HPA (3-10 replicas, CPU/memory scaling)
    - ResourceQuota and LimitRange
    - Ingress with Let's Encrypt TLS
    - PostgreSQL StatefulSet with Longhorn storage
    - Secrets management guide (SOPS, External Secrets, Sealed Secrets)

### Security & Governance (Phase 5 Complete)
*   **Secrets Vault Service** (`server/secrets-vault-service.ts`):
    - AES-256-GCM encryption with scrypt key derivation
    - Secret versioning with previous version retention
    - Rotation policy support (weekly/monthly/quarterly/yearly)
    - Access control via allowedServices/allowedRoles
    - Comprehensive audit logging via vaultAuditLog table
*   **Secrets Vault API** (`server/secrets-vault-routes.ts`):
    - `POST /api/vault/secrets` - Create secret with encryption
    - `GET /api/vault/secrets/*` - Get metadata (no value)
    - `POST /api/vault/secrets/*/reveal` - Decrypt with confirmation
    - `PATCH /api/vault/secrets/*` - Update with re-encryption
    - `POST /api/vault/secrets/*/rotate` - Rotate with version history
    - `DELETE /api/vault/secrets/*` - Delete with audit
    - `GET /api/vault/list` - Filter by scope/project/type
    - `GET /api/vault/stats` - Vault statistics
    - `GET /api/vault/rotation-needed` - Secrets due for rotation
*   **Nova Permissions System** (`server/nova-permissions.ts`):
    - 20+ granular permissions with security levels (high/medium/low/danger)
    - Categories: code_execution, file_operations, database_operations, api_integration
    - Permission grants and audit logging

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