# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Node.js GitHub Action (`action.yml` declares `runs.using: node24`) that deletes a directory and optionally re-creates it empty. Inputs: `directory` (defaults to `${{ github.workspace }}`) and `recreate` (defaults to `true`). Entrypoint is `src/index.ts` (just calls `run()`); main logic lives in `src/run.ts`. The action runtime executes the compiled bundle at `dist/index.js`.

## Commands

- `npm run all` — lint + test + package (run before committing; `simple-git-hooks` installs a pre-commit hook that runs this and then `git add dist/*`).
- `npm run package` — bundle `src/index.ts` into `dist/index.js` via `@vercel/ncc`.
- `npm run lint` / `npm run lint:fix` — ESLint over `.ts` files.
- `npm test` — `node --experimental-strip-types --test __tests__/*.test.ts`. Run a single test file by passing its path; filter to a test name with `--test-name-pattern <regex>`.

## Architecture notes

- The bundled `dist/` is committed and is what GitHub actually executes — code changes are not live until `npm run package` regenerates it. The pre-commit hook handles this automatically, and CI (`.github/workflows/ci.yml`) verifies `dist/` is in sync with `src/` on every push/PR, so a stale bundle merged via `--no-verify` will fail CI.
- `src/run.ts` exports the function; `src/index.ts` is just `void run()`. Tests import directly from `../src/run.ts` so importing doesn't auto-invoke.
- Tests are integration-style and operate on a real temp directory (`fs.mkdtempSync`) rather than mocking `fs` — Node's `mock.method` cannot redefine non-configurable properties on `fs` or `@actions/core` exports, so the integration approach is both more reliable and more realistic.
- `tsconfig.json` excludes `__tests__/` from the TS build (`rootDir: ./src`); tests run directly via Node's `--experimental-strip-types`, no transpile step.

## Releasing

Tags drive releases — `vX.Y` for each release and a moving `vX` major tag (force-pushed). Consumers (notably `dsb-norge/github-actions` and `dsb-norge/github-actions-terraform`) pin to `@v1`, so moving the major tag is high blast radius: tag the minor first, verify in a real workflow, then move the major. See README.md "Release" section for the exact tag/push sequence and the un-release rollback procedure.
