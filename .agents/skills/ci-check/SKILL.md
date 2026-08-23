---
name: ci-check
description: Run the full Zikstock CI pipeline locally (lint, build, and tests for both backend and frontend). Trigger when asked to check CI, verify code before pushing, or run pre-push checks.
---

# Zikstock CI Check Skill

This skill executes the exact continuous integration workflow defined in `.github/workflows/ci.yml`.

## Execution Workflow

1. **Backend CI**:
   - Change directory to `backend/`
   - Run `pnpm lint` to verify code formatting and ESLint rules.
   - Run `pnpm build` to ensure TypeScript compilation succeeds.
   - Run `pnpm test` to execute domain & integration tests.

2. **Frontend CI**:
   - Change directory to `frontend/`
   - Run `pnpm lint` to verify ESLint rules.
   - Run `pnpm build` to test Vite production build and TypeScript compilation (`tsc -b && vite build`).
   - Run `npx tsx --test src/components/CreateZikresource/urlMetadataExtractor.test.ts` for frontend unit tests.

3. **Report & Fix**:
   - Summarize the results of each step in a clear markdown table.
   - If any lint errors or minor issues occur, fix them immediately and re-verify.
