# Color System Specification & Token Usage Guide

## Core Philosophy
To avoid visual fatigue and maintain high financial legibility:
1. **Background Canvas:** Neutral, high-contrast Slate/Midnight Slate.
2. **Interactive States & Selection:** Sky Blue (`--color-accent-sky`) and Indigo (`--color-orb-indigo`).
3. **Primary Brand Action (CTA):** Emerald Green (`--color-bg-secondary`) is reserved strictly for high-value actions (e.g., "Pay Now", "Confirm", "Add Expense") and positive status indicators.

---

## 0. Surface → Foreground pairing (read this first)

Pairing mistakes cause invisible text and “black” icons. Match **foreground family** to the **surface**.

| Surface | Text / NativeWind | Iconify / ActivityIndicator hex |
| :--- | :--- | :--- |
| `bg-primary`, `bg-canvas`, sheets, overlays | Titles `text-text-primary`; meta `text-text-primary-lighter` | `COLORS.*.icon.primary` / `.lighter` |
| `bg-secondary` (primary CTA **only**) | `text-text-secondary` (white) **only** | `COLORS.*.text.contrast` (white) — never brand / `icon.secondary` |
| `bg-accent-sky-bg` (selection) | `text-accent-sky` or `text-text-primary` | Accent sky `#0284C7` (light) / `#38BDF8` (dark) |
| `bg-secondary-lighter` (success tint) | `text-green-increase` | Brand / success hex |
| Status chips (error / warn) | Status text tokens | Status hex |

### Pairing hard rules

1. Label and icon on the **same** control share one contrast family (white with white; muted with muted).
2. Neutral chrome (`bg-primary` / canvas / sheet body): never use `text.contrast` / white for nav icons (back, menu, search).
3. Selection = sky (`accent-sky*`); CTA fill = `bg-secondary`; list dividers = `border-border-input` — not brand green.
4. Hex only when classes cannot apply (Iconify `color`, ActivityIndicator, Switch, SVG strokes). Prefer `COLORS[theme]` over one-off literals.
5. Canonical CTA pairing in code: `AppButton` / `AppButtonV2` `getIconColor()` — primary → `text.contrast`; secondary → `icon.primary`.

Sheet chrome: sheet body ≈ canvas / primary-lighter; icons on the sheet header = `icon.primary`.

---

## 1. Background Tokens (`bg-*`)

| Token | Light Theme Value | Dark Theme Value | Recommended Usage |
| :--- | :--- | :--- | :--- |
| `bg-primary` | `#F8FAFC` | `#111827` | Application screen background. |
| `bg-primary-lighter` | `#FFFFFF` | `#1F2937` | Raised surfaces, elevated cards, and modals. |
| `bg-primary-darker` | `#E2E8F0` | `#090D16` | Screen canvas behind glassmorphism layers and bottom sheet backdrops. |
| `bg-canvas` | `#FFFFFF` | `#0F172A` | Glassmorphism card surfaces and inner panel fills. |
| `bg-secondary` | `#10B981` | `#10B981` | **Primary CTA Buttons ONLY** (e.g., "Pay ₹500"). |
| `bg-secondary-lighter` | `#D1FAE5` | `#064E3B` | Soft success banners or active status pill fills. |
| `bg-secondary-darker` | `#059669` | `#059669` | Pressed / Active state for Primary CTA buttons. |
| `bg-overlay` | `#FFFFFF` | `#1F2937` | Dropdowns, menus, and popover container backgrounds. |

---

## 2. Interactive & Accent Tokens (`accent-*`, `orb-*`)

| Token | Light Theme Value | Dark Theme Value | Recommended Usage |
| :--- | :--- | :--- | :--- |
| `accent-sky` | `#0284C7` | `#38BDF8` | Active selected borders, active radio rings, and focus rings. |
| `accent-sky-bg` | `#E0F2FE` | `#0C4A6E` | Background fill for selected list items or option cards. |
| `orb-indigo` | `#6366F1` | `#6366F1` | Ambient background glow orbs and recipient avatar gradients. |

---

## 3. Text Tokens (`text-*`)

| Token | Light Theme Value | Dark Theme Value | Recommended Usage |
| :--- | :--- | :--- | :--- |
| `text-primary` | `#0F172A` | `#F9FAFB` | Headings, amounts, primary titles, and list item names. |
| `text-primary-lighter` | `#64748B` | `#9CA3AF` | Subtitles, meta, captions, inactive tabs — **not** `text-secondary`. |
| `text-primary-placeholder` | `#94A3B8` | `#6B7280` | Input placeholder text in forms and search bars. |
| `text-secondary` | `#FFFFFF` | `#FFFFFF` | **Only** text on top of `bg-secondary` CTAs (`AppButton` primary). Never muted body copy. |
| `text-link` | `#0284C7` | `#38BDF8` | Clickable text links, inline action text, and "See All" triggers. |

**Allowlisted brand text:** Onboarding wordmark “Smarter” may use `text-bg-secondary` as intentional brand highlight (not selection, not money amounts).

**Hardcoded hex:** Prefer semantic classes. Hex is OK for Iconify / vector-icon `color`, `ActivityIndicator`, `Switch` tracks, and SVG strokes (no class path). Prefer `COLORS.light|dark.*` or accent-sky (`#0284C7` / `#38BDF8`) over one-off literals.

---

## 4. Icon Tokens (`icon-*`)

| Token | Light Theme Value | Dark Theme Value | Recommended Usage |
| :--- | :--- | :--- | :--- |
| `icon-primary` | `#475569` | `#9CA3AF` | Standard navigation, back arrows, close buttons, and search icons on **neutral** surfaces. |
| `icon-secondary` | `#10B981` | `#10B981` | Success checkmarks / verified badges on **neutral** surfaces — **not** on `bg-secondary` CTAs. |

On primary CTAs use white (`text.contrast`), not `icon-secondary`.

---

## 5. Status & Financial Indicators

| Token | Value | Recommended Usage |
| :--- | :--- | :--- |
| `status-error` | `#EF4444` / `#F87171` | Error messages, failed transaction banners, and validation alerts. |
| `green-increase` | `#10B981` | Money received, positive account balances, and split settlement credits. |
| `red-decrease` | `#EF4444` | Money spent, debts owed, and negative balance indicators. |
| `golden` | `#D97706` | Pending transactions, warning badges, and split reminders. |

---

## 6. Practical NativeWind Example

```tsx
import { View, Text, TouchableOpacity } from 'react-native';

export function PaymentMethodCard({ isSelected, appName, vpa }) {
  return (
    <TouchableOpacity
      className={`p-4 mb-3 rounded-2xl border ${
        isSelected
          ? 'bg-accent-sky-bg border-accent-sky'
          : 'bg-bg-canvas border-border-input'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-body-base font-bold text-text-primary">
            {appName}
          </Text>
          <Text className="text-body-small text-text-primary-lighter">
            {vpa}
          </Text>
        </View>

        <View
          className={`w-6 h-6 items-center justify-center rounded-full border ${
            isSelected ? 'bg-accent-sky border-accent-sky' : 'border-text-primary-placeholder'
          }`}
        >
          {isSelected && <Text className="text-white text-xs">✓</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}
```
