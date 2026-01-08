# Philosophy Validation Report

- Total fixtures: 20
- Correct primary (incl. allowed alternates counted as incorrect in metrics, but should be rare): 0
- Overall accuracy: 0.0%

## Per-philosophy metrics
| philosophy | support | precision | recall | f1 | accuracy | tp | fp | fn |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| barbell_antifragile | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| cash_buffer_safety_first | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| concentrated_stock_picking | 2 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 2 |
| covered_call_income | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| crypto_maximal | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| dividend_growth_income | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| esg_sri | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| factor_investing | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| inflation_hedge_real_assets | 2 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 2 |
| leveraged_risk_parity_hfea | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| passive_indexing_bogleheads | 5 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 5 |
| permanent_portfolio | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| risk_parity_all_weather | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| thematic_sector_bets | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 0 | 1 |
| time_to_financial_freedom | 0 | 0.0% | 0.0% | 0.0% | 0.0% | 0 | 20 | 0 |

## Confusion matrix (truncated)
| actual \ predicted | barbell_antifragile | cash_buffer_safety_first | concentrated_stock_picking | covered_call_income | crypto_maximal | dividend_growth_income | esg_sri | factor_investing | inflation_hedge_real_assets | passive_indexing_bogleheads | risk_parity_all_weather | thematic_sector_bets |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| barbell_antifragile | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| cash_buffer_safety_first | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| concentrated_stock_picking | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| covered_call_income | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| crypto_maximal | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| dividend_growth_income | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| esg_sri | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| factor_investing | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| inflation_hedge_real_assets | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| passive_indexing_bogleheads | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| risk_parity_all_weather | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| thematic_sector_bets | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |


## Regression checks
Regressions detected:
- recall regression: barbell_antifragile recall=0.0% < 30.0%
- recall regression: concentrated_stock_picking recall=0.0% < 50.0%
- recall regression: crypto_maximal recall=0.0% < 50.0%
- recall regression: factor_investing recall=0.0% < 50.0%
- recall regression: passive_indexing_bogleheads recall=0.0% < 50.0%
- overall accuracy regression: 0.0% < 30.0%
