import type { Holding } from '../types';
import type { ManualAsset } from '../types/Assets';
import type { PortfolioFeatures } from '../types/features';
import { getETFMetadata, normalizeTicker, type ETFMetadata } from '../data/etf_metadata';

// --- Heuristic Lists ---
const INDEX_FUNDS = new Set([
    'XEQT', 'VEQT', 'VGRO', 'VBAL', 'XGRO', 'XBAL',
    'VFV', 'XUS', 'VUN', 'XUU', 'VDY', 'XEI', 'ZSP', 'XIU',
    'VCN', 'XIC', 'XEF', 'VIU', 'ZEA', 'XEC', 'VEE', 'ZEM',
    'VTV', 'VUG', 'VBR', 'VBK', 'BND', 'AGG', 'ZAG', 'VAB', 'XBB',
    'VOO', 'VTI', 'VXUS', 'QQQ', 'IVV', 'SPY', 'IWM'
]);

const CRYPTO_ASSETS = new Set([
    'BTC', 'ETH', 'SOL', 'COIN', 'MSTR', 'IBIT', 'FBTC', 'ETHX.B', 'BTCX.B', 'DOGE'
]);

const CASH_EQUIVALENTS = new Set([
    'CASH', 'CASH.TO', 'PSA', 'PSA.TO', 'HISA', 'UBIL.U', 'CSAV', 'FDRXX',
    'BIL', 'SGOV', 'SHV', 'GBIL'
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
 */
const getCADValue = (value: number, currency: string, exchangeRate: number): number => {
    if (currency === 'USD') return value * exchangeRate;
    return value;
};



/**
 * Compute weighted average of factor tilts from ETF metadata.
 */
interface FactorAccumulator {
    tilt_value: number;
    tilt_size: number;
    tilt_quality: number;
    tilt_momentum: number;
    tilt_low_vol: number;
    totalWeight: number;
}

const accumulateFactorTilts = (
    acc: FactorAccumulator,
    meta: ETFMetadata,
    weight: number
): void => {
    acc.tilt_value += meta.tilt_value * weight;
    acc.tilt_size += meta.tilt_size * weight;
    acc.tilt_quality += meta.tilt_quality * weight;
    acc.tilt_momentum += meta.tilt_momentum * weight;
    acc.tilt_low_vol += meta.tilt_low_vol * weight;
    acc.totalWeight += weight;
};

/**
 * Compute weighted average expense ratio from ETF metadata.
 */
const computeExpenseRatio = (
    holdings: Holding[],
    totalValueCAD: number,
    exchangeRate: number
): number => {
    let weightedExpense = 0;
    let coveredWeight = 0;

    holdings.forEach(h => {
        const meta = getETFMetadata(h.ticker);
        if (meta) {
            const val = getCADValue(h.marketValue, h.currency, exchangeRate);
            const weight = val / totalValueCAD;
            weightedExpense += meta.expense_ratio * weight;
            coveredWeight += weight;
        }
    });

    // Return weighted average for covered portion, or default
    return coveredWeight > 0 ? weightedExpense / coveredWeight : 0.15;
};

/**
 * Extracts comprehensive portfolio features from holdings and manual assets.
 */
export const extractFeatures = (
    holdings: Holding[],
    manualAssets: ManualAsset[],
    exchangeRate: number = 1.35
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

    // Geography accumulators (for equity only)
    const geography = {
        us: 0,
        canada: 0,
        developed_ex_us: 0,
        emerging: 0,
        global: 0,
        unknown: 0
    };

    // Factor tilt accumulators
    const factors: FactorAccumulator = {
        tilt_value: 0,
        tilt_size: 0,
        tilt_quality: 0,
        tilt_momentum: 0,
        tilt_low_vol: 0,
        totalWeight: 0
    };

    const allAssets: { name: string; value: number }[] = [];

    // Options Overlay Accumulator
    let value_with_options = 0;
    const options_types = new Set<string>();

    // Process Holdings
    holdings.forEach(h => {
        const val = getCADValue(h.marketValue, h.currency, exchangeRate);
        totalValueCAD += val;
        allAssets.push({ name: h.ticker, value: val });

        const t = normalizeTicker(h.ticker);
        const meta = getETFMetadata(h.ticker);

        // --- 1. Asset Class Allocation (Mutually Exclusive mostly) ---
        let resolvedAssetClass = 'unknown';

        if (meta) {
            // Trust metadata first
            if (meta.assetClass === 'bond') resolvedAssetClass = 'bond';
            else if (meta.assetClass === 'real_asset') resolvedAssetClass = 'real_asset';
            else if (meta.assetClass === 'equity' || meta.assetClass === 'mixed') {
                // Determine if thematic or broad
                // For now treat as equity, sector/thematic logic adds to attribute
                resolvedAssetClass = 'equity';
            }
        } else {
            // Fallback to input assetClass
            const ac = h.assetClass; // may be undefined for some inputs
            if (CASH_EQUIVALENTS.has(t) || ac === 'Cash') resolvedAssetClass = 'cash';
            else if (CRYPTO_ASSETS.has(t) || ac === 'Crypto') resolvedAssetClass = 'crypto';
            else if (ac === 'FixedIncome') resolvedAssetClass = 'bond';
            else if (ac === 'Property') resolvedAssetClass = 'real_asset';
            else if (['stock', 'Equity', 'etf', 'mutual_fund'].includes(ac || '') || ac === 'Equity') {
                // Logic for generic ETF without metadata handled below
                resolvedAssetClass = 'equity';
            }
        }

        // Special case: Generic ETF without metadata not in lists -> assume Equity? 
        // Or if INDEX_FUNDS has it but no metadata? 
        // e.g. BND in INDEX_FUNDS but not in meta (if it wasn't). 
        // Current lists: INDEX_FUNDS has BND. 
        // If meta not found, resolvedAssetClass might default to equity if we aren't careful.

        // Let's rely on resolvedAssetClass for the main buckets
        switch (resolvedAssetClass) {
            case 'equity': composition.pct_equity += val; break;
            case 'bond': composition.pct_bonds += val; break;
            case 'real_asset': composition.pct_real_assets += val; break;
            case 'crypto': composition.pct_crypto += val; break;
            case 'cash': composition.pct_cash += val; break;
            // 'unknown' falls through
        }

        // --- 2. Attributes (Overlapping) ---

        // Index Funds
        if (INDEX_FUNDS.has(t) || (meta && meta.expense_ratio <= 0.25 && meta.name.includes('Index'))) {
            composition.pct_index_funds += val;
        }

        // Sector / Thematic
        if (SECTOR_THEMATIC.has(t)) {
            composition.pct_sector_thematic += val;
        }

        // Active Funds (heuristic)
        // If it's an ETF/Fund but NOT an index fund?
        const isMutualFund = h.assetClass === 'MutualFund';
        const isFund = isMutualFund || INDEX_FUNDS.has(t) || !!meta;
        if (isFund && !INDEX_FUNDS.has(t) && !SECTOR_THEMATIC.has(t)) {
            // Maybe active?
            // composition.pct_active_funds += val;
        }

        // Single Stocks
        // If it's Equity but not identified as a Fund/ETF
        const isEquity = h.assetClass === 'Equity' || resolvedAssetClass === 'equity';
        if (isEquity && !isFund && !CASH_EQUIVALENTS.has(t)) {
            composition.pct_single_stocks += val;
        }

        // These apply if metadata is available
        if (meta) {
            if (meta.assetClass === 'equity' || meta.assetClass === 'mixed') {
                geography[meta.region] += val;
            }
            if (meta.options_strategy && meta.options_strategy !== 'none') {
                value_with_options += val;
                options_types.add(meta.options_strategy);
            }
            accumulateFactorTilts(factors, meta, val);
        } else {
            if (resolvedAssetClass === 'equity') {
                geography.unknown += val;
            }
        }
    });

    // Process Manual Assets (Simple)
    manualAssets.forEach(m => {
        const val = getCADValue(m.value, m.currency, exchangeRate);
        totalValueCAD += val;
        allAssets.push({ name: m.name, value: val });

        if (m.assetClass === 'Cash') composition['pct_cash'] += val;
        else if (m.assetClass === 'Property') composition['pct_real_assets'] += val;
        else if (m.assetClass === 'FixedIncome') composition['pct_bonds'] += val;
        else if (m.assetClass === 'Equity') composition['pct_single_stocks'] += val;
        else if (m.assetClass === 'Speculative') composition['pct_crypto'] += val;
    });

    // --- Normalize Composition ---
    if (totalValueCAD > 0) {
        Object.keys(composition).forEach(key => {
            composition[key] = composition[key] / totalValueCAD;
        });
    }

    // --- Normalize Geography ---
    const totalEquityGeo = geography.us + geography.canada + geography.developed_ex_us + geography.emerging + geography.global + geography.unknown;
    let pct_us_equity = 0;
    let pct_ex_us_dev_equity = 0;
    let pct_em_equity = 0;
    let home_bias_score = 0;

    if (totalEquityGeo > 0) {
        // Global funds are roughly 60% US, 25% dev ex-US, 10% EM, 5% Canada
        const globalUS = geography.global * 0.60;
        const globalDevExUS = geography.global * 0.25;
        const globalEM = geography.global * 0.10;
        const globalCanada = geography.global * 0.05;

        const effectiveUS = geography.us + globalUS;
        const effectiveDevExUS = geography.developed_ex_us + globalDevExUS;
        const effectiveEM = geography.emerging + globalEM;
        const effectiveCanada = geography.canada + globalCanada;

        pct_us_equity = effectiveUS / totalEquityGeo;
        pct_ex_us_dev_equity = effectiveDevExUS / totalEquityGeo;
        pct_em_equity = effectiveEM / totalEquityGeo;

        // Home bias: Canada weight relative to ~3% global market cap
        const canadaWeight = effectiveCanada / totalEquityGeo;
        home_bias_score = Math.min(1, canadaWeight / 0.03); // Normalized to 1 if 3x overweight
    }

    // --- Normalize Factor Tilts ---
    let tilt_value = 0, tilt_size = 0, tilt_quality = 0, tilt_momentum = 0, tilt_low_vol = 0;
    if (factors.totalWeight > 0) {
        tilt_value = factors.tilt_value / factors.totalWeight;
        tilt_size = factors.tilt_size / factors.totalWeight;
        tilt_quality = factors.tilt_quality / factors.totalWeight;
        tilt_momentum = factors.tilt_momentum / factors.totalWeight;
        tilt_low_vol = factors.tilt_low_vol / factors.totalWeight;
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
    const hasLeveraged = holdings.some(h => LEVERAGED_ETFS.has(normalizeTicker(h.ticker)));

    // --- Expense Ratio ---
    const avg_expense_ratio = totalValueCAD > 0
        ? computeExpenseRatio(holdings, totalValueCAD, exchangeRate)
        : 0.15;

    // --- Options Overlay Logic ---
    const pct_with_options = totalValueCAD > 0 ? value_with_options / totalValueCAD : 0;
    const uses_options_overlay = pct_with_options >= 0.10; // Threshold: 10% of portfolio

    let options_overlay_type = 'none';
    if (uses_options_overlay) {
        if (options_types.has('covered_call')) options_overlay_type = 'covered_call';
        else if (options_types.has('protective_put')) options_overlay_type = 'protective_put';
        else options_overlay_type = 'other';
    }

    return {
        ...composition,

        // Concentration
        top_1_position_pct: totalValueCAD > 0 ? top1Val / totalValueCAD : 0,
        top_5_positions_pct: totalValueCAD > 0 ? top5Val / totalValueCAD : 0,
        n_positions: allAssets.length,
        herfindahl_index: herfindahl,

        // Geography (now computed from ETF metadata)
        pct_us_equity,
        pct_ex_us_dev_equity,
        pct_em_equity,
        home_bias_score,

        // Style (now computed from ETF metadata)
        tilt_value,
        tilt_size,
        tilt_quality,
        tilt_momentum,
        tilt_low_vol,

        // Risk
        est_equity_beta: 1.0 + (tilt_size * 0.2) - (tilt_low_vol * 0.3), // Heuristic
        est_duration: 5,
        leverage_ratio: 1.0,
        uses_leveraged_etfs: hasLeveraged,
        uses_options_overlay: uses_options_overlay,
        options_overlay_type: options_overlay_type,
        rebalance_frequency: 'ad_hoc',
        tax_sensitivity: 'medium',
        fee_sensitivity: avg_expense_ratio > 0.30 ? 'low' : avg_expense_ratio > 0.15 ? 'medium' : 'high',
        avg_expense_ratio,
        totalNetWorthCAD
    } as PortfolioFeatures;
};
