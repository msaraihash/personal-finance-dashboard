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

### Phase 5: Visual Overhaul ✅
- Established **Design Contract System** (`DESIGN_CONTRACT_V1.md`).
- Implemented `PhilosophyCard` and `PhilosophyEngineView`.
- Integrated "Nebula Glass" theme with staggered animations.

### Phase 6: Precision Motifs & Data Fidelity ✅
- **6A: Data Fidelity**
  - Created `src/data/etf_metadata.ts` with 50 ETFs (region, factors, expense ratios).
  - Upgraded `featureExtractor.ts` for real geography and factor tilt computation.
- **6B: Tier 1 Motifs**
  - `AllocationDonut.tsx`: Asset class donut chart.
  - `BarbellVisual.tsx`: Taleb-style safe core / convex tail.
  - `FactorRadar.tsx`: 5-axis factor exposure radar.
  - `ConcentrationStack.tsx`: Top holdings stacked bar.
- **6C: Smart Card Integration**
  - Created motif registry (`src/components/motifs/index.ts`).
  - Updated `PhilosophyCard` for dynamic motif rendering from YAML.
- All 31 tests passing; build verified.
- **Verification & Hardening**
  - Fixed critical UI crash in `ConcentrationStack` (undefined holdings).
  - Verified UI load stability.

### Phase 7: Onboarding Wizard & UX Polish ✅
- **Onboarding Flow**
    - Implemented `OnboardingWizard.tsx` with dynamic YAML philosophy loading.
    - Added persistence via `localStorage`.
    - Integrated with `App.tsx` (conditional rendering).
- **UX Improvements**
    - Added "Restart Onboarding" button to `IPSConfigModal`.
    - Verified full flow with browser automation.

## Current Focus
Phase 7 is complete. The application now supports a full user intake flow with detecting or selecting an investment philosophy. Next steps involve enriching the tactical panel.
