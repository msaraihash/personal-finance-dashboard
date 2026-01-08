import { describe, it, expect } from 'vitest';
import { extractFeatures } from './featureExtractor';
import { scorePortfolio } from './scoringEngine';
import type { Holding } from '../types';

describe('Signal Tuning Verification', () => {

    it('Scenario 1: Boglehead Concentration (100% VWO)', () => {
        // VWO is a single ticker, so Top 1% is 100%. 
        // But it is an index fund. The new rule should preventing "Concentrated Stock Picking".
        const holdings: Holding[] = [
            { id: '1', ticker: 'VWO', marketValue: 10000, currency: 'USD', assetClass: 'Equity', name: 'Vanguard Emerging Markets', accountType: 'Test', source: 'Manual', accountName: 'Test Account' }
        ];

        const features = extractFeatures(holdings, [], 1.0);
        const result = scorePortfolio(features);
        const scores = result.philosophies;

        // Should NOT match Concentrated Stock Picking
        const stockPicking = scores.find(s => s.id === 'concentrated_stock_picking');
        // If it's undefined, score is 0 effectively, but let's check score if present
        if (stockPicking) {
            expect(stockPicking.score).toBeLessThan(55);
        } else {
            expect(true).toBe(true); // Excluded or not present is fine
        }

        // Should match Passive Indexing (or similar)
        const boglehead = scores.find(s => s.id === 'passive_indexing_bogleheads');
        expect(boglehead).toBeDefined();
    });

    it('Scenario 2: Dividend vs Factor (100% VDY)', () => {
        // VDY is High Dividend. It has value/quality leans.
        const holdings: Holding[] = [
            { id: '1', ticker: 'VDY', marketValue: 10000, currency: 'CAD', assetClass: 'Equity', name: 'Vanguard High Div', accountType: 'Test', source: 'Manual', accountName: 'Test Account' }
        ];

        const features = extractFeatures(holdings, [], 1.0);
        const result = scorePortfolio(features);
        const scores = result.philosophies;

        const dividend = scores.find(s => s.id === 'dividend_growth_income');
        // const factor = scores.find(s => s.id === 'factor_investing');

        expect(dividend?.score).toBeGreaterThanOrEqual(10);
    });

    it('Scenario 3: Covered Call Detection (100% JEPI)', () => {
        const holdings: Holding[] = [
            { id: '1', ticker: 'JEPI', marketValue: 10000, currency: 'USD', assetClass: 'Equity', name: 'JPMorgan Overlay', accountType: 'Test', source: 'Manual', accountName: 'Test Account' }
        ];

        const features = extractFeatures(holdings, [], 1.0);

        expect(features.uses_options_overlay).toBe(true);
        expect(features.options_overlay_type).toBe('covered_call');

        const result = scorePortfolio(features);
        const scores = result.philosophies;
        const coveredCall = scores.find(s => s.id === 'covered_call_income');

        expect(coveredCall?.score).toBeGreaterThanOrEqual(70);
    });

    it('Scenario 4: High Concentration Genuine Stock Picking', () => {
        // 100% TSLA (not an index fund)
        const holdings: Holding[] = [
            { id: '1', ticker: 'TSLA', marketValue: 10000, currency: 'USD', assetClass: 'Equity', name: 'Tesla Inc', accountType: 'Test', source: 'Manual', accountName: 'Test Account' } // manual assetClass
        ];

        const features = extractFeatures(holdings, [], 1.0);
        const result = scorePortfolio(features);
        const scores = result.philosophies;

        const stockPicking = scores.find(s => s.id === 'concentrated_stock_picking');
        expect(stockPicking).toBeDefined();
        expect(stockPicking?.score).toBeGreaterThanOrEqual(55);
    });
});
