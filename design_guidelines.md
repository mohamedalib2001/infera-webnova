# Design Guidelines: AI Website Builder Platform

## Design Approach
**Reference-Based + Design System Hybrid**
Drawing from modern SaaS products: Linear (clean interactions), Vercel (developer-focused simplicity), and Figma (collaborative workspace aesthetic). This creates a professional, productivity-focused environment that feels innovative yet familiar.

## Typography System
- **Primary Font**: Inter or DM Sans via Google Fonts
- **Monospace**: JetBrains Mono for code display
- **Hierarchy**:
  - Hero/Landing: text-5xl to text-6xl, font-bold
  - Page Titles: text-3xl, font-semibold
  - Section Headers: text-xl, font-semibold
  - Body: text-base, font-normal
  - UI Labels: text-sm, font-medium
  - Code: text-sm, font-mono

## Layout & Spacing System
**Tailwind Units**: Consistently use 2, 4, 6, 8, 12, 16, 24 (e.g., p-4, gap-6, mb-8)
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-16
- Grid gaps: gap-4 to gap-6
- Container max-width: max-w-7xl
- Sidebar width: w-64 to w-80

## Core Layout Structure

### Main Application Shell
Three-panel layout:
1. **Left Sidebar** (w-64): Project list, navigation, user account
2. **Center Panel** (flex-1): Chat interface and conversation history
3. **Right Panel** (flex-1): Live preview pane with responsive controls

### Dashboard/Projects View
Grid-based project cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) with:
- Project thumbnail
- Title and description
- Metadata (last edited, created date)
- Quick actions menu

## Component Library

### Chat Interface
- **Message Bubbles**: Rounded corners (rounded-2xl), generous padding (px-6 py-4)
- **User Messages**: Aligned right, max-w-2xl
- **AI Responses**: Aligned left, max-w-3xl
- **Input Area**: Fixed bottom, backdrop-blur effect, shadow-lg
- **Suggested Prompts**: Pill-shaped chips (rounded-full, px-4 py-2) below input

### Preview Pane
- **Device Frame**: Simulated browser/device chrome with URL bar
- **Viewport Controls**: Toggle buttons for desktop/tablet/mobile (inline-flex, gap-2)
- **Refresh Button**: Circular icon button (w-10 h-10)
- **Full-Screen Toggle**: Top-right corner

### Code Editor (when visible)
- **Split View**: Resizable panels
- **Syntax Highlighting**: Preserved with pre/code tags
- **Line Numbers**: Subtle, monospace, text-xs
- **Tab Bar**: Multiple file tabs with close buttons

### Navigation
- **Top Bar**: Sticky (sticky top-0), contains logo, project name, export/publish buttons
- **Sidebar Nav**: Icon + text pattern, active state with subtle indicator
- **Breadcrumbs**: For nested project views (text-sm, separated by chevrons)

### Buttons & Actions
- **Primary CTA**: Large (px-8 py-3), rounded-lg, font-semibold
- **Secondary**: Outlined style, same sizing
- **Icon Buttons**: Circular (rounded-full), w-10 h-10
- **Button Groups**: Inline-flex with gap-2

### Cards & Containers
- **Project Cards**: Aspect-video preview, rounded-xl, overflow-hidden, hover:scale effect (transform transition)
- **Info Cards**: Border style, rounded-lg, p-6
- **Modal Overlays**: Centered, max-w-2xl, rounded-xl, backdrop-blur

### Forms
- **Input Fields**: Rounded-lg, px-4 py-3, focus ring
- **Textareas**: Same as inputs, min-h-32
- **Select Dropdowns**: Consistent styling with inputs
- **Labels**: text-sm, font-medium, mb-2

### Templates Gallery
Grid layout (grid-cols-2 lg:grid-cols-3) with:
- Template preview image (aspect-video)
- Template name and category tag
- "Use Template" button on hover

## Animations
Minimal, purposeful animations:
- Page transitions: Fade (duration-200)
- Card hovers: Subtle scale (scale-105, duration-200)
- Modal appearance: Scale + fade (duration-300)
- Chat messages: Slide-in from appropriate side

## Icons
**Heroicons** via CDN (outline for nav, solid for actions)
- Navigation: 24px icons
- UI elements: 20px icons
- Inline icons: 16px icons

## Images
**Hero Section** (Landing/Welcome Screen):
- Large gradient background with subtle mesh pattern
- Floating browser window mockup showing the platform in action
- Central focus on "Start Building" CTA

**Dashboard**:
- Empty state illustration when no projects exist
- Project thumbnails showing actual website previews

**Templates Gallery**:
- High-quality screenshots of each template (aspect-video ratio)
- Category-specific placeholder images

## Accessibility
- Focus states on all interactive elements (ring-2, ring-offset-2)
- Adequate contrast ratios throughout
- Screen reader labels for icon-only buttons
- Keyboard navigation support for chat, editor, preview panels
- ARIA labels for dynamic content updates

## Responsive Strategy
- **Mobile** (< 768px): Single-panel view, bottom sheet for chat, hamburger menu
- **Tablet** (768px - 1024px): Two-panel (chat + preview), collapsible sidebar
- **Desktop** (> 1024px): Full three-panel layout