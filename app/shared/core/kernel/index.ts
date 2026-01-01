/**
 * INFERA WebNova - Kernel Module Exports
 * 10-Layer Sovereign Architecture
 * 
 * Layer 0: Sovereign Kernel (Lifecycle, Permissions, Policy, Extensions)
 * Layer 1: Module Registry (Everything is a Plugin)
 * Layer 2: Build Graph (Multi-Language Runtime Slots)
 * Layer 4: Data Fabric (Contracts + Adapters)
 * Layer 5: AI Roles Engine (6 Specialized Roles)
 * Layer 6: Deployment Adapters (Cloud/Edge/On-prem/Hybrid)
 * Layer 7: Zero Trust + Vault
 * Layer 8: Federation (Cross-Platform Identity)
 * Layer 9: Future Interfaces (Web3/XR/Quantum)
 */

// Layer 0: Sovereign Kernel
export * from './sovereign-kernel';
export { default as sovereignKernel } from './sovereign-kernel';

// Layer 1: Module Registry
export * from './module-registry';
export { default as moduleRegistry } from './module-registry';

// Layer 2: Build Graph
export * from './build-graph';

// Layer 4: Data Fabric
export * from './data-fabric';
export { default as dataFabric } from './data-fabric';

// Layer 5: AI Roles Engine
export * from './ai-roles-engine';
export { default as aiRolesEngine } from './ai-roles-engine';

// Layer 6: Deployment Adapters
export * from './deployment-adapters';
export { default as deploymentOrchestrator } from './deployment-adapters';

// Layer 6B: Cloud Deployment Adapters (Vercel, Netlify, Railway, etc.)
export * from './cloud-deploy-adapters';

// Layer 6C: Full-Stack Project Generator
export * from './fullstack-generator';
export { default as fullStackGenerator } from './fullstack-generator';

// Layer 6D: Sandbox Code Executor
export * from './sandbox-executor';
export { sandboxExecutor } from './sandbox-executor';

// Layer 7: Zero Trust + Vault
export * from './zero-trust';

// Layer 8: Federation
export * from './federation';

// Layer 9: Future Interfaces
export * from './future-interfaces';

// Quality Assurance Engine
export * from './quality-assurance-engine';
export { default as qualityAssuranceEngine } from './quality-assurance-engine';
