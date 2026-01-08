export type Currency = 'CAD' | 'USD';

export const TECH_TICKERS = ['NVDA', 'GOOG', 'META', 'GOOGL'];

export type AssetClass =
    | 'Equity'
    | 'Cash'
    | 'Property'
    | 'Speculative'
    | 'MutualFund'
    | 'FixedIncome';

export type Holding = {
    id: string; // Composite key: Source + Account + Ticker
    ticker: string;
    name: string;
    assetClass: 'Equity' | 'FixedIncome' | 'Cash' | 'Property' | 'Crypto' | 'Speculative' | 'MutualFund' | 'Other';
    marketValue: number; // Native currency
    currency: 'CAD' | 'USD';
    accountType: string;
    source: string;
    accountName: string;
    accountNumber?: string;
    quantity?: number;
    price?: number;
    valueCAD?: number; // Calculated field
};

export type ConsolidatedHolding = Holding & {
    valueCAD: number;
    sources: string;
    accounts: string;
};

export interface RebalanceInstruction {
    ticker: string;
    action: 'BUY' | 'SELL';
    amount: number;
    targetAlloc: number;
    reason: string;
}

export interface Metrics {
    totalNetWorthCAD: number;
    totalLiquidityCAD: number;
    liquidityCAD: number;
    liquidityUSD_CAD: number;
    techBasketValueCAD: number;
    speculativeValueCAD: number;
    individualTechValues: Record<string, number>;
    consolidatedHoldings: ConsolidatedHolding[];
    compliance: {
        liquidity: boolean;
        basketTech: boolean;
        singleTech: boolean;
        speculative: boolean;
    };
    ratios: {
        liquidity: number;
        tech: number;
        speculative: number;
    };
    rebalanceInstructions?: RebalanceInstruction[];
}

export type IPSState = {
    liquidityFloorCAD: number;
    targetCADLiquidity: number;
    targetUSDLiquidityCAD: number;
    techConcentrationBasketLimit: number; // e.g., 0.10 for 10%
    techConcentrationSingleLimit: number; // e.g., 0.05 for 5%
    speculativeLimit: number; // e.g., 0.02 for 2%
    manualAssets: {
        propertyValueCAD: number;
        mortgageBalanceCAD: number;
        wsChequingCAD: number;
        rbcUsChequingUSD: number;
        spouseMutualFundCAD: number;
        usdHysaAmount: number; // In USD
    };
}

export interface Snapshot {
    id: string;
    timestamp: string;
    totalNetWorthCAD: number;
    holdings: Holding[];
    exchangeRate: number; // USD to CAD
}
