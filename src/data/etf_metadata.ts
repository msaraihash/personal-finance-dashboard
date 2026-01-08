/**
 * ETF Metadata Registry
 * Maps common ETFs to their characteristics for feature extraction.
 * Used by featureExtractor to compute geography, factor tilts, and expense ratios.
 */

export type Region = 'us' | 'canada' | 'developed_ex_us' | 'emerging' | 'global';

export interface ETFMetadata {
    ticker: string;
    name: string;
    region: Region;
    assetClass: 'equity' | 'bond' | 'real_asset' | 'mixed';
    tilt_value: number;      // -1 (growth) to +1 (value)
    tilt_size: number;       // -1 (large) to +1 (small)
    tilt_quality: number;    // -1 to +1
    tilt_momentum: number;   // -1 to +1
    tilt_low_vol: number;    // -1 to +1
    expense_ratio: number;   // in percentage points (e.g., 0.20 = 0.20%)
}

/**
 * Static metadata for ~50 common ETFs.
 * Covers Canadian-traded and US-traded funds.
 */
export const ETF_METADATA: Record<string, ETFMetadata> = {
    // --- Canadian All-in-One ---
    'XEQT': { ticker: 'XEQT', name: 'iShares Core Equity ETF Portfolio', region: 'global', assetClass: 'equity', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.20 },
    'VEQT': { ticker: 'VEQT', name: 'Vanguard All-Equity ETF Portfolio', region: 'global', assetClass: 'equity', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.24 },
    'VGRO': { ticker: 'VGRO', name: 'Vanguard Growth ETF Portfolio', region: 'global', assetClass: 'mixed', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.24 },
    'VBAL': { ticker: 'VBAL', name: 'Vanguard Balanced ETF Portfolio', region: 'global', assetClass: 'mixed', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.24 },
    'XGRO': { ticker: 'XGRO', name: 'iShares Core Growth ETF Portfolio', region: 'global', assetClass: 'mixed', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.20 },
    'XBAL': { ticker: 'XBAL', name: 'iShares Core Balanced ETF Portfolio', region: 'global', assetClass: 'mixed', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.20 },

    // --- Canadian Equity ---
    'XIU': { ticker: 'XIU', name: 'iShares S&P/TSX 60 Index ETF', region: 'canada', assetClass: 'equity', tilt_value: 0, tilt_size: -0.3, tilt_quality: 0.2, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.18 },
    'VCN': { ticker: 'VCN', name: 'Vanguard FTSE Canada All Cap Index ETF', region: 'canada', assetClass: 'equity', tilt_value: 0, tilt_size: 0.1, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.05 },
    'XIC': { ticker: 'XIC', name: 'iShares Core S&P/TSX Capped Composite', region: 'canada', assetClass: 'equity', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.06 },

    // --- US Equity (CAD-hedged and unhedged) ---
    'VFV': { ticker: 'VFV', name: 'Vanguard S&P 500 Index ETF', region: 'us', assetClass: 'equity', tilt_value: 0, tilt_size: -0.3, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.08 },
    'XUS': { ticker: 'XUS', name: 'iShares Core S&P 500 Index ETF', region: 'us', assetClass: 'equity', tilt_value: 0, tilt_size: -0.3, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.10 },
    'VUN': { ticker: 'VUN', name: 'Vanguard US Total Market Index ETF', region: 'us', assetClass: 'equity', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.16 },
    'XUU': { ticker: 'XUU', name: 'iShares Core S&P US Total Market', region: 'us', assetClass: 'equity', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.07 },
    'ZSP': { ticker: 'ZSP', name: 'BMO S&P 500 Index ETF', region: 'us', assetClass: 'equity', tilt_value: 0, tilt_size: -0.3, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.09 },

    // --- International Developed ---
    'XEF': { ticker: 'XEF', name: 'iShares Core MSCI EAFE IMI Index ETF', region: 'developed_ex_us', assetClass: 'equity', tilt_value: 0.1, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.22 },
    'VIU': { ticker: 'VIU', name: 'Vanguard FTSE Developed All Cap ex NA', region: 'developed_ex_us', assetClass: 'equity', tilt_value: 0, tilt_size: 0.1, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.22 },
    'ZEA': { ticker: 'ZEA', name: 'BMO MSCI EAFE Index ETF', region: 'developed_ex_us', assetClass: 'equity', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.22 },

    // --- Emerging Markets ---
    'XEC': { ticker: 'XEC', name: 'iShares Core MSCI Emerging Markets IMI', region: 'emerging', assetClass: 'equity', tilt_value: 0.1, tilt_size: 0.1, tilt_quality: -0.1, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.26 },
    'VEE': { ticker: 'VEE', name: 'Vanguard FTSE Emerging Markets All Cap', region: 'emerging', assetClass: 'equity', tilt_value: 0, tilt_size: 0.1, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.24 },
    'ZEM': { ticker: 'ZEM', name: 'BMO MSCI Emerging Markets Index ETF', region: 'emerging', assetClass: 'equity', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.28 },

    // --- US Factor ETFs ---
    'VTV': { ticker: 'VTV', name: 'Vanguard Value ETF', region: 'us', assetClass: 'equity', tilt_value: 0.6, tilt_size: -0.2, tilt_quality: 0.1, tilt_momentum: -0.2, tilt_low_vol: 0.1, expense_ratio: 0.04 },
    'VUG': { ticker: 'VUG', name: 'Vanguard Growth ETF', region: 'us', assetClass: 'equity', tilt_value: -0.6, tilt_size: -0.2, tilt_quality: 0.1, tilt_momentum: 0.2, tilt_low_vol: -0.2, expense_ratio: 0.04 },
    'VBR': { ticker: 'VBR', name: 'Vanguard Small-Cap Value ETF', region: 'us', assetClass: 'equity', tilt_value: 0.7, tilt_size: 0.7, tilt_quality: -0.1, tilt_momentum: -0.2, tilt_low_vol: 0, expense_ratio: 0.07 },
    'VBK': { ticker: 'VBK', name: 'Vanguard Small-Cap Growth ETF', region: 'us', assetClass: 'equity', tilt_value: -0.6, tilt_size: 0.7, tilt_quality: -0.1, tilt_momentum: 0.2, tilt_low_vol: -0.3, expense_ratio: 0.07 },
    'QUAL': { ticker: 'QUAL', name: 'iShares MSCI USA Quality Factor ETF', region: 'us', assetClass: 'equity', tilt_value: -0.1, tilt_size: -0.2, tilt_quality: 0.7, tilt_momentum: 0.1, tilt_low_vol: 0.2, expense_ratio: 0.15 },
    'MTUM': { ticker: 'MTUM', name: 'iShares MSCI USA Momentum Factor ETF', region: 'us', assetClass: 'equity', tilt_value: -0.2, tilt_size: -0.1, tilt_quality: 0.2, tilt_momentum: 0.8, tilt_low_vol: 0, expense_ratio: 0.15 },
    'USMV': { ticker: 'USMV', name: 'iShares MSCI USA Min Vol Factor ETF', region: 'us', assetClass: 'equity', tilt_value: 0.1, tilt_size: 0, tilt_quality: 0.3, tilt_momentum: -0.1, tilt_low_vol: 0.8, expense_ratio: 0.15 },

    // --- Dividend ETFs ---
    'VDY': { ticker: 'VDY', name: 'Vanguard FTSE Canadian High Dividend Yield', region: 'canada', assetClass: 'equity', tilt_value: 0.4, tilt_size: -0.2, tilt_quality: 0.3, tilt_momentum: -0.1, tilt_low_vol: 0.3, expense_ratio: 0.22 },
    'XEI': { ticker: 'XEI', name: 'iShares Core S&P/TSX Composite High Dividend', region: 'canada', assetClass: 'equity', tilt_value: 0.3, tilt_size: -0.1, tilt_quality: 0.2, tilt_momentum: -0.1, tilt_low_vol: 0.2, expense_ratio: 0.22 },
    'VYM': { ticker: 'VYM', name: 'Vanguard High Dividend Yield ETF', region: 'us', assetClass: 'equity', tilt_value: 0.5, tilt_size: -0.2, tilt_quality: 0.3, tilt_momentum: -0.2, tilt_low_vol: 0.3, expense_ratio: 0.06 },
    'SCHD': { ticker: 'SCHD', name: 'Schwab US Dividend Equity ETF', region: 'us', assetClass: 'equity', tilt_value: 0.4, tilt_size: -0.1, tilt_quality: 0.5, tilt_momentum: -0.1, tilt_low_vol: 0.2, expense_ratio: 0.06 },

    // --- Bond ETFs ---
    'ZAG': { ticker: 'ZAG', name: 'BMO Aggregate Bond Index ETF', region: 'canada', assetClass: 'bond', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.09 },
    'VAB': { ticker: 'VAB', name: 'Vanguard Canadian Aggregate Bond Index', region: 'canada', assetClass: 'bond', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.09 },
    'XBB': { ticker: 'XBB', name: 'iShares Core Canadian Universe Bond', region: 'canada', assetClass: 'bond', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.10 },
    'BND': { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', region: 'us', assetClass: 'bond', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.03 },
    'AGG': { ticker: 'AGG', name: 'iShares Core US Aggregate Bond ETF', region: 'us', assetClass: 'bond', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.03 },
    'TLT': { ticker: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', region: 'us', assetClass: 'bond', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.15 },

    // --- Real Assets ---
    'VNQ': { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', region: 'us', assetClass: 'real_asset', tilt_value: 0.2, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0.1, expense_ratio: 0.12 },
    'GLD': { ticker: 'GLD', name: 'SPDR Gold Shares', region: 'global', assetClass: 'real_asset', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.40 },
    'IAU': { ticker: 'IAU', name: 'iShares Gold Trust', region: 'global', assetClass: 'real_asset', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.25 },
    'DJP': { ticker: 'DJP', name: 'iPath Bloomberg Commodity Index', region: 'global', assetClass: 'real_asset', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.70 },

    // --- Thematic / Sector ---
    'TEC': { ticker: 'TEC', name: 'TD Global Technology Leaders Index ETF', region: 'global', assetClass: 'equity', tilt_value: -0.5, tilt_size: -0.3, tilt_quality: 0.2, tilt_momentum: 0.4, tilt_low_vol: -0.4, expense_ratio: 0.35 },
    'ARKK': { ticker: 'ARKK', name: 'ARK Innovation ETF', region: 'us', assetClass: 'equity', tilt_value: -0.8, tilt_size: 0.2, tilt_quality: -0.3, tilt_momentum: 0.3, tilt_low_vol: -0.7, expense_ratio: 0.75 },
    'HCLN': { ticker: 'HCLN', name: 'Horizons Nasdaq CleanTech Index', region: 'global', assetClass: 'equity', tilt_value: -0.6, tilt_size: 0.3, tilt_quality: -0.2, tilt_momentum: 0, tilt_low_vol: -0.5, expense_ratio: 0.60 },

    // --- Leveraged (flagged) ---
    'TQQQ': { ticker: 'TQQQ', name: 'ProShares UltraPro QQQ', region: 'us', assetClass: 'equity', tilt_value: -0.6, tilt_size: -0.3, tilt_quality: 0, tilt_momentum: 0.5, tilt_low_vol: -0.9, expense_ratio: 0.86 },
    'UPRO': { ticker: 'UPRO', name: 'ProShares UltraPro S&P500', region: 'us', assetClass: 'equity', tilt_value: 0, tilt_size: -0.3, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: -0.9, expense_ratio: 0.91 },

    // --- Covered Call ---
    'XYLD': { ticker: 'XYLD', name: 'Global X S&P 500 Covered Call ETF', region: 'us', assetClass: 'equity', tilt_value: 0, tilt_size: -0.2, tilt_quality: 0.1, tilt_momentum: -0.3, tilt_low_vol: 0.4, expense_ratio: 0.60 },
    'QYLD': { ticker: 'QYLD', name: 'Global X Nasdaq 100 Covered Call ETF', region: 'us', assetClass: 'equity', tilt_value: -0.4, tilt_size: -0.3, tilt_quality: 0, tilt_momentum: -0.3, tilt_low_vol: 0.3, expense_ratio: 0.60 },
    // --- US Factor / Other ---
    'AVUV': { ticker: 'AVUV', name: 'Avantis US Small Cap Value ETF', region: 'us', assetClass: 'equity', tilt_value: 0.7, tilt_size: 0.7, tilt_quality: 0.1, tilt_momentum: -0.1, tilt_low_vol: 0, expense_ratio: 0.25 },
    'AVDV': { ticker: 'AVDV', name: 'Avantis International Small Cap Value ETF', region: 'developed_ex_us', assetClass: 'equity', tilt_value: 0.7, tilt_size: 0.7, tilt_quality: 0.1, tilt_momentum: -0.1, tilt_low_vol: 0, expense_ratio: 0.36 },
    'VIG': { ticker: 'VIG', name: 'Vanguard Dividend Appreciation ETF', region: 'us', assetClass: 'equity', tilt_value: 0.2, tilt_size: -0.2, tilt_quality: 0.6, tilt_momentum: 0.1, tilt_low_vol: 0.2, expense_ratio: 0.06 },
    'VWO': { ticker: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', region: 'emerging', assetClass: 'equity', tilt_value: 0.1, tilt_size: 0, tilt_quality: -0.1, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.08 },
    'IEF': { ticker: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF', region: 'us', assetClass: 'bond', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.15 },

    // --- Covered Call / Options ---
    'JEPI': { ticker: 'JEPI', name: 'JPMorgan Equity Premium Income ETF', region: 'us', assetClass: 'equity', tilt_value: 0.3, tilt_size: -0.2, tilt_quality: 0.2, tilt_momentum: -0.2, tilt_low_vol: 0.5, expense_ratio: 0.35 },

    // --- ESG ---
    'ESGV': { ticker: 'ESGV', name: 'Vanguard ESG U.S. Stock ETF', region: 'us', assetClass: 'equity', tilt_value: 0, tilt_size: -0.1, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.09 },
    'VSGX': { ticker: 'VSGX', name: 'Vanguard ESG International Stock ETF', region: 'global', assetClass: 'equity', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.12 },

    // --- Leveraged ---
    'TMF': { ticker: 'TMF', name: 'Direxion Daily 20+ Year Treasury Bull 3X', region: 'us', assetClass: 'bond', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 1.04 },

    // --- Commodities ---
    'DBC': { ticker: 'DBC', name: 'Invesco DB Commodity Index Tracking Fund', region: 'global', assetClass: 'real_asset', tilt_value: 0, tilt_size: 0, tilt_quality: 0, tilt_momentum: 0, tilt_low_vol: 0, expense_ratio: 0.85 },
};

/**
 * Normalize ticker for lookup (remove .TO suffix, uppercase).
 */
export const normalizeTicker = (ticker: string): string => {
    return ticker.toUpperCase().replace(/\.TO$/, '').replace(/\.U$/, '');
};

/**
 * Get ETF metadata by ticker.
 */
export const getETFMetadata = (ticker: string): ETFMetadata | undefined => {
    return ETF_METADATA[normalizeTicker(ticker)];
};

/**
 * Check if a ticker is a known ETF with metadata.
 */
export const isKnownETF = (ticker: string): boolean => {
    return normalizeTicker(ticker) in ETF_METADATA;
};
