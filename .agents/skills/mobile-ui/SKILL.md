---
name: mobile-ui
description: >
  Use this skill before building or styling ANY component or screen in PaisaLog.
  Triggers on: any UI component, any page layout, "bottom nav", "tap target", "mobile",
  "responsive", "card", "button", "form field", "spacing", colors, fonts, or any visual
  element. This is the single source of truth for how PaisaLog looks and feels.
  Never write Tailwind classes from memory — always follow this skill.
---

# Mobile UI Skill — PaisaLog

PaisaLog is used daily by parents on their phones. Every pixel must be comfortable,
readable, and tappable. This skill defines every visual rule.

---

## Color Tokens (Tailwind custom or inline hex)

| Token           | Hex       | Tailwind Class Equivalent        |
|-----------------|-----------|----------------------------------|
| Primary         | #1a56db   | `bg-blue-600` / `text-blue-600`  |
| Primary Light   | #ebf5ff   | `bg-blue-50`                     |
| Background      | #f9fafb   | `bg-gray-50`                     |
| Surface/Card    | #ffffff   | `bg-white`                       |
| Text Primary    | #111827   | `text-gray-900`                  |
| Text Secondary  | #6b7280   | `text-gray-500`                  |
| Success         | #16a34a   | `text-green-600` / `bg-green-50` |
| Error           | #dc2626   | `text-red-600` / `bg-red-50`     |
| Warning         | #d97706   | `text-amber-600`                 |
| Dad tag         | #3b82f6   | `bg-blue-500`                    |
| Mom tag         | #ec4899   | `bg-pink-500`                    |

---

## Typography

Add Inter to `app/layout.tsx`:
```typescript
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
```

| Element         | Size   | Weight | Class                        |
|-----------------|--------|--------|------------------------------|
| Page title      | 22px   | 700    | `text-[22px] font-bold`      |
| Section heading | 18px   | 600    | `text-lg font-semibold`      |
| Card title      | 16px   | 600    | `text-base font-semibold`    |
| Body text       | 15px   | 400    | `text-[15px]`                |
| Secondary text  | 13px   | 400    | `text-[13px] text-gray-500`  |
| Amount display  | 28px   | 700    | `text-[28px] font-bold`      |

Minimum font size anywhere in the app: **13px**

---

## Spacing & Layout

- Page padding: `px-4 py-4` (16px sides)
- Between cards: `gap-3` (12px)
- Between form fields: `gap-4` (16px)
- Between label and input: `gap-1` (4px)
- Section gap: `gap-6` (24px)

---

## Component Rules

### Buttons
```
h-[52px] rounded-xl font-semibold text-[15px] w-full
Primary:   bg-blue-600 text-white active:bg-blue-700
Secondary: bg-gray-100 text-gray-900 active:bg-gray-200
Disabled:  opacity-50 cursor-not-allowed
```

### Input Fields
```
h-[52px] rounded-xl border border-gray-200 bg-white px-4 text-[15px]
Focus:   border-blue-500 ring-2 ring-blue-100 outline-none
Error:   border-red-500 bg-red-50
```

### Cards
```
bg-white rounded-xl shadow-sm p-4
shadow: box-shadow: 0 1px 4px rgba(0,0,0,0.08)
Tailwind: shadow-sm
```

### Category Badge Pills
```
text-[12px] font-medium px-2.5 py-1 rounded-full
Home:     bg-green-100 text-green-700
Grocery:  bg-orange-100 text-orange-700
Utility:  bg-purple-100 text-purple-700
Personal: bg-gray-100 text-gray-700
Other:    bg-blue-100 text-blue-700
```

### Direction Indicator (Dad → Mom)
```tsx
<div className="flex items-center gap-2">
  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center
                  text-white text-[13px] font-bold">D</div>
  <span className="text-gray-400">→</span>
  <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center
                  text-white text-[13px] font-bold">M</div>
</div>
```

---

## Bottom Navigation

```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100
                pb-[env(safe-area-inset-bottom)]">
  <div className="flex items-center justify-around h-16">
    {/* Tab buttons — min 48x48 each */}
    {/* Center Log button is larger: 56px circle, bg-blue-600 */}
  </div>
</nav>
```

- Always include `pb-[env(safe-area-inset-bottom)]` for iPhone notch
- Center Log button: `w-14 h-14 rounded-full bg-blue-600` (56px)
- All other tabs: `min-w-[48px] min-h-[48px]`
- Active tab: `text-blue-600`, Inactive: `text-gray-400`

---

## Global Rules

1. **No horizontal scrolling** — every screen must fit in 390px width
2. **Min tap target 48×48px** on ALL interactive elements — no exceptions
3. **Mobile-first** — design for 390px, then check at 768px
4. **Light mode only** (v1) — no dark mode classes
5. **Bottom nav height = 64px** — add `pb-20` to all page content so it's not hidden
6. **Loading states** — always show skeleton or spinner, never blank screen
7. **Test at 390px** before marking any screen done

---

## PWA Specific

- App background color (splash screen): `#1a56db` (matches manifest theme_color)
- Status bar style: `default` (dark text on light background)
- Viewport meta (in layout.tsx):
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  ```
  `viewport-fit=cover` is required for proper safe area handling on iPhone.
