# INFERA WebNova Design Guidelines

## Design Approach
**Premium Developer Tool Reference** - Drawing from Linear (interactions), VS Code (editor ergonomics), Vercel (dashboard polish), and Awwwards-level visual sophistication. Professional dark mode as primary interface with glassmorphism accents and subtle gradient overlays.

## Typography System
- **Primary**: Inter (UI), JetBrains Mono (code)
- **Hero/Marketing**: text-6xl to text-7xl, font-bold, tracking-tight
- **Dashboard Headers**: text-4xl, font-semibold
- **Section Titles**: text-2xl, font-semibold
- **Body/Labels**: text-sm to text-base, font-medium
- **Code**: text-sm, font-mono, line-height-relaxed

## Layout & Spacing
**Tailwind Units**: 1, 2, 4, 6, 8, 12, 16, 20, 24
- Tight spacing: gap-1, p-2 (toolbar groups)
- Standard: p-4, gap-4 (panels, cards)
- Generous: p-8, gap-8 (sections)
- Container: max-w-screen-2xl

## Core Application Structure

### IDE Layout (Multi-Panel Workspace)
**Four-region split**:
1. **Left Sidebar** (w-56): File explorer tree, nested folders with expand/collapse
2. **Main Editor** (flex-1): Monaco editor with tabs, breadcrumbs, minimap toggle
3. **Right Panel** (w-96, resizable): Live preview with device frames (desktop/tablet/mobile toggles)
4. **Bottom Panel** (h-64, collapsible): Terminal with tabs, output logs, problems view

### Dashboard/Projects View
**Hero Section**: Full-width gradient background with floating glassmorphic cards showcasing platform features, large hero image of the IDE interface in action (aspect-video, rounded-2xl, with subtle shadow and glow), CTA buttons with backdrop-blur-lg

**Project Grid**: grid-cols-1 md:grid-cols-2 xl:grid-cols-3, gap-6
- Project cards with code preview thumbnails
- Tech stack badges
- Last edited timestamp
- Quick action menu (3-dot)

## Component Library

### Editor Interface
- **Tab Bar**: Horizontal tabs with close buttons, overflow scroll, active tab indicator
- **Breadcrumbs**: File path navigation (text-xs, separated by chevrons)
- **Line Numbers**: Gutter with text-xs, monospace
- **Minimap**: Collapsible code overview (w-20)
- **Status Bar**: Fixed bottom, file info, cursor position, language mode

### File Explorer
- **Tree View**: Indent-4 per level, folder icons with expand carets
- **Context Menu**: Right-click actions (New File, Rename, Delete)
- **Search Bar**: Sticky top with filter input (rounded-lg, px-3 py-2)

### Terminal Component
- **Tab System**: Multiple terminal instances, draggable tabs
- **Command Input**: Monospace, with prompt indicator
- **Output Area**: Scrollable, ANSI color support
- **Split View**: Horizontal/vertical terminal splits

### Live Preview Pane
- **Device Frame**: Browser chrome simulation with URL bar, navigation controls
- **Viewport Toggle**: Button group for responsive sizes (inline-flex, rounded-full group)
- **Refresh Controls**: Circular icon button with loading spinner
- **Split Modes**: Side-by-side code/preview or fullscreen preview

### AI Assistant Panel
- **Chat Interface**: Fixed height with scroll (h-96)
- **Message Bubbles**: User (max-w-md, rounded-2xl, px-4 py-3, self-end), AI (max-w-lg, rounded-2xl, px-5 py-4, self-start)
- **Suggested Actions**: Chip array below input (rounded-full, px-4 py-2, gap-2)
- **Input Field**: Textarea with grow behavior, backdrop-blur, rounded-xl

### Navigation & Controls
- **Top Bar**: Sticky (h-14), logo, project name, breadcrumb trail, user menu, export/deploy buttons
- **Toolbar Groups**: Segmented controls for view modes, separated by dividers
- **Action Buttons**: Primary (px-6 py-2.5, rounded-lg, font-semibold), Icon-only (w-9 h-9, rounded-lg)

### Modals & Overlays
- **Command Palette**: Centered (max-w-2xl), rounded-2xl, backdrop-blur-2xl, search input with results list
- **Settings Panel**: Slide-in from right (w-96), tabs for categories
- **Template Gallery**: Grid modal with filterable cards

### Cards & Containers
- **Glassmorphic Panels**: backdrop-blur-xl, rounded-2xl, border with opacity
- **Feature Cards**: p-6 to p-8, hover lift effect (transform transition-transform duration-300)
- **Stats Cards**: Grid of metrics (grid-cols-2 lg:grid-cols-4), icon + number + label

## RTL Support Architecture
- **Layout Mirroring**: File explorer stays left, preview right (consistent across locales)
- **Text Flow**: dir="rtl" on Arabic content blocks
- **Icon Placement**: Chevrons and arrows flip direction
- **Padding**: Use logical properties (ps-4 instead of pl-4)

## Animations (Framer Motion)
- **Panel Transitions**: Slide with spring physics (stiffness: 300, damping: 30)
- **Modal Entry**: Scale from 0.95 with fade (duration: 0.3s)
- **Tab Switching**: Crossfade content (duration: 0.2s)
- **File Tree**: Expand/collapse with height animation
- **Hover States**: Scale-105 for cards, opacity transitions for buttons
- **Loading States**: Skeleton screens with shimmer effect

## Icons
**Heroicons** (outline: navigation, solid: active states) + **VS Code Icons** for file types
- UI: 20px, Toolbar: 18px, Tree: 16px

## Images
**Hero Image**: Large IDE screenshot showing split-panel layout with code and preview (aspect-video, prominent placement, rounded-2xl, subtle glow effect)
**Dashboard**: Empty state illustration (developer at work), project thumbnails (website previews)
**Marketing Sections**: Feature demonstrations (code completion, AI assistance, deployment flow)
**Buttons on Images**: All CTAs over hero use backdrop-blur-lg background

## Accessibility
- Focus visible on all interactive elements (ring-2 with offset)
- ARIA labels for icon buttons and dynamic panels
- Keyboard shortcuts for panel navigation (Cmd+B toggle sidebar, Cmd+J toggle terminal)
- Screen reader announcements for AI responses
- High contrast mode support

## Responsive Breakpoints
- **Mobile** (< 768px): Single panel, bottom sheet for secondary views, hamburger menu
- **Tablet** (768px-1024px): Two-panel (editor + preview OR editor + files)
- **Desktop** (1024px+): Full four-panel workspace with resizable dividers
- **Ultrawide** (1920px+): Optional fifth panel for docs/references