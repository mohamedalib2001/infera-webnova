# INFERA WebNova Enterprise AI Platform - Design Guidelines

## Design Approach
**Premium AI-First Developer Tool** - Inspired by Linear's polish, VS Code's ergonomics, ChatGPT's conversational UI, and Vercel's dashboard sophistication. Professional dark theme with deep blues, purples, and cyan AI accents. Glassmorphism with gradient overlays for premium enterprise feel.

## Typography System
- **Primary**: Inter (400, 500, 600, 700)
- **Code**: JetBrains Mono (400, 500)
- **Hero Headlines**: text-6xl/text-7xl, font-bold, tracking-tight, gradient text effect
- **Section Headers**: text-4xl, font-semibold
- **Panel Titles**: text-xl, font-semibold
- **Body**: text-sm/text-base, font-medium
- **Code/Terminal**: text-sm, font-mono, leading-relaxed

## Color Architecture
**Foundation**: Deep navy/slate backgrounds (#0A0E1A, #0F1419)
**AI Accents**: Cyan (#00D9FF), Electric Blue (#4F46E5), Purple (#8B5CF6)
**Gradients**: Subtle blue-to-purple overlays, cyan glow effects on AI elements
**Glass Effects**: backdrop-blur-xl with border opacity, rgba overlays

## Layout & Spacing
**Tailwind Units**: 2, 4, 6, 8, 12, 16, 20, 24
- Compact: gap-2, p-4 (chat messages, toolbar)
- Standard: p-6, gap-6 (panels, cards)
- Generous: p-8, gap-8 (hero sections)
- Container: max-w-screen-2xl

## Core Application Structure

### Three-Panel AI Workspace
1. **Left: Nova AI Chat** (w-96, fixed): Chat interface with gradient header, message stream, input field with AI suggestions
2. **Center: Code/Content Editor** (flex-1): Monaco editor with tabs, breadcrumbs, syntax highlighting
3. **Right: Live Preview** (w-[600px], resizable): Device frame previews with responsive toggles

**Top Navigation Bar** (h-16, sticky): Logo, project selector, view mode toggles, export/deploy buttons, user menu

**Bottom Status Bar** (h-10, fixed): File info, AI status indicator (pulsing when active), cursor position, language mode

### Marketing/Landing Page Structure
**Hero Section**: Full-width (min-h-screen), large hero image showing the AI platform in action (split-screen IDE with chat + code + preview), centered headline with gradient text, dual CTAs with backdrop-blur-lg backgrounds positioned over image

**Features Grid**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-8
- Feature cards with icon, title, description, subtle glow on hover
- AI capability highlights with cyan accent borders

**Social Proof**: Centered testimonials, trust badges, enterprise client logos
**Pricing Table**: 3-column comparison with highlighted recommended tier
**Footer**: Multi-column (Company, Product, Resources, Legal), newsletter signup, social links

## Component Library

### Nova AI Chat Panel
- **Header**: Gradient background (blue-to-purple), "Nova AI" title, minimize/expand controls
- **Message Stream**: Scrollable (overflow-y-auto), alternating user/AI messages
  - User messages: rounded-2xl, px-4 py-3, max-w-[85%], self-end alignment
  - AI messages: rounded-2xl, px-5 py-4, max-w-[90%], self-start, subtle cyan glow
- **Suggested Actions**: Horizontal chip array below messages (rounded-full, px-4 py-2, gap-2, glass effect)
- **Input Field**: Textarea with auto-grow, rounded-xl, backdrop-blur, with send button (cyan gradient on hover)
- **Typing Indicator**: Animated dots when AI is processing

### Code Editor Panel
- **Tab Bar**: Horizontal file tabs, close buttons, active indicator (cyan underline glow)
- **Breadcrumbs**: Path navigation (text-xs, chevron separators)
- **Editor Area**: Monaco integration with minimap toggle (w-20, collapsible)
- **AI Inline Suggestions**: Ghost text with subtle cyan tint, tab-to-accept

### Preview Panel
- **Device Frame Toggle**: Button group (Desktop/Tablet/Mobile), rounded-full segmented control
- **Browser Chrome**: Simulated address bar with navigation controls
- **Viewport Container**: Scrollable iframe with responsive sizing
- **Refresh/Sync Controls**: Circular icon buttons with loading states

### Dashboard/Projects View
- **Project Cards**: Grid layout, glassmorphic containers (p-6, rounded-2xl, backdrop-blur-xl)
  - Code preview thumbnail with gradient border
  - Tech stack badges (rounded-full, small)
  - Last modified timestamp
  - Quick actions menu (3-dot dropdown)
- **Empty State**: Centered illustration, large create button with gradient

### Navigation Components
- **Top Bar**: Logo + project selector (dropdown), view mode toggles, primary action buttons (gradient fills for Deploy)
- **Command Palette**: Centered modal (max-w-2xl), rounded-2xl, backdrop-blur-2xl, fuzzy search with keyboard shortcuts
- **Settings Panel**: Slide-in drawer from right (w-96), tabbed categories

### Cards & Containers
- **Glass Panels**: backdrop-blur-xl, rounded-2xl, border with subtle opacity, gradient overlays on hover
- **Feature Cards**: p-8, icon with cyan glow, hover lift (transform scale-105)
- **Stats Cards**: Grid of metrics (icon + large number + label), gradient accent borders

## RTL Support
- **Mirror Layouts**: Chat stays left, preview right (consistent regardless of language)
- **Text Direction**: dir="rtl" on Arabic content
- **Icon Flipping**: Chevrons, arrows reverse direction
- **Logical Properties**: Use ps-/pe- instead of pl-/pr-

## Animations (Framer Motion)
- **Panel Slides**: Spring physics (stiffness: 300, damping: 30)
- **Message Entry**: Slide-up with fade for new chat messages
- **AI Thinking**: Pulsing glow effect on Nova avatar
- **Modal Appearance**: Scale from 0.96 with backdrop fade
- **Hover States**: Subtle lift (scale-102) on cards, glow intensity increase
- **Tab Switching**: Crossfade content (duration: 0.2s)

## Icons
**Heroicons** via CDN (outline for navigation, solid for active states)
- Standard: 20px, Toolbar: 18px, Small: 16px
- AI elements: Custom glowing container around icons

## Images
**Hero Image**: Large, prominent split-screen IDE screenshot showing AI chat + code editor + live preview in action (aspect-video, rounded-2xl, with cyan/purple glow effect). Position: Top of landing page with gradient overlay and CTAs using backdrop-blur-lg backgrounds.

**Dashboard**: Project preview thumbnails (website screenshots), AI assistant illustration for empty states

**Marketing**: Feature demonstrations (AI code completion, chat assistance, deployment workflow), customer testimonials with headshots

## Accessibility
- Focus visible ring-2 with cyan accent color
- ARIA labels for all icon buttons and dynamic panels
- Keyboard shortcuts (Cmd+K command palette, Cmd+/ toggle chat)
- Screen reader announcements for AI responses
- High contrast mode with increased glow intensity

## Responsive Breakpoints
- **Mobile** (< 768px): Single panel view, bottom sheet for chat, hamburger menu
- **Tablet** (768-1024px): Two-panel (chat + editor OR editor + preview)
- **Desktop** (1024px+): Full three-panel workspace with resizable dividers
- **Ultrawide** (1920px+): Optional fourth panel for documentation