# App Theme Alignment

**Purpose**: Documents the unified design system tokens that align the app experience with the marketing site's premium aesthetic.

**When to read this**: When styling new components or updating existing ones. Always use design tokens instead of hardcoded colors, spacing, or typography.

---

## Overview

The app and marketing site now share a unified design system built on CSS custom properties (design tokens). This ensures visual consistency, maintainability, and a cohesive brand experience across the entire product.

**Design Philosophy**:
- Quiet confidence over visual excitement
- Hierarchy > decoration
- Typography does most of the work
- Whitespace is intentional
- Color encodes meaning, not personality
- Everything should look finished even when empty

---

## Core Token Groups

### 1. Typography

All typography uses semantic size tokens defined in `globals.css`:

```css
/* Heading sizes */
--text-heading-xl-size: 2.25rem; /* 36px - Hero/page titles */
--text-heading-l-size: 1.75rem;   /* 28px - Section headers */
--text-heading-m-size: 1.375rem;  /* 22px - Card titles */

/* Body sizes */
--text-body-size: 0.9375rem;      /* 15px - Default text */
--text-label-size: 0.8125rem;     /* 13px - Metadata/labels */
```

**Usage in components**:
- Use `text-heading-l` class for page titles (h1)
- Use `text-heading-m` class for card titles (h3)
- Use `text-body` for default text
- Use `text-label` for metadata

**Example**:
```tsx
<h1 className="text-heading-l font-semibold">Projects</h1>
<h3 className="text-heading-m font-semibold">Card Title</h3>
```

### 2. Surfaces (Backgrounds & Cards)

Three-level surface system for clear visual hierarchy:

```css
/* SurfaceBase - Page background */
--surface-base-bg: var(--background); /* Pure white */

/* SurfaceRaised - Cards, panels */
--surface-raised-bg: var(--surface); /* Pure white */
--surface-raised-border: var(--border-subtle);
--surface-raised-shadow: var(--shadow-sm);

/* SurfaceOverlay - Nav, modals */
--surface-overlay-bg: var(--surface);
--surface-overlay-shadow: var(--shadow-md);
```

**Usage**:
- Cards: Use `bg-card border-border-subtle shadow-sm` classes
- Panels: Use `panel` utility class from globals.css
- Elevated cards: Add `shadow-md` for more depth

**Example**:
```tsx
<div className="bg-card border border-border-subtle rounded-lg shadow-sm p-6">
  {/* Card content */}
</div>
```

### 3. Colors

#### Neutrals
```css
--text-primary: 0 0% 5%;        /* Near-black for maximum authority */
--text-secondary: 0 0% 40%;     /* Medium gray - clear but secondary */
--text-muted: 0 0% 50%;         /* Muted text - supporting context */
```

#### Accent (Primary Brand)
```css
--accent-primary: 230 65% 50%;   /* Rich indigo - premium and modern */
--accent-primary-hover: 230 65% 45%;
```

#### Borders
```css
--border-subtle: 0 0% 92%;      /* Very light gray borders */
--border-strong: 0 0% 85%;      /* Subtle but clear separation */
```

**Usage**:
- Text: `text-foreground`, `text-muted-foreground`
- Borders: `border-border-subtle` (default), `border-border-strong` (emphasis)
- Primary actions: `bg-primary text-primary-foreground`

### 4. Shadows

Minimal, Notion/Fullstory-style restraint:

```css
--shadow-sm: 0 1px 1px 0 rgba(0, 0, 0, 0.03);
--shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
--shadow-md: 0 2px 4px 0 rgba(0, 0, 0, 0.05);
--shadow-lg: 0 4px 8px 0 rgba(0, 0, 0, 0.06);
```

**Usage**:
- Cards: `shadow-sm`
- Elevated cards: `shadow-md`
- Modals/overlays: `shadow-lg`

### 5. Border Radius

Subtle, consistent rounding:

```css
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.375rem; /* 6px - default */
--radius-lg: 0.5rem;   /* 8px */
--radius-xl: 0.75rem;  /* 12px */
```

**Usage**: Use Tailwind classes `rounded-md`, `rounded-lg`, etc.

### 6. Transitions

Standardized timing for all interactions:

```css
--transition-base: 175ms ease-out;
--transition-fast: 150ms ease-out;
--transition-slow: 200ms ease-out;
```

**Usage**: Use `transition-all duration-[175ms] ease-out` or `transition-colors duration-[175ms] ease-out`

---

## Component Patterns

### Buttons

Buttons use the unified `Button` component with variants:

```tsx
<Button variant="default">Primary action</Button>
<Button variant="secondary">Secondary action</Button>
<Button variant="outline">Tertiary action</Button>
<Button variant="ghost">Minimal action</Button>
<Button variant="brand">Marketing CTA</Button>
```

**Styling**:
- Primary: `bg-primary text-primary-foreground`
- Hover: Subtle opacity change or darker shade
- Focus: `ring-2 ring-ring ring-offset-1`
- Transitions: `duration-[175ms] ease-out`

### Inputs

Inputs use the unified `Input` component:

```tsx
<Input placeholder="Enter text..." />
```

**Styling**:
- Border: `border-border-subtle`
- Focus: `ring-2 ring-ring ring-offset-1`
- Hover: `hover:border-border-strong`

### Badges

Badges use semantic variants:

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
```

### Cards

Cards use the `Card` component or `SectionCard` for content sections:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Styling**:
- Background: `bg-card`
- Border: `border-border-subtle`
- Shadow: `shadow-sm`
- Radius: `rounded-md`

### Tables

Tables use the unified `Table` components:

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Styling**:
- Header: `bg-muted/20 border-b border-border-subtle`
- Rows: `border-b border-border-subtle hover:bg-muted/30`
- Head text: `text-xs font-semibold uppercase tracking-wide text-muted-foreground`

---

## What NOT to Do

### ❌ Avoid One-Off Colors

**Don't**:
```tsx
<div className="bg-[#f5f5f5]"> {/* Hardcoded color */}
<div className="text-gray-600"> {/* Direct Tailwind color */}
```

**Do**:
```tsx
<div className="bg-muted"> {/* Uses token */}
<div className="text-muted-foreground"> {/* Uses token */}
```

### ❌ Avoid Hardcoded Spacing

**Don't**:
```tsx
<div className="p-[18px]"> {/* Magic number */}
```

**Do**:
```tsx
<div className="p-4"> {/* Standard spacing */}
```

### ❌ Avoid Inconsistent Typography

**Don't**:
```tsx
<h1 className="text-3xl font-bold"> {/* Inconsistent size */}
```

**Do**:
```tsx
<h1 className="text-heading-l font-semibold"> {/* Uses token */}
```

### ❌ Avoid Inconsistent Borders

**Don't**:
```tsx
<div className="border border-gray-200"> {/* Direct color */}
```

**Do**:
```tsx
<div className="border border-border-subtle"> {/* Uses token */}
```

---

## Checklist for New Components

When creating or updating components, ensure:

- [ ] Uses design tokens (CSS variables) instead of hardcoded values
- [ ] Typography uses semantic size classes (`text-heading-l`, `text-body`, etc.)
- [ ] Colors use semantic tokens (`text-foreground`, `bg-card`, `border-border-subtle`)
- [ ] Shadows use standard levels (`shadow-sm`, `shadow-md`)
- [ ] Transitions use standardized timing (`duration-[175ms] ease-out`)
- [ ] Focus states are visible and use `ring-ring`
- [ ] Hover states are subtle and consistent
- [ ] Border radius is consistent (`rounded-md` default)
- [ ] Spacing uses standard Tailwind scale (4px increments)

---

## Alignment Validation

### Buttons
- [x] Primary buttons match marketing style (indigo, subtle shadow)
- [x] Hover states are consistent
- [x] Focus rings are visible and use brand color

### Focus Rings
- [x] All interactive elements have visible focus states
- [x] Focus ring uses `ring-ring` token
- [x] Focus ring offset is consistent (`ring-offset-1`)

### Cards
- [x] Cards use surface levels (SurfaceRaised)
- [x] Borders are subtle (`border-border-subtle`)
- [x] Shadows are minimal (`shadow-sm` default)

### Tables
- [x] Gridlines are lighter (`border-border-subtle`)
- [x] Header row typography is stronger (`font-semibold`)
- [x] Hover states are subtle (`hover:bg-muted/30`)

---

## Token Reference

All tokens are defined in `app/globals.css` under `:root`. Key tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `0 0% 5%` | Primary text color |
| `--text-secondary` | `0 0% 40%` | Secondary text color |
| `--accent-primary` | `230 65% 50%` | Primary brand color (indigo) |
| `--border-subtle` | `0 0% 92%` | Default border color |
| `--shadow-sm` | `0 1px 1px 0 rgba(0, 0, 0, 0.03)` | Subtle shadow |
| `--radius-md` | `0.375rem` | Default border radius |
| `--transition-base` | `175ms ease-out` | Standard transition |

---

## Migration Notes

This unified system replaces:
- Hardcoded colors in components
- Inconsistent spacing values
- Mixed typography scales
- Varying shadow styles

All components now use the shared token system, ensuring visual consistency across marketing and app experiences.

