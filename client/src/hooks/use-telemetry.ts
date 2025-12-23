import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";

interface ComponentTelemetry {
  componentName: string;
  componentType: string;
  hasAI?: boolean;
  hasAutomation?: boolean;
  renderTime?: number;
}

interface ApiCallTelemetry {
  endpoint: string;
  method: string;
  responseTime: number;
  status: number;
  success: boolean;
}

interface TelemetryBatch {
  path: string;
  components: ComponentTelemetry[];
  apiCalls: ApiCallTelemetry[];
  timestamp: number;
}

const telemetryQueue: TelemetryBatch[] = [];
let flushTimeout: NodeJS.Timeout | null = null;
const FLUSH_INTERVAL = 5000;

function extractServiceInfo(endpoint: string): { serviceName: string; serviceType: string } {
  const parts = endpoint.replace("/api/", "").split("/").filter(Boolean);
  if (parts.length === 0) {
    return { serviceName: "api", serviceType: "core" };
  }
  const serviceName = parts[0].replace(/-/g, "_");
  return { serviceName, serviceType: "dynamic" };
}

async function flushTelemetry() {
  if (telemetryQueue.length === 0) return;

  const batch = [...telemetryQueue];
  telemetryQueue.length = 0;

  try {
    await fetch("/api/telemetry/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batches: batch }),
      credentials: "include",
    });
  } catch {
    telemetryQueue.push(...batch);
  }
}

function scheduleFlush() {
  if (flushTimeout) return;
  flushTimeout = setTimeout(() => {
    flushTimeout = null;
    flushTelemetry();
  }, FLUSH_INTERVAL);
}

let currentPath = "/";
const componentBuffer: ComponentTelemetry[] = [];
const apiCallBuffer: ApiCallTelemetry[] = [];

export function trackComponent(telemetry: ComponentTelemetry) {
  componentBuffer.push(telemetry);
  scheduleFlush();
}

export function trackApiCall(telemetry: ApiCallTelemetry) {
  apiCallBuffer.push(telemetry);
  scheduleFlush();
}

export function setCurrentPath(path: string) {
  if (currentPath !== path) {
    if (componentBuffer.length > 0 || apiCallBuffer.length > 0) {
      telemetryQueue.push({
        path: currentPath,
        components: [...componentBuffer],
        apiCalls: [...apiCallBuffer],
        timestamp: Date.now(),
      });
      componentBuffer.length = 0;
      apiCallBuffer.length = 0;
    }
    currentPath = path;
  }
}

export function useTelemetry() {
  const [location] = useLocation();

  useEffect(() => {
    setCurrentPath(location);
  }, [location]);

  useEffect(() => {
    return () => {
      if (componentBuffer.length > 0 || apiCallBuffer.length > 0) {
        telemetryQueue.push({
          path: currentPath,
          components: [...componentBuffer],
          apiCalls: [...apiCallBuffer],
          timestamp: Date.now(),
        });
        componentBuffer.length = 0;
        apiCallBuffer.length = 0;
        flushTelemetry();
      }
    };
  }, []);

  return { trackComponent, trackApiCall };
}

export function useTrackedComponent(name: string, type: string, options?: { hasAI?: boolean; hasAutomation?: boolean }) {
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = performance.now();
    return () => {
      const renderTime = performance.now() - mountTimeRef.current;
      trackComponent({
        componentName: name,
        componentType: type,
        hasAI: options?.hasAI,
        hasAutomation: options?.hasAutomation,
        renderTime,
      });
    };
  }, [name, type, options?.hasAI, options?.hasAutomation]);
}

const originalFetch = globalThis.fetch;
let isInstrumented = false;

export function instrumentFetch() {
  if (isInstrumented) return;
  isInstrumented = true;

  globalThis.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    
    if (!url.startsWith("/api/") || url.includes("/api/telemetry")) {
      return originalFetch(input, init);
    }

    const method = init?.method || "GET";
    const startTime = performance.now();

    try {
      const response = await originalFetch(input, init);
      const responseTime = performance.now() - startTime;

      trackApiCall({
        endpoint: url,
        method,
        responseTime,
        status: response.status,
        success: response.ok,
      });

      return response;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      trackApiCall({
        endpoint: url,
        method,
        responseTime,
        status: 0,
        success: false,
      });
      throw error;
    }
  };
}

instrumentFetch();
