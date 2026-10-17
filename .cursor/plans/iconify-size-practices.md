# Iconify migration and size/perf practices

Status: **blocked — Plan mode only allows markdown edits; Agent-mode switch was rejected**  
Next step: switch to Agent mode (or say **execute the plan**) to apply JS changes below.  
Constraint: no changes that require a native app rebuild in this pass.

## Do now (JS / Metro only)

### 1. Enable Iconify optimization

File: `babel.config.js`

```js
['react-native-iconify/plugin', { isOptimized: true }]
```

Requires Metro restart / `npx expo start -c`. No native rebuild.

### 2. One icon system — product UI

Replace `@expo/vector-icons` with `Iconify` + string-literal `icon` props. Selected/unselected = separate JSX branches (never dynamic `icon={…}`).

| File | Mapping |
| :--- | :--- |
| `src/screens/payment/account-linking/AccountLinkingScreen.tsx` | chevron → `heroicons:chevron-left`, check → `heroicons:check`, bank → `heroicons:building-library`, card → `heroicons:credit-card` |
| `src/screens/payment/account-linking/components/ProviderStepContent.tsx` | alert → `heroicons:exclamation-circle` |
| `src/screens/payment/transfer/components/HeaderNav.tsx` | help → `heroicons:question-mark-circle` |
| `src/screens/payment/transfer/components/PayFooter.tsx` | shield → `heroicons:shield-check`, arrow → `heroicons:arrow-right` |
| `src/screens/payment/transfer/components/VpaSelector.tsx` | selected/unselected + badge → `heroicons:check-circle-solid` / `heroicons:check-circle` + `heroicons:check-badge` |
| `src/screens/payment/transfer/components/InstalledUpiAppsSelector.tsx` | same select pattern as VpaSelector |
| `src/components/common/themeToggle.tsx` | moon/sun → `heroicons:moon` / `heroicons:sun` (branches) |

Dead path: `src/screens/dashboard/components/TransactionItem.tsx` — remove unused `iconType`/`iconName` vector fallbacks; keep `AppImageV2` + `EntityFallbackIcon`.

Out of this pass: `src/screens/dev/*` vector icons; do not remove `@expo/vector-icons` from `package.json`.

### 3. Verification after execute

- Metro cache clear
- Smoke: theme toggle, account linking, transfer VPA/UPI, pay footer, dashboard row fallback
- Grep non-dev tree for `@expo/vector-icons` → expect zero

### 4. Agent execution checklist (apply in order)

1. `babel.config.js` — set `isOptimized: true`.
2. `themeToggle.tsx` — `Iconify` import; moon/sun branches with `color={…}` (drop `@expo/vector-icons`).
3. `AccountLinkingScreen.tsx` — `Iconify` + `COLORS` for:
   - back: `heroicons:chevron-left` / `colors.icon.primary`
   - checks: `heroicons:check` / `colors.text.contrast`
   - bank: `heroicons:building-library` / `colors.icon.lighter`
   - card: `heroicons:credit-card` / `colors.icon.lighter`
4. `ProviderStepContent.tsx` — empty state: `heroicons:exclamation-circle` / `COLORS.*.status.error`.
5. `HeaderNav.tsx` — `heroicons:question-mark-circle` / `colors.textPrimary`.
6. `PayFooter.tsx` — `heroicons:shield-check`, `heroicons:arrow-right` (keep existing colors).
7. `VpaSelector.tsx` / `InstalledUpiAppsSelector.tsx` — selected → `heroicons:check-circle-solid`, unselected → `heroicons:check-circle`; active badge → `heroicons:check-badge` (Vpa only). Separate JSX branches, not ternary `icon=`.
8. `TransactionItem.tsx` — remove `@expo/vector-icons` + `iconType`/`iconName` switch; fallback = `EntityFallbackIcon` only.
9. Grep product (exclude `src/screens/dev`) for `@expo/vector-icons` → zero hits.
10. Tell user: restart Metro with `-c`.

---

## Maintain (already good — keep enforcing)

- Iconify `icon` = string literal only (`.cursor/rules/iconify-string-literals.mdc`)
- Concrete primitive imports — no version-picking barrels (`.llm/ui-primitives.md`)
- Thin `app/` routes → `src/screens/…` (`.llm/folder-hygiene.md`)
- Promote to `src/components/` only on 2nd consumer
- `AppImage` / `AppImageV2` + disk cache (`ImageCacheManager` purge on AppImage paths)
- `BottomSheetFlatList` + window tuning for sheet lists
- Prefer Zustand selectors `store((s) => s.field)` when touching a file

---

## Follow onwards (JS-only, no rebuild)

When editing related files later:

- Narrow Zustand selectors on hot paths (tabs layout, add-transaction, MultiUserSelect, AppInput still destructure whole stores)
- Add `recyclingKey={id}` on dense `AppImage` / `AppImageV2` list rows
- Keep charts/maps imports inside their route screens only
- Prefer `EntityFallbackIcon` / static Iconify branches over dynamic icon name props
- Extract large inline subcomponents (folder hygiene) to limit re-render coupling

---

## Deferred (not this pass)

| Item | Why deferred |
| :--- | :--- |
| Remove unused `react-native-paper`, `@maplibre/maplibre-react-native`, `react-native-leaflet-view` | Needs rebuild / depcheck |
| Move `(tabs)/camera` playground under `src/screens/dev` | Explicitly keep for now |
| Android R8/ProGuard + resource shrink | Needs rebuild |
| Migrate `@expo/vector-icons` in `src/screens/dev/*` | Playgrounds only |
| FlashList for long lists + broader Zustand selector cleanup | Later JS pass |
