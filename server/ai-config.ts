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

export function getAnthropicClient(): Anthropic | null {
  if (anthropicInstance) {
    return anthropicInstance;
  }
  
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  
  if (!apiKey) {
    console.warn("[AI-Config] No Anthropic API key found");
    return null;
  }
  
  try {
    anthropicInstance = new Anthropic({
      apiKey,
      ...(baseURL && { baseURL }),
    });
    console.log("[AI-Config] Anthropic client initialized successfully");
    return anthropicInstance;
  } catch (error) {
    console.error("[AI-Config] Failed to initialize Anthropic client:", error);
    return null;
  }
}

export function validateModel(model: string): SupportedAnthropicModel {
  if (SUPPORTED_ANTHROPIC_MODELS.includes(model as SupportedAnthropicModel)) {
    return model as SupportedAnthropicModel;
  }
  console.warn(`[AI-Config] Model "${model}" not supported, using default: ${DEFAULT_ANTHROPIC_MODEL}`);
  return DEFAULT_ANTHROPIC_MODEL;
}
