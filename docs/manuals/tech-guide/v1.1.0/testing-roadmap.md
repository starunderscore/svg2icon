# Electron Area Testing — Roadmap

This page outlines the plan to introduce automated testing for the Electron area in the next release. Today’s coverage is manual smoke testing; the items below describe how we’ll layer in scripts without slowing development.

## Goals (next release)
- Add automated tests to exercise IPC and storage using a temporary `userData` folder
- Keep tests fast and isolated; no reliance on packaged builds
- Provide a clear path to extend coverage (downloads/packaging filters)

## Candidate tooling
- `electron-mocha` or `vitest + electron` to run tests in an Electron context

## Initial scope
- StorageService: CRUD operations and JSON guardrails via DI/mocks
- Packaging skip filters: ensure `original.svg` is excluded from the web bundle (and web subfolders in All‑In‑One)

## Milestones
1. Pick runner and wire CI task
2. Add temp `userData` harness + fixtures
3. Land StorageService unit tests (CRUD + guards)
4. Land packaging filter tests
5. Add smoke IPC tests for core endpoints

> Remember: Keep the feedback loop tight — prioritize speed and determinism so the tests help, not hinder, day‑to‑day work.
