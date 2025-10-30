# End‑to‑End (E2E) UI Testing — Roadmap

This roadmap adds E2E UI coverage using Cypress (and compatible tools) so core user journeys stay green and gated in CI.

## What kind of testing is this?
- Label: End‑to‑End (E2E) UI testing. Cypress also supports Component Testing, but this page focuses on full UI flows.

## Goals
- Lock critical flows (open app, create/edit/delete project, downloads) with stable, fast E2E checks
- Run in GitHub Actions as a blocking gate on PRs and `main`
- Keep tests deterministic: fixtures, test IDs, and resilient selectors

## Tooling
- Primary: Cypress (E2E mode)
- Consider: Playwright (parallel, auto‑wait) for comparison or future migration
- Nice‑to‑have: Visual regression add‑on (Percy/Applitools/Chromatic) for UI drift

## Target flows (first wave)
- App boot + sidebar visible
- Projects: create → edit → delete persists to `svg2icon.json`
- Downloads: web/mobile/desktop/all produce expected folders/files
- Settings: theme toggle persists

## Milestones
1. Add Cypress with basic project scaffolding and CI task
2. Introduce stable test IDs in UI where needed
3. Land smoke tests for sidebar + project CRUD
4. Add download assertions (ZIP names/files present)
5. Parallelize/spec split for speed; add flaky‑test heuristics

## Electron notes
- Renderer UI can be exercised in a browser context; for Electron‑only behavior, use thin IPC shims or a minimal Electron launcher per spec
- Use a temporary userData directory during tests to avoid polluting dev/prod data

> Remember: Prefer high‑signal E2E specs that mirror real usage. Keep them few, fast, and reliable; push detailed logic into unit/integration tests.

