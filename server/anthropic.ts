import { generateWebsite, refineWebsite, GenerationResult } from "./ai-engine";

export interface GeneratedCode {
  html: string;
  css: string;
  js: string;
  message: string;
}

export async function generateWebsiteCode(
  prompt: string,
  context?: string
): Promise<GeneratedCode> {
  console.log("=== MULTI-STAGE AI GENERATION ===");
  console.log(`Request: ${prompt.substring(0, 100)}...`);
  
  const result = await generateWebsite(prompt);
  
  console.log(`Generation complete: ${result.attempts} attempt(s), validation: ${result.validation?.score || 'N/A'}`);
  
  return {
    html: result.html,
    css: result.css,
    js: result.js,
    message: result.message,
  };
}

export async function refineWebsiteCode(
  prompt: string,
  currentHtml: string,
  currentCss: string,
  currentJs: string
): Promise<GeneratedCode> {
  console.log("=== AI REFINEMENT ===");
  console.log(`Request: ${prompt.substring(0, 100)}...`);
  
  const result = await refineWebsite(prompt, {
    html: currentHtml,
    css: currentCss,
    js: currentJs,
  });
  
  return {
    html: result.html,
    css: result.css,
    js: result.js,
    message: result.message,
  };
}
