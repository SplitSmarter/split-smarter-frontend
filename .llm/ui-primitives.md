# UI Primitives — When & How

Shared product UI lives under `src/components/common/`. Import the **concrete file** you mean. Do not add version-picking barrels (`index.ts` that re-exports “latest” as default).

Related: [color-palette.md](./color-palette.md) §0 (surface → foreground), [exceptions.md](./exceptions.md) (sheet / NativeWind pitfalls), [folder-hygiene.md](./folder-hygiene.md).

---

## Import rule (all versioned primitives)

```tsx
// Do — explicit paths
import { AppText } from '@/src/components/common/AppText';
import { AppTextV2 } from '@/src/components/common/AppTextV2';
import { AppButton } from '@/src/components/common/AppButton';
import { AppButtonV2 } from '@/src/components/common/AppButtonV2';
import { AppImage } from '@/src/components/common/AppImage';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';

// Do not — barrels that silently pick a “default” version
import AppText from '@/src/components/common/features/AppText';
```

Same pattern for any future V2/V3: new file + new export name, never an index that aliases both to `AppText`.

---

## AppText (v1) — default product copy

**File:** `src/components/common/AppText.tsx`  
**Export:** `AppText`

Use for almost all product typography (titles, body, captions). Prefer over raw RN `<Text>` so i18n font families and type scale stay consistent.

| Prop | Role |
| :--- | :--- |
| `variant` | Size/scale: `h1`…`h4`, `body-large`, `body-base` (default), `body-small`, `caption-xs`, `body-xs` |
| `fontType` | `primary` \| `secondary` (from `i18nStore`) |
| `className` | Color and extras; if it includes any `text-*` class, the default `text-foreground` is skipped |

```tsx
<AppText variant="h3" className="text-text-primary">Title</AppText>
<AppText variant="body-small" className="text-text-primary-lighter">Meta</AppText>
```

**Color:** follow surface pairing. Never use `text-text-secondary` as muted body (that token is white CTA label only).

---

## AppTextV2 — semantic `colorScheme`

**File:** `src/components/common/AppTextV2.tsx`  
**Export:** `AppTextV2`  
**Styles:** `AppText.styles.ts` (CVA; V2 only)

Use when you want named color roles instead of ad-hoc color classes (new polished surfaces, CVA-style UIs).

| `colorScheme` | Maps to |
| :--- | :--- |
| `primary` (default) | `text-text-primary` |
| `secondary` | `text-text-primary-lighter` (muted body — **not** white CTA) |
| `muted` | `text-text-primary-placeholder` |
| `link` / `canvas` / `error` / `success` / `golden` | matching semantic tokens |

```tsx
import { AppTextV2 } from '@/src/components/common/AppTextV2';

<AppTextV2 variant="h3" colorScheme="primary">Title</AppTextV2>
<AppTextV2 variant="body-small" colorScheme="secondary">Meta</AppTextV2>
```

Do not mass-migrate existing `AppText` call sites unless a screen is already being rewritten.

---

## AppButton / AppButtonV2

| | AppButton | AppButtonV2 |
| :--- | :--- | :--- |
| File | `AppButton.tsx` | `AppButtonV2.tsx` |
| Variants | `primary` \| `secondary` | `primary` \| `secondary` \| `ghost` |
| Size | `sm` \| `md` \| `lg` | + `none` for full layout override |

**When:** any pressable primary/secondary action in product UI. Prefer these over raw `Pressable` + styled text for CTAs.

**Icons:** pass `renderIcon={(color, size) => <Iconify icon="heroicons:…" size={size} color={color} />}`. `getIconColor()` pairs primary CTA → white (`text.contrast`), secondary → `icon.primary`. Iconify `icon` must be a **string literal** at the call site.

```tsx
<AppButton
  variant="primary"
  renderIcon={(c, s) => <Iconify icon="heroicons:plus-circle" size={s} color={c} />}
>
  Create
</AppButton>
```

---

## ScreenWrapper

**File:** `src/components/common/ScreenWrapper.tsx`  
**Export:** `ScreenWrapper`

Owns `SafeAreaView` + `StatusBar` + optional horizontal padding. Use for **standalone full screens** that own chrome (onboarding, dashboard shell, similar).

### Status bar / notification row

`backgroundColor` paints the **SafeAreaView**, including the system status-bar strip (battery / time / notch). That is how the phone’s top chrome matches the screen header.

| Prop | Default | Notes |
| :--- | :--- | :--- |
| `withPadding` | `true` | `px-6`; set `false` for full-bleed (maps, custom headers) |
| `backgroundColor` | Theme canvas (`COLORS.*.bg.primary`) | **Must be camelCase** `backgroundColor` — `backgroundcolor` is ignored and you get a white strip |
| `statusBarStyle` | Theme-aware (`dark-content` light / `light-content` dark) | Icons/text in the status bar; use `light-content` on dark/metallic headers |
| `className` | `""` | Inner content `View` only — **does not** fill the status-bar strip |

**Pairing rules:**

1. Neutral screens → omit props (theme defaults) or pass `COLORS.*.bg.primary` + matching `statusBarStyle`.
2. Metallic slate hero chrome → pass a **dark slate** stop (e.g. `#0F172A` / `#1E293B`) + `statusBarStyle="light-content"`. Do **not** use `COLORS.*.brand.primary` for full-screen chrome in dark mode — that token is the light CTA fill.
3. Primary CTAs use `bg-bg-secondary` + `text-text-secondary` (platinum invert). Emerald = status only.
4. Never rely on `className="bg-…"` alone for the status bar — that only styles the inner padded view.

**Do not wrap:** bottom sheets, modals, nested list/content that already sits inside tab or stack chrome.

```tsx
// Neutral canvas (or omit colors — theme defaults apply)
<ScreenWrapper
  withPadding={false}
  backgroundColor={isDark ? COLORS.dark.bg.primary : COLORS.light.bg.primary}
  statusBarStyle={isDark ? 'light-content' : 'dark-content'}
>
  {children}
</ScreenWrapper>

// Metallic slate hero (dashboard) — status bar matches dark chrome
<ScreenWrapper
  withPadding={false}
  backgroundColor={isDark ? '#0F172A' : '#1E293B'}
  statusBarStyle="light-content"
>
  {children}
</ScreenWrapper>
```

---

## Other shared primitives (brief)

| Primitive | Use when |
| :--- | :--- |
| `AppInput` | Labeled form fields; use `renderLeftIcon` / `renderRightIcon` with literal Iconify at call site |
| `AppBottomSheet` | Standard modal sheets (`isVisible` / `onClose` / snap points). Sheet body ≈ canvas pairing; avoid `shadow-*` / `active:*` on sheet chrome (see exceptions) |
| `AppImage` / `AppImageV2` | Same direct-import rule as text/buttons; pick the concrete file |
| `EntityFallbackIcon` | Entity-specific Iconify for image fallbacks — pass explicitly as `fallbackIcon` / `fallbackComponent` |
| `MediaPickerBottomSheet`, `DurationSelectionBottomSheet`, `SelectDateBottomSheet` | Shared pickers — reuse before inventing a one-off |

### AppImage / AppImageV2 fallbacks

Two layers:

1. **Component default** — when the image is missing/fails and the caller did **not** pass a fallback, both primitives show built-in `heroicons:photo`.
2. **Explicit entity fallback** — known surfaces pass `<EntityFallbackIcon kind="…" size={…} color={…} />` as `fallbackIcon` (AppImage) or `fallbackComponent` (AppImageV2). Do **not** add an `entityKind` prop on the image primitives.

```tsx
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { EntityFallbackIcon } from '@/src/components/common/EntityFallbackIcon';

<AppImageV2
  id={user.avatar.id}
  url={user.avatar.url}
  fallbackComponent={
    <EntityFallbackIcon kind="user" size={20} color={colors.icon.lighter} />
  }
/>
```

Kinds: `user`, `group`, `groupCategory`, `expenseCategory`, `expenseItem`, `expense`, `transfer`, `merchant`, `place`, `placePhoto`, `memory`, `relationship`, `paymentProvider`, `paymentCategory`, `currencyFlag`, `attachment`.

Promote to `src/components/` only on a **second** consumer (folder hygiene). Screen-private UI stays under `src/screens/{domain}/…/components/`.

---

## Quick checklist

1. Import the exact file (`AppText` vs `AppTextV2`, etc.) — no default-version barrel.
2. Product copy → `AppText` or `AppTextV2`; CTAs → `AppButton` / `AppButtonV2`.
3. Full-screen safe area → `ScreenWrapper` with theme-aware bg/status bar; not for sheets/modals.
4. Colors follow [color-palette.md](./color-palette.md) §0.
5. Iconify: string literal `icon`; dynamic only `color` / `size`.
