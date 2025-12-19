import Anthropic from "@anthropic-ai/sdk";

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

export function getAnthropicClient(): Anthropic | null {
  // Priority: Direct Anthropic API key first (cheaper), then Replit AI Integrations
  const directApiKey = process.env.ANTHROPIC_API_KEY;
  const replitApiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
  const replitBaseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  
  const useDirectApi = !!directApiKey;
  const currentApiKey = directApiKey || replitApiKey;
  
  // Dynamic reload: if API key changed, recreate the client
  if (anthropicInstance && cachedApiKey === currentApiKey) {
    return anthropicInstance;
  }
  
  if (!currentApiKey) {
    console.warn("[AI-Config] No Anthropic API key found");
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
  console.log("[AI-Config] Anthropic client reset - will reinitialize on next request");
}

export function validateModel(model: string): SupportedAnthropicModel {
  if (SUPPORTED_ANTHROPIC_MODELS.includes(model as SupportedAnthropicModel)) {
    return model as SupportedAnthropicModel;
  }
  console.warn(`[AI-Config] Model "${model}" not supported, using default: ${DEFAULT_ANTHROPIC_MODEL}`);
  return DEFAULT_ANTHROPIC_MODEL;
}
