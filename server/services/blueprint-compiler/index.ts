/**
 * Blueprint Compiler - مترجم المخططات البنائية
 * 
 * Main entry point for the Blueprint Compiler system.
 * Transforms requirements into complete, deployable digital platforms.
 */

export * from './types';
export { blueprintParser, BlueprintParser } from './blueprint-parser';
export { schemaForge, SchemaForge } from './schema-forge';
export { backendGenerator, BackendGenerator } from './backend-generator';
export { frontendGenerator, FrontendGenerator } from './frontend-generator';
export { buildOrchestrator, BuildOrchestrator } from './build-orchestrator';
