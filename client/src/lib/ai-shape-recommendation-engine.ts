/**
 * INFERA AI Shape Recommendation Engine
 * Smart Shape Suggestions – Human Final Choice
 * 
 * Core Principle:
 * - AI provides intelligence
 * - Humans provide judgment
 * - The best identity emerges when guidance and choice coexist
 */

export type ShapeCategory = 
  | "centralized-core"
  | "hexagonal-nested"
  | "orbital-nodes"
  | "shielded-lattice"
  | "axial-spine"
  | "radial-rings"
  | "distributed-constellation"
  | "precision-kernel"
  | "layered-depth"
  | "quantum-matrix"
  | "neural-mesh"
  | "sovereign-fortress";

export interface ShapeRecommendation {
  id: string;
  category: ShapeCategory;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  reasonEn: string;
  reasonAr: string;
  emphasis: "control" | "intelligence" | "stability" | "autonomy" | "security" | "precision";
  complexityLevel: "basic" | "intermediate" | "advanced";
  compatiblePatterns: string[];
  svgPreview: string;
  confidence: number;
}

export interface ShapeSelectionMetadata {
  platformId: string;
  platformType: string;
  pattern: string;
  recommendedShapes: ShapeRecommendation[];
  selectedShape: ShapeRecommendation | null;
  timestamp: number;
}

const SHAPE_DEFINITIONS: Record<ShapeCategory, Omit<ShapeRecommendation, "id" | "confidence" | "svgPreview">> = {
  "centralized-core": {
    category: "centralized-core",
    nameEn: "Centralized Core",
    nameAr: "النواة المركزية",
    descriptionEn: "Single focal point with radiating elements",
    descriptionAr: "نقطة محورية واحدة مع عناصر إشعاعية",
    reasonEn: "Emphasizes unified control and central authority",
    reasonAr: "يؤكد على التحكم الموحد والسلطة المركزية",
    emphasis: "control",
    complexityLevel: "basic",
    compatiblePatterns: ["hexagonalCore", "sovereignShield", "neuralField"]
  },
  "hexagonal-nested": {
    category: "hexagonal-nested",
    nameEn: "Nested Hexagons",
    nameAr: "سداسيات متداخلة",
    descriptionEn: "Layered hexagonal structures for depth",
    descriptionAr: "هياكل سداسية متعددة الطبقات للعمق",
    reasonEn: "Represents structured intelligence and efficiency",
    reasonAr: "يمثل الذكاء المنظم والكفاءة",
    emphasis: "intelligence",
    complexityLevel: "intermediate",
    compatiblePatterns: ["hexagonalCore", "cognitiveMatrix", "autonomousNexus"]
  },
  "orbital-nodes": {
    category: "orbital-nodes",
    nameEn: "Orbital Nodes",
    nameAr: "عُقد مدارية",
    descriptionEn: "Connected points orbiting a center",
    descriptionAr: "نقاط متصلة تدور حول المركز",
    reasonEn: "Shows dynamic systems with stable core",
    reasonAr: "يُظهر أنظمة ديناميكية مع نواة مستقرة",
    emphasis: "stability",
    complexityLevel: "intermediate",
    compatiblePatterns: ["neuralField", "autonomousNexus", "quantumCircuit"]
  },
  "shielded-lattice": {
    category: "shielded-lattice",
    nameEn: "Shielded Lattice",
    nameAr: "شبكة محمية",
    descriptionEn: "Protective grid with secure boundaries",
    descriptionAr: "شبكة وقائية بحدود آمنة",
    reasonEn: "Emphasizes security and defense",
    reasonAr: "يؤكد على الأمان والدفاع",
    emphasis: "security",
    complexityLevel: "intermediate",
    compatiblePatterns: ["sovereignShield", "infiniteLoop", "hexagonalCore"]
  },
  "axial-spine": {
    category: "axial-spine",
    nameEn: "Axial Spine",
    nameAr: "العمود المحوري",
    descriptionEn: "Central axis with balanced branches",
    descriptionAr: "محور مركزي مع فروع متوازنة",
    reasonEn: "Represents structural precision and balance",
    reasonAr: "يمثل الدقة الهيكلية والتوازن",
    emphasis: "precision",
    complexityLevel: "basic",
    compatiblePatterns: ["sovereignShield", "cognitiveMatrix", "neuralField"]
  },
  "radial-rings": {
    category: "radial-rings",
    nameEn: "Radial Intelligence Rings",
    nameAr: "حلقات ذكاء شعاعية",
    descriptionEn: "Concentric rings expanding outward",
    descriptionAr: "حلقات متحدة المركز تتوسع للخارج",
    reasonEn: "Shows expanding intelligence reach",
    reasonAr: "يُظهر امتداد الذكاء المتوسع",
    emphasis: "intelligence",
    complexityLevel: "basic",
    compatiblePatterns: ["neuralField", "quantumCircuit", "cognitiveMatrix"]
  },
  "distributed-constellation": {
    category: "distributed-constellation",
    nameEn: "Distributed Constellation",
    nameAr: "كوكبة موزعة",
    descriptionEn: "Network of interconnected points",
    descriptionAr: "شبكة من النقاط المترابطة",
    reasonEn: "Emphasizes decentralized autonomy",
    reasonAr: "يؤكد على الاستقلالية اللامركزية",
    emphasis: "autonomy",
    complexityLevel: "advanced",
    compatiblePatterns: ["autonomousNexus", "neuralField", "infiniteLoop"]
  },
  "precision-kernel": {
    category: "precision-kernel",
    nameEn: "Precision Kernel",
    nameAr: "نواة دقيقة",
    descriptionEn: "Minimal, focused geometric core",
    descriptionAr: "نواة هندسية مركزة وبسيطة",
    reasonEn: "Represents pure precision and clarity",
    reasonAr: "يمثل الدقة والوضوح المطلق",
    emphasis: "precision",
    complexityLevel: "basic",
    compatiblePatterns: ["hexagonalCore", "cognitiveMatrix", "sovereignShield"]
  },
  "layered-depth": {
    category: "layered-depth",
    nameEn: "Layered Depth Frames",
    nameAr: "إطارات عمق متعددة",
    descriptionEn: "Multiple depth layers creating dimension",
    descriptionAr: "طبقات عمق متعددة تخلق البُعد",
    reasonEn: "Shows multi-level intelligence depth",
    reasonAr: "يُظهر عمق ذكاء متعدد المستويات",
    emphasis: "intelligence",
    complexityLevel: "advanced",
    compatiblePatterns: ["cognitiveMatrix", "quantumCircuit", "neuralField"]
  },
  "quantum-matrix": {
    category: "quantum-matrix",
    nameEn: "Quantum Matrix",
    nameAr: "مصفوفة كمية",
    descriptionEn: "Grid of quantum-inspired intersections",
    descriptionAr: "شبكة من التقاطعات المستوحاة كمياً",
    reasonEn: "Represents advanced computational intelligence",
    reasonAr: "يمثل ذكاء حسابي متقدم",
    emphasis: "intelligence",
    complexityLevel: "advanced",
    compatiblePatterns: ["quantumCircuit", "cognitiveMatrix", "autonomousNexus"]
  },
  "neural-mesh": {
    category: "neural-mesh",
    nameEn: "Neural Mesh",
    nameAr: "شبكة عصبية",
    descriptionEn: "Interconnected neural-like pathways",
    descriptionAr: "مسارات شبيهة بالأعصاب مترابطة",
    reasonEn: "Shows adaptive intelligence networks",
    reasonAr: "يُظهر شبكات ذكاء تكيفية",
    emphasis: "intelligence",
    complexityLevel: "advanced",
    compatiblePatterns: ["neuralField", "cognitiveMatrix", "autonomousNexus"]
  },
  "sovereign-fortress": {
    category: "sovereign-fortress",
    nameEn: "Sovereign Fortress",
    nameAr: "القلعة السيادية",
    descriptionEn: "Fortified geometric structure",
    descriptionAr: "هيكل هندسي محصن",
    reasonEn: "Emphasizes ultimate security and sovereignty",
    reasonAr: "يؤكد على الأمان والسيادة المطلقة",
    emphasis: "security",
    complexityLevel: "intermediate",
    compatiblePatterns: ["sovereignShield", "hexagonalCore", "infiniteLoop"]
  }
};

function generateShapeSVG(category: ShapeCategory, accentColor: string = "#22D3EE"): string {
  const size = 64;
  const center = size / 2;
  
  const svgShapes: Record<ShapeCategory, string> = {
    "centralized-core": `
      <circle cx="${center}" cy="${center}" r="8" fill="${accentColor}" opacity="0.9"/>
      <circle cx="${center}" cy="${center}" r="16" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.6"/>
      <circle cx="${center}" cy="${center}" r="24" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.3"/>
      ${[0, 60, 120, 180, 240, 300].map(angle => {
        const rad = (angle * Math.PI) / 180;
        const x1 = center + 10 * Math.cos(rad);
        const y1 = center + 10 * Math.sin(rad);
        const x2 = center + 22 * Math.cos(rad);
        const y2 = center + 22 * Math.sin(rad);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${accentColor}" stroke-width="1.5" opacity="0.7"/>`;
      }).join('')}
    `,
    "hexagonal-nested": `
      <polygon points="${[0, 60, 120, 180, 240, 300].map(angle => {
        const rad = ((angle - 30) * Math.PI) / 180;
        return `${center + 22 * Math.cos(rad)},${center + 22 * Math.sin(rad)}`;
      }).join(' ')}" fill="none" stroke="${accentColor}" stroke-width="1.5"/>
      <polygon points="${[0, 60, 120, 180, 240, 300].map(angle => {
        const rad = ((angle - 30) * Math.PI) / 180;
        return `${center + 14 * Math.cos(rad)},${center + 14 * Math.sin(rad)}`;
      }).join(' ')}" fill="${accentColor}" fill-opacity="0.2" stroke="${accentColor}" stroke-width="1"/>
      <polygon points="${[0, 60, 120, 180, 240, 300].map(angle => {
        const rad = ((angle - 30) * Math.PI) / 180;
        return `${center + 6 * Math.cos(rad)},${center + 6 * Math.sin(rad)}`;
      }).join(' ')}" fill="${accentColor}" fill-opacity="0.6"/>
    `,
    "orbital-nodes": `
      <circle cx="${center}" cy="${center}" r="6" fill="${accentColor}"/>
      <circle cx="${center}" cy="${center}" r="18" fill="none" stroke="${accentColor}" stroke-width="1" stroke-dasharray="2 2" opacity="0.5"/>
      ${[0, 72, 144, 216, 288].map(angle => {
        const rad = (angle * Math.PI) / 180;
        const x = center + 18 * Math.cos(rad);
        const y = center + 18 * Math.sin(rad);
        return `<circle cx="${x}" cy="${y}" r="4" fill="${accentColor}" opacity="0.8"/>`;
      }).join('')}
    `,
    "shielded-lattice": `
      <rect x="${center - 20}" y="${center - 20}" width="40" height="40" fill="none" stroke="${accentColor}" stroke-width="2" rx="4"/>
      <rect x="${center - 12}" y="${center - 12}" width="24" height="24" fill="${accentColor}" fill-opacity="0.2" stroke="${accentColor}" stroke-width="1" rx="2"/>
      <line x1="${center - 20}" y1="${center}" x2="${center + 20}" y2="${center}" stroke="${accentColor}" stroke-width="1" opacity="0.4"/>
      <line x1="${center}" y1="${center - 20}" x2="${center}" y2="${center + 20}" stroke="${accentColor}" stroke-width="1" opacity="0.4"/>
    `,
    "axial-spine": `
      <line x1="${center}" y1="${center - 24}" x2="${center}" y2="${center + 24}" stroke="${accentColor}" stroke-width="2"/>
      <circle cx="${center}" cy="${center}" r="5" fill="${accentColor}"/>
      <line x1="${center - 16}" y1="${center - 10}" x2="${center + 16}" y2="${center - 10}" stroke="${accentColor}" stroke-width="1.5" opacity="0.7"/>
      <line x1="${center - 12}" y1="${center + 10}" x2="${center + 12}" y2="${center + 10}" stroke="${accentColor}" stroke-width="1.5" opacity="0.7"/>
    `,
    "radial-rings": `
      <circle cx="${center}" cy="${center}" r="6" fill="${accentColor}"/>
      <circle cx="${center}" cy="${center}" r="12" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.7"/>
      <circle cx="${center}" cy="${center}" r="18" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.5"/>
      <circle cx="${center}" cy="${center}" r="24" fill="none" stroke="${accentColor}" stroke-width="0.5" opacity="0.3"/>
    `,
    "distributed-constellation": `
      ${[[center, center - 16], [center - 14, center - 8], [center + 14, center - 8], 
         [center - 10, center + 12], [center + 10, center + 12], [center, center]].map(([x, y], i) => 
        `<circle cx="${x}" cy="${y}" r="${i === 5 ? 5 : 3}" fill="${accentColor}" opacity="${i === 5 ? 1 : 0.7}"/>`
      ).join('')}
      <line x1="${center}" y1="${center}" x2="${center}" y2="${center - 16}" stroke="${accentColor}" stroke-width="1" opacity="0.5"/>
      <line x1="${center}" y1="${center}" x2="${center - 14}" y2="${center - 8}" stroke="${accentColor}" stroke-width="1" opacity="0.5"/>
      <line x1="${center}" y1="${center}" x2="${center + 14}" y2="${center - 8}" stroke="${accentColor}" stroke-width="1" opacity="0.5"/>
      <line x1="${center}" y1="${center}" x2="${center - 10}" y2="${center + 12}" stroke="${accentColor}" stroke-width="1" opacity="0.5"/>
      <line x1="${center}" y1="${center}" x2="${center + 10}" y2="${center + 12}" stroke="${accentColor}" stroke-width="1" opacity="0.5"/>
    `,
    "precision-kernel": `
      <polygon points="${center},${center - 18} ${center + 15.6},${center + 9} ${center - 15.6},${center + 9}" 
               fill="${accentColor}" fill-opacity="0.3" stroke="${accentColor}" stroke-width="1.5"/>
      <circle cx="${center}" cy="${center}" r="6" fill="${accentColor}"/>
    `,
    "layered-depth": `
      <rect x="${center - 18}" y="${center - 14}" width="36" height="28" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.3" rx="2"/>
      <rect x="${center - 14}" y="${center - 10}" width="28" height="20" fill="${accentColor}" fill-opacity="0.1" stroke="${accentColor}" stroke-width="1" opacity="0.6" rx="2"/>
      <rect x="${center - 10}" y="${center - 6}" width="20" height="12" fill="${accentColor}" fill-opacity="0.3" stroke="${accentColor}" stroke-width="1.5" rx="2"/>
    `,
    "quantum-matrix": `
      ${[-12, 0, 12].flatMap(x => [-12, 0, 12].map(y => 
        `<circle cx="${center + x}" cy="${center + y}" r="2.5" fill="${accentColor}" opacity="${x === 0 && y === 0 ? 1 : 0.5}"/>`
      )).join('')}
      <line x1="${center - 12}" y1="${center}" x2="${center + 12}" y2="${center}" stroke="${accentColor}" stroke-width="1" opacity="0.4"/>
      <line x1="${center}" y1="${center - 12}" x2="${center}" y2="${center + 12}" stroke="${accentColor}" stroke-width="1" opacity="0.4"/>
    `,
    "neural-mesh": `
      <path d="M${center - 16},${center} Q${center},${center - 16} ${center + 16},${center}" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.6"/>
      <path d="M${center - 16},${center} Q${center},${center + 16} ${center + 16},${center}" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.6"/>
      <circle cx="${center - 16}" cy="${center}" r="4" fill="${accentColor}"/>
      <circle cx="${center + 16}" cy="${center}" r="4" fill="${accentColor}"/>
      <circle cx="${center}" cy="${center}" r="5" fill="${accentColor}"/>
    `,
    "sovereign-fortress": `
      <polygon points="${center},${center - 20} ${center + 20},${center} ${center},${center + 20} ${center - 20},${center}" 
               fill="${accentColor}" fill-opacity="0.2" stroke="${accentColor}" stroke-width="2"/>
      <polygon points="${center},${center - 10} ${center + 10},${center} ${center},${center + 10} ${center - 10},${center}" 
               fill="${accentColor}" fill-opacity="0.5"/>
    `
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#0A0A0A"/>
    ${svgShapes[category]}
  </svg>`;
}

export function getShapeRecommendations(
  platformType: string,
  selectedPattern: string,
  accentColor: string = "#22D3EE",
  includeAdvanced: boolean = false
): ShapeRecommendation[] {
  const recommendations: ShapeRecommendation[] = [];
  
  const allCategories = Object.keys(SHAPE_DEFINITIONS) as ShapeCategory[];
  
  for (const category of allCategories) {
    const definition = SHAPE_DEFINITIONS[category];
    
    if (!includeAdvanced && definition.complexityLevel === "advanced") {
      continue;
    }
    
    let confidence = 50;
    
    if (definition.compatiblePatterns.includes(selectedPattern)) {
      confidence += 30;
    }
    
    if (platformType === "platform" && ["centralized-core", "hexagonal-nested", "sovereign-fortress"].includes(category)) {
      confidence += 15;
    }
    if (platformType === "dashboard" && ["radial-rings", "layered-depth", "precision-kernel"].includes(category)) {
      confidence += 15;
    }
    if (platformType === "ai" && ["neural-mesh", "quantum-matrix", "distributed-constellation"].includes(category)) {
      confidence += 15;
    }
    if (platformType === "security" && ["shielded-lattice", "sovereign-fortress", "axial-spine"].includes(category)) {
      confidence += 15;
    }
    
    confidence = Math.min(confidence, 98);
    
    recommendations.push({
      ...definition,
      id: `shape-${category}-${Date.now()}`,
      confidence,
      svgPreview: generateShapeSVG(category, accentColor)
    });
  }
  
  recommendations.sort((a, b) => b.confidence - a.confidence);
  
  const minShapes = 5;
  const maxShapes = includeAdvanced ? 12 : 7;
  
  return recommendations.slice(0, Math.max(minShapes, Math.min(maxShapes, recommendations.length)));
}

const STORAGE_KEY = "infera_shape_selections";

export function saveShapeSelection(metadata: ShapeSelectionMetadata): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const history: ShapeSelectionMetadata[] = stored ? JSON.parse(stored) : [];
    
    history.unshift(metadata);
    
    if (history.length > 100) {
      history.length = 100;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn("Failed to save shape selection:", error);
  }
}

export function getShapeSelectionHistory(): ShapeSelectionMetadata[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getPopularShapesForPlatform(platformType: string): ShapeCategory[] {
  const history = getShapeSelectionHistory();
  const counts: Record<string, number> = {};
  
  for (const entry of history) {
    if (entry.platformType === platformType && entry.selectedShape) {
      const cat = entry.selectedShape.category;
      counts[cat] = (counts[cat] || 0) + 1;
    }
  }
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat]) => cat as ShapeCategory);
}
