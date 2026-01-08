# Philosophy Detection Engine - Validation Infrastructure

## Files
- `ground_truth_schema.json` — JSON Schema for labeled portfolios
- `fixtures/portfolios.json` — Ground truth fixtures (20 archetypes)
- `validation.test.ts` — Vitest harness + metrics + confusion matrix + Markdown report
- `generateSyntheticPortfolio.ts` — Random portfolio generator for fuzz testing
- `artifacts/validation_report.md` — Generated after running tests

## Run

```bash
npx vitest run src/validation/validation.test.ts
```

## What the test does

For each fixture portfolio:

1. Converts fixture to engine input
2. Runs `extractFeatures → scorePortfolio`
3. Asserts predicted primary philosophy == expected primary (or allowed alternates)
4. Updates a confusion matrix and per-philosophy TP/FP/FN counts

After all tests:

* Prints a Markdown report to console
* Writes `artifacts/validation_report.md`
* Fails the test run if regression thresholds are violated

## Regression thresholds

Edit `THRESHOLDS` in `validation.test.ts`:

* `minOverallAccuracy`
* `minRecallByPhilosophy`

## Interpreting the report

### Per-philosophy metrics

* **support**: number of fixtures where this philosophy is the ground truth primary
* **precision**: of predictions labeled this philosophy, how many were correct
* **recall**: of true cases of this philosophy, how many were correctly detected
* **f1**: balance of precision/recall

### Confusion matrix

Shows where the model is mixing up labels.

## Fuzz testing

```ts
import { generateSyntheticPortfolio } from "./generateSyntheticPortfolio";

const p = generateSyntheticPortfolio({
  seed: 42,
  totalValue: 250000,
  mix: { equity: 0.6, bonds: 0.2, cash: 0.1, crypto: 0.1 },
  concentration: "high",
  tilts: { value: 0.8, em: 0.3 },
  includeTinyPositions: true,
  includeManualRealEstate: true,
  multiCurrency: true
});
```
