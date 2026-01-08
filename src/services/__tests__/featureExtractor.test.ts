import { describe, it, expect } from 'vitest';
import { extractFeatures } from '../featureExtractor';
import type { Holding } from '../../types';
import type { ManualAsset } from '../../types/Assets';

describe('featureExtractor', () => {

    // Helper to create a mock holding
    const createHolding = (ticker: string, marketValue: number, assetClass: Holding['assetClass'] = 'Equity'): Holding => ({
        id: 'test-id',
        ticker,
        name: ticker,
        marketValue,
        currency: 'CAD',
        assetClass,
        source: 'Wealthsimple',
        accountName: 'TFSA',
        accountType: 'TFSA',
    });

    it('Scenario 1: The Boglehead (80% XEQT, 20% CASH)', () => {
        const holdings: Holding[] = [
            createHolding('XEQT', 8000),
            createHolding('CASH.TO', 2000, 'Cash')
        ];
        const manualAssets: ManualAsset[] = [];

        const features = extractFeatures(holdings, manualAssets);

        expect(features.pct_index_funds).toBeCloseTo(0.8);
        expect(features.pct_cash).toBeCloseTo(0.2);
        expect(features.pct_single_stocks).toBeCloseTo(0.0);
        expect(features.pct_equity).toBeCloseTo(0.8);
    });

    it('Scenario 2: The Gambler (100% GME)', () => {
        const holdings: Holding[] = [
            createHolding('GME', 10000, 'Equity')
        ];
        const manualAssets: ManualAsset[] = [];

        const features = extractFeatures(holdings, manualAssets);

        expect(features.pct_single_stocks).toBeCloseTo(1.0);
        expect(features.top_1_position_pct).toBeCloseTo(1.0);
        expect(features.herfindahl_index).toBeCloseTo(1.0);
        expect(features.pct_index_funds).toBe(0);
    });

    it('Scenario 3: Crypto Bro (50% BTC, 50% Cash)', () => {
        const holdings: Holding[] = [
            createHolding('BTC', 5000, 'Speculative'),
            createHolding('CASH.TO', 5000, 'Cash')
        ];
        const manualAssets: ManualAsset[] = [];

        const features = extractFeatures(holdings, manualAssets);

        expect(features.pct_crypto).toBeCloseTo(0.5);
        expect(features.pct_cash).toBeCloseTo(0.5);
    });

    it('Scenario 4: Manual Real Estate', () => {
        const holdings: Holding[] = [
            createHolding('XEQT', 5000)
        ];
        const manualAssets: ManualAsset[] = [
            {
                id: 'house',
                name: 'Main Home',
                value: 5000,
                currency: 'CAD',
                assetClass: 'Property'
            }
        ];

        const features = extractFeatures(holdings, manualAssets);

        expect(features.pct_real_assets).toBeCloseTo(0.5);
        expect(features.pct_index_funds).toBeCloseTo(0.5);
    });

    // --- Phase 6A: New tests for enriched feature extraction ---

    it('Geography: US-focused portfolio (VFV + XUS)', () => {
        const holdings: Holding[] = [
            createHolding('VFV', 5000),
            createHolding('XUS', 5000)
        ];

        const features = extractFeatures(holdings, []);

        // Both are pure US equity
        expect(features.pct_us_equity).toBeCloseTo(1.0);
        expect(features.pct_ex_us_dev_equity).toBeCloseTo(0.0);
        expect(features.pct_em_equity).toBeCloseTo(0.0);
    });

    it('Geography: Diversified portfolio (VFV + XEF + VEE)', () => {
        const holdings: Holding[] = [
            createHolding('VFV', 6000),  // US
            createHolding('XEF', 3000),  // Dev ex-US
            createHolding('VEE', 1000)   // EM
        ];

        const features = extractFeatures(holdings, []);

        expect(features.pct_us_equity).toBeCloseTo(0.6);
        expect(features.pct_ex_us_dev_equity).toBeCloseTo(0.3);
        expect(features.pct_em_equity).toBeCloseTo(0.1);
    });

    it('Geography: Global fund distributes across regions', () => {
        const holdings: Holding[] = [
            createHolding('XEQT', 10000) // Global
        ];

        const features = extractFeatures(holdings, []);

        // Global is ~60% US, 25% dev ex-US, 10% EM, 5% Canada
        expect(features.pct_us_equity).toBeCloseTo(0.6);
        expect(features.pct_ex_us_dev_equity).toBeCloseTo(0.25);
        expect(features.pct_em_equity).toBeCloseTo(0.10);
    });

    it('Factor Tilts: Small-cap value portfolio (VBR)', () => {
        const holdings: Holding[] = [
            createHolding('VBR', 10000) // Small-cap value
        ];

        const features = extractFeatures(holdings, []);

        // VBR has tilt_value: 0.7, tilt_size: 0.7
        expect(features.tilt_value).toBeGreaterThan(0.5);
        expect(features.tilt_size).toBeGreaterThan(0.5);
    });

    it('Factor Tilts: Quality-focused portfolio (QUAL)', () => {
        const holdings: Holding[] = [
            createHolding('QUAL', 10000)
        ];

        const features = extractFeatures(holdings, []);

        // QUAL has tilt_quality: 0.7
        expect(features.tilt_quality).toBeGreaterThan(0.5);
    });

    it('Factor Tilts: Blended portfolio neutralizes tilts', () => {
        const holdings: Holding[] = [
            createHolding('VTV', 5000),  // Value: +0.6
            createHolding('VUG', 5000)   // Growth: -0.6
        ];

        const features = extractFeatures(holdings, []);

        // Should roughly cancel out
        expect(features.tilt_value).toBeCloseTo(0, 1);
    });

    it('Expense Ratio: Low-cost index portfolio', () => {
        const holdings: Holding[] = [
            createHolding('XEQT', 10000) // 0.20%
        ];

        const features = extractFeatures(holdings, []);

        expect(features.avg_expense_ratio).toBeCloseTo(0.20, 1);
    });

    it('Expense Ratio: High-cost thematic portfolio', () => {
        const holdings: Holding[] = [
            createHolding('ARKK', 10000) // 0.75%
        ];

        const features = extractFeatures(holdings, []);

        expect(features.avg_expense_ratio).toBeCloseTo(0.75, 1);
    });

    it('Expense Ratio: Blended portfolio', () => {
        const holdings: Holding[] = [
            createHolding('XEQT', 8000),  // 0.20%
            createHolding('ARKK', 2000)   // 0.75%
        ];

        const features = extractFeatures(holdings, []);

        // Weighted: (0.8 * 0.20 + 0.2 * 0.75) = 0.31
        expect(features.avg_expense_ratio).toBeCloseTo(0.31, 1);
    });
});
