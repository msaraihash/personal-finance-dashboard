# Architecture Documentation

## Data Flow Pipeline
The application allows for a **Local-First**, compliance-driven loop.

```mermaid
graph TD
    A[User CSV Upload] -->|Wealthsimple CSV| B[Parser Service]
    B -->|Holding[]| C[FeatureExtractor]
    D[Manual Assets] -->|Asset[]| C
    C -->|PortfolioFeatures| E[Philosophy Engine]
    F[Philosophy Defs (YAML)] -->|Rules| E
    E -->|ComplianceResult| G[StrategicVisuals]
    E -->|RebalanceAction[]| H[TacticalPanel]
```

### 1. Ingestion Layer (`src/services/parser.ts`)
*   **Wealthsimple Only**: Strictly parses the specific schema from Wealthsimple trade/account exports.
*   **Normalization**: Converts raw CSV rows into a standardized `Holding` object (Ticker, Amount, Currency).

### 2. Feature Extractor (`src/services/featureExtractor.ts`)
*   **Purpose**: Bridges the gap between raw data and philosophy rules.
*   **Logic**:
    *   **Tagging**: Uses heuristics (Tickers, Asset Class) to identify `Index`, `Crypto`, `Cash`, etc.
    *   **Metrics**: computes `herfindahl_index`, `pct_equity`, `top_5_positions_pct`.

### 3. The Philosophy Engine (Phase 4)
*   **Logic**: Consumes `PortfolioFeatures` + `ManualAssets`.
*   **Registry**: `src/data/investment_philosophies.v1.yml`.
*   **Execution**:
    1.  **Extracts** features from holdings.
    2.  **Matches** against Philosophy Rules (e.g., "Is `pct_single_stocks` > 0? Fail Boglehead").
    3.  **Returns** a `ComplianceResult`.

### 3. Onboarding Flow (`src/contexts/OnboardingContext.tsx`)
*   **State Machine**: Tracks the user's journey from "Stranger" to "Dashboard User".
    *   `Step 0`: Welcome / Value Prop.
    *   `Step 1`: Select Philosophy (The "Vibe Check").
    *   `Step 2`: Upload Wealthsimple CSV.
    *   `Step 3`: Dashboard.

### 4. Implementation Details
*   **Storage**: `localStorage` keys are now namespaced and generic (e.g., `finance_dashboard_holdings` instead of `michael_holdings`).
*   **Styling**: Continuing the "Nebula Glass" aesthetic but making components modular to support different visualizations per philosophy.
