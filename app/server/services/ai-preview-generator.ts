/**
 * AI Preview Generator - Modern Design
 * Generates professional, modern HTML previews for AI-built platforms
 */

import type { Blueprint, BlueprintArtifacts, BuildState } from './blueprint-compiler/types';

export function generateLoadingPreview(blueprint: Blueprint, buildState: BuildState): string {
  const name = blueprint.name || 'Platform';
  const stage = buildState.stage || 'building';
  const progress = buildState.progress || 0;
  
  const stageAr: Record<string, string> = {
    'validating': 'التحقق من البيانات',
    'analyzing': 'تحليل المتطلبات',
    'generating': 'إنشاء الكود',
    'building': 'بناء المنصة',
    'testing': 'اختبار المنصة',
    'completed': 'اكتمل البناء'
  };
  
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <title>جاري بناء ${name}...</title>
  <meta http-equiv="refresh" content="2">
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', 'Inter', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #09090b; color: #fafafa; }
    .container { text-align: center; padding: 60px 40px; }
    .logo { width: 80px; height: 80px; margin: 0 auto 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; color: white; box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3); }
    .loader { width: 64px; height: 64px; border: 3px solid rgba(139, 92, 246, 0.1); border-top: 3px solid #8b5cf6; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 32px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 12px; color: #fafafa; }
    .progress-container { width: 320px; margin: 28px auto; }
    .progress-bar { height: 6px; background: rgba(139, 92, 246, 0.15); border-radius: 100px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7); width: ${progress}%; transition: width 0.3s ease; border-radius: 100px; }
    .stage { color: #71717a; font-size: 0.875rem; margin-top: 16px; }
    .percent { font-size: 3rem; font-weight: 700; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">N</div>
    <div class="loader"></div>
    <h2>جاري بناء ${name}</h2>
    <div class="progress-container">
      <div class="progress-bar"><div class="progress-fill"></div></div>
    </div>
    <p class="percent">${progress}%</p>
    <p class="stage">${stageAr[stage] || stage}</p>
  </div>
</body>
</html>`;
}

function generateEmployeeData(): { name: string; nameAr: string; role: string; roleAr: string; department: string; departmentAr: string; status: string; avatar: string; email: string }[] {
  return [
    { name: 'Ahmed Mohamed', nameAr: 'أحمد محمد', role: 'Software Engineer', roleAr: 'مهندس برمجيات', department: 'Engineering', departmentAr: 'الهندسة', status: 'active', avatar: 'AM', email: 'ahmed.m@company.com' },
    { name: 'Sara Ali', nameAr: 'سارة علي', role: 'HR Director', roleAr: 'مديرة الموارد البشرية', department: 'Human Resources', departmentAr: 'الموارد البشرية', status: 'active', avatar: 'SA', email: 'sara.a@company.com' },
    { name: 'Omar Hassan', nameAr: 'عمر حسن', role: 'Product Designer', roleAr: 'مصمم منتجات', department: 'Design', departmentAr: 'التصميم', status: 'active', avatar: 'OH', email: 'omar.h@company.com' },
    { name: 'Fatima Khalid', nameAr: 'فاطمة خالد', role: 'Finance Manager', roleAr: 'مديرة المالية', department: 'Finance', departmentAr: 'المالية', status: 'on-leave', avatar: 'FK', email: 'fatima.k@company.com' },
    { name: 'Youssef Ibrahim', nameAr: 'يوسف إبراهيم', role: 'DevOps Lead', roleAr: 'قائد DevOps', department: 'Engineering', departmentAr: 'الهندسة', status: 'active', avatar: 'YI', email: 'youssef.i@company.com' },
    { name: 'Nour Mahmoud', nameAr: 'نور محمود', role: 'Marketing Lead', roleAr: 'قائدة التسويق', department: 'Marketing', departmentAr: 'التسويق', status: 'active', avatar: 'NM', email: 'nour.m@company.com' },
  ];
}

function generateDepartmentData(): { name: string; nameAr: string; count: number; manager: string; managerAr: string; color: string; growth: number }[] {
  return [
    { name: 'Engineering', nameAr: 'الهندسة', count: 45, manager: 'Mohamed Salem', managerAr: 'محمد سالم', color: '#6366f1', growth: 12 },
    { name: 'Human Resources', nameAr: 'الموارد البشرية', count: 12, manager: 'Sara Ali', managerAr: 'سارة علي', color: '#ec4899', growth: 8 },
    { name: 'Finance', nameAr: 'المالية', count: 18, manager: 'Khaled Ahmed', managerAr: 'خالد أحمد', color: '#10b981', growth: 5 },
    { name: 'Design', nameAr: 'التصميم', count: 15, manager: 'Layla Hassan', managerAr: 'ليلى حسن', color: '#f59e0b', growth: 20 },
    { name: 'Marketing', nameAr: 'التسويق', count: 22, manager: 'Nour Mahmoud', managerAr: 'نور محمود', color: '#3b82f6', growth: 15 },
    { name: 'Operations', nameAr: 'العمليات', count: 30, manager: 'Ali Mostafa', managerAr: 'علي مصطفى', color: '#8b5cf6', growth: 10 },
  ];
}

export function generatePlatformPreview(blueprint: Blueprint, artifacts: BlueprintArtifacts): string {
  const name = blueprint.name || 'HR Platform';
  const nameAr = (blueprint as any).nameAr || 'منصة الموارد البشرية';
  
  const employees = generateEmployeeData();
  const departments = generateDepartmentData();
  
  const totalEmployees = departments.reduce((sum, d) => sum + d.count, 0);
  const schemaCount = artifacts.schema?.length || 0;
  const backendCount = artifacts.backend?.length || 0;
  const frontendCount = artifacts.frontend?.length || 0;
  const totalFiles = schemaCount + backendCount + frontendCount;
  
  const avatarColors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];
  
  const employeeRows = employees.map((emp, idx) => `
    <tr class="table-row">
      <td class="table-cell">
        <div class="employee-info">
          <div class="avatar" style="background: ${avatarColors[idx % avatarColors.length]}">${emp.avatar}</div>
          <div class="employee-details">
            <span class="employee-name">${emp.nameAr}</span>
            <span class="employee-email">${emp.email}</span>
          </div>
        </div>
      </td>
      <td class="table-cell">${emp.roleAr}</td>
      <td class="table-cell"><span class="dept-badge">${emp.departmentAr}</span></td>
      <td class="table-cell">
        <span class="status-badge ${emp.status === 'active' ? 'status-active' : 'status-leave'}">
          <span class="status-dot"></span>
          ${emp.status === 'active' ? 'نشط' : 'إجازة'}
        </span>
      </td>
      <td class="table-cell">
        <div class="actions">
          <button class="action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn action-delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  
  const departmentCards = departments.slice(0, 4).map(dept => `
    <div class="dept-card">
      <div class="dept-header">
        <div class="dept-icon" style="background: ${dept.color}15; color: ${dept.color}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <span class="dept-growth" style="color: ${dept.color}">+${dept.growth}%</span>
      </div>
      <h4 class="dept-name">${dept.nameAr}</h4>
      <div class="dept-stats">
        <span class="dept-count">${dept.count} موظف</span>
        <span class="dept-manager">${dept.managerAr}</span>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nameAr} - INFERA WebNova</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #09090b;
      --bg-secondary: #18181b;
      --bg-tertiary: #27272a;
      --border: #27272a;
      --border-hover: #3f3f46;
      --text-primary: #fafafa;
      --text-secondary: #a1a1aa;
      --text-muted: #71717a;
      --accent: #6366f1;
      --accent-hover: #818cf8;
      --success: #22c55e;
      --warning: #f59e0b;
      --danger: #ef4444;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Cairo', 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
    }
    
    .layout {
      display: flex;
      min-height: 100vh;
    }
    
    /* Sidebar */
    .sidebar {
      width: 280px;
      background: var(--bg-secondary);
      border-left: 1px solid var(--border);
      height: 100vh;
      position: fixed;
      right: 0;
      display: flex;
      flex-direction: column;
      z-index: 100;
    }
    
    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid var(--border);
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    
    .logo {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.125rem;
      color: white;
    }
    
    .logo-text h1 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
    }
    
    .ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      padding: 2px 8px;
      border-radius: 100px;
      font-size: 0.6875rem;
      font-weight: 500;
    }
    
    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      overflow-y: auto;
    }
    
    .nav-section {
      margin-bottom: 24px;
    }
    
    .nav-section-title {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0 12px;
      margin-bottom: 8px;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
      margin-bottom: 2px;
      font-size: 0.875rem;
    }
    
    .nav-item:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    
    .nav-item.active {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08));
      color: var(--text-primary);
      position: relative;
    }
    
    .nav-item.active::before {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background: var(--accent);
      border-radius: 100px 0 0 100px;
    }
    
    .nav-icon {
      width: 20px;
      height: 20px;
      opacity: 0.8;
    }
    
    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--border);
    }
    
    .files-info {
      background: var(--bg-tertiary);
      border-radius: 10px;
      padding: 14px;
    }
    
    .files-title {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 10px;
    }
    
    .files-badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    
    .file-badge {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.6875rem;
      font-weight: 500;
    }
    
    .file-badge.schema { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .file-badge.api { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
    .file-badge.ui { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
    
    /* Main Content */
    .main {
      flex: 1;
      margin-right: 280px;
      min-height: 100vh;
    }
    
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 32px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-primary);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    
    .topbar-title h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .topbar-title p {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 16px;
      width: 280px;
      transition: all 0.15s ease;
    }
    
    .search-box:focus-within {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .search-box input {
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-size: 0.875rem;
      width: 100%;
      font-family: inherit;
    }
    
    .search-box input::placeholder {
      color: var(--text-muted);
    }
    
    .search-icon {
      color: var(--text-muted);
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
      font-family: inherit;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
    }
    
    .btn-primary:hover {
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
      transform: translateY(-1px);
    }
    
    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }
    
    .btn-ghost:hover {
      background: var(--bg-secondary);
      border-color: var(--border-hover);
    }
    
    .content {
      padding: 32px;
    }
    
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .stat-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      transition: all 0.2s ease;
    }
    
    .stat-card:hover {
      border-color: var(--border-hover);
      transform: translateY(-2px);
    }
    
    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    
    .stat-title {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    
    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .stat-icon.purple { background: rgba(99, 102, 241, 0.12); color: #818cf8; }
    .stat-icon.pink { background: rgba(236, 72, 153, 0.12); color: #f472b6; }
    .stat-icon.green { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
    .stat-icon.amber { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
    
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 8px;
      background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .stat-change {
      font-size: 0.8125rem;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .stat-change.positive { color: var(--success); }
    .stat-change.neutral { color: var(--text-muted); }
    
    /* Cards Grid */
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    
    .card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
    }
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
    }
    
    .card-title {
      font-size: 1rem;
      font-weight: 600;
    }
    
    .card-action {
      font-size: 0.8125rem;
      color: var(--accent);
      cursor: pointer;
      transition: color 0.15s;
    }
    
    .card-action:hover {
      color: var(--accent-hover);
    }
    
    .card-body {
      padding: 20px 24px;
    }
    
    /* Departments */
    .depts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    
    .dept-card {
      background: var(--bg-tertiary);
      border: 1px solid transparent;
      border-radius: 12px;
      padding: 18px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .dept-card:hover {
      border-color: var(--border-hover);
      transform: translateY(-2px);
    }
    
    .dept-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    
    .dept-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .dept-growth {
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .dept-name {
      font-size: 0.9375rem;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .dept-stats {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
    
    /* Table */
    .table-container {
      overflow-x: auto;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .table-header {
      background: var(--bg-tertiary);
    }
    
    .table-header th {
      text-align: right;
      padding: 14px 20px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    
    .table-row {
      border-bottom: 1px solid var(--border);
      transition: background 0.15s;
    }
    
    .table-row:hover {
      background: rgba(99, 102, 241, 0.03);
    }
    
    .table-cell {
      padding: 16px 20px;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    
    .employee-info {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8125rem;
      font-weight: 600;
    }
    
    .employee-details {
      display: flex;
      flex-direction: column;
    }
    
    .employee-name {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .employee-email {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .dept-badge {
      display: inline-block;
      padding: 4px 10px;
      background: var(--bg-tertiary);
      border-radius: 6px;
      font-size: 0.8125rem;
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 100px;
      font-size: 0.8125rem;
      font-weight: 500;
    }
    
    .status-active {
      background: rgba(34, 197, 94, 0.1);
      color: #4ade80;
    }
    
    .status-leave {
      background: rgba(245, 158, 11, 0.1);
      color: #fbbf24;
    }
    
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    
    .actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    
    .action-btn:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    
    .action-btn.action-delete:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
    }
    
    /* Activity */
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .activity-item {
      display: flex;
      gap: 14px;
    }
    
    .activity-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .activity-icon.join { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
    .activity-icon.leave { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
    .activity-icon.promotion { background: rgba(139, 92, 246, 0.12); color: #a78bfa; }
    
    .activity-content {
      flex: 1;
    }
    
    .activity-text {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }
    
    .activity-text strong {
      color: var(--text-primary);
      font-weight: 500;
    }
    
    .activity-time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo">HR</div>
          <div class="logo-text">
            <h1>${nameAr}</h1>
            <span class="ai-badge">AI Generated</span>
          </div>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-title">الرئيسية</div>
          <div class="nav-item active">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            لوحة التحكم
          </div>
          <div class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            الموظفون
          </div>
          <div class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            الأقسام
          </div>
        </div>
        
        <div class="nav-section">
          <div class="nav-section-title">العمليات</div>
          <div class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            الحضور والانصراف
          </div>
          <div class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            الرواتب
          </div>
          <div class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            التقارير
          </div>
        </div>
        
        <div class="nav-section">
          <div class="nav-section-title">النظام</div>
          <div class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            الإعدادات
          </div>
        </div>
      </nav>
      
      <div class="sidebar-footer">
        <div class="files-info">
          <div class="files-title">تم إنشاء ${totalFiles} ملف</div>
          <div class="files-badges">
            <span class="file-badge schema">Schema: ${schemaCount}</span>
            <span class="file-badge api">API: ${backendCount}</span>
            <span class="file-badge ui">UI: ${frontendCount}</span>
          </div>
        </div>
      </div>
    </aside>
    
    <main class="main">
      <header class="topbar">
        <div class="topbar-title">
          <h2>لوحة التحكم</h2>
          <p>مرحباً بك في ${nameAr}</p>
        </div>
        <div class="topbar-actions">
          <div class="search-box">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="بحث...">
          </div>
          <button class="btn btn-ghost">تصدير</button>
          <button class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            إضافة موظف
          </button>
        </div>
      </header>
      
      <div class="content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">إجمالي الموظفين</span>
              <div class="stat-icon purple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
            </div>
            <div class="stat-value">${totalEmployees}</div>
            <div class="stat-change positive">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              +12% من الشهر الماضي
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">الأقسام النشطة</span>
              <div class="stat-icon pink">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
            </div>
            <div class="stat-value">${departments.length}</div>
            <div class="stat-change neutral">أقسام فعّالة</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">الحاضرون اليوم</span>
              <div class="stat-icon green">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
            </div>
            <div class="stat-value">${Math.floor(totalEmployees * 0.94)}</div>
            <div class="stat-change positive">94% نسبة الحضور</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">طلبات معلقة</span>
              <div class="stat-icon amber">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
            </div>
            <div class="stat-value">7</div>
            <div class="stat-change neutral">بانتظار الموافقة</div>
          </div>
        </div>
        
        <div class="cards-grid">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">الأقسام</h3>
              <span class="card-action">عرض الكل</span>
            </div>
            <div class="card-body">
              <div class="depts-grid">
                ${departmentCards}
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">آخر النشاطات</h3>
              <span class="card-action">عرض الكل</span>
            </div>
            <div class="card-body">
              <div class="activity-list">
                <div class="activity-item">
                  <div class="activity-icon join">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                  </div>
                  <div class="activity-content">
                    <p class="activity-text">انضم <strong>أحمد محمد</strong> إلى قسم الهندسة</p>
                    <span class="activity-time">منذ ساعتين</span>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon promotion">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  </div>
                  <div class="activity-content">
                    <p class="activity-text">تمت ترقية <strong>سارة علي</strong> إلى مديرة</p>
                    <span class="activity-time">منذ 5 ساعات</span>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon leave">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div class="activity-content">
                    <p class="activity-text">طلب <strong>عمر حسن</strong> إجازة لمدة 3 أيام</p>
                    <span class="activity-time">منذ يوم</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">الموظفون</h3>
            <span class="card-action">عرض الكل</span>
          </div>
          <div class="table-container">
            <table>
              <thead class="table-header">
                <tr>
                  <th>الموظف</th>
                  <th>المسمى الوظيفي</th>
                  <th>القسم</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${employeeRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
  
  <script>
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
      });
    });
  </script>
</body>
</html>`;
}
