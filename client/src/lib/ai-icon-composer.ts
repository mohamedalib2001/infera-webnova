import { type ShapeCategory, type ShapeRecommendation } from './ai-shape-recommendation-engine';

export interface IconComposition {
  id: string;
  name: string;
  nameAr: string;
  svg: string;
  category: IconCategory;
  style: IconStyle;
  primaryColor: string;
  secondaryColor: string;
  complexity: number;
  timestamp: number;
}

export type IconCategory = 
  | 'sovereignty' 
  | 'intelligence' 
  | 'security' 
  | 'commerce' 
  | 'connectivity' 
  | 'analytics'
  | 'infrastructure'
  | 'governance';

export type IconStyle = 
  | 'minimal' 
  | 'geometric' 
  | 'layered' 
  | 'organic' 
  | 'crystalline'
  | 'neural'
  | 'quantum';

export const ICON_CATEGORIES: Record<IconCategory, { name: string; nameAr: string; description: string }> = {
  sovereignty: { name: 'Sovereignty', nameAr: 'السيادة', description: 'Authority and control symbols' },
  intelligence: { name: 'Intelligence', nameAr: 'الذكاء', description: 'AI and neural patterns' },
  security: { name: 'Security', nameAr: 'الأمان', description: 'Protection and shield motifs' },
  commerce: { name: 'Commerce', nameAr: 'التجارة', description: 'Trade and exchange symbols' },
  connectivity: { name: 'Connectivity', nameAr: 'الاتصال', description: 'Network and communication' },
  analytics: { name: 'Analytics', nameAr: 'التحليلات', description: 'Data and insights patterns' },
  infrastructure: { name: 'Infrastructure', nameAr: 'البنية التحتية', description: 'Foundation and structure' },
  governance: { name: 'Governance', nameAr: 'الحوكمة', description: 'Management and oversight' }
};

export const ICON_STYLES: Record<IconStyle, { name: string; nameAr: string; complexity: number }> = {
  minimal: { name: 'Minimal', nameAr: 'بسيط', complexity: 1 },
  geometric: { name: 'Geometric', nameAr: 'هندسي', complexity: 2 },
  layered: { name: 'Layered', nameAr: 'طبقات', complexity: 3 },
  organic: { name: 'Organic', nameAr: 'عضوي', complexity: 3 },
  crystalline: { name: 'Crystalline', nameAr: 'بلوري', complexity: 4 },
  neural: { name: 'Neural', nameAr: 'عصبي', complexity: 4 },
  quantum: { name: 'Quantum', nameAr: 'كوانتي', complexity: 5 }
};

export const SOVEREIGN_COLORS = {
  primary: {
    quantumPurple: '#8B5CF6',
    neuralCyan: '#22D3EE',
    sovereignBlue: '#3B82F6',
    signalGold: '#F59E0B',
    deepEmerald: '#10B981',
    royalMagenta: '#D946EF',
    crimsonRed: '#EF4444'
  },
  backgrounds: {
    obsidianBlack: '#0A0A0A',
    deepSpace: '#050510',
    darkGraphite: '#121218',
    midnightBlue: '#0F172A'
  }
};

function generateUniqueId(): string {
  return `icon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function composeAdvancedSVG(
  category: IconCategory,
  style: IconStyle,
  primaryColor: string,
  size: number = 512
): string {
  const center = size / 2;
  const baseRadius = size * 0.35;
  
  const gradientId = `grad_${Date.now()}`;
  const glowId = `glow_${Date.now()}`;
  const maskId = `mask_${Date.now()}`;
  
  let coreElements = '';
  let decorativeElements = '';
  let glowEffects = '';
  
  switch (style) {
    case 'minimal':
      coreElements = generateMinimalCore(center, baseRadius, primaryColor);
      break;
    case 'geometric':
      coreElements = generateGeometricCore(center, baseRadius, primaryColor, size);
      break;
    case 'layered':
      coreElements = generateLayeredCore(center, baseRadius, primaryColor, size);
      decorativeElements = generateLayeredDecor(center, baseRadius, primaryColor);
      break;
    case 'organic':
      coreElements = generateOrganicCore(center, baseRadius, primaryColor, size);
      decorativeElements = generateOrganicDecor(center, baseRadius, primaryColor);
      break;
    case 'crystalline':
      coreElements = generateCrystallineCore(center, baseRadius, primaryColor, size);
      decorativeElements = generateCrystallineDecor(center, baseRadius, primaryColor, size);
      glowEffects = generateGlowEffect(glowId, primaryColor);
      break;
    case 'neural':
      coreElements = generateNeuralCore(center, baseRadius, primaryColor, size);
      decorativeElements = generateNeuralNetwork(center, baseRadius, primaryColor, size);
      glowEffects = generateGlowEffect(glowId, primaryColor);
      break;
    case 'quantum':
      coreElements = generateQuantumCore(center, baseRadius, primaryColor, size);
      decorativeElements = generateQuantumField(center, baseRadius, primaryColor, size);
      glowEffects = generateAdvancedGlow(glowId, primaryColor);
      break;
  }
  
  const categoryOverlay = generateCategoryOverlay(category, center, baseRadius * 0.4, primaryColor);
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="1"/>
      <stop offset="50%" stop-color="${primaryColor}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.4"/>
    </linearGradient>
    <radialGradient id="${gradientId}_radial" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="${primaryColor}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0"/>
    </radialGradient>
    ${glowEffects}
    <mask id="${maskId}">
      <rect width="100%" height="100%" fill="white"/>
    </mask>
  </defs>
  
  <rect width="${size}" height="${size}" fill="#050510"/>
  
  <g filter="${glowEffects ? `url(#${glowId})` : 'none'}">
    ${decorativeElements}
    ${coreElements}
    ${categoryOverlay}
  </g>
</svg>`;
}

function generateMinimalCore(cx: number, cy: number, color: string): string {
  return `
    <circle cx="${cx}" cy="${cy}" r="${cx * 0.5}" fill="none" stroke="${color}" stroke-width="3" opacity="0.9"/>
    <circle cx="${cx}" cy="${cy}" r="${cx * 0.25}" fill="${color}" opacity="0.8"/>
    <circle cx="${cx}" cy="${cy}" r="${cx * 0.08}" fill="#050510"/>
  `;
}

function generateGeometricCore(cx: number, cy: number, radius: number, color: string, size: number): string {
  const hexPoints = generateHexagonPoints(cx, cy, radius);
  const innerHex = generateHexagonPoints(cx, cy, radius * 0.6);
  
  return `
    <polygon points="${hexPoints}" fill="none" stroke="${color}" stroke-width="3" opacity="0.9"/>
    <polygon points="${innerHex}" fill="${color}" opacity="0.2"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.3}" fill="${color}" opacity="0.7"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.12}" fill="#050510"/>
    ${[0, 60, 120, 180, 240, 300].map(angle => {
      const rad = angle * Math.PI / 180;
      const x = cx + Math.cos(rad) * radius;
      const y = cy + Math.sin(rad) * radius;
      return `<circle cx="${x}" cy="${y}" r="4" fill="${color}" opacity="0.6"/>`;
    }).join('')}
  `;
}

function generateLayeredCore(cx: number, cy: number, radius: number, color: string, size: number): string {
  return `
    <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${color}" stroke-width="2" opacity="0.3"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.75}" fill="none" stroke="${color}" stroke-width="2.5" opacity="0.5"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.5}" fill="none" stroke="${color}" stroke-width="3" opacity="0.7"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.3}" fill="${color}" opacity="0.8"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.1}" fill="#050510"/>
  `;
}

function generateLayeredDecor(cx: number, cy: number, radius: number, color: string): string {
  return `
    ${[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
      const rad = angle * Math.PI / 180;
      const x1 = cx + Math.cos(rad) * radius * 0.55;
      const y1 = cy + Math.sin(rad) * radius * 0.55;
      const x2 = cx + Math.cos(rad) * radius * 0.95;
      const y2 = cy + Math.sin(rad) * radius * 0.95;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" opacity="0.4"/>`;
    }).join('')}
  `;
}

function generateOrganicCore(cx: number, cy: number, radius: number, color: string, size: number): string {
  const wave1 = generateWavyCircle(cx, cy, radius, 6, 0.1);
  const wave2 = generateWavyCircle(cx, cy, radius * 0.65, 8, 0.15);
  
  return `
    <path d="${wave1}" fill="none" stroke="${color}" stroke-width="2" opacity="0.5"/>
    <path d="${wave2}" fill="${color}" opacity="0.3"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.25}" fill="${color}" opacity="0.9"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.08}" fill="#050510"/>
  `;
}

function generateOrganicDecor(cx: number, cy: number, radius: number, color: string): string {
  return `
    ${[0, 72, 144, 216, 288].map((angle, i) => {
      const rad = angle * Math.PI / 180;
      const x = cx + Math.cos(rad) * radius * 0.8;
      const y = cy + Math.sin(rad) * radius * 0.8;
      const size = 8 + i * 2;
      return `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="${0.3 - i * 0.04}"/>`;
    }).join('')}
  `;
}

function generateCrystallineCore(cx: number, cy: number, radius: number, color: string, size: number): string {
  const points = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45) * Math.PI / 180;
    const r = i % 2 === 0 ? radius : radius * 0.6;
    points.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`);
  }
  
  return `
    <polygon points="${points.join(' ')}" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="2"/>
    <polygon points="${generateHexagonPoints(cx, cy, radius * 0.45)}" fill="${color}" opacity="0.4"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.18}" fill="${color}" opacity="0.9"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.06}" fill="#050510"/>
  `;
}

function generateCrystallineDecor(cx: number, cy: number, radius: number, color: string, size: number): string {
  return `
    ${[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
      const rad = angle * Math.PI / 180;
      const r = i % 2 === 0 ? radius * 1.1 : radius * 0.95;
      const x = cx + Math.cos(rad) * r;
      const y = cy + Math.sin(rad) * r;
      return `
        <line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${color}" stroke-width="1" opacity="0.2"/>
        <circle cx="${x}" cy="${y}" r="3" fill="${color}" opacity="0.5"/>
      `;
    }).join('')}
  `;
}

function generateNeuralCore(cx: number, cy: number, radius: number, color: string, size: number): string {
  return `
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.9}" fill="none" stroke="${color}" stroke-width="1" opacity="0.2" stroke-dasharray="8 4"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.6}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.3" stroke-dasharray="5 3"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.35}" fill="${color}" opacity="0.15"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.2}" fill="${color}" opacity="0.8"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.06}" fill="#050510"/>
  `;
}

function generateNeuralNetwork(cx: number, cy: number, radius: number, color: string, size: number): string {
  const nodes: { x: number; y: number; r: number }[] = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * Math.PI / 180;
    nodes.push({
      x: cx + Math.cos(angle) * radius * 0.75,
      y: cy + Math.sin(angle) * radius * 0.75,
      r: 6
    });
  }
  
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 + 30) * Math.PI / 180;
    nodes.push({
      x: cx + Math.cos(angle) * radius * 0.45,
      y: cy + Math.sin(angle) * radius * 0.45,
      r: 4
    });
  }
  
  let connections = '';
  for (let i = 0; i < 6; i++) {
    connections += `<line x1="${cx}" y1="${cy}" x2="${nodes[i].x}" y2="${nodes[i].y}" stroke="${color}" stroke-width="1" opacity="0.3"/>`;
    connections += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[(i + 1) % 6].x}" y2="${nodes[(i + 1) % 6].y}" stroke="${color}" stroke-width="0.8" opacity="0.25"/>`;
    connections += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[i + 6].x}" y2="${nodes[i + 6].y}" stroke="${color}" stroke-width="0.6" opacity="0.2"/>`;
  }
  
  const nodeElements = nodes.map((n, i) => 
    `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${color}" opacity="${0.7 - (i > 5 ? 0.2 : 0)}"/>`
  ).join('');
  
  return connections + nodeElements;
}

function generateQuantumCore(cx: number, cy: number, radius: number, color: string, size: number): string {
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="${radius}" ry="${radius * 0.35}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.4" transform="rotate(-30 ${cx} ${cy})"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${radius}" ry="${radius * 0.35}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.4" transform="rotate(30 ${cx} ${cy})"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${radius}" ry="${radius * 0.35}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.4" transform="rotate(90 ${cx} ${cy})"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.25}" fill="${color}" opacity="0.9"/>
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.08}" fill="#050510"/>
  `;
}

function generateQuantumField(cx: number, cy: number, radius: number, color: string, size: number): string {
  const particles: string[] = [];
  
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) * Math.PI / 180;
    const dist = radius * (0.5 + Math.random() * 0.5);
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const size = 2 + Math.random() * 4;
    particles.push(`<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="${0.2 + Math.random() * 0.3}"/>`);
  }
  
  return particles.join('');
}

function generateCategoryOverlay(category: IconCategory, cx: number, cy: number, radius: number, color: string): string {
  switch (category) {
    case 'sovereignty':
      return `<polygon points="${cx},${cy - radius} ${cx + radius * 0.3},${cy - radius * 0.3} ${cx},${cy + radius * 0.2} ${cx - radius * 0.3},${cy - radius * 0.3}" fill="${color}" opacity="0.6"/>`;
    case 'intelligence':
      return `<circle cx="${cx}" cy="${cy}" r="${radius * 0.15}" fill="${color}" opacity="0.9"/>`;
    case 'security':
      return `<path d="M${cx},${cy - radius * 0.8} L${cx + radius * 0.5},${cy - radius * 0.3} L${cx + radius * 0.5},${cy + radius * 0.3} L${cx},${cy + radius * 0.8} L${cx - radius * 0.5},${cy + radius * 0.3} L${cx - radius * 0.5},${cy - radius * 0.3} Z" fill="none" stroke="${color}" stroke-width="2" opacity="0.5"/>`;
    default:
      return '';
  }
}

function generateGlowEffect(id: string, color: string): string {
  return `
    <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow"/>
      <feBlend in="SourceGraphic" in2="glow" mode="normal"/>
    </filter>
  `;
}

function generateAdvancedGlow(id: string, color: string): string {
  return `
    <filter id="${id}" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur"/>
      <feFlood flood-color="${color}" flood-opacity="0.5"/>
      <feComposite in2="blur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
}

function generateHexagonPoints(cx: number, cy: number, radius: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 - 30) * Math.PI / 180;
    points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
  }
  return points.join(' ');
}

function generateWavyCircle(cx: number, cy: number, radius: number, waves: number, amplitude: number): string {
  const points: string[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const waveOffset = Math.sin(angle * waves) * radius * amplitude;
    const r = radius + waveOffset;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    points.push(i === 0 ? `M${x},${y}` : `L${x},${y}`);
  }
  return points.join(' ') + 'Z';
}

export function createIconComposition(
  category: IconCategory,
  style: IconStyle,
  primaryColor: string,
  name?: string
): IconComposition {
  const svg = composeAdvancedSVG(category, style, primaryColor, 512);
  const categoryInfo = ICON_CATEGORIES[category];
  const styleInfo = ICON_STYLES[style];
  
  return {
    id: generateUniqueId(),
    name: name || `${categoryInfo.name} ${styleInfo.name}`,
    nameAr: `${categoryInfo.nameAr} ${styleInfo.nameAr}`,
    svg,
    category,
    style,
    primaryColor,
    secondaryColor: SOVEREIGN_COLORS.backgrounds.deepSpace,
    complexity: styleInfo.complexity,
    timestamp: Date.now()
  };
}

export function generateVariants(
  category: IconCategory,
  style: IconStyle,
  colors: string[]
): IconComposition[] {
  return colors.map(color => createIconComposition(category, style, color));
}
