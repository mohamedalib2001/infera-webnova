import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";
import { aiProviderConfigs } from "@shared/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "./encryption";

export const SUPPORTED_ANTHROPIC_MODELS = [
  "claude-sonnet-4-5",
  "claude-opus-4-5", 
  "claude-haiku-4-5",
  "claude-opus-4-1",
] as const;

export type SupportedAnthropicModel = typeof SUPPORTED_ANTHROPIC_MODELS[number];

export const DEFAULT_ANTHROPIC_MODEL: SupportedAnthropicModel = "claude-sonnet-4-5";

let anthropicInstance: Anthropic | null = null;
let cachedApiKey: string | null = null;
let cachedBaseURL: string | null = null;

async function getStoredAnthropicKey(): Promise<{ apiKey: string | null; baseUrl: string | null }> {
  try {
    const config = await db.select()
      .from(aiProviderConfigs)
      .where(eq(aiProviderConfigs.provider, "anthropic"))
      .limit(1);
    
    if (config.length > 0 && config[0].encryptedApiKey && config[0].isActive) {
      const decryptedKey = decrypt(config[0].encryptedApiKey);
      return {
        apiKey: decryptedKey,
        baseUrl: config[0].baseUrl || null,
      };
    }
    return { apiKey: null, baseUrl: null };
  } catch (error) {
    console.error("[AI-Config] Error fetching stored API key:", error);
    return { apiKey: null, baseUrl: null };
  }
}

export async function getAnthropicClientAsync(): Promise<Anthropic | null> {
  const stored = await getStoredAnthropicKey();
  
  // Priority: 1. Environment ANTHROPIC_API_KEY, 2. Stored key from DB, 3. Replit integrations
  const envApiKey = process.env.ANTHROPIC_API_KEY;
  const replitApiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
  const replitBaseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  
  const useDirectEnv = !!envApiKey;
  const useStoredKey = !useDirectEnv && !!stored.apiKey;
  const useReplitIntegrations = !useDirectEnv && !useStoredKey && !!replitApiKey;
  
  const currentApiKey = envApiKey || stored.apiKey || replitApiKey;
  const currentBaseURL = useStoredKey ? stored.baseUrl : (useReplitIntegrations ? replitBaseURL : null);
  
  if (anthropicInstance && cachedApiKey === currentApiKey && cachedBaseURL === currentBaseURL) {
    return anthropicInstance;
  }
  
  if (!currentApiKey) {
    console.warn("[AI-Config] No Anthropic API key found");
    return null;
  }
  
  try {
    if (currentBaseURL) {
      anthropicInstance = new Anthropic({
        apiKey: currentApiKey,
        baseURL: currentBaseURL,
      });
    } else {
      anthropicInstance = new Anthropic({ apiKey: currentApiKey });
    }
    cachedApiKey = currentApiKey;
    cachedBaseURL = currentBaseURL || null;
    
    if (useDirectEnv) {
      console.log("[AI-Config] Using DIRECT Anthropic API (environment variable)");
    } else if (useStoredKey) {
      console.log("[AI-Config] Using STORED API key from database (encrypted)");
    } else {
      console.log("[AI-Config] Using Replit AI Integrations");
    }
    
    return anthropicInstance;
  } catch (error) {
    console.error("[AI-Config] Failed to initialize Anthropic client:", error);
    return null;
  }
}

export function getAnthropicClient(): Anthropic | null {
  const directApiKey = process.env.ANTHROPIC_API_KEY;
  const replitApiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
  const replitBaseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  
  const useDirectApi = !!directApiKey;
  const currentApiKey = directApiKey || replitApiKey;
  
  if (anthropicInstance && cachedApiKey === currentApiKey) {
    return anthropicInstance;
  }
  
  if (!currentApiKey) {
    console.warn("[AI-Config] No Anthropic API key found (sync method - use getAnthropicClientAsync for DB keys)");
    return null;
  }
  
  try {
    if (useDirectApi) {
      anthropicInstance = new Anthropic({ apiKey: currentApiKey });
      console.log("[AI-Config] Using DIRECT Anthropic API (Claude Console)");
    } else {
      anthropicInstance = new Anthropic({
        apiKey: currentApiKey,
        ...(replitBaseURL && { baseURL: replitBaseURL }),
      });
      console.log("[AI-Config] Using Replit AI Integrations");
    }
    cachedApiKey = currentApiKey;
    return anthropicInstance;
  } catch (error) {
    console.error("[AI-Config] Failed to initialize Anthropic client:", error);
    return null;
  }
}

export function resetAnthropicClient(): void {
  anthropicInstance = null;
  cachedApiKey = null;
  cachedBaseURL = null;
  console.log("[AI-Config] Anthropic client reset - will reinitialize on next request");
}

export function validateModel(model: string): SupportedAnthropicModel {
  if (SUPPORTED_ANTHROPIC_MODELS.includes(model as SupportedAnthropicModel)) {
    return model as SupportedAnthropicModel;
  }
  console.warn(`[AI-Config] Model "${model}" not supported, using default: ${DEFAULT_ANTHROPIC_MODEL}`);
  return DEFAULT_ANTHROPIC_MODEL;
}
