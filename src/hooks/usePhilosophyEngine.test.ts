
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePhilosophyEngine } from '../hooks/usePhilosophyEngine';
import { PortfolioFeatures } from '../types/features';

describe('usePhilosophyEngine', () => {
    // Basic mock features
    const mockFeatures: PortfolioFeatures = {
        pct_equity: 1, pct_bonds: 0, pct_cash: 0, pct_real_assets: 0, pct_alternatives: 0, pct_crypto: 0,
        pct_single_stocks: 0, pct_index_funds: 1, pct_active_funds: 0, pct_sector_thematic: 0,
        top_1_position_pct: 0.1, top_5_positions_pct: 0.1, n_positions: 20, herfindahl_index: 0.01,
        pct_us_equity: 0.6, pct_ex_us_dev_equity: 0.3, pct_em_equity: 0.1, home_bias_score: 0,
        tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0,
        est_equity_beta: 1, est_duration: 0, leverage_ratio: 1, uses_leveraged_etfs: false,
        uses_options_overlay: false, options_overlay_type: 'none', rebalance_frequency: 'none',
        tax_sensitivity: 'low', fee_sensitivity: 'low', avg_expense_ratio: 0.05
    };

    it('returns null if features are null', () => {
        const { result } = renderHook(() => usePhilosophyEngine(null));
        expect(result.current).toBeNull();
    });

    it('returns scored results when features are provided', () => {
        const { result } = renderHook(() => usePhilosophyEngine(mockFeatures));
        expect(result.current).not.toBeNull();
        expect(result.current?.philosophies.length).toBeGreaterThan(0);

        // Should match Passive Indexing
        const bogle = result.current?.philosophies.find(p => p.id === 'passive_indexing_bogleheads');
        expect(bogle?.score).toBeGreaterThan(50);
    });
});
