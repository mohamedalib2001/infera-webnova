/**
 * INFERA WebNova - Drag & Drop Visual Builder
 * Intuitive visual UI builder for mobile and desktop apps
 * 
 * Features: Component library, drag-drop, property editor, responsive preview
 */

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Slider
} from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Layout,
  Type,
  Image,
  Square,
  Circle,
  List,
  Grid3X3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Trash2,
  Copy,
  Move,
  Layers,
  ChevronUp,
  ChevronDown,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Download,
  Upload,
  Smartphone,
  Monitor,
  Tablet,
  MousePointer,
  Hand,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Palette,
  Settings,
  Plus,
  Minus,
  Menu,
  Bell,
  User,
  Search,
  Heart,
  Star,
  MessageSquare,
  Share2,
  MoreVertical,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Camera,
  MapPin,
  Calendar,
  Clock,
  Mail,
  Phone,
  Globe,
  Home,
  FileText,
  Folder,
  Database,
  Server,
  Cloud,
  Shield,
  Zap,
  Package,
} from 'lucide-react';

// ==================== TYPES ====================
interface ComponentDefinition {
  id: string;
  type: string;
  name: string;
  nameAr: string;
  icon: any;
  category: 'layout' | 'basic' | 'form' | 'media' | 'navigation' | 'data' | 'advanced';
  defaultProps: Record<string, any>;
  allowedChildren?: string[];
  isContainer?: boolean;
}

interface CanvasComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  children: CanvasComponent[];
  parentId: string | null;
  locked: boolean;
  hidden: boolean;
}

interface DragDropBuilderProps {
  language: 'ar' | 'en';
  type: 'mobile' | 'desktop';
  initialComponents?: CanvasComponent[];
  onSave?: (components: CanvasComponent[]) => void;
  onExport?: (code: string) => void;
}

// ==================== COMPONENT LIBRARY ====================
const componentLibrary: ComponentDefinition[] = [
  // Layout Components
  {
    id: 'container',
    type: 'container',
    name: 'Container',
    nameAr: 'حاوية',
    icon: Square,
    category: 'layout',
    defaultProps: {
      padding: 16,
      backgroundColor: 'transparent',
      borderRadius: 8,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
    },
    isContainer: true,
  },
  {
    id: 'row',
    type: 'row',
    name: 'Row',
    nameAr: 'صف',
    icon: Layout,
    category: 'layout',
    defaultProps: {
      gap: 8,
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    isContainer: true,
  },
  {
    id: 'column',
    type: 'column',
    name: 'Column',
    nameAr: 'عمود',
    icon: Layers,
    category: 'layout',
    defaultProps: {
      gap: 8,
      justifyContent: 'flex-start',
      alignItems: 'stretch',
    },
    isContainer: true,
  },
  {
    id: 'grid',
    type: 'grid',
    name: 'Grid',
    nameAr: 'شبكة',
    icon: Grid3X3,
    category: 'layout',
    defaultProps: {
      columns: 2,
      gap: 8,
    },
    isContainer: true,
  },
  {
    id: 'scrollview',
    type: 'scrollview',
    name: 'Scroll View',
    nameAr: 'عرض قابل للتمرير',
    icon: List,
    category: 'layout',
    defaultProps: {
      horizontal: false,
    },
    isContainer: true,
  },
  
  // Basic Components
  {
    id: 'text',
    type: 'text',
    name: 'Text',
    nameAr: 'نص',
    icon: Type,
    category: 'basic',
    defaultProps: {
      content: 'Text',
      fontSize: 16,
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'left',
    },
  },
  {
    id: 'heading',
    type: 'heading',
    name: 'Heading',
    nameAr: 'عنوان',
    icon: Type,
    category: 'basic',
    defaultProps: {
      content: 'Heading',
      level: 1,
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000000',
    },
  },
  {
    id: 'button',
    type: 'button',
    name: 'Button',
    nameAr: 'زر',
    icon: Square,
    category: 'basic',
    defaultProps: {
      text: 'Button',
      variant: 'primary',
      size: 'medium',
      borderRadius: 8,
    },
  },
  {
    id: 'image',
    type: 'image',
    name: 'Image',
    nameAr: 'صورة',
    icon: Image,
    category: 'basic',
    defaultProps: {
      src: 'https://via.placeholder.com/150',
      alt: 'Image',
      width: 150,
      height: 150,
      borderRadius: 0,
    },
  },
  {
    id: 'icon',
    type: 'icon',
    name: 'Icon',
    nameAr: 'أيقونة',
    icon: Star,
    category: 'basic',
    defaultProps: {
      name: 'star',
      size: 24,
      color: '#000000',
    },
  },
  {
    id: 'divider',
    type: 'divider',
    name: 'Divider',
    nameAr: 'فاصل',
    icon: Minus,
    category: 'basic',
    defaultProps: {
      thickness: 1,
      color: '#e5e7eb',
      margin: 8,
    },
  },
  {
    id: 'spacer',
    type: 'spacer',
    name: 'Spacer',
    nameAr: 'مسافة',
    icon: Square,
    category: 'basic',
    defaultProps: {
      height: 16,
    },
  },
  
  // Form Components
  {
    id: 'input',
    type: 'input',
    name: 'Text Input',
    nameAr: 'حقل نص',
    icon: Type,
    category: 'form',
    defaultProps: {
      placeholder: 'Enter text...',
      label: 'Label',
      type: 'text',
      required: false,
    },
  },
  {
    id: 'textarea',
    type: 'textarea',
    name: 'Text Area',
    nameAr: 'منطقة نص',
    icon: AlignLeft,
    category: 'form',
    defaultProps: {
      placeholder: 'Enter text...',
      label: 'Label',
      rows: 4,
    },
  },
  {
    id: 'checkbox',
    type: 'checkbox',
    name: 'Checkbox',
    nameAr: 'مربع اختيار',
    icon: Square,
    category: 'form',
    defaultProps: {
      label: 'Checkbox',
      checked: false,
    },
  },
  {
    id: 'switch',
    type: 'switch',
    name: 'Switch',
    nameAr: 'مفتاح',
    icon: Circle,
    category: 'form',
    defaultProps: {
      label: 'Switch',
      enabled: false,
    },
  },
  {
    id: 'select',
    type: 'select',
    name: 'Dropdown',
    nameAr: 'قائمة منسدلة',
    icon: List,
    category: 'form',
    defaultProps: {
      label: 'Select',
      placeholder: 'Choose an option',
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
  },
  {
    id: 'slider',
    type: 'slider',
    name: 'Slider',
    nameAr: 'شريط تمرير',
    icon: Minus,
    category: 'form',
    defaultProps: {
      min: 0,
      max: 100,
      value: 50,
      step: 1,
    },
  },
  
  // Media Components
  {
    id: 'avatar',
    type: 'avatar',
    name: 'Avatar',
    nameAr: 'صورة شخصية',
    icon: User,
    category: 'media',
    defaultProps: {
      src: '',
      size: 48,
      fallback: 'AB',
    },
  },
  {
    id: 'video',
    type: 'video',
    name: 'Video',
    nameAr: 'فيديو',
    icon: Play,
    category: 'media',
    defaultProps: {
      src: '',
      autoplay: false,
      controls: true,
    },
  },
  {
    id: 'map',
    type: 'map',
    name: 'Map',
    nameAr: 'خريطة',
    icon: MapPin,
    category: 'media',
    defaultProps: {
      latitude: 24.7136,
      longitude: 46.6753,
      zoom: 12,
    },
  },
  
  // Navigation Components
  {
    id: 'navbar',
    type: 'navbar',
    name: 'Navigation Bar',
    nameAr: 'شريط تنقل',
    icon: Menu,
    category: 'navigation',
    defaultProps: {
      title: 'App Title',
      showBack: false,
      actions: [],
    },
    isContainer: true,
  },
  {
    id: 'tabbar',
    type: 'tabbar',
    name: 'Tab Bar',
    nameAr: 'شريط تبويبات',
    icon: Layout,
    category: 'navigation',
    defaultProps: {
      tabs: [
        { label: 'Home', icon: 'home' },
        { label: 'Search', icon: 'search' },
        { label: 'Profile', icon: 'user' },
      ],
      activeTab: 0,
    },
  },
  {
    id: 'bottomsheet',
    type: 'bottomsheet',
    name: 'Bottom Sheet',
    nameAr: 'ورقة سفلية',
    icon: Layers,
    category: 'navigation',
    defaultProps: {
      title: 'Bottom Sheet',
      height: 300,
    },
    isContainer: true,
  },
  
  // Data Components
  {
    id: 'card',
    type: 'card',
    name: 'Card',
    nameAr: 'بطاقة',
    icon: Square,
    category: 'data',
    defaultProps: {
      elevation: 2,
      borderRadius: 12,
      padding: 16,
    },
    isContainer: true,
  },
  {
    id: 'list',
    type: 'list',
    name: 'List',
    nameAr: 'قائمة',
    icon: List,
    category: 'data',
    defaultProps: {
      items: ['Item 1', 'Item 2', 'Item 3'],
      dividers: true,
    },
  },
  {
    id: 'badge',
    type: 'badge',
    name: 'Badge',
    nameAr: 'شارة',
    icon: Circle,
    category: 'data',
    defaultProps: {
      text: 'New',
      color: 'primary',
    },
  },
  {
    id: 'progress',
    type: 'progress',
    name: 'Progress Bar',
    nameAr: 'شريط تقدم',
    icon: Minus,
    category: 'data',
    defaultProps: {
      value: 60,
      max: 100,
      showLabel: true,
    },
  },
  {
    id: 'chart',
    type: 'chart',
    name: 'Chart',
    nameAr: 'رسم بياني',
    icon: Grid3X3,
    category: 'data',
    defaultProps: {
      type: 'line',
      data: [10, 20, 30, 40, 50],
    },
  },
];

// ==================== TRANSLATIONS ====================
const translations = {
  ar: {
    components: 'المكونات',
    properties: 'الخصائص',
    layers: 'الطبقات',
    layout: 'التخطيط',
    basic: 'الأساسية',
    form: 'النماذج',
    media: 'الوسائط',
    navigation: 'التنقل',
    data: 'البيانات',
    advanced: 'متقدمة',
    search: 'بحث...',
    noSelection: 'اختر عنصراً من اللوحة',
    canvas: 'اللوحة',
    zoom: 'التكبير',
    undo: 'تراجع',
    redo: 'إعادة',
    save: 'حفظ',
    export: 'تصدير',
    import: 'استيراد',
    clear: 'مسح الكل',
    duplicate: 'نسخ',
    delete: 'حذف',
    lock: 'قفل',
    unlock: 'إلغاء القفل',
    hide: 'إخفاء',
    show: 'إظهار',
    moveUp: 'للأعلى',
    moveDown: 'للأسفل',
    bringToFront: 'للمقدمة',
    sendToBack: 'للخلفية',
    phone: 'هاتف',
    tablet: 'جهاز لوحي',
    desktop: 'سطح المكتب',
    dragHere: 'اسحب المكونات هنا',
    emptyCanvas: 'اللوحة فارغة',
    position: 'الموضع',
    size: 'الحجم',
    style: 'التنسيق',
    spacing: 'المسافات',
    text: 'النص',
    content: 'المحتوى',
    actions: 'الإجراءات',
    width: 'العرض',
    height: 'الارتفاع',
    padding: 'الحشو',
    margin: 'الهامش',
    borderRadius: 'تقويس الحواف',
    backgroundColor: 'لون الخلفية',
    color: 'اللون',
    fontSize: 'حجم الخط',
    fontWeight: 'سماكة الخط',
    textAlign: 'محاذاة النص',
    opacity: 'الشفافية',
  },
  en: {
    components: 'Components',
    properties: 'Properties',
    layers: 'Layers',
    layout: 'Layout',
    basic: 'Basic',
    form: 'Form',
    media: 'Media',
    navigation: 'Navigation',
    data: 'Data',
    advanced: 'Advanced',
    search: 'Search...',
    noSelection: 'Select an element from canvas',
    canvas: 'Canvas',
    zoom: 'Zoom',
    undo: 'Undo',
    redo: 'Redo',
    save: 'Save',
    export: 'Export',
    import: 'Import',
    clear: 'Clear All',
    duplicate: 'Duplicate',
    delete: 'Delete',
    lock: 'Lock',
    unlock: 'Unlock',
    hide: 'Hide',
    show: 'Show',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    bringToFront: 'Bring to Front',
    sendToBack: 'Send to Back',
    phone: 'Phone',
    tablet: 'Tablet',
    desktop: 'Desktop',
    dragHere: 'Drag components here',
    emptyCanvas: 'Canvas is empty',
    position: 'Position',
    size: 'Size',
    style: 'Style',
    spacing: 'Spacing',
    text: 'Text',
    content: 'Content',
    actions: 'Actions',
    width: 'Width',
    height: 'Height',
    padding: 'Padding',
    margin: 'Margin',
    borderRadius: 'Border Radius',
    backgroundColor: 'Background Color',
    color: 'Color',
    fontSize: 'Font Size',
    fontWeight: 'Font Weight',
    textAlign: 'Text Align',
    opacity: 'Opacity',
  },
};

// ==================== MAIN COMPONENT ====================
export default function DragDropBuilder({
  language,
  type,
  initialComponents = [],
  onSave,
  onExport,
}: DragDropBuilderProps) {
  const t = translations[language];
  const isRTL = language === 'ar';
  
  // State
  const [components, setComponents] = useState<CanvasComponent[]>(initialComponents);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<ComponentDefinition | null>(null);
  const [zoom, setZoom] = useState(100);
  const [devicePreview, setDevicePreview] = useState<'phone' | 'tablet' | 'desktop'>(
    type === 'mobile' ? 'phone' : 'desktop'
  );
  const [history, setHistory] = useState<CanvasComponent[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('layout');
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Get device dimensions
  const getDeviceDimensions = () => {
    switch (devicePreview) {
      case 'phone':
        return { width: 375, height: 812 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'desktop':
        return { width: 1280, height: 800 };
    }
  };

  // History management
  const pushHistory = useCallback((newComponents: CanvasComponent[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newComponents)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setComponents(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setComponents(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  }, [history, historyIndex]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, component: ComponentDefinition) => {
    setDraggedComponent(component);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, parentId: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedComponent) return;

    const newComponent: CanvasComponent = {
      id: `${draggedComponent.type}_${Date.now()}`,
      type: draggedComponent.type,
      props: { ...draggedComponent.defaultProps },
      children: [],
      parentId,
      locked: false,
      hidden: false,
    };

    const newComponents = [...components];
    
    if (parentId) {
      // Add to parent
      const addToParent = (items: CanvasComponent[]): boolean => {
        for (const item of items) {
          if (item.id === parentId) {
            item.children.push(newComponent);
            return true;
          }
          if (addToParent(item.children)) return true;
        }
        return false;
      };
      addToParent(newComponents);
    } else {
      newComponents.push(newComponent);
    }

    setComponents(newComponents);
    pushHistory(newComponents);
    setDraggedComponent(null);
    setSelectedId(newComponent.id);
  };

  // Component actions
  const updateComponent = (id: string, updates: Partial<CanvasComponent>) => {
    const updateRecursive = (items: CanvasComponent[]): CanvasComponent[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return { ...item, children: updateRecursive(item.children) };
      });
    };

    const newComponents = updateRecursive(components);
    setComponents(newComponents);
    pushHistory(newComponents);
  };

  const updateComponentProps = (id: string, propUpdates: Record<string, any>) => {
    const updateRecursive = (items: CanvasComponent[]): CanvasComponent[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, props: { ...item.props, ...propUpdates } };
        }
        return { ...item, children: updateRecursive(item.children) };
      });
    };

    const newComponents = updateRecursive(components);
    setComponents(newComponents);
    pushHistory(newComponents);
  };

  const deleteComponent = (id: string) => {
    const deleteRecursive = (items: CanvasComponent[]): CanvasComponent[] => {
      return items.filter(item => item.id !== id).map(item => ({
        ...item,
        children: deleteRecursive(item.children),
      }));
    };

    const newComponents = deleteRecursive(components);
    setComponents(newComponents);
    pushHistory(newComponents);
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateComponent = (id: string) => {
    const findComponent = (items: CanvasComponent[]): CanvasComponent | null => {
      for (const item of items) {
        if (item.id === id) return item;
        const found = findComponent(item.children);
        if (found) return found;
      }
      return null;
    };

    const component = findComponent(components);
    if (!component) return;

    const duplicateRecursive = (item: CanvasComponent): CanvasComponent => ({
      ...item,
      id: `${item.type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      children: item.children.map(duplicateRecursive),
    });

    const duplicated = duplicateRecursive(component);
    
    if (component.parentId) {
      const addAfterOriginal = (items: CanvasComponent[]): CanvasComponent[] => {
        const result: CanvasComponent[] = [];
        for (const item of items) {
          result.push({
            ...item,
            children: addAfterOriginal(item.children),
          });
          if (item.id === id) {
            result.push(duplicated);
          }
        }
        return result;
      };
      const newComponents = addAfterOriginal(components);
      setComponents(newComponents);
      pushHistory(newComponents);
    } else {
      const index = components.findIndex(c => c.id === id);
      const newComponents = [...components];
      newComponents.splice(index + 1, 0, duplicated);
      setComponents(newComponents);
      pushHistory(newComponents);
    }

    setSelectedId(duplicated.id);
  };

  // Get selected component
  const getSelectedComponent = (): CanvasComponent | null => {
    if (!selectedId) return null;
    
    const findComponent = (items: CanvasComponent[]): CanvasComponent | null => {
      for (const item of items) {
        if (item.id === selectedId) return item;
        const found = findComponent(item.children);
        if (found) return found;
      }
      return null;
    };

    return findComponent(components);
  };

  const selectedComponent = getSelectedComponent();

  // Filter components by search and category
  const filteredComponents = componentLibrary.filter(comp => {
    const matchesSearch = searchQuery === '' || 
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.nameAr.includes(searchQuery);
    const matchesCategory = activeCategory === 'all' || comp.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Generate code from components
  const generateCode = (): string => {
    const generateComponentCode = (comp: CanvasComponent, indent: number = 0): string => {
      const spaces = '  '.repeat(indent);
      const props = Object.entries(comp.props)
        .map(([key, value]) => {
          if (typeof value === 'string') return `${key}="${value}"`;
          if (typeof value === 'boolean') return value ? key : '';
          return `${key}={${JSON.stringify(value)}}`;
        })
        .filter(Boolean)
        .join(' ');

      const childrenCode = comp.children.length > 0
        ? `\n${comp.children.map(c => generateComponentCode(c, indent + 1)).join('\n')}\n${spaces}`
        : '';

      const componentName = comp.type.charAt(0).toUpperCase() + comp.type.slice(1);

      if (childrenCode) {
        return `${spaces}<${componentName} ${props}>${childrenCode}</${componentName}>`;
      }
      return `${spaces}<${componentName} ${props} />`;
    };

    return components.map(c => generateComponentCode(c)).join('\n');
  };

  // Export handler
  const handleExport = () => {
    const code = generateCode();
    onExport?.(code);
  };

  // Save handler
  const handleSave = () => {
    onSave?.(components);
  };

  // Render canvas component
  const renderCanvasComponent = (comp: CanvasComponent): React.ReactNode => {
    if (comp.hidden) return null;

    const isSelected = selectedId === comp.id;
    const definition = componentLibrary.find(c => c.type === comp.type);

    const baseStyle: React.CSSProperties = {
      position: 'relative',
      cursor: comp.locked ? 'not-allowed' : 'pointer',
      outline: isSelected ? '2px solid #6366f1' : 'none',
      outlineOffset: '2px',
      opacity: comp.locked ? 0.7 : 1,
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!comp.locked) {
        setSelectedId(comp.id);
      }
    };

    // Render based on component type
    switch (comp.type) {
      case 'container':
      case 'row':
      case 'column':
      case 'card':
        return (
          <div
            key={comp.id}
            style={{
              ...baseStyle,
              display: 'flex',
              flexDirection: comp.type === 'row' ? 'row' : 'column',
              padding: comp.props.padding,
              backgroundColor: comp.props.backgroundColor || (comp.type === 'card' ? '#ffffff' : 'transparent'),
              borderRadius: comp.props.borderRadius,
              gap: comp.props.gap,
              justifyContent: comp.props.justifyContent,
              alignItems: comp.props.alignItems,
              minHeight: 60,
              border: comp.type === 'card' ? '1px solid #e5e7eb' : '1px dashed #d1d5db',
              boxShadow: comp.type === 'card' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, comp.id)}
          >
            {comp.children.length === 0 ? (
              <div className="text-muted-foreground text-sm text-center w-full py-4">
                {definition?.isContainer ? t.dragHere : ''}
              </div>
            ) : (
              comp.children.map(renderCanvasComponent)
            )}
          </div>
        );

      case 'text':
        return (
          <p
            key={comp.id}
            style={{
              ...baseStyle,
              fontSize: comp.props.fontSize,
              fontWeight: comp.props.fontWeight,
              color: comp.props.color,
              textAlign: comp.props.textAlign,
              margin: 0,
            }}
            onClick={handleClick}
          >
            {comp.props.content}
          </p>
        );

      case 'heading':
        const HeadingTag = `h${comp.props.level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag
            key={comp.id}
            style={{
              ...baseStyle,
              fontSize: comp.props.fontSize,
              fontWeight: comp.props.fontWeight,
              color: comp.props.color,
              margin: 0,
            }}
            onClick={handleClick}
          >
            {comp.props.content}
          </HeadingTag>
        );

      case 'button':
        return (
          <button
            key={comp.id}
            style={{
              ...baseStyle,
              padding: '8px 16px',
              borderRadius: comp.props.borderRadius,
              backgroundColor: comp.props.variant === 'primary' ? '#6366f1' : 'transparent',
              color: comp.props.variant === 'primary' ? '#ffffff' : '#6366f1',
              border: comp.props.variant === 'outline' ? '1px solid #6366f1' : 'none',
              cursor: 'pointer',
            }}
            onClick={handleClick}
          >
            {comp.props.text}
          </button>
        );

      case 'image':
        return (
          <img
            key={comp.id}
            src={comp.props.src}
            alt={comp.props.alt}
            style={{
              ...baseStyle,
              width: comp.props.width,
              height: comp.props.height,
              borderRadius: comp.props.borderRadius,
              objectFit: 'cover',
            }}
            onClick={handleClick}
          />
        );

      case 'input':
        return (
          <div key={comp.id} style={{ ...baseStyle, width: '100%' }} onClick={handleClick}>
            {comp.props.label && (
              <label className="block text-sm mb-1">{comp.props.label}</label>
            )}
            <input
              type={comp.props.type}
              placeholder={comp.props.placeholder}
              className="w-full px-3 py-2 border rounded-md"
              disabled
            />
          </div>
        );

      case 'divider':
        return (
          <hr
            key={comp.id}
            style={{
              ...baseStyle,
              borderTop: `${comp.props.thickness}px solid ${comp.props.color}`,
              margin: `${comp.props.margin}px 0`,
              width: '100%',
            }}
            onClick={handleClick}
          />
        );

      case 'spacer':
        return (
          <div
            key={comp.id}
            style={{
              ...baseStyle,
              height: comp.props.height,
              width: '100%',
              backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            }}
            onClick={handleClick}
          />
        );

      default:
        return (
          <div
            key={comp.id}
            style={{
              ...baseStyle,
              padding: 16,
              backgroundColor: '#f3f4f6',
              borderRadius: 8,
              textAlign: 'center',
            }}
            onClick={handleClick}
          >
            <span className="text-muted-foreground text-sm">
              {definition?.name || comp.type}
            </span>
          </div>
        );
    }
  };

  const dimensions = getDeviceDimensions();

  return (
    <div className={`flex h-full ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Component Library Panel */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-3 border-b">
          <h3 className="font-semibold mb-2">{t.components}</h3>
          <Input
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
            data-testid="input-component-search"
          />
        </div>
        
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col">
          <TabsList className="mx-2 mt-2 grid grid-cols-3">
            <TabsTrigger value="layout" className="text-xs" data-testid="tab-layout">{t.layout}</TabsTrigger>
            <TabsTrigger value="basic" className="text-xs" data-testid="tab-basic">{t.basic}</TabsTrigger>
            <TabsTrigger value="form" className="text-xs" data-testid="tab-form">{t.form}</TabsTrigger>
          </TabsList>
          <TabsList className="mx-2 mb-2 grid grid-cols-3">
            <TabsTrigger value="media" className="text-xs" data-testid="tab-media">{t.media}</TabsTrigger>
            <TabsTrigger value="navigation" className="text-xs" data-testid="tab-navigation">{t.navigation}</TabsTrigger>
            <TabsTrigger value="data" className="text-xs" data-testid="tab-data">{t.data}</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 px-2">
            <div className="grid grid-cols-2 gap-2 pb-4">
              {filteredComponents.map(comp => (
                <div
                  key={comp.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, comp)}
                  className="flex flex-col items-center gap-1 p-2 rounded-md border bg-background cursor-grab hover-elevate transition-colors"
                  data-testid={`component-${comp.id}`}
                >
                  <comp.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-center">
                    {language === 'ar' ? comp.nameAr : comp.name}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col bg-muted/20">
        {/* Toolbar */}
        <div className="h-12 border-b bg-background flex items-center justify-between px-4 gap-2">
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={undo}
              disabled={historyIndex <= 0}
              data-testid="button-undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              data-testid="button-redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Button
              size="icon"
              variant={devicePreview === 'phone' ? 'default' : 'ghost'}
              onClick={() => setDevicePreview('phone')}
              data-testid="button-preview-phone"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={devicePreview === 'tablet' ? 'default' : 'ghost'}
              onClick={() => setDevicePreview('tablet')}
              data-testid="button-preview-tablet"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={devicePreview === 'desktop' ? 'default' : 'ghost'}
              onClick={() => setDevicePreview('desktop')}
              data-testid="button-preview-desktop"
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setZoom(Math.min(150, zoom + 10))}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleSave} data-testid="button-save">
              <Save className="h-4 w-4 mr-1" />
              {t.save}
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-1" />
              {t.export}
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-8 flex items-start justify-center">
          <div
            ref={canvasRef}
            className="bg-background rounded-lg shadow-lg overflow-hidden"
            style={{
              width: dimensions.width * (zoom / 100),
              height: dimensions.height * (zoom / 100),
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, null)}
            onClick={() => setSelectedId(null)}
            data-testid="canvas"
          >
            <div
              className="w-full h-full p-4 overflow-auto"
              style={{ minWidth: dimensions.width, minHeight: dimensions.height }}
            >
              {components.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Layers className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-lg">{t.emptyCanvas}</p>
                  <p className="text-sm">{t.dragHere}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {components.map(renderCanvasComponent)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-72 border-l bg-muted/30 flex flex-col">
        <div className="p-3 border-b">
          <h3 className="font-semibold">{t.properties}</h3>
        </div>
        
        <ScrollArea className="flex-1">
          {selectedComponent ? (
            <div className="p-3 space-y-4">
              {/* Component Info */}
              <div>
                <Label className="text-xs text-muted-foreground">
                  {componentLibrary.find(c => c.type === selectedComponent.type)?.[language === 'ar' ? 'nameAr' : 'name']}
                </Label>
                <Badge variant="outline" className="mt-1">
                  {selectedComponent.id}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => duplicateComponent(selectedComponent.id)}
                  data-testid="button-duplicate"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => updateComponent(selectedComponent.id, { locked: !selectedComponent.locked })}
                  data-testid="button-lock"
                >
                  {selectedComponent.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => updateComponent(selectedComponent.id, { hidden: !selectedComponent.hidden })}
                  data-testid="button-visibility"
                >
                  {selectedComponent.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => deleteComponent(selectedComponent.id)}
                  data-testid="button-delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Properties Editor */}
              <div className="space-y-3">
                {Object.entries(selectedComponent.props).map(([key, value]) => (
                  <div key={key}>
                    <Label className="text-xs capitalize">{key}</Label>
                    {typeof value === 'boolean' ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateComponentProps(selectedComponent.id, { [key]: e.target.checked })}
                          className="h-4 w-4"
                          data-testid={`prop-${key}`}
                        />
                      </div>
                    ) : typeof value === 'number' ? (
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => updateComponentProps(selectedComponent.id, { [key]: parseInt(e.target.value) || 0 })}
                        className="h-8 mt-1"
                        data-testid={`prop-${key}`}
                      />
                    ) : key === 'textAlign' || key === 'justifyContent' || key === 'alignItems' || key === 'flexDirection' ? (
                      <Select
                        value={value}
                        onValueChange={(v) => updateComponentProps(selectedComponent.id, { [key]: v })}
                      >
                        <SelectTrigger className="h-8 mt-1" data-testid={`prop-${key}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {key === 'textAlign' && (
                            <>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </>
                          )}
                          {(key === 'justifyContent' || key === 'alignItems') && (
                            <>
                              <SelectItem value="flex-start">Start</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="flex-end">End</SelectItem>
                              <SelectItem value="stretch">Stretch</SelectItem>
                              <SelectItem value="space-between">Space Between</SelectItem>
                            </>
                          )}
                          {key === 'flexDirection' && (
                            <>
                              <SelectItem value="row">Row</SelectItem>
                              <SelectItem value="column">Column</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    ) : key.includes('color') || key.includes('Color') ? (
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => updateComponentProps(selectedComponent.id, { [key]: e.target.value })}
                          className="h-8 w-8 rounded border cursor-pointer"
                          data-testid={`prop-${key}`}
                        />
                        <Input
                          value={value}
                          onChange={(e) => updateComponentProps(selectedComponent.id, { [key]: e.target.value })}
                          className="h-8 flex-1"
                        />
                      </div>
                    ) : (
                      <Input
                        value={value}
                        onChange={(e) => updateComponentProps(selectedComponent.id, { [key]: e.target.value })}
                        className="h-8 mt-1"
                        data-testid={`prop-${key}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <MousePointer className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t.noSelection}</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
