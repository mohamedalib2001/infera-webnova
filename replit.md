# INFERA WebNova - Intelligent OS for Sovereign Digital Platforms

## Overview
INFERA WebNova is a **Core Operating System** designed for building and operating sovereign digital platforms. It functions as a "digital platform factory," autonomously generating and managing multiple platforms without requiring rebuilds or refactoring. The system prioritizes a Blueprint-First approach, uses an Event-Driven Architecture, and incorporates Autonomous Governance with AI Orchestration. It supports multi-tenant isolation and targets diverse sovereign platform domains including Financial, Healthcare, Government, Education, and Enterprise, ensuring compliance with relevant industry standards (e.g., PCI-DSS, HIPAA, GDPR).

## User Preferences
I want iterative development.
Ask before making major changes.
I prefer detailed explanations.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
INFERA WebNova is built using React, TypeScript, and Vite for the frontend, Express.js and Node.js for the backend, and PostgreSQL with Drizzle ORM for database management. Styling is handled by Tailwind CSS and Shadcn UI, with TanStack Query managing state.

**UI/UX Decisions:**
The platform features an AI Chat Interface, a live preview with responsive viewport controls, dark/light mode, pre-built UI components and templates, and full bilingual support (Arabic/English).

**Core System Architecture:**
*   **AI Orchestrator**: Utilizes Anthropic Claude for intent analysis, code generation, and platform optimization, acting as the central decision-making authority.
*   **Blueprint System**: Serves as the Single Source of Truth for all platform specifications, intents, compliance requirements, and deployment targets.
*   **Platform Orchestrator**: Manages the complete workflow from Blueprint creation to Code Generation, Runtime deployment, and Autonomous Governance.
*   **PostgreSQL Event Store**: Implements durable event sourcing with tenant isolation, snapshots, and dead letter queuing.
*   **Extension Registry**: Provides scoped contexts for multi-tenant extension isolation.
*   **Multi-tier Subscriptions & Role Hierarchy**: Supports various access levels (Free, Basic, Pro, Enterprise, Sovereign, Owner).
*   **AI Sovereignty Layer**: A robust governance framework ensuring owner-only control over AI, enforcing constitutional rules, resource allocation (power levels 1-10), and an emergency kill switch. It mandates human-in-the-loop for critical decisions and maintains immutable audit logs.
*   **Core Modules**: Includes an Event Bus, Core Contracts (Zod schemas), Plugin System, Code Generation Engine, Runtime Layer, Versioning System, and Multi-Tenancy Core.

**Orchestration Flow:**
1.  User describes Sovereign Platform Specifications.
2.  AI Orchestrator analyzes requirements and creates a Blueprint.
3.  Code Generation Engine generates the Sovereign Codebase.
4.  Runtime Layer deploys and configures the platform.
5.  Autonomous Governance monitors, heals, optimizes, and evolves the platform.

**Design Principles:** The architecture is Modular and Event-Driven, adhering to Contract-First design using JSON Schemas and Event Contracts, with a Plugin Architecture for extensibility and Multi-Tenancy for tier-based quotas and isolation.

## Service Providers Integration Hub (New Feature - Dec 2024)
The platform includes a comprehensive Integrations Hub for managing external service providers:

**Features:**
*   **14 Built-in Providers** across 8 categories: AI (OpenAI, Claude, Google AI, Meta AI), Payment (Stripe, PayPal), Communication (Twilio, SendGrid), Cloud (AWS, Cloudflare), Analytics (Google Analytics), Search (Algolia), Media (Cloudinary), Maps (Google Maps)
*   **Secure API Key Management**: AES-256 encryption for stored keys, key rotation support, hash verification
*   **Performance Monitoring**: Health score, response time, success rate, request counts
*   **Cost Tracking**: Monthly budget and spending per provider
*   **Failover System**: Automatic switching between providers based on health metrics
*   **Alert System**: Multi-severity notifications for provider issues
*   **Audit Logging**: Complete history of all operations on providers and keys
*   **Advanced Filtering**: Search, filter by status/category, grid/list views

**Security:**
*   API keys encrypted with AES-256-CBC before storage
*   Keys never returned to frontend (only prefix shown)
*   ROOT_OWNER access required for all operations
*   Complete audit trail for compliance

## Sovereign User Management System (New Feature - Dec 2024)
Complete user governance system with ROOT_OWNER controls:

**User Status Management:**
*   **Status Types**: ACTIVE, SUSPENDED, BANNED, PENDING, DEACTIVATED
*   **Actions**: Suspend/Ban/Reactivate users with reason tracking
*   **Middleware**: Automatic status check on all authenticated requests
*   **Audit Trail**: Complete logging of all user governance actions

**User Permissions:**
*   Custom permission arrays per user
*   Owner-only permission management
*   ROOT_OWNER protection (cannot be suspended/banned/demoted)

## Resource Usage & Cost Tracking System (New Feature - Dec 2024)
Comprehensive tracking of user resource consumption with regional pricing:

**Database Tables:**
*   `userLocations`: Geographic tracking (country, city, timezone, IP, VPN detection)
*   `resourceUsage`: Per-request tracking with realCostUSD and billedCostUSD
*   `userUsageLimits`: Monthly/daily limits with auto-suspend capability
*   `pricingConfig`: 4 pricing models (FREE, FIXED, MARKUP, SUBSIDIZED) with regional overrides
*   `usageAlerts`: Multi-severity notification system
*   `dailyUsageAggregates`: Daily rollup for performance
*   `monthlyUsageSummary`: Monthly billing summaries

**Owner Analytics:**
*   Real-time cost vs. billed analysis
*   Top 5 users by consumption
*   Users where cost > billed (losing money alerts)
*   Profit by service breakdown
*   Geographic distribution of users

**API Endpoints (Owner Only):**
*   `GET /api/owner/users/:userId/usage` - User resource usage details
*   `GET /api/owner/users/:userId/location` - User location info
*   `GET /api/owner/users-with-locations` - All users with locations
*   `GET /api/owner/users/country/:countryCode` - Users by country
*   `POST /api/owner/users/:userId/usage-limits` - Set usage limits
*   `GET /api/owner/pricing-configs` - Pricing configurations
*   `GET /api/owner/usage-analytics` - Owner analytics dashboard
*   `GET /api/owner/monthly-summaries` - Monthly billing summaries

## Sovereign Infrastructure Management (New Feature - Dec 2024)
Cloud-agnostic infrastructure management with Provider Abstraction Layer (PAL):

**Supported Providers:**
*   Hetzner, Amazon AWS, Google Cloud, Microsoft Azure, DigitalOcean

**Features:**
*   **Infrastructure Providers**: Add/configure multiple cloud providers with credentials management
*   **Server Management**: Create, monitor, and manage servers across providers
*   **Deployment Engine**: One-click deployment with templates, auto-scaling, and rollback
*   **Backup System**: Automated backups with retention policies
*   **Cost Tracking**: Real-time cost monitoring with budget alerts

**API Endpoints (Owner Only):**
*   `GET/POST /api/owner/infrastructure/providers` - Manage cloud providers
*   `GET/POST/PATCH/DELETE /api/owner/infrastructure/servers` - Server CRUD
*   `GET/POST/PATCH /api/owner/infrastructure/deployments` - Deployment management
*   `GET/POST/DELETE /api/owner/infrastructure/backups` - Backup management
*   `GET /api/owner/infrastructure/cost-alerts` - Cost alerts
*   `GET /api/owner/infrastructure/budgets` - Budget management

## External Integration Gateway (New Feature - Dec 2024)
Secure gateway for technical partner access (Replit, GitHub Copilot, etc.):

**Features:**
*   **Session-based Access**: Manual owner activation with MFA verification
*   **Permission System**: Read/Write/Execute permissions with scope restrictions
*   **Digital Signatures**: Owner signature for audit trail
*   **Sandbox Mode**: Optional sandbox-only access for security
*   **Auto-close**: Sessions can auto-terminate after task completion
*   **Complete Logging**: All operations logged for audit compliance

**API Endpoints (Owner Only):**
*   `GET/POST /api/owner/integrations/sessions` - Session management
*   `POST /api/owner/integrations/sessions/:id/activate` - Activate session
*   `POST /api/owner/integrations/sessions/:id/deactivate` - Deactivate session
*   `GET /api/owner/integrations/sessions/:id/logs` - Session activity logs

**UI Pages:**
*   `/owner/infrastructure` - Cloud infrastructure management dashboard
*   `/owner/integrations` - External integration gateway management

## AI Smart Suggestions System (New Feature - Dec 2024)
Intelligent code analysis and improvement recommendations using Claude AI:

**Features:**
*   **Multi-Category Analysis**: Performance, Security, Accessibility, SEO, Best Practices, Code Quality, UX, Optimization
*   **Scoring System**: 0-100 scores for overall quality and each category
*   **Bilingual Support**: Full Arabic/English translations for all suggestions
*   **Analysis Types**: Full, Quick, Security-focused, Performance-focused
*   **Auto-Apply**: Safe suggestions can be automatically applied with revert capability
*   **Rating System**: Users can rate suggestion quality (1-5 stars) with feedback
*   **History Tracking**: Complete improvement history per project

**Database Tables:**
*   `codeAnalysisSessions`: Analysis session metadata with scores
*   `smartSuggestions`: Individual suggestions with status tracking
*   `analysisRules`: Configurable analysis rules
*   `projectImprovementHistory`: Applied changes with revert capability

**API Endpoints:**
*   `GET /api/suggestions` - Get suggestions for a project
*   `GET /api/suggestions/sessions` - Get analysis sessions
*   `POST /api/suggestions/analyze` - Run AI code analysis
*   `POST /api/suggestions/:id/apply` - Apply a suggestion
*   `POST /api/suggestions/:id/reject` - Reject a suggestion
*   `POST /api/suggestions/:id/rate` - Rate a suggestion
*   `GET /api/suggestions/history/:projectId` - Get improvement history

**UI Page:**
*   `/smart-suggestions` - Smart suggestions dashboard with score cards, suggestion list, and history

## One-Click Deployment System (New Feature - Dec 2024)
Streamlined deployment with a single button click:

**Features:**
*   **Multi-Platform Support**: Deploy to Web, Mobile (React Native), Desktop (Electron), or all platforms
*   **Environment Management**: Development, Staging, and Production environments
*   **Custom Domains**: Support for custom domain configuration
*   **Auto-Scaling**: Automatic scaling with configurable min/max instances
*   **SSL/CDN**: Built-in SSL certificate and CDN support
*   **Deployment History**: Complete history with rollback capability
*   **Status Tracking**: Real-time status updates (pending, building, deploying, running, failed)
*   **Bilingual Support**: Full Arabic/English interface

**API Endpoints:**
*   `GET /api/deployments` - Get deployments for a project
*   `POST /api/deployments/deploy` - Deploy a project
*   `POST /api/deployments/:id/stop` - Stop a running deployment
*   `POST /api/deployments/:id/rollback` - Rollback to a previous deployment

**UI Page:**
*   `/deploy` - One-click deployment dashboard with settings, status, and history

## External Dependencies
*   **Database**: PostgreSQL
*   **ORM**: Drizzle ORM
*   **AI**: Anthropic Claude API
*   **Payment Gateways**: Stripe, PayPal, Tap, mada, Apple Pay, Google Pay, STC Pay, Bank Transfer, Crypto