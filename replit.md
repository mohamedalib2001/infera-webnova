# INFERA WebNova - Intelligent OS for Sovereign Digital Platforms

## Overview
INFERA WebNova is a **Core Operating System** that functions as a "digital platform factory." It autonomously generates and manages sovereign digital platforms using a Blueprint-First approach, Event-Driven Architecture, and AI Orchestration for autonomous governance. The system supports multi-tenant isolation and targets diverse sectors (Financial, Healthcare, Government, Education, Enterprise) with a strong focus on compliance (PCI-DSS, HIPAA, GDPR). The project aims to create a robust, self-managing ecosystem for digital platforms, surpassing existing market solutions in qualitative transcendence and offering unique, AI-powered features.

## User Preferences
I want iterative development.
Ask before making major changes.
I prefer detailed explanations.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
INFERA WebNova employs a modern web stack: React, TypeScript, and Vite for the frontend; Express.js and Node.js for the backend; and PostgreSQL with Drizzle ORM for data persistence. Styling is handled by Tailwind CSS and Shadcn UI, and state management by TanStack Query.

**UI/UX Decisions:**
The platform features an AI Chat Interface, live preview with responsive controls, dark/light modes, pre-built UI components, bilingual support (Arabic/English), and Visual Git Version Control.

**Core System Architecture:**
The system is built around a Blueprint System (Single Source of Truth), an AI Orchestrator (using Anthropic Claude for intent analysis and code generation), and a Platform Orchestrator for workflow management. Key architectural components include:
*   **Event-Driven Architecture**: Utilizing a PostgreSQL Event Store for durable event sourcing with tenant isolation.
*   **AI-First Principle**: Every generated platform incorporates an AI Core, AI Assistant, Predictive Engine, and Behavioral Intelligence.
*   **Dynamic Architecture**: All components (UI, Workflows, Permissions, Data Models) are fully dynamic.
*   **Sovereign Security**: Zero-Trust Architecture with End-to-End Encryption, AI Threat Detection, and Automated Incident Response, aiming for unhackable platforms. This is bolstered by a FIPS 140-3 Crypto Module, PKI/X.509 System, SBOM Generator, Incident Response Manager, and Zero Trust Engine in the military-grade layer.
*   **AI Sovereignty Layer**: A governance framework enforcing owner-only AI control, rules, resource allocation, and human-in-the-loop decisions with immutable audit logs.
*   **Modular Design**: Implemented through an Event Bus, Core Contracts (Zod schemas), a Plugin System, Code Generation Engine, Runtime Layer, Versioning System, and Multi-Tenancy Core.
*   **Service Providers Integration Hub**: Manages 14 built-in external providers across various categories.
*   **Sovereign User Management System**: Provides granular user governance with ROOT_OWNER controls.
*   **Resource Usage & Cost Tracking System**: Monitors resource consumption with regional pricing.
*   **Sovereign Infrastructure Management**: Cloud-agnostic infrastructure via a Provider Abstraction Layer (PAL).
*   **External Integration Gateway**: Securely manages technical partner access (Replit, GitHub Copilot).
*   **One-Click Deployment System**: Streamlined deployment to Web, Mobile, or Desktop environments.
*   **Backend Generator System**: AI-powered full backend code generation.
*   **AI Copilot Assistant**: Intelligent coding assistance.
*   **Testing Generator**: Automatic generation of unit, integration, and E2E tests.
*   **Marketplace**: For community extensions and templates.
*   **Real-time Collaboration**: Features live collaborators and role-based access.
*   **Full-Stack Project Generator**: Supports 12 project templates.
*   **Cloud Deployment Adapters**: Provider-agnostic deployment API for various cloud platforms.
*   **Sandbox Code Executor**: Securely executes code in multiple languages with isolation and security features.
*   **Secure Terminal System**: Provides a secure terminal with whitelist-based command execution.
*   **Project Runtime Engine**: Manages project lifecycle with real filesystem operations.
*   **Platform Linking Unit (INFERA Engine Federation)**: Registry for INFERA group platforms with WebNova as the ROOT.
*   **Security Model**: Role-Based Access Control (ROOT_OWNER, sovereign, owner roles) with real-time database revalidation, session security, and Zod validation. Includes a Nova Permissions System with 20+ granular permissions.
*   **Dynamic Page Telemetry System**: Tracks React component performance with zero hardcoded values.
*   **Institutional Memory System**: Authenticated API for semantic memory management, including search and versioning.
*   **Execution Engine Enhancements**: Docker container isolation for code execution.
*   **Integration Layer**: Git API for repository management and CI/CD.
*   **Infrastructure-as-Code**: Terraform for Hetzner Cloud provisioning and Ansible for k3s cluster setup, with Kubernetes manifests.
*   **Secrets Vault Service**: AES-256-GCM encrypted secret management with versioning and audit logging.
*   **Service-to-Service Authentication**: HMAC-SHA256 signature validation.
*   **Nova Sovereign Decision Engine**: Governs AI operations with Decision Policy Engine, Traceability, Approval Chains, Kill Switch, Human-in-the-Loop matrix, Model Lifecycle management, Bias/Drift/Risk Monitoring, Knowledge Graph, Policy Memory, and a Compliance Engine.
*   **Smart Analysis Tools**: Includes Code Analyzer, Security Scanner (SAST), Performance Profiler, and Testing Automation. Fully integrated with Nova AI IDE through handleAnalyzeCode and handleSecurityScan handlers.
*   **CI/CD Automation Engine**: Manages pipelines, Docker, multi-cloud deployment, and GitHub automation.
*   **Context Understanding Engine**: Analyzes databases, projects, history, and detects architectural patterns.
*   **Military Security Database Schema**: Four dedicated tables for persistent security data storage:
    - `pki_certificates`: PKI/X.509 certificate management with status tracking and revocation support
    - `military_incident_response`: DoD 72-hour incident response tracking with timeline and classification
    - `security_scan_results`: SAST/DAST scan results with OWASP categorization and findings
    - `security_audit_logs`: Military-grade audit logging with classification levels (unclassified to top_secret)

## External Dependencies
*   **Database**: PostgreSQL
*   **ORM**: Drizzle ORM
*   **AI**: Anthropic Claude API
*   **Payment Gateways**: Stripe, PayPal, Tap, mada, Apple Pay, Google Pay, STC Pay, Bank Transfer, Crypto
*   **Communication**: Twilio
*   **Cloud Providers**: AWS, Cloudflare, Hetzner, Google Cloud, Microsoft Azure, DigitalOcean, Vercel, Netlify, Railway, Render, Fly.io
*   **Analytics**: Google Analytics
*   **Search**: Algolia
*   **Media**: Cloudinary
*   **Maps**: Google Maps
*   **Development Tools**: Replit, GitHub Copilot
*   **IaC**: Terraform, Ansible