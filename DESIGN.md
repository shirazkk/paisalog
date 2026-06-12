# DESIGN.md — PaisaLog
# Family Money Tracker · Mobile-First PWA

---

## 1. Visual Theme and Atmosphere

PaisaLog feels like "trusted simplicity." It's the digital equivalent of a clean notebook
your parents actually use — familiar, reassuring, never intimidating. Every surface is calm
and uncluttered. Large text, generous spacing, and warm white backgrounds signal safety and
clarity. There are no dark gradients, no complex animations, no trendy glassmorphism.

The aesthetic is inspired by simple Pakistani banking apps (Easypaisa, Sadapay) crossed with
a WhatsApp-style friendliness. The app never makes the user feel like they're using technology
— it feels like reading a receipt or checking a notebook. The one moment of delight is the
direction indicator (Dad → Mom with colored avatars), which adds warmth without complexity.

**Personality:** Warm. Trustworthy. Readable. Frictionless.
**Not:** Corporate. Trendy. Dense. Dark.

---

## 2. Color Palette and Roles

| Role              | Token                  | Value      | Usage                                              |
|-------------------|------------------------|------------|----------------------------------------------------|
| Primary           | --color-primary        | #1a56db    | Buttons, active nav tab, FAB, links, focus rings   |
| Primary Light     | --color-primary-light  | #ebf5ff    | Button hover bg, selected state bg, input focus bg |
| Background        | --color-bg             | #f9fafb    | Main app canvas — every screen background          |
| Surface           | --color-surface        | #ffffff    | Cards, form fields, bottom sheets, nav bar         |
| Border            | --color-border         | #e5e7eb    | Card borders, input borders, dividers              |
| Text Primary      | --color-text           | #111827    | Headings, amounts, main labels                     |
| Text Secondary    | --color-text-muted     | #6b7280    | Dates, subtext, category labels, placeholder text  |
| Success           | --color-success        | #16a34a    | "Saved ✓" toast, confirmed state                   |
| Success Light     | --color-success-light  | #f0fdf4    | Success toast background                           |
| Error             | --color-error          | #dc2626    | Validation errors, failed toast, destructive btn   |
| Error Light       | --color-error-light    | #fef2f2    | Error field background, error toast background     |
| Warning           | --color-warning        | #d97706    | Pending or unconfirmed states                      |
| Dad Tag           | --color-dad            | #3b82f6    | Dad's avatar circle, Dad-side direction indicator  |
| Mom Tag           | --color-mom            | #ec4899    | Mom's avatar circle, Mom-side direction indicator  |

### Category Badge Colors

| Category      | Background | Text    |
|---------------|------------|---------|
| Home Expenses | #dcfce7    | #16a34a |
| Grocery       | #ffedd5    | #d97706 |
| Utility       | #ede9fe    | #7c3aed |
| Personal      | #f3f4f6    | #374151 |
| Other         | #dbeafe    | #1d4ed8 |

---

## 3. Typography Rules

**Font Family:** Inter (Google Fonts) — import in layout.tsx
**Fallback:** system-ui, -apple-system, sans-serif

| Level             | Size | Weight | Line Height | Usage                               |
|-------------------|------|--------|-------------|-------------------------------------|
| Page Title        | 22px | 700    | 1.2         | Screen headings (Dashboard, etc.)   |
| Section Heading   | 18px | 600    | 1.3         | "Recent Transactions" labels        |
| Card Title        | 16px | 600    | 1.4         | Transaction card primary text       |
| Body              | 15px | 400    | 1.5         | Labels, descriptions, form text     |
| Secondary / Meta  | 13px | 400    | 1.4         | Dates, "logged by", subtext         |
| Amount Display    | 28px | 700    | 1.0         | PKR amounts — always bold, always big |
| Badge / Pill      | 12px | 500    | 1.0         | Category pills                      |

**Rules:**
- Minimum font size anywhere: 13px — no exceptions
- Amounts always render at 28px bold — never shrink them
- Labels always appear above fields, never as floating placeholders only
- All text must meet WCAG AA contrast against its background

---

## 4. Component Styles

### Buttons

**Primary Button** (Save, Login, Create Account)
- height: 52px
- border-radius: 12px
- background: #1a56db
- color: #ffffff
- font-size: 15px, font-weight: 600
- width: 100% full-width on mobile
- active: background #1e429f
- disabled: opacity 0.5, cursor not-allowed
- loading: show "Saving..." text

**Secondary Button** (Cancel, Back)
- height: 52px, border-radius: 12px
- background: #f3f4f6, color: #111827
- active: background #e5e7eb

**Destructive Button** (Sign Out)
- Same as secondary but color: #dc2626, background: #fef2f2

**FAB — Log Button** (center bottom nav)
- width: 56px, height: 56px, border-radius: 50%
- background: #1a56db, color: white
- box-shadow: 0 4px 12px rgba(26, 86, 219, 0.4)
- icon: Plus 24px

### Input Fields
- height: 52px, border-radius: 12px
- border: 1.5px solid #e5e7eb, background: #ffffff
- padding: 0 16px, font-size: 15px
- focus: border-color #1a56db, box-shadow 0 0 0 3px rgba(26,86,219,0.12)
- error: border-color #dc2626, background #fef2f2
- placeholder color: #6b7280

### Transaction Cards
- background: #ffffff, border-radius: 12px
- padding: 14px 16px
- box-shadow: 0 1px 4px rgba(0,0,0,0.07)
- border: 1px solid #e5e7eb
- Row 1: Direction indicator (left) + Amount 28px bold (right)
- Row 2: Category badge (left) + Date muted (right)
- Row 3: Note text muted (if present)

### Direction Indicator (Dad → Mom)
- Dad circle: 32px, border-radius 50%, background #3b82f6, white text "D", 13px bold
- Arrow: → in #9ca3af, 14px
- Mom circle: 32px, border-radius 50%, background #ec4899, white text "M", 13px bold

### Category Badge Pills
- font-size: 12px, font-weight: 500
- padding: 3px 10px, border-radius: 999px
- Colors per category — see section 2

### Bottom Sheet (Log Transaction)
- position fixed, bottom/left/right 0
- background #ffffff, border-radius 20px 20px 0 0
- padding: 20px 16px 32px
- box-shadow: 0 -4px 24px rgba(0,0,0,0.10)
- drag handle: 40px wide, 4px tall, #d1d5db, centered, margin-bottom 16px

### Toast Notifications
- position fixed, top 16px, left/right 16px
- border-radius: 12px, padding: 14px 16px
- font-size: 15px, font-weight: 500
- auto-dismiss: 3 seconds
- Success: background #16a34a, color white
- Error: background #dc2626, color white

### Bottom Navigation Bar
- position fixed, bottom 0, left/right 0, height 64px
- background #ffffff, border-top 1px solid #f3f4f6
- padding-bottom: env(safe-area-inset-bottom) — REQUIRED
- Inactive tab: color #9ca3af, icon 22px
- Active tab: color #1a56db, icon 22px
- FAB rises above bar: 56px circle, elevated

---

## 5. Layout Principles

- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 48px
- Page padding: 16px horizontal
- Between cards: 12px gap
- Between form fields: 16px gap
- Label to field gap: 6px
- Section gap: 24px
- Bottom nav offset: always add pb-20 (80px) to page content
- Max width: 480px centered — app never stretches wide on tablet
- Design target: 390px (iPhone 14 / standard Android)

---

## 6. Depth and Elevation

| Level | Usage                 | Shadow Value                          |
|-------|-----------------------|---------------------------------------|
| 0     | Background, canvas    | none                                  |
| 1     | Cards, input fields   | 0 1px 4px rgba(0,0,0,0.07)           |
| 2     | Bottom nav bar        | border-top 1px #f3f4f6 only          |
| 3     | Bottom sheets         | 0 -4px 24px rgba(0,0,0,0.10)         |
| 4     | FAB button            | 0 4px 12px rgba(26,86,219,0.4)       |
| 5     | Toast notifications   | 0 4px 16px rgba(0,0,0,0.15)          |

Rule: depth is shown through background contrast (white card on gray bg) more than shadows.

---

## 7. Do's and Don'ts

### Do:
- Use #1a56db for all primary actions — one consistent blue everywhere
- Use --color-dad and --color-mom ONLY for the direction indicator avatars
- Always show labels above form fields — never label-as-placeholder only
- Always include env(safe-area-inset-bottom) on the bottom nav bar
- Always show amounts at 28px bold — never smaller
- Keep every screen to single-column layout on mobile
- Show empty states with a friendly short message — never a blank screen
- Auto-dismiss all toasts after 3 seconds — never require user to close them

### Don't:
- Don't use dark mode — light mode only in v1
- Don't use more than 2 brand colors in one view
- Don't make any tap target smaller than 48x48px
- Don't use font sizes below 13px anywhere
- Don't use heavy box shadows — keep elevation subtle
- Don't use horizontal scrolling on any screen
- Don't show raw error messages — always friendly human text
- Don't use Mom/Dad tag colors for anything other than direction indicator
- Don't add animations longer than 300ms

---

## 8. Responsive Behavior

Primary target: 390px mobile — this is a PWA used on phones daily

| Breakpoint | Width     | Behavior                                              |
|------------|-----------|-------------------------------------------------------|
| Mobile     | < 640px   | Single column, bottom nav, full-width buttons         |
| Tablet     | 640–768px | Max-width 480px centered, same layout, more whitespace|
| Desktop    | > 768px   | Max-width 480px centered card, rest is #f9fafb bg     |

PWA-specific:
- viewport-fit=cover in meta viewport — required for iPhone safe area
- Bottom nav always has pb-[env(safe-area-inset-bottom)]
- Splash screen background: #1a56db (matches theme_color in manifest)
- Portrait only — no landscape layout needed

---

## 9. Agent Prompt Guide

When generating any UI for PaisaLog, follow these rules strictly:

**Priority order:**
1. Follow this DESIGN.md exactly — no improvisation on colors, fonts, spacing
2. Mobile-first — design for 390px, never desktop first
3. Simplicity — if in doubt, use less UI not more
4. Accessibility — WCAG AA contrast minimum on all text

**Sample prompts:**
- "Build the Dashboard screen for PaisaLog following DESIGN.md exactly."
- "Create the Log Transaction bottom sheet using the component specs in DESIGN.md."
- "Generate the transaction card component using exact colors and shadows from DESIGN.md."

**Key token reminders:**
- Primary blue #1a56db = buttons, active states, FAB, links only
- Dad blue #3b82f6 and Mom pink #ec4899 = direction indicator avatars only
- Amounts = always 28px bold, color #111827
- All inputs = 52px height, 12px border-radius, Inter 15px

**Accessibility checklist:**
- All text meets WCAG AA contrast ratio (4.5:1 body, 3:1 large text)
- No information conveyed by color alone — errors use icon + color + text
- All interactive elements have visible focus states
- All form inputs have visible text labels (not placeholder-only)
- All tap targets minimum 48x48px
- Font size minimum 13px across entire app

**What this app is NOT:**
- Not a fintech dashboard — no charts or graphs in v1
- Not a dark-mode app — always light
- Not a desktop app — always optimized for one-hand phone use
- Not a multi-user tool — exactly 2 users (husband and wife) per household