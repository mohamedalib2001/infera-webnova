import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, 
  Eye, 
  RefreshCw, 
  Shield, 
  Hexagon, 
  Circle, 
  Triangle,
  Layers,
  Cpu,
  Network,
  Sparkles,
  FileType,
  Palette,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Crown,
  Link2,
  Zap,
  Target,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getAllPlatformsForBinding, 
  bindAllVariantsToPlatform,
  getPlatformLogoState,
  checkGlobalCompliance,
  type PlatformLogoState
} from "@/lib/logo-binding-engine";
import { useLogoSyncDialog, LogoSyncResultDialog } from "@/components/logo-sync-result-dialog";
import { AIShapeRecommendations } from "@/components/ai-shape-recommendations";
import { 
  type ShapeCategory, 
  type ShapeRecommendation,
  saveShapeSelection 
} from "@/lib/ai-shape-recommendation-engine";

// =====================================================================
// INFERA SOVEREIGN VISUAL IDENTITY & ICONOGRAPHY MANDATORY FRAMEWORK
// This factory generates icons following strict governance rules
// =====================================================================

// SOVEREIGN PALETTE - Mandatory Colors
const SOVEREIGN_PALETTE = {
  backgrounds: {
    obsidianBlack: "#0A0A0A",
    deepSpaceGradient: ["#050510", "#0A0A1A"],
    darkGraphite: "#121218"
  },
  accents: {
    quantumPurple: { name: "Quantum Purple", nameAr: "بنفسجي كوانتم", hex: "#8B5CF6" },
    neuralCyan: { name: "Neural Cyan", nameAr: "سماوي عصبي", hex: "#22D3EE" },
    sovereignBlue: { name: "Sovereign Blue", nameAr: "أزرق سيادي", hex: "#3B82F6" },
    signalGold: { name: "Signal Gold", nameAr: "ذهبي إشارة", hex: "#F59E0B" },
    deepEmerald: { name: "Deep Emerald", nameAr: "زمردي عميق", hex: "#10B981" }
  },
  highlights: {
    softWhite: "#F5F5F5",
    silverGray: "#9CA3AF"
  }
};

// Icon Categories with differentiation rules
const ICON_CATEGORIES = {
  coreSystem: {
    name: "Core System Icons",
    nameAr: "أيقونات النظام الأساسي",
    description: "Deepest, most minimal. Strong central core. Almost monolithic.",
    descriptionAr: "أعمق وأبسط. نواة مركزية قوية. أحادي تقريباً.",
    visualWeight: "maximum",
    complexity: "minimal"
  },
  platform: {
    name: "Platform Icons",
    nameAr: "أيقونات المنصات",
    description: "Abstract representation of function. Still sovereign, slightly expressive.",
    descriptionAr: "تمثيل مجرد للوظيفة. سيادي مع تعبير خفيف.",
    visualWeight: "high",
    complexity: "moderate"
  },
  aiModel: {
    name: "AI Model Icons",
    nameAr: "أيقونات نماذج الذكاء",
    description: "Intelligence cores only. No UI metaphors. Feels behind the curtain.",
    descriptionAr: "نوى ذكاء فقط. بدون استعارات واجهة. شعور خلف الستار.",
    visualWeight: "high",
    complexity: "abstract"
  },
  feature: {
    name: "Feature Icons",
    nameAr: "أيقونات الميزات",
    description: "Simplified. Lower visual weight. Still aligned with core system.",
    descriptionAr: "مبسطة. وزن بصري أقل. متوافقة مع النظام الأساسي.",
    visualWeight: "medium",
    complexity: "simplified"
  },
  digitalSeal: {
    name: "Digital Seals",
    nameAr: "الأختام الرقمية",
    description: "Official platform seals. Circular or hexagonal. Represents authenticity and authority.",
    descriptionAr: "أختام رسمية للمنصات. دائرية أو سداسية. تمثل الأصالة والسلطة.",
    visualWeight: "maximum",
    complexity: "ceremonial"
  }
};

// Design Patterns for each category
const DESIGN_PATTERNS = {
  intelligenceCore: { name: "Intelligence Core", nameAr: "نواة الذكاء", icon: Cpu },
  neuralField: { name: "Neural Field", nameAr: "حقل عصبي", icon: Network },
  controlRing: { name: "Control Ring", nameAr: "حلقة التحكم", icon: Circle },
  sovereignShield: { name: "Sovereign Shield", nameAr: "درع السيادة", icon: Shield },
  hexagonalCore: { name: "Hexagonal Core", nameAr: "نواة سداسية", icon: Hexagon },
  layeredDepth: { name: "Layered Depth", nameAr: "عمق متعدد الطبقات", icon: Layers },
  quantumGrid: { name: "Quantum Grid", nameAr: "شبكة كوانتم", icon: Sparkles }
};

type CategoryKey = keyof typeof ICON_CATEGORIES;
type AccentKey = keyof typeof SOVEREIGN_PALETTE.accents;
type PatternKey = keyof typeof DESIGN_PATTERNS;

interface GeneratedIcon {
  svg: string;
  category: CategoryKey;
  accent: AccentKey;
  pattern: PatternKey;
  name: string;
  timestamp: number;
}

// SVG Generator following MANDATORY RULES
function generateSovereignSVG(
  category: CategoryKey,
  accent: AccentKey,
  pattern: PatternKey,
  size: number = 512,
  platformName: string = "infera"
): string {
  const accentColor = SOVEREIGN_PALETTE.accents[accent].hex;
  const bg = SOVEREIGN_PALETTE.backgrounds;
  const highlights = SOVEREIGN_PALETTE.highlights;
  
  // Visual weight based on category
  const categoryConfig = ICON_CATEGORIES[category];
  const strokeWidth = categoryConfig.visualWeight === 'maximum' ? size * 0.015 : 
                      categoryConfig.visualWeight === 'high' ? size * 0.012 : size * 0.008;
  
  // Core opacity based on complexity
  const coreOpacity = categoryConfig.complexity === 'minimal' ? 0.95 :
                      categoryConfig.complexity === 'abstract' ? 0.85 : 0.75;
  
  // Generate pattern-specific elements
  let patternElements = '';
  const center = size / 2;
  
  switch(pattern) {
    case 'intelligenceCore':
      patternElements = `
        <!-- Intelligence Core - Concentric rings with neural center -->
        <circle cx="${center}" cy="${center}" r="${size * 0.32}" fill="none" stroke="${accentColor}" stroke-width="${strokeWidth}" opacity="${coreOpacity}"/>
        <circle cx="${center}" cy="${center}" r="${size * 0.22}" fill="none" stroke="${accentColor}" stroke-width="${strokeWidth * 0.7}" opacity="${coreOpacity * 0.8}"/>
        <circle cx="${center}" cy="${center}" r="${size * 0.12}" fill="${accentColor}" opacity="${coreOpacity * 0.9}"/>
        <circle cx="${center}" cy="${center}" r="${size * 0.06}" fill="${bg.obsidianBlack}"/>
        <circle cx="${center}" cy="${center}" r="${size * 0.025}" fill="${accentColor}"/>
        <!-- Neural spokes -->
        ${[0,60,120,180,240,300].map(angle => {
          const rad = angle * Math.PI / 180;
          const inner = size * 0.15;
          const outer = size * 0.32;
          return `<line x1="${center + Math.cos(rad) * inner}" y1="${center + Math.sin(rad) * inner}" 
                        x2="${center + Math.cos(rad) * outer}" y2="${center + Math.sin(rad) * outer}" 
                        stroke="${accentColor}" stroke-width="${strokeWidth * 0.5}" opacity="0.6"/>`;
        }).join('')}
      `;
      break;
      
    case 'neuralField':
      patternElements = `
        <!-- Neural Field - Distributed nodes with connections -->
        <circle cx="${center}" cy="${center}" r="${size * 0.35}" fill="none" stroke="${accentColor}" stroke-width="${strokeWidth * 0.5}" opacity="0.3" stroke-dasharray="${size * 0.03} ${size * 0.02}"/>
        <!-- Central node -->
        <circle cx="${center}" cy="${center}" r="${size * 0.08}" fill="${accentColor}" opacity="${coreOpacity}"/>
        <!-- Orbital nodes -->
        ${[0,72,144,216,288].map((angle, i) => {
          const rad = angle * Math.PI / 180;
          const r = size * 0.25;
          const nodeSize = size * 0.035;
          return `
            <circle cx="${center + Math.cos(rad) * r}" cy="${center + Math.sin(rad) * r}" r="${nodeSize}" fill="${accentColor}" opacity="${0.7 - i * 0.05}"/>
            <line x1="${center}" y1="${center}" x2="${center + Math.cos(rad) * r}" y2="${center + Math.sin(rad) * r}" 
                  stroke="${accentColor}" stroke-width="${strokeWidth * 0.4}" opacity="0.4"/>
          `;
        }).join('')}
        <!-- Cross connections -->
        ${[0,1,2].map(i => {
          const a1 = (i * 72) * Math.PI / 180;
          const a2 = ((i + 2) * 72) * Math.PI / 180;
          const r = size * 0.25;
          return `<line x1="${center + Math.cos(a1) * r}" y1="${center + Math.sin(a1) * r}" 
                        x2="${center + Math.cos(a2) * r}" y2="${center + Math.sin(a2) * r}" 
                        stroke="${accentColor}" stroke-width="${strokeWidth * 0.3}" opacity="0.25"/>`;
        }).join('')}
      `;
      break;
      
    case 'controlRing':
      patternElements = `
        <!-- Control Ring - Authority ring with command center -->
        <circle cx="${center}" cy="${center}" r="${size * 0.36}" fill="none" stroke="${accentColor}" stroke-width="${strokeWidth * 1.5}" opacity="${coreOpacity}"/>
        <circle cx="${center}" cy="${center}" r="${size * 0.28}" fill="none" stroke="${accentColor}" stroke-width="${strokeWidth * 0.6}" opacity="0.5"/>
        <!-- Command indicators -->
        ${[0,90,180,270].map(angle => {
          const rad = angle * Math.PI / 180;
          const r = size * 0.36;
          return `<circle cx="${center + Math.cos(rad) * r}" cy="${center + Math.sin(rad) * r}" r="${size * 0.025}" fill="${accentColor}"/>`;
        }).join('')}
        <!-- Central command -->
        <rect x="${center - size * 0.08}" y="${center - size * 0.08}" width="${size * 0.16}" height="${size * 0.16}" 
              rx="${size * 0.02}" fill="${accentColor}" opacity="${coreOpacity}"/>
        <rect x="${center - size * 0.04}" y="${center - size * 0.04}" width="${size * 0.08}" height="${size * 0.08}" 
              rx="${size * 0.01}" fill="${bg.obsidianBlack}"/>
      `;
      break;
      
    case 'sovereignShield':
      patternElements = `
        <!-- Sovereign Shield - Protective authority symbol -->
        <path d="M${center} ${center - size * 0.35} 
                 L${center + size * 0.28} ${center - size * 0.15} 
                 L${center + size * 0.28} ${center + size * 0.1} 
                 Q${center + size * 0.28} ${center + size * 0.35} ${center} ${center + size * 0.4}
                 Q${center - size * 0.28} ${center + size * 0.35} ${center - size * 0.28} ${center + size * 0.1}
                 L${center - size * 0.28} ${center - size * 0.15} Z" 
              fill="none" stroke="${accentColor}" stroke-width="${strokeWidth * 1.2}" opacity="${coreOpacity}"/>
        <!-- Inner shield -->
        <path d="M${center} ${center - size * 0.22} 
                 L${center + size * 0.16} ${center - size * 0.08} 
                 L${center + size * 0.16} ${center + size * 0.05} 
                 Q${center + size * 0.16} ${center + size * 0.2} ${center} ${center + size * 0.25}
                 Q${center - size * 0.16} ${center + size * 0.2} ${center - size * 0.16} ${center + size * 0.05}
                 L${center - size * 0.16} ${center - size * 0.08} Z" 
              fill="${accentColor}" opacity="0.15"/>
        <!-- Crown symbol -->
        <circle cx="${center}" cy="${center - size * 0.02}" r="${size * 0.06}" fill="${accentColor}" opacity="${coreOpacity}"/>
      `;
      break;
      
    case 'hexagonalCore':
      const hexPoints = (r: number) => [0,1,2,3,4,5].map(i => {
        const angle = (i * 60 - 90) * Math.PI / 180;
        return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
      }).join(' ');
      patternElements = `
        <!-- Hexagonal Core - Structured sovereignty -->
        <polygon points="${hexPoints(size * 0.36)}" fill="none" stroke="${accentColor}" stroke-width="${strokeWidth}" opacity="${coreOpacity}"/>
        <polygon points="${hexPoints(size * 0.26)}" fill="none" stroke="${accentColor}" stroke-width="${strokeWidth * 0.7}" opacity="0.6"/>
        <polygon points="${hexPoints(size * 0.16)}" fill="${accentColor}" opacity="0.2"/>
        <!-- Center -->
        <circle cx="${center}" cy="${center}" r="${size * 0.06}" fill="${accentColor}" opacity="${coreOpacity}"/>
        <!-- Vertex indicators -->
        ${[0,1,2,3,4,5].map(i => {
          const angle = (i * 60 - 90) * Math.PI / 180;
          const r = size * 0.36;
          return `<circle cx="${center + Math.cos(angle) * r}" cy="${center + Math.sin(angle) * r}" r="${size * 0.018}" fill="${accentColor}" opacity="0.8"/>`;
        }).join('')}
      `;
      break;
      
    case 'layeredDepth':
      patternElements = `
        <!-- Layered Depth - Multi-layer authority -->
        <rect x="${center - size * 0.32}" y="${center - size * 0.32}" width="${size * 0.64}" height="${size * 0.64}" 
              rx="${size * 0.08}" fill="none" stroke="${accentColor}" stroke-width="${strokeWidth}" opacity="0.4"/>
        <rect x="${center - size * 0.24}" y="${center - size * 0.24}" width="${size * 0.48}" height="${size * 0.48}" 
              rx="${size * 0.06}" fill="none" stroke="${accentColor}" stroke-width="${strokeWidth}" opacity="0.6"/>
        <rect x="${center - size * 0.16}" y="${center - size * 0.16}" width="${size * 0.32}" height="${size * 0.32}" 
              rx="${size * 0.04}" fill="${accentColor}" opacity="0.15" stroke="${accentColor}" stroke-width="${strokeWidth}" />
        <rect x="${center - size * 0.08}" y="${center - size * 0.08}" width="${size * 0.16}" height="${size * 0.16}" 
              rx="${size * 0.02}" fill="${accentColor}" opacity="${coreOpacity}"/>
      `;
      break;
      
    case 'quantumGrid':
      patternElements = `
        <!-- Quantum Grid - Intelligence matrix -->
        <circle cx="${center}" cy="${center}" r="${size * 0.35}" fill="none" stroke="${accentColor}" stroke-width="${strokeWidth * 0.5}" opacity="0.3"/>
        <!-- Grid lines -->
        ${[-2,-1,0,1,2].map(i => `
          <line x1="${center + i * size * 0.12}" y1="${center - size * 0.35}" 
                x2="${center + i * size * 0.12}" y2="${center + size * 0.35}" 
                stroke="${accentColor}" stroke-width="${strokeWidth * 0.3}" opacity="0.2"/>
          <line x1="${center - size * 0.35}" y1="${center + i * size * 0.12}" 
                x2="${center + size * 0.35}" y2="${center + i * size * 0.12}" 
                stroke="${accentColor}" stroke-width="${strokeWidth * 0.3}" opacity="0.2"/>
        `).join('')}
        <!-- Quantum nodes -->
        ${[-1,0,1].flatMap(x => [-1,0,1].map(y => {
          if(x === 0 && y === 0) return '';
          const opacity = 0.5 + Math.random() * 0.3;
          return `<circle cx="${center + x * size * 0.12}" cy="${center + y * size * 0.12}" r="${size * 0.02}" fill="${accentColor}" opacity="${opacity}"/>`;
        })).join('')}
        <!-- Central quantum core -->
        <circle cx="${center}" cy="${center}" r="${size * 0.08}" fill="${accentColor}" opacity="${coreOpacity}"/>
        <circle cx="${center}" cy="${center}" r="${size * 0.04}" fill="${bg.obsidianBlack}"/>
        <circle cx="${center}" cy="${center}" r="${size * 0.015}" fill="${accentColor}"/>
      `;
      break;
  }
  
  // Special handling for Digital Seals
  let sealFrame = '';
  if (category === 'digitalSeal') {
    sealFrame = `
      <!-- Official Seal Frame -->
      <circle cx="${center}" cy="${center}" r="${size * 0.44}" fill="none" stroke="${accentColor}" stroke-width="${strokeWidth * 2}" opacity="0.9"/>
      <circle cx="${center}" cy="${center}" r="${size * 0.42}" fill="none" stroke="${highlights.silverGray}" stroke-width="${strokeWidth * 0.5}" opacity="0.4"/>
      <!-- Seal authenticity ring -->
      <circle cx="${center}" cy="${center}" r="${size * 0.46}" fill="none" stroke="${accentColor}" stroke-width="${strokeWidth * 0.3}" opacity="0.3" stroke-dasharray="${size * 0.015} ${size * 0.01}"/>
    `;
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Deep Space Gradient Background -->
    <linearGradient id="bg-${platformName}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg.deepSpaceGradient[0]}"/>
      <stop offset="100%" stop-color="${bg.deepSpaceGradient[1]}"/>
    </linearGradient>
    
    <!-- Subtle accent glow -->
    <radialGradient id="glow-${platformName}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
    </radialGradient>
    
    <!-- Sovereign filter -->
    <filter id="sovereign-filter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
      <feFlood flood-color="${accentColor}" flood-opacity="0.15"/>
      <feComposite in2="blur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Base Background - Obsidian/Deep Space -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bg-${platformName})"/>
  
  <!-- Subtle corner accent -->
  <circle cx="${size * 0.85}" cy="${size * 0.15}" r="${size * 0.02}" fill="${accentColor}" opacity="0.5"/>
  
  <!-- Ambient glow -->
  <circle cx="${center}" cy="${center}" r="${size * 0.4}" fill="url(#glow-${platformName})"/>
  
  ${sealFrame}
  
  <!-- Pattern Elements -->
  <g filter="url(#sovereign-filter)">
    ${patternElements}
  </g>
</svg>`;
}

// Validation function - checks if design meets INFERA standards
function validateDesign(svg: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check for forbidden elements
  if (svg.includes('<text')) issues.push("Contains text (FORBIDDEN)");
  if (svg.includes('emoji')) issues.push("Contains emoji reference (FORBIDDEN)");
  if (svg.toLowerCase().includes('cartoon')) issues.push("Cartoon style detected (FORBIDDEN)");
  if (svg.toLowerCase().includes('playful')) issues.push("Playful style detected (FORBIDDEN)");
  
  // Check for proper structure
  if (!svg.includes('linearGradient') && !svg.includes('radialGradient')) {
    issues.push("Missing gradient definitions");
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

export default function LogoFactory() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('platform');
  const [selectedAccent, setSelectedAccent] = useState<AccentKey>('neuralCyan');
  const [selectedPattern, setSelectedPattern] = useState<PatternKey>('hexagonalCore');
  const [platformName, setPlatformName] = useState('infera-platform');
  const [previewSize, setPreviewSize] = useState(256);
  const [generatedIcons, setGeneratedIcons] = useState<GeneratedIcon[]>([]);
  
  // AI Shape Recommendation State (MANDATORY)
  const [selectedShape, setSelectedShape] = useState<ShapeCategory | null>(null);
  
  // MANDATORY: Target Platform Selection
  const [targetPlatformId, setTargetPlatformId] = useState<string>("");
  const [platformLogoState, setPlatformLogoState] = useState<PlatformLogoState | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [complianceStats, setComplianceStats] = useState<ReturnType<typeof checkGlobalCompliance> | null>(null);
  
  // Get available platforms for binding
  const availablePlatforms = getAllPlatformsForBinding();
  
  // Logo sync result dialog
  const { showSyncResult, createSyncResult, dialogProps } = useLogoSyncDialog();
  
  // Update platform logo state when target changes
  useEffect(() => {
    if (targetPlatformId) {
      const state = getPlatformLogoState(targetPlatformId);
      setPlatformLogoState(state);
      // Auto-set platform name from selection (use actual name for display)
      const platform = availablePlatforms.find(p => p.id === targetPlatformId);
      if (platform) {
        // Use lowercase slug format for file naming
        setPlatformName(platform.name.toLowerCase().replace(/\s+/g, '-'));
      }
    } else {
      setPlatformLogoState(null);
    }
  }, [targetPlatformId, availablePlatforms]);
  
  // Load compliance stats and subscribe to logo sync events
  useEffect(() => {
    const refreshStats = () => {
      setComplianceStats(checkGlobalCompliance());
      if (targetPlatformId) {
        setPlatformLogoState(getPlatformLogoState(targetPlatformId));
      }
    };
    
    refreshStats();
    
    // Subscribe to logo sync events for real-time updates
    const handleSync = () => {
      refreshStats();
    };
    
    window.addEventListener("infera-logo-sync", handleSync);
    return () => window.removeEventListener("infera-logo-sync", handleSync);
  }, [targetPlatformId]);
  
  // Generate preview SVG
  const previewSVG = generateSovereignSVG(
    selectedCategory,
    selectedAccent,
    selectedPattern,
    previewSize,
    platformName
  );
  
  // Validation status
  const validation = validateDesign(previewSVG);
  
  // Download single file
  const downloadSVG = useCallback((svg: string, filename: string) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, []);
  
  // Download all required formats
  const downloadAllFormats = useCallback(() => {
    const formats = [
      { size: 1024, suffix: 'app-icon' },
      { size: 512, suffix: 'standard' },
      { size: 32, suffix: 'favicon-32' },
      { size: 16, suffix: 'favicon-16' }
    ];
    
    formats.forEach((format, index) => {
      setTimeout(() => {
        const svg = generateSovereignSVG(
          selectedCategory,
          selectedAccent,
          selectedPattern,
          format.size,
          platformName
        );
        downloadSVG(svg, `${platformName}-${format.suffix}.svg`);
      }, index * 300);
    });
    
    // Generate monochrome version
    setTimeout(() => {
      const monoSVG = generateSovereignSVG(
        selectedCategory,
        selectedAccent,
        selectedPattern,
        512,
        platformName
      ).replace(new RegExp(SOVEREIGN_PALETTE.accents[selectedAccent].hex, 'g'), '#FFFFFF')
       .replace(/#0A0A0A/g, '#000000');
      downloadSVG(monoSVG, `${platformName}-mono.svg`);
    }, 1500);
    
    toast({
      title: "Downloading All Formats | تنزيل جميع التنسيقات",
      description: "5 files: 1024px, 512px, 32px, 16px, monochrome"
    });
  }, [selectedCategory, selectedAccent, selectedPattern, platformName, downloadSVG, toast]);
  
  // Save to gallery
  const saveToGallery = useCallback(() => {
    const newIcon: GeneratedIcon = {
      svg: previewSVG,
      category: selectedCategory,
      accent: selectedAccent,
      pattern: selectedPattern,
      name: platformName,
      timestamp: Date.now()
    };
    setGeneratedIcons(prev => [newIcon, ...prev.slice(0, 19)]);
    toast({
      title: "Saved to Gallery | تم الحفظ",
      description: `${platformName} icon saved`
    });
  }, [previewSVG, selectedCategory, selectedAccent, selectedPattern, platformName, toast]);
  
  // MANDATORY: Sync logo to target platform
  const syncToPlatform = useCallback(() => {
    if (!targetPlatformId) {
      toast({
        title: "No Platform Selected | لم يتم اختيار منصة",
        description: "You must select a target platform before syncing",
        variant: "destructive"
      });
      return;
    }
    
    if (!validation.valid) {
      toast({
        title: "Validation Failed | فشل التحقق",
        description: "Logo does not meet sovereign design requirements",
        variant: "destructive"
      });
      return;
    }
    
    setIsSyncing(true);
    
    // Generate mono version
    const monoSVG = previewSVG
      .replace(new RegExp(SOVEREIGN_PALETTE.accents[selectedAccent].hex, 'g'), '#FFFFFF')
      .replace(/#0A0A0A/g, '#000000');
    
    // Bind all variants to platform
    setTimeout(() => {
      const result = bindAllVariantsToPlatform(
        targetPlatformId,
        previewSVG,
        monoSVG,
        "logo-factory"
      );
      
      setIsSyncing(false);
      
      if (result.success) {
        // Refresh platform state
        setPlatformLogoState(getPlatformLogoState(targetPlatformId));
        setComplianceStats(checkGlobalCompliance());
        
        // Show professional sync result dialog
        const platform = availablePlatforms.find(p => p.id === targetPlatformId);
        const syncResult = createSyncResult(
          targetPlatformId,
          platform?.name || targetPlatformId,
          result.versions,
          previewSVG,
          platform?.nameAr
        );
        showSyncResult(syncResult);
      } else {
        toast({
          title: "Sync Failed | فشل المزامنة",
          description: result.message,
          variant: "destructive"
        });
      }
    }, 500);
  }, [targetPlatformId, previewSVG, selectedAccent, validation.valid, platformLogoState, toast, availablePlatforms, createSyncResult, showSyncResult]);
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              INFERA Logo Factory
              <Badge variant="outline" className="ml-2">Sovereign</Badge>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              مصنع تصميم الشعارات السيادي | Sovereign Visual Identity Generator
            </p>
          </div>
          <div className="flex items-center gap-2">
            {complianceStats && (
              <Badge variant={complianceStats.compliant === complianceStats.totalPlatforms ? "default" : "outline"} className="text-xs">
                {complianceStats.compliant}/{complianceStats.totalPlatforms} Compliant
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              Mandatory Framework v1.0
            </Badge>
          </div>
        </div>
        
        {/* MANDATORY: Target Platform Selector */}
        <Card className="border-2 border-amber-500/50 bg-amber-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-base">
                  Target Platform | المنصة الهدف
                  <Badge variant="destructive" className="ml-2 text-[10px]">MANDATORY</Badge>
                </CardTitle>
              </div>
              {platformLogoState && (
                <Badge 
                  variant={platformLogoState.complianceStatus === "compliant" ? "default" : 
                          platformLogoState.complianceStatus === "partial" ? "outline" : "destructive"}
                  className="text-xs"
                >
                  {platformLogoState.complianceStatus === "compliant" ? "Fully Synced" :
                   platformLogoState.complianceStatus === "partial" ? "Partially Synced" : "Not Synced"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Select target platform before generating or exporting any logo | اختر المنصة الهدف قبل التصدير
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[250px]">
                <Select value={targetPlatformId} onValueChange={setTargetPlatformId}>
                  <SelectTrigger data-testid="select-target-platform" className="border-amber-500/30">
                    <SelectValue placeholder="Select target platform | اختر المنصة" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatforms.map(platform => (
                      <SelectItem key={platform.id} value={platform.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{platform.name}</span>
                          <span className="text-xs text-muted-foreground">| {platform.nameAr}</span>
                          <Badge variant="secondary" className="text-[9px] ml-1">{platform.category}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={syncToPlatform}
                disabled={!targetPlatformId || !validation.valid || isSyncing}
                className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                data-testid="button-sync-to-platform"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    Bind & Sync All Variants | ربط ومزامنة
                  </>
                )}
              </Button>
            </div>
            
            {!targetPlatformId && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 text-xs">
                <Lock className="h-4 w-4" />
                <span>Generation and export disabled until platform is selected | الإنشاء والتصدير معطل حتى يتم اختيار منصة</span>
              </div>
            )}
            
            {platformLogoState && (
              <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Last Sync: {platformLogoState.lastSync > 0 ? new Date(platformLogoState.lastSync).toLocaleString() : 'Never'}
                </span>
                <span className="flex items-center gap-1">
                  Platform: {platformLogoState.platformName} | {platformLogoState.platformNameAr}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Configuration | الإعدادات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Platform Name */}
              <div className="space-y-2">
                <Label htmlFor="platform-name" className="text-xs">
                  Platform Name | اسم المنصة
                </Label>
                <Input
                  id="platform-name"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="infera-platform"
                  className="text-sm"
                  data-testid="input-platform-name"
                />
                <p className="text-[10px] text-muted-foreground">
                  File naming: {platformName}-[type].svg
                </p>
              </div>
              
              <Separator />
              
              {/* Category Selection */}
              <div className="space-y-2">
                <Label className="text-xs">Icon Category | فئة الأيقونة</Label>
                <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as CategoryKey)}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ICON_CATEGORIES).map(([key, cat]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-muted-foreground">{cat.nameAr}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  {ICON_CATEGORIES[selectedCategory].description}
                </p>
              </div>
              
              {/* Pattern Selection */}
              <div className="space-y-2">
                <Label className="text-xs">Design Pattern | نمط التصميم</Label>
                <Select value={selectedPattern} onValueChange={(v) => setSelectedPattern(v as PatternKey)}>
                  <SelectTrigger data-testid="select-pattern">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DESIGN_PATTERNS).map(([key, pat]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <pat.icon className="h-3 w-3" />
                          <span>{pat.name}</span>
                          <span className="text-[10px] text-muted-foreground">| {pat.nameAr}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Accent Color Selection */}
              <div className="space-y-2">
                <Label className="text-xs">Accent Color | اللون المميز</Label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(SOVEREIGN_PALETTE.accents).map(([key, color]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedAccent(key as AccentKey)}
                      className={`w-full aspect-square rounded-md border-2 transition-all ${
                        selectedAccent === key ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name} | ${color.nameAr}`}
                      data-testid={`button-accent-${key}`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  {SOVEREIGN_PALETTE.accents[selectedAccent].name} | {SOVEREIGN_PALETTE.accents[selectedAccent].nameAr}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* AI Shape Recommendations - MANDATORY */}
          <Card className="lg:col-span-3">
            <CardContent className="p-0">
              <AIShapeRecommendations
                platformType={selectedCategory}
                selectedPattern={selectedPattern}
                accentColor={SOVEREIGN_PALETTE.accents[selectedAccent].hex}
                selectedShape={selectedShape}
                onSelectShape={(shape: ShapeRecommendation, allRecommendations: ShapeRecommendation[]) => {
                  setSelectedShape(shape.category);
                  // Save selection with live recommendations for AI learning
                  saveShapeSelection({
                    platformId: targetPlatformId || 'preview',
                    platformType: selectedCategory,
                    pattern: selectedPattern,
                    recommendedShapes: allRecommendations,
                    selectedShape: shape,
                    timestamp: Date.now()
                  });
                }}
              />
            </CardContent>
          </Card>
          
          {/* Validation Status */}
          <Card className="lg:col-span-3">
            <CardContent className="pt-4">
              
              {/* Validation Status */}
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  {validation.valid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-xs font-medium">
                    {validation.valid ? 'Compliant | متوافق' : 'Issues Found | مشاكل'}
                  </span>
                </div>
                {validation.issues.length > 0 && (
                  <ul className="text-[10px] text-muted-foreground space-y-1">
                    {validation.issues.map((issue, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Preview Panel */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview | معاينة
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewSize(previewSize === 256 ? 128 : previewSize === 128 ? 64 : 256)}
                    data-testid="button-toggle-size"
                  >
                    {previewSize}px
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveToGallery}
                    data-testid="button-save-gallery"
                  >
                    <Layers className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Preview */}
                <div className="flex flex-col items-center gap-4">
                  <div 
                    className="rounded-xl border border-border/50 p-4 bg-[#050510]"
                    style={{ width: previewSize + 32, height: previewSize + 32 }}
                  >
                    <div 
                      dangerouslySetInnerHTML={{ __html: previewSVG }}
                      style={{ width: previewSize, height: previewSize }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Deep Space Background Preview
                  </p>
                </div>
                
                {/* Size Variants */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Size Variants | أحجام متعددة</h3>
                  <div className="flex items-end gap-4 p-4 bg-muted/30 rounded-lg">
                    {[64, 32, 24, 16].map(size => (
                      <div key={size} className="flex flex-col items-center gap-1">
                        <div 
                          className="bg-[#0A0A0A] rounded p-1"
                          dangerouslySetInnerHTML={{ 
                            __html: generateSovereignSVG(selectedCategory, selectedAccent, selectedPattern, size, platformName) 
                          }}
                          style={{ width: size + 8, height: size + 8 }}
                        />
                        <span className="text-[9px] text-muted-foreground">{size}px</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Required Files */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Required Files | الملفات المطلوبة</h3>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="flex items-center gap-1 p-2 bg-muted/30 rounded">
                        <FileType className="h-3 w-3" />
                        <span>SVG Primary</span>
                      </div>
                      <div className="flex items-center gap-1 p-2 bg-muted/30 rounded">
                        <FileType className="h-3 w-3" />
                        <span>PNG 1024×1024</span>
                      </div>
                      <div className="flex items-center gap-1 p-2 bg-muted/30 rounded">
                        <FileType className="h-3 w-3" />
                        <span>PNG 32×32</span>
                      </div>
                      <div className="flex items-center gap-1 p-2 bg-muted/30 rounded">
                        <FileType className="h-3 w-3" />
                        <span>PNG 16×16</span>
                      </div>
                      <div className="flex items-center gap-1 p-2 bg-muted/30 rounded col-span-2">
                        <FileType className="h-3 w-3" />
                        <span>Monochrome SVG</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                onClick={downloadAllFormats}
                className="flex-1"
                data-testid="button-download-all-formats"
              >
                <Download className="h-4 w-4 mr-2" />
                Download All Formats (5 Files)
              </Button>
              <Button 
                variant="outline"
                onClick={() => downloadSVG(previewSVG, `${platformName}-preview.svg`)}
                data-testid="button-download-preview"
              >
                <Download className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Mandatory Rules Reference */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Mandatory Framework Rules | قواعد الإطار الإلزامي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="allowed">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="allowed" data-testid="tab-allowed">Allowed | مسموح</TabsTrigger>
                <TabsTrigger value="forbidden" data-testid="tab-forbidden">Forbidden | ممنوع</TabsTrigger>
                <TabsTrigger value="colors" data-testid="tab-colors">Colors | الألوان</TabsTrigger>
                <TabsTrigger value="delivery" data-testid="tab-delivery">Delivery | التسليم</TabsTrigger>
              </TabsList>
              
              <TabsContent value="allowed" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    "Abstract symbols | رموز مجردة",
                    "Intelligence cores | نوى ذكاء",
                    "Neural fields | حقول عصبية",
                    "Control rings | حلقات تحكم",
                    "Structured geometry | هندسة منظمة",
                    "Symmetry & balance | تماثل وتوازن",
                    "Minimal layered depth | عمق طبقي بسيط"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1 p-2 bg-green-500/10 rounded text-xs">
                      <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="forbidden" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    "Cartoon styles | أساليب كرتونية",
                    "Friendly/playful icons | أيقونات ودية",
                    "Tool icons (gear, wrench) | أيقونات أدوات",
                    "Chat bubbles | فقاعات محادثة",
                    "Robot/human figures | أشكال بشرية/روبوت",
                    "Emojis | إيموجي",
                    "Generic UI libraries | مكتبات UI عامة",
                    "Text/letters inside | نص داخل الأيقونة"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1 p-2 bg-destructive/10 rounded text-xs">
                      <XCircle className="h-3 w-3 text-destructive shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="colors" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Base Backgrounds | الخلفيات</h4>
                    <div className="space-y-2">
                      {Object.entries(SOVEREIGN_PALETTE.backgrounds).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ background: Array.isArray(value) ? `linear-gradient(135deg, ${value[0]}, ${value[1]})` : value }}
                          />
                          <span className="text-xs">{key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Accent Colors (ONE per icon) | لون مميز واحد فقط</h4>
                    <div className="space-y-2">
                      {Object.entries(SOVEREIGN_PALETTE.accents).map(([key, color]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-xs">{color.name} | {color.nameAr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="delivery" className="mt-4">
                <div className="space-y-3">
                  <div className="p-3 bg-muted/30 rounded">
                    <h4 className="text-sm font-medium mb-2">File Naming Convention</h4>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      infera-{'{platform|system|model}'}-{'{type}'}.svg
                    </code>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <Badge variant="outline">SVG Primary</Badge>
                    <Badge variant="outline">PNG 1024×1024</Badge>
                    <Badge variant="outline">PNG 32×32</Badge>
                    <Badge variant="outline">PNG 16×16</Badge>
                    <Badge variant="outline">Monochrome SVG</Badge>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Generated Icons Gallery */}
        {generatedIcons.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Generated Gallery | معرض المُولَّدة ({generatedIcons.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {generatedIcons.map((icon, i) => (
                    <div 
                      key={icon.timestamp} 
                      className="flex flex-col items-center gap-1 p-2 bg-muted/30 rounded hover-elevate cursor-pointer"
                      onClick={() => downloadSVG(icon.svg, `${icon.name}.svg`)}
                    >
                      <div 
                        className="w-12 h-12 rounded bg-[#0A0A0A]"
                        dangerouslySetInnerHTML={{ __html: icon.svg.replace(/width="\d+"/, 'width="48"').replace(/height="\d+"/, 'height="48"').replace(/viewBox="0 0 \d+ \d+"/, 'viewBox="0 0 512 512"') }}
                      />
                      <span className="text-[9px] text-muted-foreground truncate max-w-full">
                        {icon.name}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Logo Sync Result Dialog */}
      <LogoSyncResultDialog {...dialogProps} />
    </div>
  );
}
