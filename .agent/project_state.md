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

### Phase 4: Philosophy Engine (Next) 🚧
- Implement the "Scoring Logic" to match portfolios against the YAML rules.
- Build the `usePhilosophyEngine` hook.

### Phase 5: Visual Overhaul
- Implement the "Nebula Glass" UI components.
- Build visualizations (Barbells, Sankeys) driven by the Engine.

## Current Focus
Preparing for **Phase 4**. The taxonomy and data layer are ready. We need to build the logic that consumes the `PortfolioFeatures` and outputs a `ComplianceResult`.
