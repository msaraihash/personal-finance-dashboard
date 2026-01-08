import { useMemo } from 'react';
import type { Holding, IPSState } from '../types';
import { TECH_TICKERS } from '../types';
import type { Metrics } from '../types';
import { calculateRebalance } from '../services/tacticalEngine';

export const useIPSEngine = (holdings: Holding[], ipsState: IPSState, usdToCadRate: number = 1.40): Metrics => {
    const metrics = useMemo(() => {
        let totalNetWorthCAD = 0;
        let liquidityCAD = 0;
        let liquidityUSD_CAD = 0;
        let techBasketValueCAD = 0;
        let speculativeValueCAD = 0;

        const individualTechValues: Record<string, number> = {};

        holdings.forEach(h => {
            const valueInCAD = h.currency === 'USD' ? h.marketValue * usdToCadRate : h.marketValue;
            totalNetWorthCAD += valueInCAD;

            if (h.assetClass === 'Cash') {
                if (h.currency === 'CAD') liquidityCAD += h.marketValue;
                else liquidityUSD_CAD += valueInCAD;
            }

            const baseTicker = h.ticker.split('.')[0];
            if (TECH_TICKERS.includes(baseTicker)) {
                techBasketValueCAD += valueInCAD;
                individualTechValues[baseTicker] = (individualTechValues[baseTicker] || 0) + valueInCAD;
            }

            if (h.assetClass === 'Speculative') {
                speculativeValueCAD += valueInCAD;
            }
        });

        // Add Manual Assets & Liabilities
        totalNetWorthCAD += ipsState.manualAssets.propertyValueCAD;
        totalNetWorthCAD -= ipsState.manualAssets.mortgageBalanceCAD;
        totalNetWorthCAD += ipsState.manualAssets.spouseMutualFundCAD;

        // Add Chequing & High Yield
        const wsChequingCAD = ipsState.manualAssets.wsChequingCAD;
        const rbcUsChequingCAD = ipsState.manualAssets.rbcUsChequingUSD * usdToCadRate;
        const usdHysaCAD = ipsState.manualAssets.usdHysaAmount * usdToCadRate;

        totalNetWorthCAD += wsChequingCAD + rbcUsChequingCAD + usdHysaCAD;

        // Update Liquidity
        liquidityCAD += wsChequingCAD;
        liquidityUSD_CAD += rbcUsChequingCAD + usdHysaCAD;

        const totalLiquidityCAD = liquidityCAD + liquidityUSD_CAD;

        // Consolidate holdings by ticker
        type HoldingAccumulator = Holding & { valueCAD: number; sources: Set<string>; accounts: Set<string> };
        const consolidatedMap: Record<string, HoldingAccumulator> = {};
        holdings.forEach(h => {
            const ticker = h.ticker.split('.')[0];
            const valueCAD = h.currency === 'USD' ? h.marketValue * usdToCadRate : h.marketValue;

            if (!consolidatedMap[ticker]) {
                consolidatedMap[ticker] = {
                    ...h,
                    ticker,
                    marketValue: 0,
                    valueCAD: 0,
                    sources: new Set<string>(),
                    accounts: new Set<string>()
                };
            }
            consolidatedMap[ticker].marketValue += h.marketValue;
            consolidatedMap[ticker].valueCAD += valueCAD;
            consolidatedMap[ticker].sources.add(h.source);
            consolidatedMap[ticker].accounts.add(h.accountName);
        });

        const consolidatedHoldings = Object.entries(consolidatedMap).map(([ticker, data]) => ({
            ...data,
            ticker,
            sources: Array.from(data.sources).join(', '),
            accounts: Array.from(data.accounts).join(', ')
        }));

        const liquidityCompliance = totalLiquidityCAD >= ipsState.liquidityFloorCAD;
        const basketTechCompliance = (techBasketValueCAD / totalNetWorthCAD) <= ipsState.techConcentrationBasketLimit;

        const singleTechCompliance = Object.values(individualTechValues).every(
            val => (val / totalNetWorthCAD) <= ipsState.techConcentrationSingleLimit
        );

        const speculativeCompliance = (speculativeValueCAD / totalNetWorthCAD) <= ipsState.speculativeLimit;

        const baseMetrics = {
            totalNetWorthCAD,
            totalLiquidityCAD,
            liquidityCAD,
            liquidityUSD_CAD,
            techBasketValueCAD,
            speculativeValueCAD,
            individualTechValues,
            consolidatedHoldings,
            compliance: {
                liquidity: liquidityCompliance,
                basketTech: basketTechCompliance,
                singleTech: singleTechCompliance,
                speculative: speculativeCompliance
            },
            ratios: {
                liquidity: totalLiquidityCAD / totalNetWorthCAD,
                tech: techBasketValueCAD / totalNetWorthCAD,
                speculative: speculativeValueCAD / totalNetWorthCAD
            }
        };

        return {
            ...baseMetrics,
            rebalanceInstructions: calculateRebalance(baseMetrics, ipsState)
        };
    }, [holdings, ipsState, usdToCadRate]);

    return metrics;
};
