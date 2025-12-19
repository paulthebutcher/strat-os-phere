# StratOSphere Design System

## Overview

This design system establishes a professional, production-grade UI foundation for StratOSphere—a B2B strategy tool. The UI should feel **calm, trustworthy, and invisible**—not expressive or experimental.

**Design Intent:**
- Professional, restrained, and modern
- High readability and low visual noise
- Familiar patterns that reduce cognitive load
- Closer to Linear / Notion / Figma than a marketing site

**Do NOT:**
- Use playful, punk, or experimental styles
- Add heavy shadows, gradients, or decorative elements
- Introduce personality through visuals

---

## Design Tokens

All UI must use design tokens. **No hardcoded hex values, colors, spacing, or typography.**

### Backgrounds
- `--background`: Off-white / very light gray (app background)
- `--surface`: Pure white (cards/panels)
- `--surface-muted`: Very light gray (subtle sections)

**Usage:**
- `bg-background` - Main app background
- `bg-surface` - Cards and panels
- `bg-surface-muted` - Muted fills, table rows, subtle backgrounds

### Text
- `--text-primary`: Dark gray (not pure black) - Primary text
- `--text-secondary`: Medium gray - Secondary text, supporting content
- `--text-muted`: Light gray - Labels, helpers, meta information

**Usage:**
- `text-text-primary` - Headings, body text
- `text-text-secondary` - Supporting text, descriptions
- `text-text-muted` - Labels, timestamps, meta info

### Borders
- `--border-subtle`: Light gray - Standard borders
- `--border-strong`: Medium gray - Emphasis borders

**Usage:**
- `border-border-subtle` - Default borders
- `border-border-strong` - Stronger emphasis (rarely used)

### Accents
- `--accent-primary`: Desaturated blue - Primary actions, links
- `--accent-secondary`: Dark slate - Secondary emphasis

**Usage:**
- `bg-accent-primary` / `text-accent-primary` - Primary buttons, links
- `bg-accent-secondary` / `text-accent-secondary` - Secondary emphasis

### States
- `--success`: Green - Success states
- `--warning`: Yellow/Orange - Warning states
- `--danger`: Red - Destructive actions, errors

**Usage:**
- `text-success`, `bg-success/10` - Success messages
- `text-warning`, `bg-warning/10` - Warnings
- `text-danger`, `bg-danger/10` - Errors, destructive actions

---

## Typography

### Hierarchy
- **Page titles (h1)**: `text-2xl font-semibold` - Large, semibold
- **Section headers (h2)**: `text-xl font-semibold` - Section titles
- **Subsection (h3)**: `text-lg font-semibold` - Subsections
- **Body text**: `text-base` - Default body text
- **Small / Meta**: `text-sm` or `text-xs` - Labels, meta information

### Font
- **Primary**: Geist Sans (system font fallback)
- **Monospace**: Geist Mono (for code, IDs, technical content)

### Line Height
- **Tight**: `leading-tight` (1.25) - Headings
- **Normal**: `leading-normal` (1.5) - Default body text
- **Relaxed**: `leading-relaxed` (1.75) - Long-form content

---

## UI Primitives

### Buttons
- **Primary**: `variant="default"` - Solid blue background
- **Secondary**: `variant="outline"` - Outlined with border
- **Ghost**: `variant="ghost"` - Transparent, minimal chrome
- **Destructive**: `variant="destructive"` - Red for dangerous actions
- **Link**: `variant="link"` - Text link style

**Sizes:**
- `size="sm"` - Small (h-9)
- `size="default"` - Default (h-10)
- `size="lg"` - Large (h-11)

### Inputs / Textareas
- Flat design with subtle 1px border
- White background (`bg-surface`)
- Border: `border-border-subtle`
- Focus: Ring using `accent-primary`
- Placeholder: `text-text-muted`

### Cards / Panels
Use the `.panel` utility class:
- Rounded corners (`rounded-md` = 6px)
- 1px border (`border-border-subtle`)
- White background (`bg-surface`)
- No shadows

**Muted variant**: `.panel-muted` for subtle sections

### Tabs
Use `TabsList` and `TabsTrigger` components:
- Flat design
- Subtle border container
- Active state: background change + semibold text

### Tables
Use `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` components:
- Striped rows using `bg-surface-muted` on hover
- Headers: `bg-surface-muted` with uppercase, small text
- Subtle borders between rows

### Badges
Use `Badge` component with variants:
- `variant="default"` - Neutral gray
- `variant="primary"` - Blue accent
- `variant="success"` - Green
- `variant="warning"` - Yellow/Orange
- `variant="danger"` - Red

---

## Visual Rules

1. **Flat design** - No heavy shadows, gradients, or decorative elements
2. **Subtle borders** - 1px borders using `border-border-subtle`
3. **Minimal shadows** - Avoid shadows; use borders for separation
4. **Border radius** - Consistent 6px (`--radius`) for all rounded elements
5. **Spacing** - Use Tailwind's spacing scale (4px increments)
6. **Consistent padding** - Standard padding: `px-4 py-3` for cards, `px-6 py-4` for panels

---

## Layout

### Global Navigation
- Persistent top navigation bar
- App name / logo (left)
- Primary nav links: Projects, Insights, Help
- User email and sign out (right)
- Sticky with backdrop blur

### Content Areas
- Max width containers with consistent padding
- Centered layouts for focused content
- Responsive breakpoints: `sm:`, `md:`, `lg:`

### Page Structure
```tsx
<div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
  <main className="flex w-full max-w-4xl flex-col gap-6 py-10">
    {/* Page content */}
  </main>
</div>
```

---

## Guardrails

⚠️ **All UI must use design tokens. No exceptions.**

1. **No hardcoded colors** - Always use design tokens (`text-text-primary`, `bg-surface`, etc.)
2. **No hardcoded spacing** - Use Tailwind spacing utilities
3. **No new component styles** - Update the design system first
4. **Consistent patterns** - Follow existing component patterns
5. **Accessibility first** - Ensure proper contrast ratios and focus states

### Before Adding New Styles

1. Check if a design token already exists
2. Check if a component already exists
3. If not, add to the design system first (`globals.css`)
4. Create reusable component if needed
5. Document usage

---

## Component Examples

### Card with content
```tsx
<div className="panel p-6">
  <h2 className="text-lg font-semibold text-text-primary">Title</h2>
  <p className="mt-2 text-sm text-text-secondary">Description</p>
</div>
```

### Button usage
```tsx
<Button variant="default" size="sm">Primary Action</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Tertiary</Button>
```

### Form input
```tsx
<label className="text-sm font-medium text-text-primary">
  Email
</label>
<Input type="email" placeholder="you@example.com" />
```

---

## References

- **Inspiration**: Linear, Notion, Figma
- **Design tokens**: Defined in `app/globals.css`
- **Components**: Located in `components/ui/`

