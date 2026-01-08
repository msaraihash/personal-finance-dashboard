# Coding Standards: Defeating "AI Slop"

To ensure this project remains maintainable by agents and humans alike, we enforce strict coding standards.

## 1. Type Safety (TypeScript)
*   **NO `any`**: The use of `any` is strictly forbidden.
*   **Centralized Types**: All shared interfaces (`Metrics`, `Holding`, `IPSState`) MUST be defined in `src/types/index.ts`.
*   **Strict Imports**: Use `import type { ... }` for interfaces to comply with `verbatimModuleSyntax`.

## 2. Architecture Rules
*   **No Circular Dependencies**: `useIPSEngine` (Hook) depends on `tacticalEngine` (Service). `tacticalEngine` MUST NOT depend on `useIPSEngine`.
*   **Functional purity**: Service functions should be pure where possible (input -> output), making them easy to test.

## 3. Git & Deployment
*   **Commit Style**: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`).
*   **Build Artifacts**: The `/docs` folder is the Source of Truth for production. Always run `npm run build` before pushing.
*   **Pathing**: Assets must use relative paths (`base: './'`) to support GitHub Pages subdirectories.

## 4. Maintenance
*   **Unused Code**: Delete it. Don't comment it out. "Dead code is liability."
*   **Console Logs**: Remove `console.log` before committing.
