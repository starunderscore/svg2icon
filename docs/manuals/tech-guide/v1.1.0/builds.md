# Build Artifacts

Compile the app (TypeScript → JS):

```bash
npm run build
```

Outputs to `dist/` and keeps renderer assets under `src/renderer/` for packaging.

Verify build:
- `tsc` exits cleanly
- Run `npm run dev` to smoke test UI
