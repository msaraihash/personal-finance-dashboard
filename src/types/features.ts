export type RebalanceFrequency = 'none' | 'ad_hoc' | 'monthly' | 'quarterly' | 'annual' | 'threshold';
export type TaxSensitivity = 'low' | 'medium' | 'high';
export type FeeSensitivity = 'low' | 'medium' | 'high';
export type OptionsOverlayType = 'none' | 'covered_call' | 'protective_put' | 'collar' | 'other';

export interface PortfolioFeatures {
    // Composition (0..1)
    pct_equity: number;
    pct_bonds: number;
    pct_cash: number;
    pct_real_assets: number;
    pct_alternatives: number;
    pct_crypto: number;
    pct_single_stocks: number;
    pct_index_funds: number;
    pct_active_funds: number;
    pct_sector_thematic: number;

    // Concentration & diversification
    top_1_position_pct: number;
    top_5_positions_pct: number;
    n_positions: number;
    herfindahl_index: number;

    // Geography (0..1)
    pct_us_equity: number;
    pct_ex_us_dev_equity: number;
    pct_em_equity: number;
    home_bias_score: number;

    // Style / factors (approximate; can be inferred from holdings)
    tilt_value: number; // Negative=growthy, Positive=valuey; normalized -1..+1
    tilt_size: number; // Negative=large-cap, Positive=small-cap; normalized -1..+1
    tilt_quality: number; // Normalized -1..+1
    tilt_momentum: number; // Normalized -1..+1
    tilt_low_vol: number; // Normalized -1..+1

    // Risk & implementation
    est_equity_beta: number;
    est_duration: number;
    leverage_ratio: number;
    uses_leveraged_etfs: boolean;
    uses_options_overlay: boolean;
    options_overlay_type: OptionsOverlayType;
    rebalance_frequency: RebalanceFrequency;
    tax_sensitivity: TaxSensitivity;
    fee_sensitivity: FeeSensitivity;
    avg_expense_ratio: number;
    totalNetWorthCAD: number;
}
