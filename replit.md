# INFERA WebNova - Intelligent OS for Sovereign Digital Platforms

## Overview
INFERA WebNova is a Core Operating System that acts as a "digital platform factory." It autonomously generates and manages sovereign digital platforms using a Blueprint-First approach, Event-Driven Architecture, and AI Orchestration. The system supports multi-tenant isolation, targets diverse sectors (Financial, Healthcare, Government, Education, Enterprise), and focuses heavily on compliance (PCI-DSS, HIPAA, GDPR). The project aims to build a robust, self-managing ecosystem for digital platforms, offering unique, AI-powered features.

## User Preferences
I want iterative development.
Ask before making major changes.
I prefer detailed explanations.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture

INFERA WebNova utilizes a modern web stack: React, TypeScript, and Vite for the frontend; Express.js and Node.js for the backend; and PostgreSQL with Drizzle ORM for data persistence. Styling is managed by Tailwind CSS and Shadcn UI, and state management by TanStack Query.

**UI/UX Decisions:** The platform includes an AI Chat Interface, live preview with responsive controls, dark/light modes, pre-built UI components, bilingual support (Arabic/English), and Visual Git Version Control.

**Core System Architecture:**
The system is centered around a Blueprint System (Single Source of Truth), an AI Orchestrator (using Anthropic Claude for intent analysis and code generation), and a Platform Orchestrator for workflow management. Key architectural principles and components include:

*   **Dynamic Architecture (0% Hardcoded - 100% Dynamic):** All platform elements, including identity, branding, UI components, loading pages, and operational logic, must be dynamically loaded and controllable from the Owner Account. This includes dynamic loading of platform name, logo, colors, fonts, text, language, and metadata. No hardcoded values are allowed.
*   **Platform Governance Policy:** Strict code line limits are enforced for different file types (Page/Route, Component, Hook, Service/API, Utility/Helper). Pages must act as coordinators only, with no business logic. Lazy loading is required for heavy components, and virtualization for large lists/tables.
*   **Routing & Navigation Policy:** Sidebar menus use metadata only, with no page imports or API calls. All pages must use lazy loading, and direct page imports are prohibited.
*   **Event-Driven Architecture:** Utilizes a PostgreSQL Event Store for durable event sourcing with tenant isolation.
*   **AI-First Principle:** Every generated platform incorporates an AI Core, AI Assistant, Predictive Engine, and Behavioral Intelligence.
*   **Sovereign Security:** Implements a Zero-Trust Architecture with End-to-End Encryption, AI Threat Detection, Automated Incident Response, FIPS 140-3 Crypto Module, PKI/X.509 System, SBOM Generator, Incident Response Manager, and Zero Trust Engine.
*   **AI Sovereignty Layer:** A governance framework enforcing owner-only AI control, rules, resource allocation, and human-in-the-loop decisions with immutable audit logs.
*   **Modular Design:** Achieved through an Event Bus, Core Contracts (Zod schemas), a Plugin System, Code Generation Engine, Runtime Layer, Versioning System, and Multi-Tenancy Core.
*   **Sovereign User Management System:** Provides granular user governance with `ROOT_OWNER` controls.
*   **Sovereign Infrastructure Management:** Cloud-agnostic infrastructure via a Provider Abstraction Layer (PAL).
*   **One-Click Deployment System:** Streamlined deployment to Web, Mobile, or Desktop environments.
*   **Backend Generator System:** AI-powered full backend code generation.
*   **AI Copilot Assistant & Testing Generator:** Intelligent coding assistance and automatic test generation.
*   **Security Model:** Role-Based Access Control (ROOT_OWNER, sovereign, owner roles) with real-time database revalidation, session security, and Zod validation, including a Nova Permissions System.
*   **Dynamic Page Telemetry System:** Tracks React component performance without hardcoded values.
*   **Institutional Memory System:** Authenticated API for semantic memory management.
*   **Execution Engine Enhancements:** Docker container isolation for code execution.
*   **Integration Layer:** Git API for repository management and CI/CD.
*   **Infrastructure-as-Code:** Terraform for Hetzner Cloud provisioning and Ansible for k3s cluster setup.
*   **Secrets Vault Service:** AES-256-GCM encrypted secret management.
*   **Service-to-Service Authentication:** HMAC-SHA256 signature validation.
*   **Nova Sovereign Decision Engine:** Governs AI operations with a Policy Engine, Traceability, Approval Chains, Kill Switch, Human-in-the-Loop, Model Lifecycle management, and Compliance Engine.
*   **Smart Analysis Tools:** Code Analyzer, Security Scanner (SAST), Performance Profiler, and Testing Automation integrated with Nova AI IDE.
*   **CI/CD Automation Engine:** Manages pipelines, Docker, multi-cloud deployment, and GitHub automation.
*   **Context Understanding Engine:** Analyzes databases, projects, history, and architectural patterns.
*   **Military Security Database Schema:** Dedicated tables for PKI/X.509 certificates, incident response tracking, SAST/DAST scan results, and military-grade audit logs.
*   **Unified Payment Orchestrator System:** Centralized system for managing payments, enforcing dynamic gateway selection, unified contract schema, and zero code changes for new gateways. Supports regions like EGYPT, UAE, and KSA with various local gateways.
*   **Smart Code Generator System:** AI-powered system for generating full backend and frontend code from natural language requirements, supporting various project templates and integration types.

## External Dependencies
*   **Database**: PostgreSQL
*   **ORM**: Drizzle ORM
*   **AI**: Anthropic Claude API
*   **Payment Gateways**: Stripe, PayPal, Tap, mada, Apple Pay, Google Pay, STC Pay, Bank Transfer, Crypto, Paymob, Fawry, PaySky, Meeza, InstaPay, PayTabs, Telr, Amazon Payment Services, HyperPay
*   **Communication**: Twilio
*   **Cloud Providers**: AWS, Cloudflare, Hetzner, Google Cloud, Microsoft Azure, DigitalOcean, Vercel, Netlify, Railway, Render, Fly.io
*   **Analytics**: Google Analytics
*   **Search**: Algolia
*   **Media**: Cloudinary
*   **Maps**: Google Maps
*   **Development Tools**: Replit, GitHub Copilot
*   **IaC**: Terraform, Ansible
*   **AI Integration**: OpenAI, Google AI
*   **Storage**: GCS, S3, Azure Blob