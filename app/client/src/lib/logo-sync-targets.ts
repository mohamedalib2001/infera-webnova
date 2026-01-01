// =====================================================================
// LOGO SYNC TARGET LOCATIONS - مواقع مزامنة الشعارات
// =====================================================================

import { LogoVariantType } from "./logo-binding-engine";
import { 
  Home, 
  Layout, 
  AppWindow, 
  Chrome, 
  Smartphone, 
  Moon, 
  Sun, 
  FileImage,
  Globe,
  Menu,
  type LucideIcon 
} from "lucide-react";

export interface LogoTargetLocation {
  id: string;
  variant: LogoVariantType;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  route: string;
  icon: LucideIcon;
  priority: number;
}

export const logoTargetLocations: LogoTargetLocation[] = [
  {
    id: "home-hero",
    variant: "app-icon-1024",
    nameEn: "Home Page Hero",
    nameAr: "الصفحة الرئيسية",
    descriptionEn: "Main logo displayed on the home page hero section",
    descriptionAr: "الشعار الرئيسي المعروض في قسم البطل بالصفحة الرئيسية",
    route: "/",
    icon: Home,
    priority: 1
  },
  {
    id: "landing-header",
    variant: "app-icon-512",
    nameEn: "Landing Page",
    nameAr: "صفحة الهبوط",
    descriptionEn: "Logo in the landing page header",
    descriptionAr: "الشعار في رأس صفحة الهبوط",
    route: "/landing",
    icon: Globe,
    priority: 2
  },
  {
    id: "sidebar-logo",
    variant: "app-icon-512",
    nameEn: "Sidebar Navigation",
    nameAr: "الشريط الجانبي",
    descriptionEn: "Logo displayed in the sidebar navigation",
    descriptionAr: "الشعار المعروض في التنقل الجانبي",
    route: "/builder",
    icon: Menu,
    priority: 3
  },
  {
    id: "browser-favicon-32",
    variant: "favicon-32",
    nameEn: "Browser Favicon (32px)",
    nameAr: "أيقونة المتصفح (32 بكسل)",
    descriptionEn: "Favicon shown in browser tabs (standard size)",
    descriptionAr: "الأيقونة المعروضة في علامات تبويب المتصفح (الحجم القياسي)",
    route: "/",
    icon: Chrome,
    priority: 4
  },
  {
    id: "browser-favicon-16",
    variant: "favicon-16",
    nameEn: "Browser Favicon (16px)",
    nameAr: "أيقونة المتصفح (16 بكسل)",
    descriptionEn: "Small favicon for bookmarks and address bar",
    descriptionAr: "أيقونة صغيرة للإشارات المرجعية وشريط العناوين",
    route: "/",
    icon: Chrome,
    priority: 5
  },
  {
    id: "app-icon",
    variant: "app-icon-1024",
    nameEn: "App Icon (Mobile/Desktop)",
    nameAr: "أيقونة التطبيق (موبايل/سطح المكتب)",
    descriptionEn: "High-resolution icon for mobile and desktop apps",
    descriptionAr: "أيقونة عالية الدقة لتطبيقات الموبايل وسطح المكتب",
    route: "/one-click-deploy",
    icon: Smartphone,
    priority: 6
  },
  {
    id: "tab-icon",
    variant: "tab-icon",
    nameEn: "Tab Icon",
    nameAr: "أيقونة التبويب",
    descriptionEn: "Icon shown in browser tab titles",
    descriptionAr: "الأيقونة المعروضة في عناوين تبويبات المتصفح",
    route: "/",
    icon: AppWindow,
    priority: 7
  },
  {
    id: "mono-svg",
    variant: "mono-svg",
    nameEn: "Monochrome Version",
    nameAr: "النسخة أحادية اللون",
    descriptionEn: "Single-color version for printing and documents",
    descriptionAr: "نسخة بلون واحد للطباعة والمستندات",
    route: "/visual-identity",
    icon: FileImage,
    priority: 8
  },
  {
    id: "light-bg",
    variant: "light-bg",
    nameEn: "Light Background",
    nameAr: "الخلفية الفاتحة",
    descriptionEn: "Optimized for light theme backgrounds",
    descriptionAr: "محسّن للخلفيات ذات الوضع الفاتح",
    route: "/",
    icon: Sun,
    priority: 9
  },
  {
    id: "dark-bg",
    variant: "dark-bg",
    nameEn: "Dark Background",
    nameAr: "الخلفية الداكنة",
    descriptionEn: "Optimized for dark theme backgrounds",
    descriptionAr: "محسّن للخلفيات ذات الوضع الداكن",
    route: "/",
    icon: Moon,
    priority: 10
  }
];

export function getTargetByVariant(variant: LogoVariantType): LogoTargetLocation | undefined {
  return logoTargetLocations.find(t => t.variant === variant);
}

export function getTargetsByPriority(): LogoTargetLocation[] {
  return [...logoTargetLocations].sort((a, b) => a.priority - b.priority);
}
