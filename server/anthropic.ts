import Anthropic from "@anthropic-ai/sdk";
import { findBestTemplate } from './premium-templates';

const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

const anthropic = new Anthropic({
  apiKey: apiKey,
  ...(baseURL && { baseURL }),
});

function extractField(content: string, fieldName: string): string {
  const patterns = [
    new RegExp(`"${fieldName}"\\s*:\\s*"((?:[^"\\\\]|\\\\[\\s\\S])*)"`, 's'),
    new RegExp(`"${fieldName}"\\s*:\\s*\`((?:[^\`\\\\]|\\\\[\\s\\S])*)\``, 's'),
    new RegExp(`"${fieldName}"\\s*:\\s*'((?:[^'\\\\]|\\\\[\\s\\S])*)'`, 's'),
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1]
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
  }
  
  const startMarker = `"${fieldName}": "`;
  const startIdx = content.indexOf(startMarker);
  if (startIdx !== -1) {
    let endIdx = startIdx + startMarker.length;
    let depth = 0;
    let escaped = false;
    
    while (endIdx < content.length) {
      const char = content[endIdx];
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"' && depth === 0) {
        break;
      }
      endIdx++;
    }
    
    const extracted = content.substring(startIdx + startMarker.length, endIdx);
    return extracted
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
  
  return '';
}

function parseJsonResponse(content: string): any {
  let jsonContent = content.trim();
  
  const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonContent = jsonMatch[1].trim();
  } else {
    jsonContent = jsonContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/g, '').trim();
  }
  
  if (!jsonContent.startsWith('{')) {
    const objMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (objMatch) {
      jsonContent = objMatch[0];
    }
  }
  
  try {
    return JSON.parse(jsonContent);
  } catch (parseError) {
    console.log("JSON parse failed, trying field extraction...");
    
    const html = extractField(jsonContent, 'html');
    const css = extractField(jsonContent, 'css');
    const js = extractField(jsonContent, 'js');
    const message = extractField(jsonContent, 'message');
    
    if (html || css) {
      console.log("Field extraction successful");
      return { html, css, js, message: message || 'Website generated!' };
    }
    
    console.error("All parsing methods failed");
    throw parseError;
  }
}

export interface GeneratedCode {
  html: string;
  css: string;
  js: string;
  message: string;
}

const PREMIUM_DESIGN_SYSTEM = `
# PREMIUM DESIGN SYSTEM - INFERA WebNova

You are an elite UI/UX designer and frontend developer creating award-winning websites. Your designs must match or exceed Tailwind UI, Dribbble, and Awwwards quality.

## TYPOGRAPHY SYSTEM
- Primary Font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
- Heading Font: 'DM Sans', 'Inter', sans-serif (bolder, more impactful)
- Code Font: 'JetBrains Mono', 'Fira Code', monospace
- Scale: clamp() for fluid typography
  - Hero: clamp(2.5rem, 5vw + 1rem, 4.5rem) font-weight: 800
  - H1: clamp(2rem, 4vw + 0.5rem, 3.5rem) font-weight: 700
  - H2: clamp(1.5rem, 3vw + 0.5rem, 2.5rem) font-weight: 600
  - H3: clamp(1.25rem, 2vw + 0.5rem, 1.75rem) font-weight: 600
  - Body: clamp(1rem, 1.5vw, 1.125rem) font-weight: 400
  - Small: 0.875rem font-weight: 400
- Line heights: Headings 1.1-1.2, Body 1.6-1.8
- Letter spacing: Headings -0.02em to -0.03em, Body normal

## COLOR PALETTE (CSS Variables Required)
:root {
  --primary: #6366f1;
  --primary-light: #818cf8;
  --primary-dark: #4f46e5;
  --secondary: #8b5cf6;
  --accent: #06b6d4;
  --accent-light: #22d3ee;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --surface-50: #fafafa;
  --surface-100: #f4f4f5;
  --surface-200: #e4e4e7;
  --surface-800: #27272a;
  --surface-900: #18181b;
  --surface-950: #09090b;
  --text-primary: #18181b;
  --text-secondary: #52525b;
  --text-muted: #a1a1aa;
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-accent: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
  --gradient-mesh: radial-gradient(at 40% 20%, #818cf8 0px, transparent 50%), radial-gradient(at 80% 0%, #06b6d4 0px, transparent 50%), radial-gradient(at 0% 50%, #8b5cf6 0px, transparent 50%);
}

## SPACING SCALE (8px base)
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)  
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)
- 3xl: 4rem (64px)
- 4xl: 6rem (96px)
- Section padding: clamp(3rem, 8vw, 6rem) vertical

## LAYOUT RULES
- Max content width: 1280px with auto margins
- Grid: CSS Grid with minmax(280px, 1fr) for responsive cards
- Flex gaps instead of margins where possible
- Container padding: clamp(1rem, 5vw, 2rem)
- Card padding: 1.5rem to 2rem
- Consistent border-radius: 0.5rem (cards), 0.375rem (buttons), 1rem (large surfaces)

## VISUAL EFFECTS (Use Sparingly)
- Glassmorphism: backdrop-filter: blur(12px); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
- Soft shadows: box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
- Elevated shadows: box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
- Hover lift: transform: translateY(-4px); box-shadow: 0 20px 40px -15px rgba(99,102,241,0.3);
- Transitions: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

## ANIMATIONS (Smooth & Professional)
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.3); } 50% { box-shadow: 0 0 40px rgba(99,102,241,0.6); } }

## BUTTON STYLES
.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--gradient-primary);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(99,102,241,0.4);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99,102,241,0.5);
}
.btn-outline {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--primary);
  font-weight: 600;
  border: 2px solid var(--primary);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-outline:hover {
  background: var(--primary);
  color: white;
}

## CARD PATTERNS
.card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.15);
}
.card-glass {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 1rem;
  padding: 2rem;
}

## HERO SECTION REQUIREMENTS
- Full viewport height or min-height: 90vh
- Layered gradient or mesh background
- Large impactful heading with gradient text or white on dark
- Subheading with lighter weight and muted color
- Clear CTA buttons with proper spacing
- Optional: floating elements, decorative shapes, or subtle patterns
- Animation: Elements fade in with stagger

## SECTION PATTERNS
- Feature Grid: 3-4 columns, icons, clear hierarchy
- Stats Section: Large numbers with labels, gradient accents
- Testimonials: Cards with avatars, quotes, proper attribution
- Pricing: Highlighted recommended plan, feature comparison
- CTA: Contrasting background, compelling copy, prominent button
- Footer: Multi-column links, social icons, subtle branding

## RTL/ARABIC REQUIREMENTS
- For Arabic content: dir="rtl" on container
- font-family: 'Tajawal', 'Cairo', 'IBM Plex Sans Arabic', sans-serif
- Flip flex-direction where needed
- Adjust letter-spacing (remove negative values)
- Mirror icons and decorative elements
- Right-align text naturally

## RESPONSIVE BREAKPOINTS
- Desktop: 1280px+
- Tablet: 768px - 1279px
- Mobile: < 768px
- Use CSS Grid with auto-fit/minmax for natural responsiveness
- Stack layouts vertically on mobile
- Adjust font sizes with clamp()
- Reduce padding on smaller screens

## QUALITY CHECKLIST (Self-verify before output)
1. Typography hierarchy is clear and consistent
2. Spacing follows the 8px scale
3. Colors have sufficient contrast (WCAG AA)
4. Interactive elements have hover/focus states
5. Layout is responsive (test mentally at 320px, 768px, 1280px)
6. Animations are smooth and purposeful
7. No orphaned elements or broken layouts
8. RTL works correctly if Arabic content
9. All buttons have hover effects
10. Hero section is impactful and professional
`;

export async function generateWebsiteCode(
  prompt: string,
  context?: string
): Promise<GeneratedCode> {
  const template = findBestTemplate(prompt);
  console.log(`Using premium template: ${template.id}`);
  
  const systemPrompt = `You are an expert frontend developer. Your task is to CUSTOMIZE a premium template based on the user's request.

## PREMIUM TEMPLATE (BASE CODE - USE THIS AS YOUR STARTING POINT)
This is a professionally designed template. Modify it according to the user's needs while PRESERVING the design quality.

=== HTML ===
${template.html}

=== CSS ===
${template.css}

=== JS ===
${template.js}

## USER REQUEST
${prompt}

## YOUR TASK
Customize this template based on the user's request:
1. Change text content, brand names, product names as needed
2. Adjust colors if requested (update CSS variables)
3. Add/remove sections as needed
4. Keep the professional design quality intact
5. Preserve all hover effects, animations, and transitions
6. Maintain responsive design

## OUTPUT FORMAT
Respond with ONLY a valid JSON object (no markdown, no extra text):
{"html": "...", "css": "...", "js": "...", "message": "..."}

CRITICAL RULES:
- Escape all newlines as \\n
- Escape quotes inside strings as \\"
- Output COMPLETE code (not partial)
- NEVER use emojis for icons - use SVG icons only
- NEVER use colored bars or placeholders
- Every section must have proper styling`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 12000,
      messages: [
        { role: "user", content: `Customize this template for: ${prompt}` },
      ],
      system: systemPrompt,
    });

    const textBlock = response.content.find(block => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      console.log("No AI response, returning template as-is");
      return {
        html: template.html,
        css: template.css,
        js: template.js,
        message: "تم استخدام القالب الاحترافي"
      };
    }

    try {
      const result = parseJsonResponse(textBlock.text);
      if (result.html && result.html.length > 500) {
        return {
          html: result.html || template.html,
          css: result.css || template.css,
          js: result.js || template.js,
          message: result.message || "تم تخصيص الموقع بنجاح!",
        };
      }
    } catch (parseError) {
      console.log("Parse failed, using template:", parseError);
    }
    
    return {
      html: template.html,
      css: template.css,
      js: template.js,
      message: "تم إنشاء موقع احترافي باستخدام قالب متميز"
    };
  } catch (error) {
    console.error("Claude generation error:", error);
    return {
      html: template.html,
      css: template.css,
      js: template.js,
      message: "تم إنشاء موقع احترافي"
    };
  }
}

export async function refineWebsiteCode(
  prompt: string,
  currentHtml: string,
  currentCss: string,
  currentJs: string
): Promise<GeneratedCode> {
  const systemPrompt = `${PREMIUM_DESIGN_SYSTEM}

## CURRENT WEBSITE CODE
HTML:
${currentHtml.substring(0, 3000)}

CSS:
${currentCss.substring(0, 2000)}

JS:
${currentJs.substring(0, 1000)}

## MODIFICATION REQUEST
${prompt}

## YOUR TASK
Enhance or modify the existing website while maintaining the premium design quality. Improve any areas that don't meet the design system standards.

## OUTPUT FORMAT
Respond with ONLY a valid JSON object (no markdown, no code blocks):
{"html": "complete updated HTML", "css": "complete updated CSS", "js": "complete updated JS", "message": "Brief description of changes"}

CRITICAL: Escape newlines as \\n and quotes as \\"`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8000,
      messages: [
        { role: "user", content: prompt },
      ],
      system: systemPrompt,
    });

    const textBlock = response.content.find(block => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No content generated");
    }

    const result = parseJsonResponse(textBlock.text);
    return {
      html: result.html || currentHtml,
      css: result.css || currentCss,
      js: result.js || currentJs,
      message: result.message || "Website updated!",
    };
  } catch (error) {
    console.error("Claude refinement error:", error);
    throw new Error("Failed to update website code. Please try again.");
  }
}
