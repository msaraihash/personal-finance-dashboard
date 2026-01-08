# Project State

## Roadmap Status

### Phase 1: De-Personalization & Cleanup ✅
- Removed hardcoded "Michael" references.
- Abstracted "Manual Assets".
- Built `src/types/Assets.ts` and `src/services/parser.ts`.

### Phase 2: Inventory of Philosophies ✅
- Defined taxonomy in `src/data/investment_philosophies.v1.yml`.
- Defined 20+ philosophies with detection signals and visual motifs.

### Phase 3: Feature Extraction ✅
- Created `src/types/features.ts`.
- Implemented `src/services/featureExtractor.ts` with heuristics.
- Verified with `vitest`.

### Phase 4: Philosophy Engine ✅
- Implemented `src/services/ruleEvaluator.ts` (DSL Parser).
- Implemented `src/services/scoringEngine.ts` (Matching & Scoring).
- Implemented `src/hooks/usePhilosophyEngine.ts` (React Integration).
- Verified with comprehensive `vitest` suites.

### Phase 5: Visual Overhaul (Next) 🚧
- Implement the "Nebula Glass" UI components.
- Build visualizations (Barbells, Sankeys) driven by the Engine.

## Current Focus
Phase 4 is complete. The application can now take a portfolio and output a sorted list of matched Investment Philosophies. Next step is Phase 5: Building the UI to display these results.
