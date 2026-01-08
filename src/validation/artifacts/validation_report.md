# Philosophy Validation Report

- Total fixtures: 20
- Correct primary (incl. allowed alternates counted as incorrect in metrics, but should be rare): 11
- Overall accuracy: 55.0%

## Per-philosophy metrics
| philosophy | support | precision | recall | f1 | accuracy | tp | fp | fn |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| barbell_antifragile | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| cash_buffer_safety_first | 1 | 33.3% | 100.0% | 50.0% | 100.0% | 1 | 2 | 0 |
| concentrated_stock_picking | 2 | 25.0% | 50.0% | 33.3% | 50.0% | 1 | 3 | 1 |
| covered_call_income | 1 | 50.0% | 100.0% | 66.7% | 100.0% | 1 | 1 | 0 |
| crypto_maximal | 1 | 100.0% | 100.0% | 100.0% | 100.0% | 1 | 0 | 0 |
| dividend_growth_income | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| esg_sri | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| factor_investing | 1 | 33.3% | 100.0% | 50.0% | 100.0% | 1 | 2 | 0 |
| inflation_hedge_real_assets | 2 | 50.0% | 50.0% | 50.0% | 50.0% | 1 | 1 | 1 |
| leveraged_risk_parity_hfea | 1 | 100.0% | 100.0% | 100.0% | 100.0% | 1 | 0 | 0 |
| passive_indexing_bogleheads | 5 | 100.0% | 80.0% | 88.9% | 80.0% | 4 | 0 | 1 |
| permanent_portfolio | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| risk_parity_all_weather | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| thematic_sector_bets | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |

## Confusion matrix (truncated)
| actual \ predicted | barbell_antifragile | cash_buffer_safety_first | concentrated_stock_picking | covered_call_income | crypto_maximal | dividend_growth_income | esg_sri | factor_investing | inflation_hedge_real_assets | passive_indexing_bogleheads | risk_parity_all_weather | thematic_sector_bets |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| barbell_antifragile | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| cash_buffer_safety_first | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| concentrated_stock_picking | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| covered_call_income | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| crypto_maximal | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| dividend_growth_income | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| esg_sri | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| factor_investing | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| inflation_hedge_real_assets | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| passive_indexing_bogleheads | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 |
| risk_parity_all_weather | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| thematic_sector_bets | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |


## Regression checks
Regressions detected:
- recall regression: barbell_antifragile recall=0.0% < 30.0%
