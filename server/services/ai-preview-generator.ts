/**
 * AI Preview Generator
 * Generates HTML previews for AI-built platforms
 */

import type { Blueprint, BlueprintArtifacts, BuildState } from './blueprint-compiler/types';

export function generateLoadingPreview(blueprint: Blueprint, buildState: BuildState): string {
  const name = blueprint.name || 'Platform';
  const stage = buildState.stage || 'building';
  const progress = buildState.progress || 0;
  
  return `<!DOCTYPE html>
<html>
<head>
  <title>Building ${name}...</title>
  <meta http-equiv="refresh" content="2">
  <style>
    body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0a0a0f; color: #fff; }
    .container { text-align: center; }
    .loader { width: 50px; height: 50px; border: 3px solid #333; border-top: 3px solid #7c3aed; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .progress { color: #9ca3af; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="loader"></div>
    <h2>Building ${name}...</h2>
    <p class="progress">Stage: ${stage} | Progress: ${progress}%</p>
  </div>
</body>
</html>`;
}

export function generatePlatformPreview(blueprint: Blueprint, artifacts: BlueprintArtifacts): string {
  const name = blueprint.name || 'منصة جديدة';
  const description = blueprint.description || 'منصة مُنشأة بالذكاء الاصطناعي';
  const sector = blueprint.sector || 'enterprise';
  
  const featureCards = (blueprint.features || []).map((f: any) => {
    const featureName = typeof f === 'string' ? f : (f.name || f);
    const featureDesc = typeof f === 'string' ? 'ميزة مُنشأة بالكامل' : (f.description || 'ميزة مُنشأة بالكامل');
    return `<div class="card rounded-lg p-4">
      <div class="flex items-center gap-3 mb-2">
        <div class="feature-icon w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm">✓</div>
        <h3 class="font-medium text-white">${featureName}</h3>
      </div>
      <p class="text-sm text-gray-400">${featureDesc}</p>
    </div>`;
  }).join('');
  
  const entityCards = (blueprint.entities || []).map((e: any) => {
    const entityName = typeof e === 'string' ? e : (e.name || e);
    const fieldCount = typeof e === 'object' && e.fields ? e.fields.length : 0;
    return `<div class="card rounded-lg p-4">
      <h3 class="font-medium text-white mb-2">${entityName}</h3>
      <p class="text-xs text-gray-500">${fieldCount} حقل</p>
    </div>`;
  }).join('');
  
  const schemaCount = artifacts.schema?.length || 0;
  const backendCount = artifacts.backend?.length || 0;
  const frontendCount = artifacts.frontend?.length || 0;
  const totalFiles = schemaCount + backendCount + frontendCount;
  
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - AI Generated Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%); color: #e5e5e5; }
    .gradient-text { background: linear-gradient(90deg, #7c3aed, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .card { background: rgba(30, 30, 50, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(124, 58, 237, 0.2); }
    .feature-icon { background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); }
  </style>
</head>
<body class="min-h-screen">
  <header class="border-b border-purple-500/20 p-4">
    <div class="container mx-auto flex items-center justify-between">
      <h1 class="text-2xl font-bold gradient-text">${name}</h1>
      <div class="flex gap-2">
        <span class="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">AI Generated</span>
        <span class="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">${sector}</span>
      </div>
    </div>
  </header>
  
  <main class="container mx-auto py-8 px-4">
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4 text-purple-300">وصف المنصة</h2>
      <p class="text-gray-400">${description}</p>
    </section>
    
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4 text-purple-300">الميزات المُنشأة</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${featureCards}
      </div>
    </section>
    
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4 text-purple-300">الكيانات / الجداول</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        ${entityCards}
      </div>
    </section>
    
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4 text-purple-300">الملفات المُنشأة (${totalFiles} ملف)</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card rounded-lg p-4">
          <h3 class="text-sm text-gray-400 mb-2">Schema</h3>
          <p class="text-2xl font-bold text-white">${schemaCount}</p>
        </div>
        <div class="card rounded-lg p-4">
          <h3 class="text-sm text-gray-400 mb-2">Backend</h3>
          <p class="text-2xl font-bold text-white">${backendCount}</p>
        </div>
        <div class="card rounded-lg p-4">
          <h3 class="text-sm text-gray-400 mb-2">Frontend</h3>
          <p class="text-2xl font-bold text-white">${frontendCount}</p>
        </div>
      </div>
    </section>
  </main>
  
  <footer class="border-t border-purple-500/20 p-4 mt-8">
    <div class="container mx-auto text-center text-gray-500 text-sm">
      تم إنشاء هذه المنصة بواسطة INFERA WebNova AI Blueprint Compiler
    </div>
  </footer>
</body>
</html>`;
}
