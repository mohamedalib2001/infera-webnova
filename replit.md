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
*   **AI-Powered Generation**: Utilizes OpenAI API (GPT-5) for generating website code and full-stack applications from natural language prompts.
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
*   **AI**: OpenAI API (GPT-5)
*   **Payment Gateways**: Stripe, PayPal, Tap, mada, Apple Pay, Google Pay, STC Pay, Bank Transfer, Crypto