# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A GitHub composite Action (`action.yml`) that deletes a directory and optionally re-creates it empty. Inputs: `directory` (defaults to `${{ github.workspace }}`) and `recreate` (defaults to `true`). Source lives in `src/index.ts`; the action runtime executes the compiled bundle at `dist/index.js` under `node24`.

## Commands

- `npm run all` — lint + test + package (run before committing; the husky `pre-commit` hook runs this and then `git add dist/*`).
- `npm run package` — bundle `src/index.ts` into `dist/index.js` via `@vercel/ncc`.
- `npm run lint` / `npm run lint:fix` — ESLint over `.ts` files.
- `npm test` — Jest (ts-jest preset). Run a single test with `npx jest -t '<test name substring>'` or `npx jest __tests__/index.test.ts`.

## Architecture notes

- The bundled `dist/` is committed and is what GitHub actually executes — code changes are not live until `npm run package` regenerates it. The pre-commit hook handles this automatically, but anything that bypasses the hook (e.g. `--no-verify`, IDEs that skip husky) will ship stale `dist/`.
- `src/index.ts` calls `run()` at module load (line 65), so importing it from tests triggers execution. The Jest suite mocks `@actions/core` and `fs` globally (see `__tests__/index.test.ts`) to keep this safe.
- `tsconfig.json` excludes `__tests__/` from the TS build (`rootDir: ./src`); tests are compiled on the fly by ts-jest using their own settings.

## Releasing

Tags drive releases — `vX.Y` for each release and a moving `vX` major tag (force-pushed). See README.md "Release" section for the exact tag/push sequence, including the un-release rollback procedure.