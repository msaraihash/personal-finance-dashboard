import { Holding } from '../types';
import { ManualAsset } from '../types/Assets';
import { PortfolioFeatures, RebalanceFrequency, TaxSensitivity, FeeSensitivity, OptionsOverlayType } from '../types/features';

// --- Heuristic Lists ---
const INDEX_FUNDS = new Set([
    'XEQT', 'VEQT', 'VGRO', 'VBAL', 'XGRO', 'XBAL',
    'VFV', 'XUS', 'VUN', 'XUU', 'VDY', 'XEI', 'ZSP', 'XIU'
]);

const CRYPTO_ASSETS = new Set([
    'BTC', 'ETH', 'SOL', 'COIN', 'MSTR', 'IBIT', 'FBTC', 'ETHX.B', 'BTCX.B'
]);

const CASH_EQUIVALENTS = new Set([
    'CASH', 'CASH.TO', 'PSA', 'PSA.TO', 'HISA', 'UBIL.U', 'CSAV', 'FDRXX'
]);

const SECTOR_THEMATIC = new Set([
    'TEC', 'CIBR', 'HCLN', 'LIT', 'BOTZ', 'ARKK'
]);

const LEVERAGED_ETFS = new Set([
    'TQQQ', 'UPRO', 'SOXL', 'TECL', 'HQU', 'HOU'
]);

// --- Helper Functions ---

/**
 * Normalizes asset value to CAD.
 * Naive implementation: Assumes if currency is USD, multiply by exchangeRate.
 */
const getCADValue = (value: number, currency: string, exchangeRate: number): number => {
    if (currency === 'USD') return value * exchangeRate;
    return value;
};

/**
 * Categorizes an asset into one of the PortfolioFeature buckets.
 * Returns the key in PortfolioFeatures to increment.
 */
const categorizeAsset = (ticker: string, assetClass: string): keyof PortfolioFeatures | null => {
    const t = ticker.toUpperCase().replace('.TO', ''); // Simple normalization

    if (CASH_EQUIVALENTS.has(t) || assetClass === 'Cash') return 'pct_cash';
    if (CRYPTO_ASSETS.has(t) || assetClass === 'Crypto') return 'pct_crypto';
    if (INDEX_FUNDS.has(t)) return 'pct_index_funds';
    if (SECTOR_THEMATIC.has(t)) return 'pct_sector_thematic';
    if (assetClass === 'Property' || assetClass === 'Speculative') return 'pct_real_assets'; // Approximation for now

    // Default fallback: Single Stock if it's Equity and not an Index
    if (assetClass === 'Equity') return 'pct_single_stocks';
    if (assetClass === 'FixedIncome') return 'pct_bonds';

    return null;
};

/**
 * Extracts comprehensive portfolio features from holdings and manual assets.
 */
export const extractFeatures = (
    holdings: Holding[],
    manualAssets: ManualAsset[],
    exchangeRate: number = 1.35 // Default fallback
): PortfolioFeatures => {

    let totalValueCAD = 0;
    const composition: Record<string, number> = {
        pct_equity: 0,
        pct_bonds: 0,
        pct_cash: 0,
        pct_real_assets: 0,
        pct_alternatives: 0,
        pct_crypto: 0,
        pct_single_stocks: 0,
        pct_index_funds: 0,
        pct_active_funds: 0,
        pct_sector_thematic: 0
    };

    // Consolidated list of assets with CAD values for Concentration calcs
    const allAssets: { name: string, value: number }[] = [];

    // Process Holdings
    holdings.forEach(h => {
        const val = getCADValue(h.marketValue, h.currency, exchangeRate);
        totalValueCAD += val;
        allAssets.push({ name: h.ticker, value: val });

        const category = categorizeAsset(h.ticker, h.assetClass);
        if (category && category in composition) {
            composition[category] += val;
        }

        // Broad Category Aggregation (Overlapping)
        // If it's a single stock or index fund or sector ETF, it's also "Equity"
        if (['pct_single_stocks', 'pct_index_funds', 'pct_sector_thematic', 'pct_active_funds'].includes(category || '')) {
            composition['pct_equity'] += val;
        }
    });

    // Process Manual Assets
    manualAssets.forEach(m => {
        const val = getCADValue(m.value, m.currency, exchangeRate);
        totalValueCAD += val;
        allAssets.push({ name: m.name, value: val });

        // Simple mapping for manual assets
        if (m.assetClass === 'Cash') composition['pct_cash'] += val;
        else if (m.assetClass === 'Property') composition['pct_real_assets'] += val;
        else if (m.assetClass === 'Crypto') composition['pct_crypto'] += val;
        else if (m.assetClass === 'FixedIncome') composition['pct_bonds'] += val;
        else if (m.assetClass === 'Equity') composition['pct_single_stocks'] += val; // Assume manual equity is specific
    });

    // --- Normalize Composition ---
    if (totalValueCAD > 0) {
        Object.keys(composition).forEach(key => {
            composition[key] = composition[key] / totalValueCAD;
        });
    }

    // --- Concentration Metrics ---
    allAssets.sort((a, b) => b.value - a.value);

    const top1Val = allAssets.length > 0 ? allAssets[0].value : 0;
    const top5Val = allAssets.slice(0, 5).reduce((sum, a) => sum + a.value, 0);

    let herfindahl = 0;
    if (totalValueCAD > 0) {
        herfindahl = allAssets.reduce((sum, a) => sum + Math.pow(a.value / totalValueCAD, 2), 0);
    }

    // --- Heuristic Checks ---
    const hasLeveraged = holdings.some(h => LEVERAGED_ETFS.has(h.ticker.toUpperCase().replace('.TO', '')));

    // --- Defaults / Placeholders for Hard-to-Compute ---
    // These would ideally come from a richer data source or user questionnaire

    return {
        ...composition,

        // Concentration
        top_1_position_pct: totalValueCAD > 0 ? top1Val / totalValueCAD : 0,
        top_5_positions_pct: totalValueCAD > 0 ? top5Val / totalValueCAD : 0,
        n_positions: allAssets.length,
        herfindahl_index: herfindahl,

        // Geography (Stubbed defaults)
        pct_us_equity: 0.5, // Total guess without look-through
        pct_ex_us_dev_equity: 0.1,
        pct_em_equity: 0.05,
        home_bias_score: 0.2,

        // Style (Stubbed defaults)
        tilt_value: 0,
        tilt_size: 0,
        tilt_quality: 0,
        tilt_momentum: 0,
        tilt_low_vol: 0,

        // Risk
        est_equity_beta: 1.0,
        est_duration: 5,
        leverage_ratio: 1.0,
        uses_leveraged_etfs: hasLeveraged,
        uses_options_overlay: false,
        options_overlay_type: 'none',
        rebalance_frequency: 'ad_hoc',
        tax_sensitivity: 'medium',
        fee_sensitivity: 'low',
        avg_expense_ratio: 0.15
    } as PortfolioFeatures;
};
