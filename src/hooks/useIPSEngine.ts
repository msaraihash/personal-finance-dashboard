import { useMemo } from 'react';
import type { Holding, IPSState, Metrics } from '../types';
import { calculateRebalance } from '../services/tacticalEngine';

export const useIPSEngine = (holdings: Holding[], ipsState: IPSState, usdToCadRate: number = 1.40): Metrics => {
    const metrics = useMemo(() => {
        let totalNetWorthCAD = 0;
        let liquidityCAD = 0;
        let liquidityUSD_CAD = 0;
        let speculativeValueCAD = 0;

        holdings.forEach(h => {
            const valueInCAD = h.currency === 'USD' ? h.marketValue * usdToCadRate : h.marketValue;
            totalNetWorthCAD += valueInCAD;

            if (h.assetClass === 'Cash') {
                if (h.currency === 'CAD') liquidityCAD += h.marketValue;
                else liquidityUSD_CAD += valueInCAD;
            }



            if (h.assetClass === 'Speculative') {
                speculativeValueCAD += valueInCAD;
            }
        });

        // Add Manual Assets
        ipsState.manualAssets.forEach(asset => {
            const valueCAD = asset.currency === 'USD' ? asset.value * usdToCadRate : asset.value;
            totalNetWorthCAD += valueCAD;

            if (asset.assetClass === 'Cash') {
                if (asset.currency === 'CAD') liquidityCAD += asset.value;
                else liquidityUSD_CAD += valueCAD;
            } else if (asset.assetClass === 'Speculative') {
                speculativeValueCAD += valueCAD;
            }
        });

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


        const speculativeCompliance = (speculativeValueCAD / totalNetWorthCAD) <= ipsState.speculativeLimit;

        const baseMetrics = {
            totalNetWorthCAD,
            totalLiquidityCAD,
            liquidityCAD,
            liquidityUSD_CAD,
            techBasketValueCAD: 0, // Not computed in stripped-down version
            speculativeValueCAD,
            individualTechValues: {},
            consolidatedHoldings,
            compliance: {
                liquidity: liquidityCompliance,
                basketTech: true,
                singleTech: true,
                speculative: speculativeCompliance
            },
            ratios: {
                liquidity: totalLiquidityCAD / totalNetWorthCAD,
                tech: 0,
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
