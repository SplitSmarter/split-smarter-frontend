# Folder hygiene & coding guidelines

Production layout for this Expo Router + Zustand app (**Split Smarter**).

Screen-private code colocates with the screen. `src/components/` is shared-only. Follow this whenever you add or move UI, hooks, or screens.

## Layers

| Layer | Path | Rule |
|---|---|---|
| Routes | `app/` | Thin re-exports only — no business UI |
| Screens | `src/screens/{domain}/…` | Product UI home; private `components/`, `hooks/`, `types/`, etc. |
| Shared UI | `src/components/` | Reusable across **2+** screens only |
| API | `src/api/` | Domain clients + `dto/`; never bury inside screens |
| State | `src/store/` | Global Zustand stores |
| Cross-screen hooks | `src/hooks/` | Only hooks used by 2+ screens |
| Config / theme | `src/config/`, `src/theme/`, `src/constants/` | Design tokens and app constants |
| Types | `src/types/` | Shared types; UI-only types stay in the screen folder |
| Playgrounds | `src/screens/dev/` | Experiments / prototypes only |

## Canonical tree

```text
app/                          # Expo Router only — thin re-exports
src/
  components/
    common/                   # primitives: AppButton, AppText, AppInput, ScreenWrapper
    list-items/               # reusable list rows (2+ screens)
    skeletons/
    empty-states/
    modals/                   # shared sheets/modals only
    global/                   # app-shell: alerts, error boundary, overlays
  screens/
    dashboard/
      index.tsx               # screen entry
      components/             # dashboard-only
      hooks/
      constants/
      types/
      utils/
    expense/
      add-transaction/        # nested screen/feature module
        index.tsx
        components/
        hooks/
        ...
    payment/
      transfer/
      account-linking/
    spatial-map/
    group/
    onboarding/
    ...
  api/
  store/
  hooks/
  config/
  constants/
  theme/
  utils/
  types/
```

## Colocation (locked)

**Do** — keep private pieces beside the screen:

```text
src/screens/dashboard/
  index.tsx
  components/HeaderBar.tsx      # only used by dashboard
  hooks/useDashboardData.ts
```

**Do not** mirror the screen path under shared components:

```text
src/components/dashboard/HeaderBar.tsx   # forbidden for private UI
```

Rules of thumb:

- **1 consumer** → beside the screen (`components/`, `hooks/`, or sibling files if tiny).
- **2+ consumers** → promote to `src/components/` (`common/`, `list-items/`, `skeletons/`, `empty-states/`, `modals/`, `global/`).
- Tiny screens: skip nested folders; a few sibling files next to `index.tsx` are enough.
- Nest child features the same way (`screens/expense/add-transaction/…`).

Hard rule: **never create `src/components/{same-as-screen-path}/` for private UI.**

## Naming

- Folders: `kebab-case`
- Screen entry: `index.tsx` (or `ScreenName.tsx` re-exported from `index.tsx`)
- Avoid `_comps`, scratch roots (`faltu`), and new `snake_case` folders
- One product-UI home: `src/screens/` — do not add `src/features/`
- Playgrounds → `src/screens/dev/` (or delete)

## Shared component roles

| Folder | Use for |
|---|---|
| `components/common/` | Primitives (Button, Text, Input, ScreenWrapper) |
| `components/list-items/` | Reusable list rows |
| `components/skeletons/` | Loading placeholders |
| `components/empty-states/` | Empty / offline states |
| `components/modals/` | Shared sheets / modals |
| `components/global/` | App shell (alerts, error boundary, overlays) |

## New screen checklist

1. Add a thin route under `app/` that imports the screen entry.
2. Create `src/screens/{domain}/{screen-name}/index.tsx`.
3. Put private UI/hooks/types next to that entry (not under `src/components/`).
4. Call `src/api/` and `src/store/` from the screen/hooks — do not bury clients in the screen tree.
5. Promote a piece to `src/components/` only when a second screen needs it.
6. Extract large inline subcomponents into sibling files (single responsibility).

## Extract rule

Do not leave large inline subcomponents in one file. Extract to sibling files under the owning folder so review stays easy and accidental re-render coupling stays low.

## Reference modules

Use these as living examples:

- `src/screens/dashboard/`
- `src/screens/expense/add-transaction/`
- `src/screens/payment/transfer/`
- `src/screens/spatial-map/`
