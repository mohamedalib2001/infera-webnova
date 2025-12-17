import { GeneratedCode } from "./builder";

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface ValidationIssue {
  severity: "critical" | "warning" | "info";
  category: string;
  message: string;
}

export function validateGeneratedCode(code: GeneratedCode): ValidationResult {
  const issues: ValidationIssue[] = [];
  let score = 100;

  // === HTML VALIDATION ===
  
  // Check for basic structure
  if (!code.html.includes("<!DOCTYPE html>")) {
    issues.push({ severity: "warning", category: "structure", message: "Missing DOCTYPE declaration" });
    score -= 5;
  }

  if (!code.html.includes("<html")) {
    issues.push({ severity: "critical", category: "structure", message: "Missing html tag" });
    score -= 20;
  }

  if (!code.html.includes("<head>") && !code.html.includes("<head ")) {
    issues.push({ severity: "critical", category: "structure", message: "Missing head tag" });
    score -= 15;
  }

  if (!code.html.includes("<body>") && !code.html.includes("<body ")) {
    issues.push({ severity: "critical", category: "structure", message: "Missing body tag" });
    score -= 15;
  }

  // Check for essential meta tags
  if (!code.html.includes('charset')) {
    issues.push({ severity: "warning", category: "seo", message: "Missing charset meta tag" });
    score -= 3;
  }

  if (!code.html.includes('viewport')) {
    issues.push({ severity: "warning", category: "responsive", message: "Missing viewport meta tag" });
    score -= 5;
  }

  // Check for font loading
  if (!code.html.includes('fonts.googleapis.com') && !code.css.includes('@font-face')) {
    issues.push({ severity: "info", category: "typography", message: "No custom fonts loaded" });
    score -= 2;
  }

  // Check for Arabic support
  const hasArabic = /[\u0600-\u06FF]/.test(code.html);
  if (hasArabic && !code.html.includes('dir="rtl"')) {
    issues.push({ severity: "critical", category: "rtl", message: "Arabic content without RTL direction" });
    score -= 15;
  }

  // Check for emoji (BAD)
  const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]/u;
  if (emojiPattern.test(code.html)) {
    issues.push({ severity: "critical", category: "icons", message: "Contains emoji instead of proper SVG icons" });
    score -= 25;
  }

  // Check for placeholder content
  if (code.html.includes('Lorem ipsum') || code.html.includes('placeholder')) {
    issues.push({ severity: "warning", category: "content", message: "Contains placeholder text" });
    score -= 10;
  }

  // Check for navigation
  if (!code.html.includes('<nav') && !code.html.includes('class="nav')) {
    issues.push({ severity: "warning", category: "navigation", message: "Missing navigation element" });
    score -= 5;
  }

  // Check for footer
  if (!code.html.includes('<footer') && !code.html.includes('class="footer')) {
    issues.push({ severity: "info", category: "structure", message: "Missing footer element" });
    score -= 3;
  }

  // Check for sections count
  const sectionCount = (code.html.match(/<section/g) || []).length;
  if (sectionCount < 3) {
    issues.push({ severity: "warning", category: "content", message: `Only ${sectionCount} sections found, expected 4+` });
    score -= 10;
  }

  // === CSS VALIDATION ===

  // Check for CSS variables
  if (!code.css.includes(':root') && !code.css.includes('--')) {
    issues.push({ severity: "warning", category: "css", message: "Not using CSS variables for theming" });
    score -= 5;
  }

  // Check for responsive design
  if (!code.css.includes('@media')) {
    issues.push({ severity: "critical", category: "responsive", message: "No media queries found - not responsive" });
    score -= 20;
  }

  // Check for hover effects
  if (!code.css.includes(':hover')) {
    issues.push({ severity: "warning", category: "ux", message: "No hover effects found" });
    score -= 10;
  }

  // Check for transitions
  if (!code.css.includes('transition')) {
    issues.push({ severity: "warning", category: "ux", message: "No CSS transitions for smooth interactions" });
    score -= 5;
  }

  // Check for flexbox/grid usage
  if (!code.css.includes('display: flex') && !code.css.includes('display: grid') &&
      !code.css.includes('display:flex') && !code.css.includes('display:grid')) {
    issues.push({ severity: "warning", category: "layout", message: "Not using modern layout (flex/grid)" });
    score -= 5;
  }

  // Check CSS length (too short = incomplete)
  if (code.css.length < 1000) {
    issues.push({ severity: "critical", category: "css", message: "CSS too short - likely incomplete styling" });
    score -= 20;
  }

  // Check for colored bars issue (repeated background colors without content)
  const bgColorMatches = code.css.match(/background:\s*#[a-fA-F0-9]{6}/g) || [];
  const uniqueBgColors = new Set(bgColorMatches);
  if (uniqueBgColors.size > 10 && code.html.length < 2000) {
    issues.push({ severity: "critical", category: "design", message: "Suspicious pattern: many bg colors with little content" });
    score -= 30;
  }

  // === JS VALIDATION ===
  
  // Basic JS check
  if (code.js && code.js.length > 0) {
    if (!code.js.includes('addEventListener') && !code.js.includes('document.')) {
      issues.push({ severity: "info", category: "js", message: "JavaScript may not be functional" });
      score -= 2;
    }
  }

  // Generate suggestions
  const suggestions: string[] = [];
  
  if (issues.some(i => i.category === "responsive")) {
    suggestions.push("Add responsive breakpoints for mobile (768px) and tablet (1024px)");
  }
  
  if (issues.some(i => i.category === "ux")) {
    suggestions.push("Add hover effects to buttons and cards for better interactivity");
  }

  if (issues.some(i => i.category === "icons")) {
    suggestions.push("Replace all emoji with proper SVG icons for professional look");
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  const isValid = score >= 60 && !issues.some(i => i.severity === "critical" && 
    (i.category === "icons" || i.category === "design" || i.category === "structure"));

  return {
    isValid,
    score,
    issues,
    suggestions
  };
}

export function getQualityReport(result: ValidationResult): string {
  const criticalCount = result.issues.filter(i => i.severity === "critical").length;
  const warningCount = result.issues.filter(i => i.severity === "warning").length;
  
  let report = `Quality Score: ${result.score}/100\n`;
  report += `Status: ${result.isValid ? "PASSED" : "FAILED"}\n`;
  report += `Critical Issues: ${criticalCount}, Warnings: ${warningCount}\n\n`;
  
  if (result.issues.length > 0) {
    report += "Issues:\n";
    result.issues.forEach(issue => {
      report += `  [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.message}\n`;
    });
  }
  
  if (result.suggestions.length > 0) {
    report += "\nSuggestions:\n";
    result.suggestions.forEach(s => {
      report += `  - ${s}\n`;
    });
  }
  
  return report;
}
