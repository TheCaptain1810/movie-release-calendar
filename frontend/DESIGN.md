# Design System — Release Calendar

Single source of truth for the UI. **Read this before changing any styling; update it when the system changes.**
Implementation lives in `src/index.css` (tokens + utilities) and `src/components/ui/*` (primitives).

## 1. Principles

1. **Gradient is the brand.** One signature gradient (violet → magenta → pink) marks *primary actions, the logo, "today", and the page title accent*. It is scarce on purpose — if everything is gradient, nothing is.
2. **Depth through glass, not borders.** Surfaces are translucent (`.glass`) floating over an aurora background. Hairline borders are low-contrast tints of the primary colour.
3. **Content first.** Movie posters are the most colourful thing on screen; chrome stays quiet (muted neutrals with a violet tint).
4. **Dark is the hero theme**, light must be equally polished (lavender-tinted, never pure grey).
5. **Motion is subtle and purposeful** (≤ 200ms interactions, one 450ms entrance). Respect `prefers-reduced-motion`.
6. **Full-width layout.** Page content is capped at `max-w-[1800px]`; never go back to narrow `max-w-5xl` for the calendar. Text-heavy pages (Search `max-w-3xl`, Settings `max-w-2xl`) stay narrow on purpose.

## 2. Colour tokens

Always use semantic tokens (Tailwind classes generated from `@theme inline`), **never raw hex in components**.

| Token | Use |
|---|---|
| `background` / `foreground` | page / body text |
| `card`, `popover` | opaque surfaces (rare — prefer `.glass`) |
| `primary` (`#6d4aff` light, `#8b6bff` dark) | focus rings, tracked-state accents, links, glows |
| `secondary`, `muted`, `accent` | tinted violet fills (chips, hover, active nav) |
| `muted-foreground` | secondary text, labels |
| `border`, `input` | hairlines (violet tints, alpha-based) |
| `destructive` | errors only |
| `brand-from` / `brand-via` / `brand-to` | gradient stops: `#6d4aff/#7c5cff` → `#b04bf0/#c14df0` → `#ff5fa2/#ff6aa8` |
| `surface` | translucent glass fill (`bg-surface`) |

Aurora background = three radial gradients (`--aurora-1..3`: violet, pink, cyan) fixed on `body`. Don't add page-level background colours; they hide it.

## 3. Utilities (defined in `index.css`)

| Class | Purpose |
|---|---|
| `bg-brand-gradient` | 135° brand gradient fill — primary buttons, logo tile, today marker |
| `text-brand-gradient` | gradient text — one accent word per view (page title month, logo word) |
| `glass` | translucent blurred surface + hairline border + soft shadow. Use for navbar, calendar, cards, dialogs |
| `shadow-glow` | violet glow under gradient elements |
| `gradient-border` | 1px gradient outline via mask. **Parent must be positioned** (`relative`/`fixed`); the class does not set `position` |
| `animate-rise` | 450ms fade+translate entrance for major containers |

Pitfall: these utilities are unlayered CSS, so they beat Tailwind utilities of the same property (e.g. `.glass` sets `border` and `box-shadow`). Don't combine `glass` with conflicting `border-*`/`shadow-*` classes expecting the utility to win.

## 4. Typography

- Font: **Inter** (400–800), loaded in `index.css`; system fallback.
- Page title: `text-3xl sm:text-4xl font-extrabold tracking-tight`, one word in `text-brand-gradient`, year `font-light text-muted-foreground`.
- Eyebrow label above titles: `text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground`.
- Weekday headers: `text-[11px] font-bold uppercase tracking-[0.14em]`.
- Body `text-sm`; dense chips `text-[11px] font-medium`.

## 5. Shape, spacing, elevation

- Radius: controls `rounded-lg`; large controls & chips `rounded-lg/xl`; cards, calendar, dialogs, navbar `rounded-2xl`; nav pills & today marker `rounded-full`.
- Navbar floats: `sticky top-0 px-3 pt-3 sm:px-8`, inner `glass rounded-2xl` — not a full-bleed bar.
- Page padding: `p-4 sm:px-8 sm:py-6`. Gaps on the 4px scale (`gap-1.5`, `gap-3`, `gap-4`).
- Elevation: only two levels — flat glass (`glass`) and glowing gradient elements (`shadow-glow`). No stacked drop shadows.

## 6. Components

- **Button** (`ui/button.tsx`): `default` = gradient + glow, lifts 1px on hover, `active:scale-[0.98]`. `outline` = glass with primary-tinted hover border. `ghost` for toolbar icons. One gradient button per view section max.
- **Input**: `h-10`, `bg-surface`, focus = `border-primary` + 2px `ring-ring/40`.
- **Card**: `glass rounded-2xl`.
- **Dialog**: blurred dark overlay, `glass gradient-border` panel; bottom sheet on phones, centred modal on `sm+`.
- **Navbar**: floating glass pill; active link = `bg-accent` + `ring-primary/40` + soft glow; logo = gradient tile + gradient word.
- **Calendar**: glass container, gradient-tinted weekday header row. Day cell: hover = faint diagonal primary wash; **today** = gradient circle date + subtle gradient wash; out-of-month = muted. Movie chip: `bg-secondary`; **tracked** chip = `gradient-border` + primary→pink tint + filled bookmark. Posters `rounded-md`. Chips nudge 2px right on cell hover.
- **Mobile (<`sm`)**: 7-col grid replaced by agenda list of `glass` cards; date tile is gradient when today.

## 7. Do / Don't

- ✅ Use tokens and the utilities above; ✅ keep gradient for emphasis; ✅ keep contrast ≥ 4.5:1 for text (verify in both themes); ✅ visible focus rings on every interactive element.
- ❌ No raw hex / `bg-white` / `bg-slate-*` in components; ❌ no flat opaque grey cards; ❌ no more than one gradient text accent per view; ❌ no new fonts or radius scales without updating this file.

## 8. Adding a new page/component checklist

1. Wrap in `mx-auto max-w-* p-4 sm:px-8 sm:py-6` (calendar-like pages use `max-w-[1800px]`).
2. Surfaces → `glass rounded-2xl`; inputs/buttons → `ui/*` primitives.
3. Major container → `animate-rise`.
4. Check light + dark + phone width.
5. Update this file if you introduced a new token, utility or pattern.
