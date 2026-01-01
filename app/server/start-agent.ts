/**
 * INFERA Agent Standalone Starter
 * 
 * هذا الملف يشغل INFERA Agent كخدمة مستقلة على port 5001
 * منفصل عن WebNova (port 5000)
 */

import { startStandaloneAgent } from "./infera-agent-standalone";

console.log("[INFERA Agent] Starting standalone server...");
startStandaloneAgent();
