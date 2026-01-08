# Project Context: Personal Finance Dashboard (Public Edition)

## Mission
This application is a **Privacy-First, Visual Investment Mapper**.
Its goal is to turn raw data from **Wealthsimple** (via CSV) into unforgettable visual communications of a user's financial reality, mapped to their chosen **Investment Philosophy** (e.g., Taleb, Bogle, Dividend).

## Core Philosophy
*   **Privacy First**: "What happens in your browser, stays in your browser." No servers, no databases, no data harvesting.
*   **Visuals Over Spreadsheets**: We don't just show rows of numbers; we show "Barbells", "Sankeys", and "Donuts" that intuitively explain risk and allocation.
*   **Opinionated but Flexible**: The app doesn't just "track"; it "grades" your portfolio against strict philosophical rules (e.g., "You claim to be a Boglehead, but you own 50% NVDA. Fail.").

## Core Entities
### Data Sources
*   **Wealthsimple**: The primary and initial data source (CSV export).
*   **Manual Assets**: Generic user-defined assets (Real Estate, Cash, Alternative Investments) that are not in the CSV.

### The Philosophy Engine
*   **Source of Truth**: `src/data/investment_philosophies.v1.yml` defines 20+ philosophies (definitions, rules, "sins").
*   **Feature Extraction**: A dedicated layer that converts raw holdings into normalized metrics (e.g., `pct_equity`, `herfindahl_index`) using heuristics.
*   **Philosophy Selection**: Users match with a philosophy (e.g., Boglehead, Taleb, Yield Hunter) which dictates the "Grading Logic".

## Technology Stack
*   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
*   **Testing**: [Vitest](https://vitest.dev/)
*   **Persistence**: `localStorage` (Device-only persistence)
*   **Deployment**: Static hosting (GitHub Pages / Netlify)
