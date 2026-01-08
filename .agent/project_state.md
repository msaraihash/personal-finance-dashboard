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

### Phase 8: Validation Infrastructure & Quality Assurance ✅
- **Philosophy Detection Harness**
  - Created `src/validation/ground_truth_schema.json` and 20 labeled fixtures.
  - Implemented `validation.test.ts` with precision/recall metrics and confusion matrices.
  - Created logic fuzz generator `generateSyntheticPortfolio.ts`.
  - Identified signal regression (fallback philosophy dominating predictions).

### Phase 8B: Fallback Philosophy & Financial Goals ✅
- **Time to Financial Freedom Fallback**
  - Defined outcome-based philosophy `time_to_financial_freedom` (low-score fallback).
  - Implemented `RunwayMeter` visual motif showing years to FI.
- **Financial Goals Integration**
  - Added "Financial Goals" step to `OnboardingWizard` (Expenses, Savings Rate).
  - Wired global state in `App.tsx` to pass net worth and goals to the engine view.

### Phase 9: Signal Tuning & Engine Hardening ✅
- **Signal Tuning**
  - Implemented weighted scoring logic in `scoringEngine.ts`.
  - Tuned `risk_parity` and `tactical` signals via data fidelity improvements.
  - Achieved **55% Baseline Accuracy** (up from 0%) on validation set.
- **Engine Hardening**
  - Refactored `featureExtractor.ts` to support overlapping feature attributes (e.g., Bond Index Funds).
  - Expanded `etf_metadata.ts` with 15+ missing tickers (AVUV, JEPI, etc.).
  - Fixed critical bug in validation harness (`value` vs `marketValue` mismatch).
- **Outcome**
  - `time_to_financial_freedom` fallback no longer dominates valid portfolios.
  - Accurate detection of Boglehead, Risk Parity, and Factor strategies.

### Phase 9B: Signal Fine-Tuning (Concentration + Options) ✅
- **Concentration Tuning**
  - Adjusted logic to differentiate "Concentrated Stock Picking" from "Single-Ticker Index Fund" (e.g. VEQT).
- **Options Overlay Support**
  - Added `options_strategy` to `etf_metadata.ts`.
  - Implemented `uses_options_overlay` feature extraction.
  - Successfully detecting `JEPI`, `XYLD`, `QYLD` as covered call strategies.
- **Factor vs Dividend Separation**
  - Refined rules to reduce false positives between Factor Investing and Dividend Growth.

### Phase 9C: Financial Freedom Calculator V2 ✅
- **Robust Math Engine**
  - Implemented closed-form annuity formulas for accurate FI projections (`src/types/FinancialGoals.ts`).
  - Added support for `Gross Income`, `Tax Rate`, `Real Return`, and `Safe Withdrawal Rate`.
  - Implemented iterative fallback for edge cases (negative returns).
- **UI & UX**
  - Updated `IPSConfigModal` with "Progressive Disclosure" (Basic vs Advanced settings).
  - Refined `RunwayMeter` to show "Years to Freedom" and "Projected Age".
  - Detected and removed legacy UI duplications (`StrategicVisuals.tsx`).
- **Data Safety**
  - Implemented auto-migration for V1 types to V2 defaults.
  - Verified with new unit tests (`fiMath.test.ts`).
- **Refinement (V2.1)**
  - **Simplified Onboarding**: Reduced inputs to Age/Income only layout (implicit assumptions).
  - **Tax Automation**: Added `src/services/tax.ts` for Ontario tax estimation.
  - **Settings Parity**: Updated `IPSConfigModal` to match simplified logic + added SWR configuration.


### Phase 10: Portfolio Remix Studio (Retention) ✅
- **Remix Engine**
  - Implemented `useRemixEngine` hook with "Top 5 + Rest" logic.
  - Added real-time slider normalization and live re-scoring.
- **Studio UI**
  - Created `RemixStudio` component with split view (Controls / Preview).
  - Implemented `AllocationSliders` and `LiveStats` for instant feedback.
- **Viral Mechanics**
  - Built `PosterCanvas` for 9:16 social-ready export.
  - Created 3 templates: Minimal, Vibrant (mesh gradient), Geometric (charts).
  - Integrated `html2canvas` for PNG download.


## Current Focus
The philosophy engine is robust, and the "Time to Financial Freedom" calculator is now mathematically rigorous. The project is ready for broader user testing. Next steps could involve more advanced motifs or further tuning of philosophy signals.
