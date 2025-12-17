import { generateWebsite, refineWebsite } from "./ai-engine";

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
  const result = await generateWebsite(prompt);
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
