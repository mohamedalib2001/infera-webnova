/**
 * Preview Runtime Service
 * Uses ESBuild to compile generated React applications for live preview
 */

import * as esbuild from 'esbuild';
import { BlueprintArtifacts, Blueprint, GeneratedFile } from './types';
import * as path from 'path';
import * as fs from 'fs';

interface PreviewBundle {
  html: string;
  js: string;
  css: string;
  mockData: Record<string, any[]>;
}

// Cache for compiled bundles
const bundleCache = new Map<string, PreviewBundle>();

/**
 * Generate a live preview bundle from artifacts using ESBuild
 */
export async function generatePreviewBundle(
  blueprint: Blueprint,
  artifacts: BlueprintArtifacts
): Promise<PreviewBundle> {
  const cacheKey = `${blueprint.id}-${Date.now()}`;
  
  // Check cache
  const cached = bundleCache.get(blueprint.id);
  if (cached) {
    return cached;
  }
  
  try {
    // Generate mock data based on blueprint entities
    const mockData = generateMockData(blueprint);
    
    // Build using ESBuild with virtual file system
    const result = await buildWithESBuild(blueprint, artifacts, mockData);
    
    const bundle: PreviewBundle = {
      html: result.html,
      js: result.js,
      css: result.css,
      mockData
    };
    
    // Cache the result
    bundleCache.set(blueprint.id, bundle);
    
    return bundle;
  } catch (error) {
    console.error('[PreviewRuntime] ESBuild failed, falling back to template:', error);
    // Fallback to template-based preview
    return generateTemplatePreview(blueprint, artifacts);
  }
}

/**
 * Build with ESBuild using virtual file system
 */
async function buildWithESBuild(
  blueprint: Blueprint,
  artifacts: BlueprintArtifacts,
  mockData: Record<string, any[]>
): Promise<{ html: string; js: string; css: string }> {
  
  // Create a virtual module that exports the app
  const virtualEntry = createVirtualEntry(blueprint, artifacts, mockData);
  
  try {
    // Use ESBuild to transform JSX with classic React.createElement
    // This works with React loaded from CDN onto window.React
    const jsxResult = await esbuild.transform(virtualEntry, {
      loader: 'tsx',
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      target: 'es2020',
      minify: false,
    });
    
    // Generate CSS
    const css = generatePreviewCSS(blueprint);
    
    // Generate HTML shell
    const html = generatePreviewHTML(blueprint, jsxResult.code, css, mockData);
    
    return {
      html,
      js: jsxResult.code,
      css
    };
  } catch (error) {
    console.error('[PreviewRuntime] ESBuild transform error:', error);
    throw error;
  }
}

/**
 * Create virtual entry point for ESBuild
 */
function createVirtualEntry(
  blueprint: Blueprint,
  artifacts: BlueprintArtifacts,
  mockData: Record<string, any[]>
): string {
  const entities = blueprint.dataModel.entities;
  const pages = blueprint.frontend.pages;
  const navItems = blueprint.frontend.navigation.items;
  const theme = blueprint.frontend.theme;
  
  // Generate entity table components
  const entityTables = entities.map(entity => {
    const fields = entity.fields.filter(f => 
      !['id', 'createdAt', 'updatedAt', 'deletedAt', 'tenantId'].includes(f.name)
    ).slice(0, 6);
    
    const headerCells = fields.map(f => 
      `<th key="${f.name}" className="table-header">${f.nameAr || f.name}</th>`
    ).join('\n                ');
    
    const dataCells = fields.map(f => 
      `<td key="${f.name}" className="table-cell">{formatValue(item.${f.name})}</td>`
    ).join('\n                  ');
    
    return `
  function ${entity.name}Table({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
      return <div className="empty-state">لا توجد بيانات للعرض</div>;
    }
    
    return (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              ${headerCells}
              <th className="table-header">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={item.id || idx} className="table-row">
                ${dataCells}
                <td className="table-cell">
                  <div className="action-buttons">
                    <button className="action-btn view" onClick={() => handleAction('view', item.id)}>
                      <EyeIcon />
                    </button>
                    <button className="action-btn edit" onClick={() => handleAction('edit', item.id)}>
                      <EditIcon />
                    </button>
                    <button className="action-btn delete" onClick={() => handleAction('delete', item.id)}>
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }`;
  }).join('\n');
  
  // Generate entity forms
  const entityForms = entities.map(entity => {
    const fields = entity.fields.filter(f => 
      !['id', 'createdAt', 'updatedAt', 'deletedAt', 'tenantId'].includes(f.name)
    );
    
    const formFields = fields.map(f => {
      const inputType = f.type === 'boolean' ? 'checkbox' : 
                        f.type === 'number' || f.type === 'integer' ? 'number' :
                        f.type === 'date' || f.type === 'datetime' ? 'date' :
                        f.type === 'email' ? 'email' : 'text';
      
      if (f.type === 'boolean') {
        return `
        <div key="${f.name}" className="form-field checkbox">
          <label className="checkbox-label">
            <input 
              type="checkbox"
              name="${f.name}"
              checked={formData.${f.name} || false}
              onChange={handleChange}
            />
            <span>${f.nameAr || f.name}</span>
          </label>
        </div>`;
      }
      
      if (f.type === 'enum' && f.enumValues) {
        return `
        <div key="${f.name}" className="form-field">
          <label className="form-label">${f.nameAr || f.name}${f.required ? ' *' : ''}</label>
          <select 
            name="${f.name}"
            value={formData.${f.name} || ''}
            onChange={handleChange}
            className="form-select"
            ${f.required ? 'required' : ''}
          >
            <option value="">اختر...</option>
            ${f.enumValues.map(v => `<option value="${v}">${v}</option>`).join('\n            ')}
          </select>
        </div>`;
      }
      
      return `
        <div key="${f.name}" className="form-field">
          <label className="form-label">${f.nameAr || f.name}${f.required ? ' *' : ''}</label>
          <input 
            type="${inputType}"
            name="${f.name}"
            value={formData.${f.name} || ''}
            onChange={handleChange}
            className="form-input"
            placeholder="${f.nameAr || f.name}"
            ${f.required ? 'required' : ''}
          />
        </div>`;
    }).join('');
    
    return `
  function ${entity.name}Form({ defaultValues, onSubmit, onCancel }: { defaultValues?: any; onSubmit: (data: any) => void; onCancel: () => void }) {
    const [formData, setFormData] = React.useState(defaultValues || {});
    const [loading, setLoading] = React.useState(false);
    
    const handleChange = (e: any) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev: any) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    };
    
    const handleSubmit = async (e: any) => {
      e.preventDefault();
      setLoading(true);
      await new Promise(r => setTimeout(r, 500));
      onSubmit(formData);
      setLoading(false);
      showToast('تم الحفظ بنجاح');
    };
    
    return (
      <form onSubmit={handleSubmit} className="entity-form">
        ${formFields}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            إلغاء
          </button>
        </div>
      </form>
    );
  }`;
  }).join('\n');
  
  // Generate page components
  const pageComponents = pages.map(page => {
    const isListPage = page.name.endsWith('List');
    const isFormPage = page.name.endsWith('Form');
    const entityName = page.name.replace(/List$|Form$/, '');
    const entity = entities.find(e => e.name === entityName);
    
    if (page.name === 'Dashboard') {
      const statCards = entities.slice(0, 4).map((e, i) => `
          <div key="${e.name}" className="stat-card">
            <div className="stat-icon" style={{ background: '${getEntityColor(i)}20', color: '${getEntityColor(i)}' }}>
              <DatabaseIcon />
            </div>
            <div className="stat-content">
              <span className="stat-value">{mockData['${e.tableName}']?.length || 0}</span>
              <span className="stat-label">${e.nameAr}</span>
            </div>
          </div>`
      ).join('');
      
      return `
  function Dashboard() {
    return (
      <div className="page dashboard-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">لوحة التحكم</h1>
            <p className="page-subtitle">مرحباً بك في ${blueprint.name}</p>
          </div>
        </div>
        
        <div className="stats-grid">
          ${statCards}
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3 className="card-title">النشاط الأخير</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon"><UserIcon /></div>
                <div className="activity-content">
                  <p>تم إضافة موظف جديد</p>
                  <span className="activity-time">منذ 5 دقائق</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon"><EditIcon /></div>
                <div className="activity-content">
                  <p>تم تحديث بيانات</p>
                  <span className="activity-time">منذ 15 دقيقة</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon"><CheckIcon /></div>
                <div className="activity-content">
                  <p>تمت الموافقة على طلب</p>
                  <span className="activity-time">منذ ساعة</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3 className="card-title">إحصائيات سريعة</h3>
            <div className="quick-stats">
              <div className="quick-stat">
                <span className="quick-stat-value text-green">+12%</span>
                <span className="quick-stat-label">نمو هذا الشهر</span>
              </div>
              <div className="quick-stat">
                <span className="quick-stat-value text-blue">85%</span>
                <span className="quick-stat-label">معدل الإنجاز</span>
              </div>
              <div className="quick-stat">
                <span className="quick-stat-value text-purple">24</span>
                <span className="quick-stat-label">مهام قيد التنفيذ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }`;
    } else if (isListPage && entity) {
      return `
  function ${page.name}() {
    const [data, setData] = React.useState(window.dataManager?.getAll('${entity.tableName}') || []);
    const [showForm, setShowForm] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState<any>(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    
    // Subscribe to DataManager updates
    React.useEffect(() => {
      if (window.dataManager) {
        const unsubscribe = window.dataManager.subscribe('${entity.tableName}', (newData) => {
          setData(newData);
        });
        // Load initial data from DataManager
        setData(window.dataManager.getAll('${entity.tableName}'));
        return unsubscribe;
      }
    }, []);
    
    const filteredData = data.filter((item: any) => {
      if (!searchTerm) return true;
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    
    const handleAdd = () => {
      setEditingItem(null);
      setShowForm(true);
    };
    
    const handleEdit = (item: any) => {
      setEditingItem(item);
      setShowForm(true);
    };
    
    const handleDelete = (id: number) => {
      if (confirm('هل أنت متأكد من الحذف؟')) {
        if (window.dataManager) {
          window.dataManager.delete('${entity.tableName}', id);
        } else {
          setData((prev: any[]) => prev.filter(item => item.id !== id));
        }
        showToast('تم الحذف بنجاح');
      }
    };
    
    const handleSubmit = (formData: any) => {
      if (window.dataManager) {
        if (editingItem) {
          window.dataManager.update('${entity.tableName}', editingItem.id, formData);
        } else {
          window.dataManager.create('${entity.tableName}', formData);
        }
      } else {
        if (editingItem) {
          setData((prev: any[]) => prev.map(item => 
            item.id === editingItem.id ? { ...item, ...formData } : item
          ));
        } else {
          const newId = Math.max(0, ...data.map((d: any) => d.id)) + 1;
          setData((prev: any[]) => [...prev, { ...formData, id: newId }]);
        }
      }
      setShowForm(false);
    };
    
    // Expose handleAction globally for table buttons
    React.useEffect(() => {
      (window as any).handleEntityAction = (action: string, id: number) => {
        if (action === 'view') {
          const item = data.find((d: any) => d.id === id);
          if (item) {
            showToast('عرض: ' + JSON.stringify(item, null, 2).substring(0, 100));
          }
        } else if (action === 'edit') {
          const item = data.find((d: any) => d.id === id);
          if (item) handleEdit(item);
        } else if (action === 'delete') {
          handleDelete(id);
        }
      };
    }, [data]);
    
    return (
      <div className="page list-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">${entity.nameAr}</h1>
            <p className="page-subtitle">إدارة ${entity.nameAr} ({filteredData.length} سجل)</p>
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>
            <PlusIcon /> إضافة جديد
          </button>
        </div>
        
        <div className="card">
          <div className="card-toolbar">
            <div className="search-box">
              <SearchIcon />
              <input 
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="toolbar-actions">
              <button className="btn btn-ghost">
                <FilterIcon /> تصفية
              </button>
              <button className="btn btn-ghost">
                <DownloadIcon /> تصدير
              </button>
            </div>
          </div>
          
          <${entity.name}Table data={filteredData} />
          
          {filteredData.length > 0 && (
            <div className="table-footer">
              <span>عرض {filteredData.length} من {data.length} سجل</span>
            </div>
          )}
        </div>
        
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingItem ? 'تعديل' : 'إضافة'} ${entity.nameAr}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <${entity.name}Form 
                  defaultValues={editingItem} 
                  onSubmit={handleSubmit}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }`;
    } else if (isFormPage && entity) {
      return `
  function ${page.name}() {
    const handleSubmit = (data: any) => {
      showToast('تم الحفظ بنجاح');
      navigate('/');
    };
    
    return (
      <div className="page form-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">${page.titleAr || page.title || entity.nameAr}</h1>
            <p className="page-subtitle">إضافة ${entity.nameAr} جديد</p>
          </div>
        </div>
        
        <div className="card">
          <${entity.name}Form 
            onSubmit={handleSubmit}
            onCancel={() => navigate('/')}
          />
        </div>
      </div>
    );
  }`;
    } else {
      return `
  function ${page.name}() {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">${page.titleAr || page.title || page.name}</h1>
        </div>
        <div className="card">
          <p className="text-muted">محتوى الصفحة</p>
        </div>
      </div>
    );
  }`;
    }
  }).join('\n');
  
  // Generate navigation items
  const navItemsArray = navItems.map(item => ({
    path: item.path,
    label: item.labelAr,
    icon: item.icon || 'LayoutDashboard'
  }));
  
  return `
// Generated Preview Bundle for ${blueprint.name}
// Blueprint ID: ${blueprint.id}

const React = window.React;
const ReactDOM = window.ReactDOM;

// Mock Data
const mockData: Record<string, any[]> = ${JSON.stringify(mockData, null, 2)};

// Toast System
let toastTimeout: number;
function showToast(message: string) {
  let toast = document.getElementById('preview-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'preview-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast!.classList.remove('show'), 3000);
}

// Simple Router
let currentPath = '/';
const routeListeners: ((path: string) => void)[] = [];

function navigate(path: string) {
  currentPath = path;
  routeListeners.forEach(fn => fn(path));
  window.history.pushState({}, '', '#' + path);
}

function useLocation(): string {
  const [path, setPath] = React.useState(currentPath);
  React.useEffect(() => {
    routeListeners.push(setPath);
    return () => {
      const idx = routeListeners.indexOf(setPath);
      if (idx > -1) routeListeners.splice(idx, 1);
    };
  }, []);
  return path;
}

// Format value for display
function formatValue(val: any): string {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'boolean') return val ? 'نعم' : 'لا';
  if (typeof val === 'number') return val.toLocaleString('ar-EG');
  return String(val);
}

// Handle table actions
function handleAction(action: string, id: number) {
  if ((window as any).handleEntityAction) {
    (window as any).handleEntityAction(action, id);
  } else {
    showToast(action + ' ' + id);
  }
}

// Icons
function LayoutDashboardIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;
}
function UsersIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function DatabaseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
}
function SettingsIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function UserIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function EyeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function EditIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function TrashIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
}
function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function FilterIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
}
function DownloadIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
}
function MenuIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function ChevronLeftIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>;
}
function ChevronRightIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
}
function BellIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}

// Get icon component by name
function getIcon(name: string) {
  const icons: Record<string, () => JSX.Element> = {
    LayoutDashboard: LayoutDashboardIcon,
    Users: UsersIcon,
    Database: DatabaseIcon,
    Settings: SettingsIcon,
    User: UserIcon
  };
  return icons[name] || DatabaseIcon;
}

// Entity Tables
${entityTables}

// Entity Forms
${entityForms}

// Page Components
${pageComponents}

// Settings Page
function SettingsPage() {
  const [theme, setTheme] = React.useState('dark');
  const [language, setLanguage] = React.useState('ar');
  
  return (
    <div className="page settings-page">
      <div className="page-header">
        <h1 className="page-title">الإعدادات</h1>
      </div>
      
      <div className="settings-sections">
        <div className="card settings-card">
          <h3 className="settings-title">الإعدادات العامة</h3>
          
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">اللغة</span>
              <span className="setting-desc">اختر لغة الواجهة</span>
            </div>
            <select 
              value={language} 
              onChange={(e) => { setLanguage(e.target.value); showToast('تم تغيير اللغة'); }}
              className="form-select compact"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">الوضع</span>
              <span className="setting-desc">الوضع الليلي أو النهاري</span>
            </div>
            <button 
              className={"toggle-button " + (theme === 'dark' ? 'active' : '')}
              onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); showToast('تم تغيير الوضع'); }}
            >
              {theme === 'dark' ? 'ليلي' : 'نهاري'}
            </button>
          </div>
        </div>
        
        <div className="card settings-card">
          <h3 className="settings-title">الحساب</h3>
          
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">البريد الإلكتروني</span>
              <span className="setting-desc">admin@${blueprint.name.toLowerCase().replace(/\s+/g, '')}.com</span>
            </div>
            <button className="btn btn-ghost compact" onClick={() => showToast('تعديل البريد')}>تعديل</button>
          </div>
          
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">كلمة المرور</span>
              <span className="setting-desc">آخر تغيير منذ 30 يوم</span>
            </div>
            <button className="btn btn-ghost compact" onClick={() => showToast('تغيير كلمة المرور')}>تغيير</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation Items
const navItems = ${JSON.stringify(navItemsArray)};

// Sidebar Component
function Sidebar({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const location = useLocation();
  
  return (
    <aside className={"sidebar " + (isOpen ? 'open' : 'collapsed')}>
      <div className="sidebar-header">
        <div className="logo" onClick={() => navigate('/')}>
          <span className="logo-icon">N</span>
          {isOpen && <span className="logo-text">${blueprint.name}</span>}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>
          {isOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item: any, idx: number) => {
          const Icon = getIcon(item.icon);
          const isActive = location === item.path;
          return (
            <button
              key={idx}
              className={"nav-item " + (isActive ? 'active' : '')}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon"><Icon /></span>
              {isOpen && <span className="nav-label">{item.label}</span>}
            </button>
          );
        })}
        
        <div className="nav-divider" />
        
        <button
          className={"nav-item " + (location === '/settings' ? 'active' : '')}
          onClick={() => navigate('/settings')}
        >
          <span className="nav-icon"><SettingsIcon /></span>
          {isOpen && <span className="nav-label">الإعدادات</span>}
        </button>
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">م</div>
          {isOpen && (
            <div className="user-info">
              <span className="user-name">مدير النظام</span>
              <span className="user-role">مسؤول</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// Header Component
function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="main-header">
      <button className="header-menu-btn" onClick={onMenuClick}>
        <MenuIcon />
      </button>
      
      <div className="header-title">${blueprint.name}</div>
      
      <div className="header-actions">
        <button className="header-btn" onClick={() => showToast('الإشعارات')}>
          <BellIcon />
          <span className="notification-badge">3</span>
        </button>
        <div className="header-user" onClick={() => showToast('الملف الشخصي')}>
          <div className="header-avatar">م</div>
        </div>
      </div>
    </header>
  );
}

// Route mapping
const routes: Record<string, () => JSX.Element> = {
  '/': Dashboard,
  ${pages.map(p => `'${p.path}': ${p.name}`).join(',\n  ')},
  '/settings': SettingsPage
};

// Main App Component
function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const location = useLocation();
  
  const CurrentPage = routes[location] || Dashboard;
  
  React.useEffect(() => {
    // Handle hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || '/';
      if (hash !== currentPath) {
        currentPath = hash;
        routeListeners.forEach(fn => fn(hash));
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={"main-wrapper " + (sidebarOpen ? '' : 'sidebar-collapsed')}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="main-content">
          <CurrentPage />
        </main>
      </div>
    </div>
  );
}

// Render
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
`;
}

function getEntityColor(index: number): string {
  const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];
  return colors[index % colors.length];
}

/**
 * Generate CSS for the preview
 */
function generatePreviewCSS(blueprint: Blueprint): string {
  const theme = blueprint.frontend.theme;
  const primaryColor = theme.primaryColor || '#6366f1';
  const accentColor = theme.accentColor || '#8b5cf6';
  
  return `
:root {
  --primary: ${primaryColor};
  --primary-hover: ${adjustColor(primaryColor, -15)};
  --accent: ${accentColor};
  --bg-primary: #09090b;
  --bg-secondary: #18181b;
  --bg-tertiary: #27272a;
  --bg-card: #1c1c1f;
  --border: #27272a;
  --border-hover: #3f3f46;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --radius: 10px;
  --sidebar-width: 280px;
  --sidebar-collapsed: 72px;
  --header-height: 64px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Cairo', 'Inter', -apple-system, system-ui, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  direction: rtl;
  line-height: 1.6;
  overflow: hidden;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed);
}

.sidebar-header {
  height: var(--header-height);
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  overflow: hidden;
}

.logo-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  color: white;
}

.logo-text {
  font-weight: 600;
  font-size: 1rem;
  white-space: nowrap;
}

.sidebar-toggle {
  width: 28px;
  height: 28px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.sidebar-toggle:hover {
  background: var(--border);
  color: var(--text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  text-align: right;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.9rem;
  font-family: inherit;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-item.active {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  font-weight: 500;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-divider {
  height: 1px;
  background: var(--border);
  margin: 12px 0;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.user-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-weight: 500;
  font-size: 0.875rem;
  white-space: nowrap;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Main Wrapper */
.main-wrapper {
  flex: 1;
  margin-right: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-right 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-wrapper.sidebar-collapsed {
  margin-right: var(--sidebar-collapsed);
}

/* Header */
.main-header {
  height: var(--header-height);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-menu-btn {
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-menu-btn:hover {
  background: var(--bg-tertiary);
}

.header-title {
  flex: 1;
  font-weight: 600;
  font-size: 1.125rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-btn {
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.header-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  background: var(--danger);
  border-radius: 50%;
  font-size: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-user {
  cursor: pointer;
}

.header-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: white;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: var(--bg-primary);
}

/* Page Styles */
.page {
  max-width: 1400px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Cards */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

/* Search */
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0 12px;
  min-width: 280px;
}

.search-box svg {
  color: var(--text-muted);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  padding: 10px 0;
  font-size: 0.875rem;
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--text-muted);
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
}

.dashboard-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 16px;
}

/* Activity */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius);
}

.activity-icon {
  width: 36px;
  height: 36px;
  background: var(--primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.activity-content p {
  font-size: 0.875rem;
  margin-bottom: 2px;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Quick Stats */
.quick-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius);
}

.quick-stat-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.quick-stat-label {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.text-green { color: var(--success); }
.text-blue { color: #3b82f6; }
.text-purple { color: var(--accent); }

/* Tables */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  text-align: right;
  padding: 14px 20px;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  font-size: 0.875rem;
  white-space: nowrap;
}

.table-cell {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  font-size: 0.875rem;
}

.table-row {
  transition: background 0.15s ease;
}

.table-row:hover {
  background: var(--bg-tertiary);
}

.table-footer {
  padding: 14px 20px;
  color: var(--text-muted);
  font-size: 0.875rem;
  border-top: 1px solid var(--border);
}

/* Actions */
.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--border);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn.compact {
  padding: 6px 12px;
  font-size: 0.8125rem;
}

/* Forms */
.entity-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.checkbox {
  flex-direction: row;
  align-items: center;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-input, .form-select {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--primary);
}

.form-select.compact {
  padding: 8px 12px;
  min-width: 120px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
}

.modal-close {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 6px;
  font-size: 1.25rem;
}

.modal-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 60px);
}

/* Settings */
.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-card {
  padding: 20px;
}

.settings-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  gap: 16px;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-label {
  font-weight: 500;
}

.setting-desc {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.toggle-button {
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-primary);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.875rem;
  transition: all 0.15s ease;
}

.toggle-button:hover {
  background: var(--border);
}

.toggle-button.active {
  background: var(--primary);
  border-color: var(--primary);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px;
  color: var(--text-muted);
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 14px 24px;
  border-radius: var(--radius);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
}

.toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(100%);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .main-wrapper {
    margin-right: 0;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .card-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
`;
}

function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Generate preview HTML shell with DevTools
 */
function generatePreviewHTML(
  blueprint: Blueprint,
  jsCode: string,
  css: string,
  mockData: Record<string, any[]>
): string {
  const devToolsScript = `
// ========== INFERA DevTools ==========
const BLUEPRINT_ID = '${blueprint.id}';
const STORAGE_KEY = 'infera_preview_data_' + BLUEPRINT_ID;

// Console Logger
class InferaConsole {
  constructor() {
    this.logs = [];
    this.listeners = [];
  }
  
  log(type, message, data = null) {
    const entry = { 
      id: Date.now(), 
      type, 
      message, 
      data,
      timestamp: new Date().toLocaleTimeString('ar-EG')
    };
    this.logs.push(entry);
    this.listeners.forEach(fn => fn(entry));
    
    // Keep last 100 logs
    if (this.logs.length > 100) this.logs = this.logs.slice(-100);
  }
  
  info(msg, data) { this.log('info', msg, data); }
  success(msg, data) { this.log('success', msg, data); }
  warn(msg, data) { this.log('warn', msg, data); }
  error(msg, data) { this.log('error', msg, data); }
  api(method, url, data) { this.log('api', method + ' ' + url, data); }
  
  subscribe(fn) { this.listeners.push(fn); }
  getLogs() { return this.logs; }
  clear() { this.logs = []; }
}

window.inferaConsole = new InferaConsole();

// Data Manager with localStorage persistence
class DataManager {
  constructor(initialData) {
    this.data = this.loadFromStorage() || initialData;
    this.listeners = {};
    window.inferaConsole.info('تم تحميل البيانات', { tables: Object.keys(this.data).length });
  }
  
  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        window.inferaConsole.success('تم استرجاع البيانات من التخزين المحلي');
        return JSON.parse(saved);
      }
    } catch (e) {
      window.inferaConsole.warn('فشل تحميل البيانات المحفوظة');
    }
    return null;
  }
  
  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      window.inferaConsole.info('تم حفظ البيانات');
    } catch (e) {
      window.inferaConsole.error('فشل حفظ البيانات');
    }
  }
  
  getAll(table) {
    window.inferaConsole.api('GET', '/api/' + table);
    return this.data[table] || [];
  }
  
  getById(table, id) {
    window.inferaConsole.api('GET', '/api/' + table + '/' + id);
    return (this.data[table] || []).find(item => item.id === id);
  }
  
  create(table, item) {
    if (!this.data[table]) this.data[table] = [];
    const newId = Math.max(0, ...this.data[table].map(i => i.id || 0)) + 1;
    const newItem = { ...item, id: newId, createdAt: new Date().toISOString() };
    this.data[table].push(newItem);
    this.saveToStorage();
    this.notify(table);
    window.inferaConsole.api('POST', '/api/' + table, newItem);
    window.inferaConsole.success('تم إنشاء سجل جديد', { table, id: newId });
    return newItem;
  }
  
  update(table, id, updates) {
    const idx = (this.data[table] || []).findIndex(i => i.id === id);
    if (idx !== -1) {
      this.data[table][idx] = { ...this.data[table][idx], ...updates, updatedAt: new Date().toISOString() };
      this.saveToStorage();
      this.notify(table);
      window.inferaConsole.api('PUT', '/api/' + table + '/' + id, updates);
      window.inferaConsole.success('تم تحديث السجل', { table, id });
      return this.data[table][idx];
    }
    window.inferaConsole.error('السجل غير موجود', { table, id });
    return null;
  }
  
  delete(table, id) {
    const idx = (this.data[table] || []).findIndex(i => i.id === id);
    if (idx !== -1) {
      this.data[table].splice(idx, 1);
      this.saveToStorage();
      this.notify(table);
      window.inferaConsole.api('DELETE', '/api/' + table + '/' + id);
      window.inferaConsole.success('تم حذف السجل', { table, id });
      return true;
    }
    return false;
  }
  
  subscribe(table, fn) {
    if (!this.listeners[table]) this.listeners[table] = [];
    this.listeners[table].push(fn);
    return () => {
      this.listeners[table] = this.listeners[table].filter(f => f !== fn);
    };
  }
  
  notify(table) {
    (this.listeners[table] || []).forEach(fn => fn(this.data[table]));
  }
  
  exportData() {
    const json = JSON.stringify(this.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'platform-data-' + BLUEPRINT_ID + '.json';
    a.click();
    window.inferaConsole.success('تم تصدير البيانات');
  }
  
  importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        this.data = JSON.parse(e.target.result);
        this.saveToStorage();
        Object.keys(this.data).forEach(t => this.notify(t));
        window.inferaConsole.success('تم استيراد البيانات', { tables: Object.keys(this.data).length });
      } catch (err) {
        window.inferaConsole.error('فشل استيراد البيانات: تنسيق غير صالح');
      }
    };
    reader.readAsText(file);
  }
  
  resetData(initialData) {
    this.data = JSON.parse(JSON.stringify(initialData));
    this.saveToStorage();
    Object.keys(this.data).forEach(t => this.notify(t));
    window.inferaConsole.info('تم إعادة تعيين البيانات');
  }
  
  getStats() {
    return Object.entries(this.data).map(([table, records]) => ({
      table,
      count: records.length
    }));
  }
}

// Initialize with mock data
window.dataManager = new DataManager(${JSON.stringify(mockData)});
window.mockData = window.dataManager.data;

// DevTools Panel Component
window.DevToolsPanel = function() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('console');
  const [logs, setLogs] = React.useState([]);
  const [stats, setStats] = React.useState(window.dataManager.getStats());
  const fileInputRef = React.useRef(null);
  
  React.useEffect(() => {
    window.inferaConsole.subscribe(log => {
      setLogs(prev => [...prev.slice(-99), log]);
    });
    setLogs(window.inferaConsole.getLogs());
    
    // Update stats periodically
    const interval = setInterval(() => {
      setStats(window.dataManager.getStats());
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getLogColor = (type) => ({
    info: '#3b82f6',
    success: '#22c55e',
    warn: '#f59e0b',
    error: '#ef4444',
    api: '#8b5cf6'
  }[type] || '#71717a');
  
  const getLogIcon = (type) => ({
    info: 'ℹ',
    success: '✓',
    warn: '⚠',
    error: '✕',
    api: '↔'
  }[type] || '•');
  
  if (!isOpen) {
    return React.createElement('button', {
      onClick: () => setIsOpen(true),
      style: {
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 20px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'Cairo, sans-serif'
      }
    }, '🛠 DevTools');
  }
  
  return React.createElement('div', {
    style: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '320px',
      background: '#0a0a0b',
      borderTop: '1px solid #27272a',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Cairo, sans-serif',
      direction: 'rtl'
    }
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid #27272a',
        background: '#18181b'
      }
    }, [
      React.createElement('div', { key: 'tabs', style: { display: 'flex', gap: '4px' } }, 
        [['console', '📋 Console'], ['data', '💾 Data']].map(function(item) {
          const id = item[0];
          const label = item[1];
          return React.createElement('button', {
            key: id,
            onClick: function() { setActiveTab(id); },
            style: {
              padding: '6px 12px',
              background: activeTab === id ? '#27272a' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: activeTab === id ? 'white' : '#71717a',
              cursor: 'pointer',
              fontSize: '12px'
            }
          }, label);
        })
      ),
      React.createElement('button', {
        key: 'close',
        onClick: () => setIsOpen(false),
        style: {
          background: 'transparent',
          border: 'none',
          color: '#71717a',
          cursor: 'pointer',
          fontSize: '18px'
        }
      }, '✕')
    ]),
    
    // Content
    React.createElement('div', {
      key: 'content',
      style: { flex: 1, overflow: 'auto', padding: '8px' }
    }, 
      activeTab === 'console' 
        ? React.createElement('div', { style: { fontSize: '12px', fontFamily: 'monospace' } },
            logs.length === 0 
              ? React.createElement('div', { style: { color: '#71717a', padding: '20px', textAlign: 'center' } }, 'لا توجد سجلات')
              : logs.map(log => 
                  React.createElement('div', {
                    key: log.id,
                    style: {
                      display: 'flex',
                      gap: '8px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      marginBottom: '2px',
                      background: '#18181b'
                    }
                  }, [
                    React.createElement('span', { key: 'time', style: { color: '#52525b' } }, log.timestamp),
                    React.createElement('span', { key: 'icon', style: { color: getLogColor(log.type) } }, getLogIcon(log.type)),
                    React.createElement('span', { key: 'msg', style: { color: '#fafafa' } }, log.message),
                    log.data && React.createElement('span', { key: 'data', style: { color: '#71717a' } }, JSON.stringify(log.data))
                  ])
                )
          )
        : React.createElement('div', { style: { padding: '8px' } }, [
            // Data Actions
            React.createElement('div', {
              key: 'actions',
              style: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }
            }, [
              React.createElement('button', {
                key: 'export',
                onClick: () => window.dataManager.exportData(),
                style: {
                  padding: '8px 16px',
                  background: '#22c55e',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }
              }, '📤 تصدير JSON'),
              React.createElement('button', {
                key: 'import',
                onClick: () => fileInputRef.current?.click(),
                style: {
                  padding: '8px 16px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }
              }, '📥 استيراد JSON'),
              React.createElement('input', {
                key: 'file-input',
                ref: fileInputRef,
                type: 'file',
                accept: '.json',
                style: { display: 'none' },
                onChange: (e) => e.target.files[0] && window.dataManager.importData(e.target.files[0])
              }),
              React.createElement('button', {
                key: 'reset',
                onClick: () => {
                  if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟')) {
                    window.dataManager.resetData(${JSON.stringify(mockData)});
                  }
                },
                style: {
                  padding: '8px 16px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }
              }, '🔄 إعادة تعيين'),
              React.createElement('button', {
                key: 'clear-storage',
                onClick: () => {
                  localStorage.removeItem(STORAGE_KEY);
                  window.inferaConsole.info('تم مسح التخزين المحلي');
                },
                style: {
                  padding: '8px 16px',
                  background: '#71717a',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }
              }, '🗑 مسح التخزين')
            ]),
            // Stats
            React.createElement('div', {
              key: 'stats',
              style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }
            }, stats.map(s =>
              React.createElement('div', {
                key: s.table,
                style: {
                  background: '#18181b',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #27272a'
                }
              }, [
                React.createElement('div', { key: 'name', style: { color: '#fafafa', fontWeight: '600', marginBottom: '4px' } }, s.table),
                React.createElement('div', { key: 'count', style: { color: '#6366f1', fontSize: '24px', fontWeight: '700' } }, s.count),
                React.createElement('div', { key: 'label', style: { color: '#71717a', fontSize: '12px' } }, 'سجلات')
              ])
            ))
          ])
    )
  ]);
};
`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${blueprint.name} - Live Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <style>${css}</style>
</head>
<body>
  <div id="root"></div>
  <div id="devtools-root"></div>
  <script>${devToolsScript}</script>
  <script>${jsCode}</script>
  <script>
    // Render DevTools Panel
    const devRoot = document.getElementById('devtools-root');
    if (devRoot && window.DevToolsPanel) {
      const devToolsRoot = ReactDOM.createRoot(devRoot);
      devToolsRoot.render(React.createElement(window.DevToolsPanel));
    }
  </script>
</body>
</html>`;
}

/**
 * Generate template-based preview (fallback)
 */
function generateTemplatePreview(
  blueprint: Blueprint,
  artifacts: BlueprintArtifacts
): PreviewBundle {
  const mockData = generateMockData(blueprint);
  const css = generatePreviewCSS(blueprint);
  
  // Simple template-based preview
  const jsCode = createVirtualEntry(blueprint, artifacts, mockData);
  const html = generatePreviewHTML(blueprint, jsCode, css, mockData);
  
  return {
    html,
    js: jsCode,
    css,
    mockData
  };
}

/**
 * Generate mock data based on blueprint entities
 */
function generateMockData(blueprint: Blueprint): Record<string, any[]> {
  const data: Record<string, any[]> = {};
  
  const arabicNames = [
    'أحمد محمد علي', 'سارة أحمد حسن', 'محمد عبدالله خالد', 'فاطمة محمود سالم',
    'عمر إبراهيم أحمد', 'نور محمد علي', 'يوسف خالد حسن', 'مريم أحمد سالم',
    'خالد عبدالرحمن محمد', 'ليلى حسين أحمد', 'عبدالرحمن محمد علي', 'هدى علي حسن'
  ];
  
  const departments = ['الهندسة', 'الموارد البشرية', 'المالية', 'التسويق', 'المبيعات', 'خدمة العملاء'];
  const roles = ['مدير', 'مهندس', 'محلل', 'مطور', 'مصمم', 'منسق'];
  const statuses = ['نشط', 'معلق', 'في إجازة'];
  
  for (const entity of blueprint.dataModel.entities) {
    const records: any[] = [];
    const count = Math.floor(Math.random() * 5) + 6; // 6-10 records
    
    for (let i = 1; i <= count; i++) {
      const record: any = { id: i };
      
      for (const field of entity.fields) {
        if (field.name === 'id') continue;
        
        const fieldLower = field.name.toLowerCase();
        
        if (field.type === 'string') {
          if (fieldLower.includes('name') || fieldLower.includes('اسم')) {
            record[field.name] = arabicNames[(i - 1) % arabicNames.length];
          } else if (fieldLower.includes('email') || fieldLower.includes('بريد')) {
            record[field.name] = `user${i}@company.com`;
          } else if (fieldLower.includes('phone') || fieldLower.includes('هاتف')) {
            record[field.name] = `+20 10${Math.floor(10000000 + Math.random() * 90000000)}`;
          } else if (fieldLower.includes('department') || fieldLower.includes('قسم')) {
            record[field.name] = departments[(i - 1) % departments.length];
          } else if (fieldLower.includes('role') || fieldLower.includes('منصب') || fieldLower.includes('وظيفة')) {
            record[field.name] = roles[(i - 1) % roles.length];
          } else if (fieldLower.includes('status') || fieldLower.includes('حالة')) {
            record[field.name] = statuses[(i - 1) % statuses.length];
          } else if (fieldLower.includes('address') || fieldLower.includes('عنوان')) {
            record[field.name] = ['القاهرة', 'الجيزة', 'الإسكندرية'][(i - 1) % 3] + ' - مصر';
          } else if (fieldLower.includes('description') || fieldLower.includes('وصف') || fieldLower.includes('notes') || fieldLower.includes('ملاحظات')) {
            record[field.name] = 'ملاحظات ومعلومات إضافية...';
          } else {
            record[field.name] = `${field.nameAr || field.name} ${i}`;
          }
        } else if (field.type === 'number' || field.type === 'integer') {
          if (fieldLower.includes('salary') || fieldLower.includes('راتب') || fieldLower.includes('amount') || fieldLower.includes('مبلغ')) {
            record[field.name] = Math.floor(5000 + Math.random() * 15000);
          } else if (fieldLower.includes('age') || fieldLower.includes('عمر')) {
            record[field.name] = Math.floor(22 + Math.random() * 40);
          } else {
            record[field.name] = Math.floor(Math.random() * 100) + 1;
          }
        } else if (field.type === 'boolean') {
          record[field.name] = Math.random() > 0.3;
        } else if (field.type === 'date' || field.type === 'datetime') {
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 365));
          record[field.name] = date.toISOString().split('T')[0];
        } else if (field.type === 'enum' && field.enumValues && field.enumValues.length > 0) {
          record[field.name] = field.enumValues[Math.floor(Math.random() * field.enumValues.length)];
        } else {
          record[field.name] = `${field.name} ${i}`;
        }
      }
      
      records.push(record);
    }
    
    data[entity.tableName] = records;
  }
  
  return data;
}

/**
 * Clear cache for a specific blueprint
 */
export function clearPreviewCache(blueprintId: string): void {
  bundleCache.delete(blueprintId);
}

/**
 * Clear all preview caches
 */
export function clearAllPreviewCaches(): void {
  bundleCache.clear();
}

export { generateMockData };
