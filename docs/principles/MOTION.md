# Motion System

**Status: Source of truth for marketing motion/animation**

## Overview

The motion system provides reusable, accessible animation primitives for marketing pages. All animations are **restrained, premium, and "quietly magical"** through clarity and polish—not gimmicks.

**Design Intent:**
- Editorial transitions (like high-end product sites)
- Premium feel through subtle, intentional motion
- "Settling into place" rather than springy or bouncy
- Stripe-esque quality

**Do NOT:**
- Use parallax scrolling
- Add springy physics or bouncing
- Create constant looping animations
- Use scroll-jank effects
- Animate long paragraphs (feels gimmicky)

---

## Motion Tokens

All motion values are defined in `lib/motion/tokens.ts`. Use these tokens for consistency.

### Durations (milliseconds)
- `fast`: 150ms — Quick transitions, hover states
- `base`: 200ms — Standard animations (most common)
- `slow`: 300ms — Deliberate, intentional animations

### Easing (cubic-bezier)
- `standard`: `cubic-bezier(0.4, 0, 0.2, 1)` — General purpose
- `enter`: `cubic-bezier(0, 0, 0.2, 1)` — Elements appearing (ease-out)
- `exit`: `cubic-bezier(0.4, 0, 1, 1)` — Elements leaving (ease-in)

### Distances (pixels)
- `liftSm`: 6px — Small lift for cards/buttons
- `liftMd`: 12px — Medium lift
- `revealY`: 8px — Default reveal translateY (subtle down movement)

### Opacity
- `initial`: 0.6 — Slightly transparent when hidden
- `final`: 1.0 — Full opacity when revealed

### Stagger Timing (milliseconds)
- `base`: 60ms — Standard delay between items
- `fast`: 40ms — Faster stagger for shorter lists
- `slow`: 80ms — Slower stagger for longer lists

---

## Components

### Reveal

Wrapper that reveals children on first viewport entry with fade + translate animation.

**Usage:**
```tsx
import { Reveal } from "@/components/marketing/motion"

<Reveal delay={60} y={8}>
  <h2>Section Title</h2>
</Reveal>
```

**Props:**
- `delay?: number` — Delay in milliseconds before animation (default: 0)
- `y?: number` — TranslateY distance (default: 8px)
- `once?: boolean` — Only animate once (default: true)
- `as?: keyof JSX.IntrinsicElements` — Element type (default: "div")
- `className?: string` — Additional CSS classes
- `threshold?: number` — IntersectionObserver threshold 0-1 (default: 0.1)

**When to use:**
- Section headers
- First paragraph after a header
- Individual cards or panels
- Any content that should fade in on scroll

**When NOT to use:**
- Long paragraphs (feels gimmicky)
- Navigation elements
- Frequently changing content

### Stagger

Applies staggered reveal animations to a list of children.

**Usage:**
```tsx
import { Stagger } from "@/components/marketing/motion"

<Stagger stagger={60} className="grid grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</Stagger>
```

**Props:**
- `stagger?: number` — Delay between items in milliseconds (default: 60ms)
- `y?: number` — TranslateY distance for reveals
- `once?: boolean` — Only animate once (default: true)
- `className?: string` — Container CSS classes
- `childClassName?: string` — Applied to each wrapped child
- `threshold?: number` — IntersectionObserver threshold

**When to use:**
- Grids of cards (3-6 items)
- Lists of features
- Any repeating content that should animate sequentially

**When NOT to use:**
- Long lists (>6 items — becomes distracting)
- Navigation menus
- Tables or data grids

### HoverLift

CSS utility class for subtle card/button hover effects.

**Usage:**
```tsx
import { HoverLift } from "@/components/marketing/motion"
import { cn } from "@/lib/utils"

<button className={cn("card", HoverLift.className)}>
  Click me
</button>
```

**Variants:**
- `HoverLift.className` — Standard hover lift (default)
- `HoverLift.strong` — Stronger lift effect
- `HoverLift.subtle` — Minimal lift effect

**When to use:**
- Interactive cards
- Buttons (primary and secondary)
- Any clickable/tappable element

**When NOT to use:**
- Navigation links
- Text links
- Non-interactive elements

---

## Accessibility

### Reduced Motion Support

All motion components automatically respect `prefers-reduced-motion: reduce`. When this preference is detected:

- `Reveal` renders immediately (no translate/opacity animation)
- Transitions are disabled
- Content is accessible without waiting for animations

**Implementation:**
The `prefersReducedMotion()` utility in `lib/motion/tokens.ts` checks the user's preference. All components handle this automatically.

**Testing:**
- Enable "Reduce motion" in OS accessibility settings
- Verify animations are disabled or minimal
- Content should remain fully accessible

---

## Patterns & Guidelines

### Hero Section

**Typical pattern:**
1. Headline: `Reveal` (delay: 0)
2. Subhead: `Reveal` (delay: 60ms)
3. CTAs: `Reveal` (delay: 120ms) + `HoverLift` on buttons
4. Proof chips: `Reveal` (delay: 180ms) + `Stagger` within (stagger: 40ms)

### Section with Cards

**Typical pattern:**
1. Section header: `Reveal`
2. Cards: `Stagger` wrapper (stagger: 60ms) + `HoverLift` on each card
3. Closing text: `Reveal` (delay: 120ms)

### Connecting Elements

**For threads/connectors:**
- Use `Reveal` with `y={0}` for fade-in only (no translate)
- No drawing animation
- Subtle fade that doesn't distract

---

## Do's and Don'ts

### ✅ Do

- Use Reveal for section headers and first paragraphs
- Stagger grid items (3-6 items max)
- Apply HoverLift to interactive cards/buttons
- Keep animations subtle (8-12px max translate)
- Respect reduced motion preferences
- Test on slower devices

### ❌ Don't

- Use parallax scrolling
- Animate long paragraphs
- Add constant looping animations
- Use springy/bouncy physics
- Exceed 12px translate distance
- Animate navigation elements
- Ignore reduced motion preferences

---

## Examples

### Complete Hero Section

```tsx
<Reveal delay={0}>
  <h1>Headline</h1>
</Reveal>

<Reveal delay={60}>
  <p>Subheadline text</p>
</Reveal>

<Reveal delay={120}>
  <div className="flex gap-4">
    <Button className={HoverLift.className}>Primary CTA</Button>
    <Button variant="outline" className={HoverLift.subtle}>Secondary</Button>
  </div>
</Reveal>

<Reveal delay={180}>
  <Stagger stagger={40}>
    {badges.map(badge => <Badge key={badge}>{badge}</Badge>)}
  </Stagger>
</Reveal>
```

### Section with Cards

```tsx
<Reveal>
  <h2>Section Title</h2>
</Reveal>

<Stagger stagger={60} className="grid grid-cols-3 gap-6">
  {cards.map(card => (
    <div key={card.id} className={cn("card", HoverLift.subtle)}>
      {card.content}
    </div>
  ))}
</Stagger>
```

---

## Default Values Reference

All defaults are defined in `lib/motion/tokens.ts`:

- **Enter duration**: 180-220ms (use `base: 200ms`)
- **Exit duration**: 140-180ms (use `fast: 150ms`)
- **Stagger**: 60-90ms (use `base: 60ms`)
- **TranslateY**: 6-12px max (use `revealY: 8px`)

Keep everything subtle. When in doubt, use smaller values.

---

## Files

- **Tokens**: `lib/motion/tokens.ts`
- **Components**: `components/marketing/motion/*`
- **Index**: `components/marketing/motion/index.ts`

---

## Future Considerations

- Could extend Stagger to support custom delay functions
- Could add a FadeIn component for opacity-only animations
- Could add a ScaleReveal for different reveal styles (but keep it subtle)

