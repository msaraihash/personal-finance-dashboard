# Architecture Documentation

## Data Flow Pipeline
The application allows for a "stateless" flow where data is ingested, processed, and discarded or utilized immediately, with minimal persistence for convenience.

```mermaid
graph TD
    A[User CSV Upload] -->|Raw Text| B[Parser Service]
    B -->|Holding[]| C[useIPSEngine Hook]
    D[Manual Config] -->|IPSState| C
    C -->|Metrics Object| E[StrategicVisuals]
    C -->|Metrics Object| F[TacticalPanel]
    C -->|RebalanceInstruction[]| F
```

### 1. Ingestion Layer (`src/services/parser.ts`)
*   **Input**: Raw CSV text from Wealthsimple or Fidelity.
*   **Normalization**: Maps various column headers (e.g., "Market Value", "Amount") to a unified `Holding` interface.
*   **Exchange Rates**: Fetches live USD/CAD rates from `frankfurter.app` but allows manual fallback.

### 2. Aggregation Logic (`src/hooks/useIPSEngine.ts`)
*   **Consolidation**: Groups holdings by **Ticker Symbol**.
    *   *Example*: 10 units of NVDA in RRSP + 5 units in TFSA = 15 units Total NVDA.
*   **Classification**: Assigns internal categories (Tech Basket, Speculative, Liquidity) based on strict ticker lists (`TECH_TICKERS`).
*   **Compliance Check**: Compares current aggregation against `IPSState` limits (e.g., "Is NVDA > 5% of Net Worth?").

### 3. Tactical Engine (`src/services/tacticalEngine.ts`)
*   **Pure Function**: Takes `Metrics` and `IPSState` and outputs `RebalanceInstruction[]`.
*   **Logic**:
    1.  Check Liquidity Floor (add CASH if < $200k).
    2.  Check Tech Concentration (trim if Basket > 10% or Single > 5%).
    3.  Check Speculative Limits (trim if > 2%).

### 4. Implementation Details
*   **State Persistence**: `src/services/storage.ts` saves the `IPSState` (manual asset values) to `localStorage` so users don't have to re-enter mortgage balances on every visit.
*   **Build System**: Vite builds to `/docs` for GitHub Pages compatibility.
