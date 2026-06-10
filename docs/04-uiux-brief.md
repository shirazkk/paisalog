# Document 04 — UI/UX Design Brief

---

## Overall Aesthetic

Clean, friendly, and trustworthy. Think of it like a simple banking app but warm — not cold
and corporate. Large text, big tap targets, clear labels. Every element must be readable at
arm's length on a phone. No clutter, no tiny icons, no jargon.

Reference vibe: Easypaisa or Sadapay meets a family WhatsApp — familiar, warm, simple.

---

## Color Palette

| Role              | Hex       | Usage                                      |
|-------------------|-----------|--------------------------------------------|
| Primary           | #1a56db   | Buttons, links, active tab, key actions    |
| Primary Light     | #ebf5ff   | Button hover bg, selected state            |
| Background        | #f9fafb   | App background                             |
| Surface / Cards   | #ffffff   | Transaction cards, form backgrounds        |
| Text Primary      | #111827   | Headings, amounts, main labels             |
| Text Secondary    | #6b7280   | Dates, subtext, category labels            |
| Success           | #16a34a   | "Saved ✓" toasts, confirmed transactions   |
| Warning           | #d97706   | Pending or unconfirmed states              |
| Error             | #dc2626   | Validation errors, failed saves            |
| Accent / CTA      | #1a56db   | Log button (large, centered bottom nav)    |
| Dad color tag     | #3b82f6   | Blue indicator on Dad's transactions       |
| Mom color tag     | #ec4899   | Pink indicator on Mom's transactions       |

---

## Typography

Font:              Inter (Google Fonts — clean, highly legible on mobile)
Fallback:          system-ui, sans-serif

| Element           | Size   | Weight  |
|-------------------|--------|---------|
| Page Heading (h1) | 22px   | 700     |
| Section Heading   | 18px   | 600     |
| Card Title        | 16px   | 600     |
| Body / Labels     | 15px   | 400     |
| Secondary text    | 13px   | 400     |
| Amount display    | 28px   | 700     | ← big and bold so it's always readable

Minimum font size across entire app: 13px (accessibility)

---

## Component Style

Border Radius:     12px for cards, 8px for buttons, 999px for pills/badges
Shadows:           Subtle — box-shadow: 0 1px 4px rgba(0,0,0,0.08) on cards
Buttons:           Large, full-width on mobile — minimum height 52px
Input Fields:      Large — minimum height 52px, 15px font, clear label above field
Icons:             Lucide React — 20px, stroke-width 1.5 — friendly and light
Spacing:           16px base padding, 12px between form fields, 8px between list items

---

## Dark / Light Mode

Light mode is primary (v1). Dark mode in v2.
Reason: Mom may find dark mode confusing — keep it simple with familiar white/light UI.

---

## Key UI Patterns

- **Transaction cards** — Rounded white cards on grey background. Shows: direction arrow,
  amount (large), category badge (pill), date, short note.
- **Direction indicator** — "Dad → Mom" shown with colored avatar initials (D in blue, M in pink)
  connected by a right arrow. Clear at a glance who gave to whom.
- **Category badges** — Colored pills: Home (green), Grocery (orange), Utility (purple),
  Personal (grey), Other (blue).
- **Bottom sheet forms** — Log Transaction opens as a bottom sheet (slides up), not a new page.
  Feels native on mobile.
- **Toast notifications** — Non-blocking, appears at top for 3 seconds. Success = green, Error = red.
- **Big FAB button** — The ➕ log button in the bottom nav is larger (56px) and primary colored.
  It's the most important action — make it obvious.

---

## Mobile Responsiveness

- Designed mobile-first (390px width base)
- Min tap target size: 48px × 48px on all interactive elements
- Bottom navigation bar fixed at bottom (safe area inset for iPhone)
- No horizontal scrolling anywhere
- Forms are single-column, full-width inputs

---

## Accessibility

- WCAG AA contrast minimum on all text
- All form inputs have visible labels (not just placeholders)
- Error messages are inline AND color + icon (not color alone)
- Font size minimum 13px — no tiny text anywhere
- Focus states visible for keyboard navigation
