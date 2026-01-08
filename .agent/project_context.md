# Project Context: Michael & Pam's Journey

## Mission
This application is **not just a net worth tracker**. It is a **Strategic IPS (Investment Policy Statement) Enforcement Engine**.
Its primary goal is to turn raw data from Wealthsimple and Fidelity into actionable, emotion-free directives based on a pre-agreed strategy allowing Michael & Pam to execute on their **$5M Retirement Journey**.

## Core Philosophy
*   **Outcome Over Observation**: We don't just show charts; we show *what to do* (e.g., "Sell $5k NVDA").
*   **Household Unity**: Assets are combined into a single "Growth Garden", but we track "Spouse" assets (Pam) simply for fair accounting, not separation.
*   **Peace of Mind**: The UI assumes the user is anxious about money and uses design ("All Is Well") to calm them.

## Core Entities
### Data Sources
*   **Wealthsimple**: Primary aggregator (CSV export).
*   **Fidelity**: Secondary aggregator (CSV export).
*   **Manual Assets**: High-level inputs for illiquid/fixed assets:
    *   **Property**: Principal residence value.
    *   **Mortgage**: Current debt load.
    *   **Spouse Mutual Funds**: Locked-in legacy assets.
    *   **USD HYSA**: Cash held outside brokerage.

## Technology Stack
*   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
*   **Deployment**: [GitHub Pages](https://pages.github.com/) (Client-side only)
*   **Persistence**: `localStorage` (Privacy-first; no server database)
*   **Styling**: Vanilla CSS (Variables-based theming) + Lucide React (Icons)
