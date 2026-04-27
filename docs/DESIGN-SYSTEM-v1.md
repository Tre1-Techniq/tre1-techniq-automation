Relative Path: docs/DESIGN-SYSTEM-v1.md

# DESIGN SYSTEM v1

Status: LOCKED  
Purpose: Source of truth for all UI/UX decisions across the application  
Scope: Applies to all components, pages, and layouts

---

## 1. Core Principles

- Clean, modern, minimal UI
- Data-first design
- Every element must serve a function
- Consistency over creativity
- No fake or placeholder metrics
- One visual language across the entire app

---

## 2. Color System

### Primary Brand

- Teal: `#00B5A5`
- Used for highlights, selected states, signals, and brand identity

### Accent

- Orange: `#FF8A3D`
- Used only for primary CTA buttons, CTA banners, and hover/active states

Rule: One orange accent builds trust. Too many orange accents create noise.

### Neutral Colors

Background:
- `bg-white`
- `bg-gray-50`

Header:
- `bg-gray-900/80`
- `backdrop-blur-md`
- `border-gray-800`

Text:
- Primary: `text-gray-900`
- Secondary: `text-gray-600`
- Muted: `text-gray-500`
- Inverted: `text-gray-200` / `text-white`

Borders:
- `border-gray-200`

---

## 3. Typography

Font:
- Inter primary
- System fallback allowed

Hierarchy:
- H1: `text-3xl font-bold`
- H2: `text-xl font-bold`
- H3: `text-lg font-semibold`
- Body: `text-sm` / `text-base text-gray-600`
- Labels: `text-sm text-gray-500`

Uppercase labels:
- `uppercase`
- `tracking-wide`

---

## 4. Layout System

Container:
- Use: `<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">`

Spacing:
- 8px → `gap-2`
- 16px → `gap-4`
- 24px → `gap-6` / `p-6`
- 32px → `gap-8`

Section spacing:
- Default sections: `space-y-6`
- Major sections: `space-y-8`

---

## 5. Header Standard

Structure:
- Height: `h-16` / 64px
- Position: `sticky top-0`
- Z-index: `z-50`

Styling:
- `bg-gray-900/80`
- `backdrop-blur-md`
- `border-b border-gray-800`

Logo:
- Source: `/public/logo.png`
- Display: `h-10 w-auto`
- Max visual height: 32px

Logo rules:
- Logo only
- No text next to logo
- Left aligned
- Must not increase header height

Navigation links:
- Default: `text-gray-200`
- Hover: `text-orange-500`
- Active: `text-orange-500`
- Spacing: `flex items-center space-x-6`

---

## 6. Card System

Base card:
- `bg-white`
- `rounded-xl`
- `shadow-sm`
- `p-6`

Card structure:
- Top: small muted label
- Middle: bold primary value
- Bottom: supporting text or CTA
- Optional: icon on right

---

## 7. Buttons

Primary button:
- `bg-orange-500`
- `hover:bg-orange-600`
- `text-white`
- `px-4 py-2`
- `rounded-lg`
- `font-semibold`

Secondary button:
- `border border-gray-200`
- `text-gray-800`
- `hover:bg-gray-50`
- `px-4 py-2`
- `rounded-lg`

Disabled button:
- `bg-gray-200`
- `text-gray-500`
- `cursor-not-allowed`

---

## 8. Pills

Base pill:
- `px-3 py-1`
- `rounded-full`
- `text-xs`
- `bg-gray-100`
- `text-gray-700`

Selected pill:
- `bg-teal/10`
- `text-teal`
- `border border-teal`

Removable pill:
- Must include label
- Must include remove `x` control

---

## 9. Icons

Rules:
- Icons must be functional, not decorative
- Icons must be consistent within a component

Allowed styles:
- Outline by default
- Solid for emphasis when intentional
- Mixed styles only when intentional and consistent

Color usage:
- Default: `text-gray-400` / `text-gray-500`
- Highlight: teal or orange based on context

---

## 10. Forms

Inputs:
- `border border-gray-300`
- `rounded-lg`
- `px-3 py-2`
- `text-sm`
- `focus:ring-2 focus:ring-teal`

Labels:
- `text-sm font-medium text-gray-700`

---

## 11. Dashboard Rules

- No fake metrics
- All values must come from real data
- Empty states must be explicit
- Cards must be scannable in under 2 seconds
- Dashboard cards must preserve the base card rhythm unless a documented exception exists

---

## 12. Responsiveness

Mobile:
- Stack vertically
- No horizontal scroll
- Touch targets must remain comfortable

Desktop:
- Use grid layouts
- Preferred grids: 2-column, 3-column, or 4-column

---

## 13. Non-Negotiable Rules

- No duplicate branding
- No logo plus adjacent text branding
- No mixed color signals
- No fake or placeholder metrics
- No inconsistent spacing between similar components
- No oversized elements breaking layout rhythm
- No deviation from the header standard
- No UI work without checking this document first

---

## 14. Enforcement Rule

No UI work may be performed without adhering to DESIGN SYSTEM v1.

Future changes must be versioned:
- v1
- v1.1
- v2