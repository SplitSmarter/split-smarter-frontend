# Split Smarter

Expo Router + React Native expense / payments app.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Build

```bash
eas build --profile development --platform android
```

## Project structure

| Path | Role |
|---|---|
| `app/` | Expo Router routes only (thin wrappers) |
| `src/screens/` | Product screens — private `components/`, `hooks/`, etc. live here |
| `src/components/` | Shared UI only (used by 2+ screens) |
| `src/api/` | Domain API clients + `dto/` |
| `src/store/` | Global Zustand stores |
| `src/hooks/` | Cross-screen hooks only |
| `src/screens/dev/` | Playgrounds / experiments |

**Colocation rule:** if UI is used by one screen, keep it under that screen’s folder. Promote to `src/components/` only when a second screen needs it. Do **not** mirror screen paths under `src/components/`.

### Example

```text
src/screens/expense/add-transaction/
  index.tsx
  components/
  hooks/
app/(authenticated)/expense/add.tsx   → imports the screen entry
```

## Coding guidelines

Full contract (layers, naming, checklists, reference modules):

- **[Folder hygiene](.llm/folder-hygiene.md)** — directory layout and where new code goes
- [Color palette](.llm/color-palette.md)
- [Exceptions](.llm/exceptions.md)

Cursor agents also load `.cursor/rules/folder-hygiene.mdc` so new work follows the same layout.

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/)
