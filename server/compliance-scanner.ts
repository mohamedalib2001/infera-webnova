/**
 * Governance Compliance Scanner Service
 * Scans codebase for files exceeding line limits per governance policy
 * ROOT_OWNER only - Audited and rate-limited
 */

import * as fs from "fs";
import * as path from "path";

interface FileViolation {
  path: string;
  type: "page" | "component" | "hook" | "service" | "util";
  lines: number;
  limit: number;
  status: "compliant" | "warning" | "violation";
}

interface ScanResult {
  timestamp: string;
  totalFiles: number;
  violations: FileViolation[];
  summary: {
    compliant: number;
    warnings: number;
    violations: number;
  };
}

const LIMITS = {
  page: 400,
  component: 300,
  hook: 200,
  service: 250,
  util: 150,
};

const ALLOWED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

const SCAN_PATHS = [
  { dir: "client/src/pages", type: "page" as const },
  { dir: "client/src/components", type: "component" as const },
  { dir: "client/src/hooks", type: "hook" as const },
  { dir: "server", type: "service" as const },
];

let lastScanTime = 0;
let cachedResult: ScanResult | null = null;
const RATE_LIMIT_MS = 60000; // 1 minute cooldown

function countLines(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return content.split("\n").length;
  } catch {
    return 0;
  }
}

function getFileType(filePath: string, baseType: "page" | "component" | "hook" | "service"): FileViolation["type"] {
  const normalized = filePath.toLowerCase();
  if (normalized.includes("/hooks/") || normalized.includes("use-")) return "hook";
  if (normalized.includes("/utils/") || normalized.includes(".util")) return "util";
  if (normalized.includes("/services/") || normalized.includes(".service")) return "service";
  return baseType;
}

function scanDirectory(dirPath: string, baseType: "page" | "component" | "hook" | "service"): FileViolation[] {
  const results: FileViolation[] = [];
  
  if (!fs.existsSync(dirPath)) return results;

  const scanRecursive = (currentPath: string) => {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);
      
      if (item.isDirectory()) {
        // Skip node_modules, ui components, test directories
        if (!["node_modules", "ui", "__tests__", "test"].includes(item.name)) {
          scanRecursive(fullPath);
        }
      } else if (item.isFile()) {
        const ext = path.extname(item.name);
        if (ALLOWED_EXTENSIONS.includes(ext)) {
          const relativePath = fullPath.replace(process.cwd() + "/", "");
          const lines = countLines(fullPath);
          const type = getFileType(relativePath, baseType);
          const limit = LIMITS[type];
          
          let status: FileViolation["status"] = "compliant";
          if (lines > limit) {
            status = "violation";
          } else if (lines > limit * 0.8) {
            status = "warning";
          }

          results.push({
            path: relativePath,
            type,
            lines,
            limit,
            status,
          });
        }
      }
    }
  };

  scanRecursive(dirPath);
  return results;
}

export async function runComplianceScan(forceRefresh = false): Promise<ScanResult> {
  const now = Date.now();
  
  // Rate limiting with cache
  if (!forceRefresh && cachedResult && (now - lastScanTime) < RATE_LIMIT_MS) {
    return cachedResult;
  }

  const allViolations: FileViolation[] = [];

  for (const { dir, type } of SCAN_PATHS) {
    const dirPath = path.join(process.cwd(), dir);
    const violations = scanDirectory(dirPath, type);
    allViolations.push(...violations);
  }

  // Sort by violation severity and line count
  allViolations.sort((a, b) => {
    const statusOrder = { violation: 0, warning: 1, compliant: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return b.lines - a.lines;
  });

  const summary = allViolations.reduce(
    (acc, v) => {
      if (v.status === "violation") acc.violations++;
      else if (v.status === "warning") acc.warnings++;
      else acc.compliant++;
      return acc;
    },
    { compliant: 0, warnings: 0, violations: 0 }
  );

  const result: ScanResult = {
    timestamp: new Date().toISOString(),
    totalFiles: allViolations.length,
    violations: allViolations,
    summary,
  };

  lastScanTime = now;
  cachedResult = result;

  return result;
}

export function getComplianceStatus(): "blocked" | "warning" | "compliant" {
  if (!cachedResult) return "compliant";
  if (cachedResult.summary.violations > 0) return "blocked";
  if (cachedResult.summary.warnings > 0) return "warning";
  return "compliant";
}
