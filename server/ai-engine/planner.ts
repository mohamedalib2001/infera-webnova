import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

const anthropic = new Anthropic({
  apiKey: apiKey,
  ...(baseURL && { baseURL }),
});

export interface WebsitePlan {
  type: "landing" | "ecommerce" | "portfolio" | "business" | "blog" | "saas";
  language: "ar" | "en" | "bilingual";
  sections: SectionPlan[];
  colorScheme: ColorScheme;
  typography: Typography;
  features: string[];
  targetAudience: string;
  tone: string;
}

export interface SectionPlan {
  id: string;
  type: string;
  title: string;
  description: string;
  components: string[];
  priority: number;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gradient: string;
}

export interface Typography {
  headingFont: string;
  bodyFont: string;
  arabicFont: string;
}

const PLANNER_PROMPT = `You are an expert website architect. Your job is to analyze a user's request and create a detailed, structured plan for building their website.

## YOUR TASK
Analyze the user's request and output a comprehensive JSON plan that will guide the code generation phase.

## ANALYSIS CHECKLIST
1. What type of website is needed? (landing, ecommerce, portfolio, business, blog, saas)
2. What language/direction? (Arabic RTL, English LTR, or bilingual)
3. What sections are needed? (hero, features, pricing, testimonials, contact, etc.)
4. What color scheme fits the brand/industry?
5. What tone/style? (professional, playful, luxury, minimal, bold)
6. What specific features are requested?

## OUTPUT FORMAT
Return ONLY valid JSON (no markdown, no explanation):
{
  "type": "landing|ecommerce|portfolio|business|blog|saas",
  "language": "ar|en|bilingual",
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "title": "Section title",
      "description": "What this section should contain",
      "components": ["gradient-bg", "headline", "cta-buttons", "stats"],
      "priority": 1
    }
  ],
  "colorScheme": {
    "primary": "#6366f1",
    "secondary": "#8b5cf6",
    "accent": "#06b6d4",
    "background": "#ffffff",
    "text": "#1e293b",
    "gradient": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
  },
  "typography": {
    "headingFont": "Tajawal",
    "bodyFont": "Tajawal",
    "arabicFont": "Tajawal"
  },
  "features": ["responsive", "animations", "dark-mode-ready", "seo-optimized"],
  "targetAudience": "Description of target audience",
  "tone": "professional|playful|luxury|minimal|bold"
}

## SECTION TYPES REFERENCE
- hero: Main landing section with headline and CTA
- features: Feature grid or list
- pricing: Pricing plans comparison
- testimonials: Customer reviews
- stats: Key metrics/numbers
- about: About section
- team: Team members
- services: Services offered
- products: Product showcase
- gallery: Image gallery
- faq: Frequently asked questions
- contact: Contact form and info
- cta: Call-to-action section
- footer: Website footer

## COLOR SCHEME RECOMMENDATIONS
- Tech/SaaS: Blues, purples, cyans (#6366f1, #8b5cf6, #06b6d4)
- E-commerce: Warm colors, oranges (#f97316, #fb923c)
- Healthcare: Greens, teals (#10b981, #14b8a6)
- Finance: Navy, golds (#1e3a8a, #fbbf24)
- Creative: Vibrant, bold colors
- Luxury: Black, gold, minimal (#000000, #d4af37)
- Minimal: Grays, whites (#64748b, #f1f5f9)

## ARABIC WEBSITES
For Arabic content:
- Always use RTL-friendly fonts: Tajawal, Cairo, IBM Plex Sans Arabic
- Ensure gradient directions work with RTL
- Include proper Arabic typography spacing`;

export async function createWebsitePlan(userRequest: string): Promise<WebsitePlan> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      messages: [
        { role: "user", content: userRequest },
      ],
      system: PLANNER_PROMPT,
    });

    const textBlock = response.content.find(block => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No plan generated");
    }

    let jsonText = textBlock.text.trim();
    
    // Extract JSON if wrapped in markdown
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    
    // Find JSON object boundaries
    const startIdx = jsonText.indexOf('{');
    const endIdx = jsonText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      jsonText = jsonText.substring(startIdx, endIdx + 1);
    }

    const plan = JSON.parse(jsonText) as WebsitePlan;
    
    // Validate and set defaults
    if (!plan.sections || plan.sections.length === 0) {
      plan.sections = getDefaultSections(plan.type || "landing");
    }
    
    if (!plan.colorScheme) {
      plan.colorScheme = getDefaultColorScheme();
    }
    
    if (!plan.typography) {
      plan.typography = {
        headingFont: "Tajawal",
        bodyFont: "Tajawal",
        arabicFont: "Tajawal"
      };
    }

    console.log("Plan created:", JSON.stringify(plan, null, 2));
    return plan;

  } catch (error) {
    console.error("Planning error:", error);
    // Return a sensible default plan
    return getDefaultPlan(userRequest);
  }
}

function getDefaultSections(type: string): SectionPlan[] {
  const baseSections: SectionPlan[] = [
    { id: "hero", type: "hero", title: "Hero Section", description: "Main landing with headline and CTA", components: ["gradient-bg", "headline", "description", "cta-buttons", "stats"], priority: 1 },
    { id: "features", type: "features", title: "Features", description: "Key features grid", components: ["section-header", "feature-cards", "icons"], priority: 2 },
  ];

  if (type === "ecommerce") {
    baseSections.push(
      { id: "products", type: "products", title: "Products", description: "Product showcase", components: ["product-grid", "product-cards", "prices"], priority: 3 },
      { id: "categories", type: "categories", title: "Categories", description: "Product categories", components: ["category-cards"], priority: 4 }
    );
  } else if (type === "saas" || type === "landing") {
    baseSections.push(
      { id: "pricing", type: "pricing", title: "Pricing", description: "Pricing plans", components: ["pricing-cards", "features-list", "cta"], priority: 3 },
      { id: "testimonials", type: "testimonials", title: "Testimonials", description: "Customer reviews", components: ["testimonial-cards", "ratings", "avatars"], priority: 4 }
    );
  }

  baseSections.push(
    { id: "cta", type: "cta", title: "Call to Action", description: "Final CTA section", components: ["gradient-bg", "headline", "cta-buttons"], priority: 5 },
    { id: "footer", type: "footer", title: "Footer", description: "Site footer", components: ["logo", "nav-links", "social-icons", "copyright"], priority: 6 }
  );

  return baseSections;
}

function getDefaultColorScheme(): ColorScheme {
  return {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#06b6d4",
    background: "#ffffff",
    text: "#1e293b",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)"
  };
}

function getDefaultPlan(userRequest: string): WebsitePlan {
  const isArabic = /[\u0600-\u06FF]/.test(userRequest);
  const isEcommerce = /متجر|shop|store|منتج|product|تجار/i.test(userRequest);
  const isPortfolio = /بورتفوليو|portfolio|أعمال|مطور|developer/i.test(userRequest);
  
  let type: WebsitePlan["type"] = "landing";
  if (isEcommerce) type = "ecommerce";
  else if (isPortfolio) type = "portfolio";

  return {
    type,
    language: isArabic ? "ar" : "en",
    sections: getDefaultSections(type),
    colorScheme: getDefaultColorScheme(),
    typography: {
      headingFont: "Tajawal",
      bodyFont: "Tajawal",
      arabicFont: "Tajawal"
    },
    features: ["responsive", "animations", "hover-effects", "seo-optimized"],
    targetAudience: "General audience",
    tone: "professional"
  };
}
