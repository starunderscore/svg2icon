# CI Gates — GitHub Actions

This roadmap describes how to gate changes with layered tests in GitHub Actions so merges only land when the suite is green.

## Objectives
- Enforce fast unit/integration tests on every PR and `main`
- Add Cypress E2E smoke flows as a required gate
- Keep runs deterministic with caching and artifacts

## Job layout (recommended)
- Lint + Unit/Integration (fast)
- E2E UI (Cypress): sidebar renders, project CRUD, basic downloads
- Optional nightly: visual regression and broader E2E

## Example workflow (reference)
```yaml
name: CI
on:
  pull_request:
  push:
    branches: [ main ]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build --if-present
      - run: npm test --workspaces -- --reporter=dot

  e2e:
    runs-on: ubuntu-latest
    needs: unit
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      # Start app (dev) on a known port with temp userData
      - run: |
          export SVG2ICON_USER_DATA=$(mktemp -d)
          nohup npm run dev &
          npx wait-on http://localhost:5173 || true
      # Run Cypress E2E
      - uses: cypress-io/github-action@v6
        with:
          build: npm run build --if-present
          start: npm run dev
          wait-on: 'http://localhost:5173'
        env:
          SVG2ICON_USER_DATA: ${{ runner.temp }}
      - name: Upload videos and screenshots
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-artifacts
          path: |
            cypress/videos/**
            cypress/screenshots/**
```

Notes:
- Prefer `npm ci` and `actions/setup-node` caching for speed
- If Electron is required, run under Xvfb or use the built-in headless mode
- Use a temp `userData` directory so CI stays clean and tests remain independent

## Branch protection (required checks)
- Mark `unit` and `e2e` jobs as required in GitHub’s Branch protection rules
- Enable “Require status checks to pass before merging” and select these jobs

## Flake control
- Use Cypress retries for E2E (`retries: { runMode: 2 }`)
- Stabilize selectors via test IDs (e.g., `data-testid="sidebar"`)
- Keep E2E lean; push detailed logic into unit/integration tests

## Artifacts and triage
- Upload Cypress screenshots/videos on failures
- Consider uploading generated ZIPs to validate packaging; keep sizes bounded

## Next steps
1. Land basic workflow with `unit` + `e2e` jobs
2. Add a small Cypress smoke suite covering sidebar + project CRUD
3. Expand with packaging assertions and (optionally) visual regression nightly

