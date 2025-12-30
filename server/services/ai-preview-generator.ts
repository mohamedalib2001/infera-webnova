/**
 * AI Preview Generator
 * Generates professional HTML previews for AI-built platforms
 * يولد معاينات HTML احترافية للمنصات المبنية بالذكاء الاصطناعي
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
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%); color: #fff; }
    .container { text-align: center; padding: 40px; }
    .logo { font-size: 3rem; margin-bottom: 20px; }
    .loader { width: 80px; height: 80px; border: 4px solid rgba(124, 58, 237, 0.2); border-top: 4px solid #7c3aed; border-radius: 50%; animation: spin 1s linear infinite; margin: 30px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    h2 { font-size: 1.5rem; margin-bottom: 15px; color: #e5e5e5; }
    .progress-bar { width: 300px; height: 8px; background: rgba(124, 58, 237, 0.2); border-radius: 4px; margin: 20px auto; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #7c3aed, #ec4899); width: ${progress}%; transition: width 0.5s; }
    .stage { color: #9ca3af; font-size: 0.9rem; margin-top: 10px; }
    .percent { font-size: 2rem; font-weight: bold; background: linear-gradient(90deg, #7c3aed, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🔮</div>
    <div class="loader"></div>
    <h2>جاري بناء ${name}</h2>
    <div class="progress-bar"><div class="progress-fill"></div></div>
    <p class="percent">${progress}%</p>
    <p class="stage">${stageAr[stage] || stage}</p>
  </div>
</body>
</html>`;
}

function generateEmployeeData(): { name: string; nameAr: string; role: string; roleAr: string; department: string; departmentAr: string; status: string; avatar: string }[] {
  return [
    { name: 'Ahmed Mohamed', nameAr: 'أحمد محمد', role: 'Software Engineer', roleAr: 'مهندس برمجيات', department: 'Engineering', departmentAr: 'الهندسة', status: 'active', avatar: 'AM' },
    { name: 'Sara Ali', nameAr: 'سارة علي', role: 'HR Manager', roleAr: 'مديرة الموارد البشرية', department: 'Human Resources', departmentAr: 'الموارد البشرية', status: 'active', avatar: 'SA' },
    { name: 'Omar Hassan', nameAr: 'عمر حسن', role: 'Product Designer', roleAr: 'مصمم منتجات', department: 'Design', departmentAr: 'التصميم', status: 'active', avatar: 'OH' },
    { name: 'Fatima Khalid', nameAr: 'فاطمة خالد', role: 'Finance Analyst', roleAr: 'محللة مالية', department: 'Finance', departmentAr: 'المالية', status: 'on-leave', avatar: 'FK' },
    { name: 'Youssef Ibrahim', nameAr: 'يوسف إبراهيم', role: 'DevOps Engineer', roleAr: 'مهندس DevOps', department: 'Engineering', departmentAr: 'الهندسة', status: 'active', avatar: 'YI' },
  ];
}

function generateDepartmentData(): { name: string; nameAr: string; count: number; manager: string; managerAr: string; color: string }[] {
  return [
    { name: 'Engineering', nameAr: 'الهندسة', count: 24, manager: 'Mohamed Salem', managerAr: 'محمد سالم', color: '#7c3aed' },
    { name: 'Human Resources', nameAr: 'الموارد البشرية', count: 8, manager: 'Sara Ali', managerAr: 'سارة علي', color: '#ec4899' },
    { name: 'Finance', nameAr: 'المالية', count: 12, manager: 'Khaled Ahmed', managerAr: 'خالد أحمد', color: '#10b981' },
    { name: 'Design', nameAr: 'التصميم', count: 6, manager: 'Layla Hassan', managerAr: 'ليلى حسن', color: '#f59e0b' },
    { name: 'Marketing', nameAr: 'التسويق', count: 10, manager: 'Nour Mahmoud', managerAr: 'نور محمود', color: '#3b82f6' },
  ];
}

export function generatePlatformPreview(blueprint: Blueprint, artifacts: BlueprintArtifacts): string {
  const name = blueprint.name || 'HR Platform';
  const nameAr = (blueprint as any).nameAr || 'منصة الموارد البشرية';
  const sector = blueprint.sector || 'enterprise';
  
  const employees = generateEmployeeData();
  const departments = generateDepartmentData();
  
  const totalEmployees = departments.reduce((sum, d) => sum + d.count, 0);
  const schemaCount = artifacts.schema?.length || 0;
  const backendCount = artifacts.backend?.length || 0;
  const frontendCount = artifacts.frontend?.length || 0;
  const totalFiles = schemaCount + backendCount + frontendCount;
  
  const employeeRows = employees.map(emp => `
    <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td class="py-3 px-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">${emp.avatar}</div>
          <div>
            <div class="font-medium text-white">${emp.nameAr}</div>
            <div class="text-xs text-gray-500">${emp.name}</div>
          </div>
        </div>
      </td>
      <td class="py-3 px-4 text-gray-300">${emp.roleAr}</td>
      <td class="py-3 px-4 text-gray-300">${emp.departmentAr}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-1 rounded-full text-xs ${emp.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}">
          ${emp.status === 'active' ? 'نشط' : 'إجازة'}
        </span>
      </td>
      <td class="py-3 px-4">
        <button class="text-purple-400 hover:text-purple-300 text-sm">عرض التفاصيل</button>
      </td>
    </tr>
  `).join('');
  
  const departmentCards = departments.map(dept => `
    <div class="card rounded-xl p-5 hover:border-purple-500/40 transition-all cursor-pointer">
      <div class="flex items-center justify-between mb-4">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl" style="background: ${dept.color}20; color: ${dept.color};">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <span class="text-2xl font-bold text-white">${dept.count}</span>
      </div>
      <h3 class="font-semibold text-white mb-1">${dept.nameAr}</h3>
      <p class="text-sm text-gray-400">المدير: ${dept.managerAr}</p>
    </div>
  `).join('');
  
  const features = blueprint.features || [];
  const featureItems = features.slice(0, 6).map((f: any) => {
    const featureName = typeof f === 'string' ? f : (f.name || f);
    return `<li class="flex items-center gap-2 text-gray-300">
      <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      ${featureName}
    </li>`;
  }).join('');
  
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nameAr} - INFERA WebNova</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #0a0a0f; color: #e5e5e5; min-height: 100vh; }
    
    .gradient-text { background: linear-gradient(90deg, #7c3aed, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .card { background: rgba(20, 20, 35, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(124, 58, 237, 0.15); }
    
    .sidebar { width: 280px; background: rgba(15, 15, 25, 0.95); border-left: 1px solid rgba(124, 58, 237, 0.2); height: 100vh; position: fixed; right: 0; top: 0; padding: 20px; }
    .main { margin-right: 280px; padding: 24px; }
    
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; color: #9ca3af; cursor: pointer; transition: all 0.2s; margin-bottom: 4px; }
    .nav-item:hover { background: rgba(124, 58, 237, 0.1); color: #e5e5e5; }
    .nav-item.active { background: linear-gradient(90deg, rgba(124, 58, 237, 0.2), rgba(236, 72, 153, 0.1)); color: #fff; border-right: 3px solid #7c3aed; }
    
    .stat-card { background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%); border: 1px solid rgba(124, 58, 237, 0.2); border-radius: 16px; padding: 24px; }
    
    .btn-primary { background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 30px rgba(124, 58, 237, 0.3); }
    
    .search-box { background: rgba(30, 30, 50, 0.8); border: 1px solid rgba(124, 58, 237, 0.2); border-radius: 10px; padding: 10px 16px; color: white; width: 300px; }
    .search-box:focus { outline: none; border-color: #7c3aed; }
    
    table { width: 100%; border-collapse: collapse; }
    th { text-align: right; padding: 12px 16px; color: #9ca3af; font-weight: 500; font-size: 0.85rem; border-bottom: 1px solid rgba(124, 58, 237, 0.2); }
    
    .badge-ai { background: linear-gradient(90deg, #7c3aed, #ec4899); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    
    .topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid rgba(124, 58, 237, 0.1); margin-bottom: 24px; }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-in { animation: fadeIn 0.5s ease-out forwards; }
  </style>
</head>
<body>
  <aside class="sidebar">
    <div class="flex items-center gap-3 mb-8 pb-6 border-b border-purple-500/20">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">HR</div>
      <div>
        <h1 class="font-bold text-white">${nameAr}</h1>
        <span class="badge-ai">AI Generated</span>
      </div>
    </div>
    
    <nav>
      <div class="nav-item active">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        لوحة التحكم
      </div>
      <div class="nav-item">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        الموظفون
      </div>
      <div class="nav-item">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        الأقسام
      </div>
      <div class="nav-item">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        الحضور والانصراف
      </div>
      <div class="nav-item">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        الرواتب
      </div>
      <div class="nav-item">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        التقارير
      </div>
      <div class="nav-item">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        الإعدادات
      </div>
    </nav>
    
    <div class="absolute bottom-6 right-6 left-6">
      <div class="card rounded-xl p-4">
        <p class="text-xs text-gray-400 mb-2">تم إنشاء ${totalFiles} ملف</p>
        <div class="flex gap-2 text-xs">
          <span class="px-2 py-1 rounded bg-blue-500/20 text-blue-400">Schema: ${schemaCount}</span>
          <span class="px-2 py-1 rounded bg-green-500/20 text-green-400">API: ${backendCount}</span>
          <span class="px-2 py-1 rounded bg-purple-500/20 text-purple-400">UI: ${frontendCount}</span>
        </div>
      </div>
    </div>
  </aside>
  
  <main class="main">
    <div class="topbar">
      <div>
        <h2 class="text-2xl font-bold text-white mb-1">مرحباً بك في ${nameAr}</h2>
        <p class="text-gray-400">لوحة تحكم شاملة لإدارة الموارد البشرية</p>
      </div>
      <div class="flex items-center gap-4">
        <input type="text" placeholder="بحث..." class="search-box">
        <button class="btn-primary">+ إضافة موظف</button>
      </div>
    </div>
    
    <div class="grid grid-cols-4 gap-6 mb-8 animate-in" style="display: grid; grid-template-columns: repeat(4, 1fr);">
      <div class="stat-card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-400">إجمالي الموظفين</span>
          <div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
        </div>
        <p class="text-3xl font-bold text-white">${totalEmployees}</p>
        <p class="text-sm text-green-400 mt-2">+12% من الشهر الماضي</p>
      </div>
      
      <div class="stat-card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-400">الأقسام</span>
          <div class="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          </div>
        </div>
        <p class="text-3xl font-bold text-white">${departments.length}</p>
        <p class="text-sm text-gray-400 mt-2">أقسام نشطة</p>
      </div>
      
      <div class="stat-card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-400">الحاضرون اليوم</span>
          <div class="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
        </div>
        <p class="text-3xl font-bold text-white">${Math.floor(totalEmployees * 0.92)}</p>
        <p class="text-sm text-gray-400 mt-2">92% نسبة الحضور</p>
      </div>
      
      <div class="stat-card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-400">طلبات الإجازة</span>
          <div class="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
        </div>
        <p class="text-3xl font-bold text-white">8</p>
        <p class="text-sm text-yellow-400 mt-2">3 بانتظار الموافقة</p>
      </div>
    </div>
    
    <div class="grid gap-6 mb-8" style="display: grid; grid-template-columns: 1fr 1fr;">
      <div class="card rounded-xl p-6 animate-in" style="animation-delay: 0.1s;">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-white">الأقسام</h3>
          <button class="text-purple-400 hover:text-purple-300 text-sm">عرض الكل</button>
        </div>
        <div class="grid grid-cols-2 gap-4" style="display: grid; grid-template-columns: repeat(2, 1fr);">
          ${departmentCards}
        </div>
      </div>
      
      <div class="card rounded-xl p-6 animate-in" style="animation-delay: 0.2s;">
        <h3 class="text-lg font-semibold text-white mb-6">الميزات المُفعّلة</h3>
        <ul class="space-y-3" style="display: flex; flex-direction: column; gap: 12px;">
          ${featureItems}
        </ul>
        <div class="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <p class="text-sm text-gray-300">تم إنشاء هذه المنصة بالكامل بواسطة الذكاء الاصطناعي</p>
        </div>
      </div>
    </div>
    
    <div class="card rounded-xl p-6 animate-in" style="animation-delay: 0.3s;">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-white">الموظفون</h3>
        <div class="flex gap-3">
          <button class="px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-colors text-sm">تصدير</button>
          <button class="btn-primary text-sm">+ إضافة موظف</button>
        </div>
      </div>
      <table>
        <thead>
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
  </main>
  
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
