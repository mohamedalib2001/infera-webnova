/**
 * INFERA WebNova - System Health Check
 * Validates core system components are functioning correctly
 */

import { AIOrchestrator } from "./ai-orchestrator";
import { ProjectRuntime } from "./project-runtime";
import { fullStackGenerator, TEMPLATE_CONFIGS } from "./fullstack-generator";

export interface HealthCheckResult {
  component: string;
  status: "healthy" | "degraded" | "unhealthy";
  message: string;
  latency?: number;
}

export async function runHealthCheck(): Promise<{
  overall: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheckResult[];
  timestamp: string;
}> {
  const checks: HealthCheckResult[] = [];
  const startTime = Date.now();

  // Check AI Orchestrator
  try {
    const orchestrator = new AIOrchestrator();
    const intentStart = Date.now();
    const intent = await orchestrator.analyzeIntent("test app", "en");
    
    checks.push({
      component: "AI Orchestrator",
      status: intent ? "healthy" : "degraded",
      message: intent ? "Intent analysis working" : "Using fallback analysis",
      latency: Date.now() - intentStart,
    });
  } catch (error: any) {
    checks.push({
      component: "AI Orchestrator",
      status: "unhealthy",
      message: error.message || "Failed to initialize",
    });
  }

  // Check Project Runtime
  try {
    const runtime = new ProjectRuntime();
    const runtimeStart = Date.now();
    const testId = `health_${Date.now()}`;
    const state = await runtime.initialize(testId, { basePath: `/tmp/health-${testId}` });
    
    checks.push({
      component: "Project Runtime",
      status: state.status === "ready" ? "healthy" : "degraded",
      message: `Runtime status: ${state.status}`,
      latency: Date.now() - runtimeStart,
    });
    
    // Cleanup
    await runtime.stop(testId);
  } catch (error: any) {
    checks.push({
      component: "Project Runtime",
      status: "unhealthy",
      message: error.message || "Failed to initialize runtime",
    });
  }

  // Check Full Stack Generator
  try {
    const genStart = Date.now();
    const templateCount = Object.keys(TEMPLATE_CONFIGS).length;
    
    checks.push({
      component: "Full Stack Generator",
      status: templateCount >= 8 ? "healthy" : "degraded",
      message: `${templateCount} templates available`,
      latency: Date.now() - genStart,
    });
  } catch (error: any) {
    checks.push({
      component: "Full Stack Generator",
      status: "unhealthy",
      message: error.message || "Generator unavailable",
    });
  }

  // Check Environment
  const envChecks = [
    { key: "ANTHROPIC_API_KEY", required: true },
    { key: "DATABASE_URL", required: true },
    { key: "HETZNER_API_TOKEN", required: false },
  ];

  const missingRequired = envChecks
    .filter(e => e.required && !process.env[e.key])
    .map(e => e.key);

  checks.push({
    component: "Environment",
    status: missingRequired.length === 0 ? "healthy" : "degraded",
    message: missingRequired.length === 0 
      ? "All required env vars configured"
      : `Missing: ${missingRequired.join(", ")}`,
  });

  // Calculate overall status
  const hasUnhealthy = checks.some(c => c.status === "unhealthy");
  const hasDegraded = checks.some(c => c.status === "degraded");

  return {
    overall: hasUnhealthy ? "unhealthy" : hasDegraded ? "degraded" : "healthy",
    checks,
    timestamp: new Date().toISOString(),
  };
}

export async function quickCheck(): Promise<boolean> {
  try {
    const result = await runHealthCheck();
    return result.overall !== "unhealthy";
  } catch {
    return false;
  }
}
