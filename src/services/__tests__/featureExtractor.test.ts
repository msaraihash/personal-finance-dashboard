import { describe, it, expect } from 'vitest';
import { extractFeatures } from '../featureExtractor';
import { Holding } from '../../types';
import { ManualAsset } from '../../types/Assets';

describe('featureExtractor', () => {

    // Helper to create a mock holding
    const createHolding = (ticker: string, marketValue: number, assetClass: any = 'Equity'): Holding => ({
        id: 'test-id',
        ticker,
        name: ticker,
        marketValue, // Assuming native currency matches for simplicity unless specified
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

        // Check broader categorization
        expect(features.pct_equity).toBeCloseTo(0.8); // XEQT is Equity
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
        expect(features.total_net_worth).toBeUndefined(); // We don't verify total NW in features yet
    });
});
