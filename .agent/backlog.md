# Backlog

Deferred items for future sprints. Prioritize based on user demand.

---

## Tier 2 Motifs (Deferred from Phase 6)
Visual motifs defined in `investment_philosophies.v1.yml` but not yet implemented.

- [ ] `risk_return_plane` — MPT efficient frontier scatter plot
- [ ] `correlation_heatmap` — Diversification benefit by asset correlation
- [ ] `glidepath_curve` — Lifecycle/Target-Date de-risking visualization
- [ ] `payoff_diagram` — Options strategy payoff (Hedging, Covered Call)
- [ ] `leverage_gauge` — Gross exposure vs net (HFEA)
- [ ] `drawdown_cone` — Amplified drawdown scenarios
- [ ] Badge motifs: `diversifier_badge`, `hands_off_badge`, `tail_risk_badge`, etc.

---

## Tech Debt
Pre-existing issues unrelated to Phase 6.

- [ ] `App.tsx:156` — Move `SortHeader` component outside render function
- [ ] `App.tsx:124` — Remove unused `_type` variable

---

## Data Enrichment (Future)
Potential improvements to `featureExtractor` and ETF metadata.

- [ ] Add more ETFs to `etf_metadata.ts` (international, sector-specific)
- [ ] Implement look-through for multi-asset ETFs (e.g., VGRO → 80/20 stock/bond)
- [ ] User-editable rebalance frequency and tax sensitivity inputs
