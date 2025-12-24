# StratOSphere UI Design Rules

**Status: Source of truth**

---

- **Aesthetic baseline**: Quietly opinionated, “paperclip punk” — muted, low-saturation, industrial/analog, closer to Linear/Arc than to playful or glossy SaaS.
- **Color system**:
  - **Use tokens only**: Colors must come from the design tokens defined in `app/globals.css` (`--background`, `--surface`, `--primary`, `--secondary`, `--muted`, `--border`, `--text`, `--text-muted`, `--accent`, etc.) and their Tailwind aliases (`bg-background`, `bg-surface`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-muted`, `bg-input`, `text-destructive`, `text-accent-foreground`, etc.).
  - **Background vs surface**: Reserve `background` for the page canvas and `surface`/`card` for panels, cards, and navigation shells.
  - **Accent**: `accent` is for rare emphasis (selection, key indicators, focused states), never for large fills or default backgrounds.
- **General feel**:
  - **Muted contrast**: Prefer warm off-whites, soft graphite, and desaturated blues/greens. Avoid pure white/black, neon, or highly saturated hues.
  - **Calm hierarchy**: Typography, spacing, and subtle borders carry hierarchy more than loud color.
- **Elements**:
  - **Buttons**:
    - **Primary** (`variant="default"`): Solid `bg-primary text-primary-foreground`, used for the single main action in a context.
    - **Secondary / outline** (`variant="outline"`): `bg-surface` or `bg-card` with `border-border`, used for secondary actions and non-destructive affordances.
    - **Ghost** (`variant="ghost"`): Minimal chrome, transparent background with subtle hover (`hover:bg-muted`), used for low-emphasis actions.
    - **Hover/focus**: Only adjust background/border/opacity. No scale, rotation, or heavy box-shadows.
  - **Inputs / textareas**:
    - Use `Input` / `Textarea` components from `components/ui`, which already wire into `bg-input`, `border-input`, `text-muted-foreground`, and `ring-ring`.
    - Do not restyle with raw hex values or Tailwind’s default gray/blue palettes.
  - **Cards / panels**:
    - Use the `.panel` utility class (border, `bg-card`, slight rounding) or equivalent `bg-card` + `border-border` styling.
    - Shadows should be minimal or absent; rely on spacing, border, and background contrast instead.
  - **Tabs**:
    - Use `.tabs-list` and `.tabs-trigger` primitives as the starting point for any tabbed navigation.
    - Active states flip background to `bg-background` and text to `text-foreground`; inactive states use `text-muted-foreground`.
- **Micro-interactions**:
  - **Radii**: Keep corners between 2–6px (`rounded-sm` to `rounded-md`), never pill-shaped for primary layout elements.
  - **Borders**: 1px, low-contrast, using `border-border` (or derived from it).
  - **Motion**: Keep transitions subtle and functional (color/opacity/border), avoiding bouncy or playful animations.
- **Extensibility**:
  - When adding new components, **start from existing tokens and utilities** instead of inventing one-off colors or shadows.
  - If a new semantic color is truly needed, add it first as a token in `app/globals.css` and expose it via `@theme inline` so Tailwind can consume it.
