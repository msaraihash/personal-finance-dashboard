
import { useState, useMemo, useEffect } from 'react';
import type { Holding, IPSState } from '../types';
import type { FinancialGoals, FICalculationResult } from '../types/FinancialGoals';
import { computeFIStatus } from '../types/FinancialGoals';
import { extractFeatures } from '../services/featureExtractor';
import { scorePortfolio } from '../services/scoringEngine';
import type { RemixResult, RemixScenario, SliderItem } from '../types/Remix';

// Helper to get consistent colors for top tickers
const COLORS = [
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#f43f5e', // Rose
    '#f59e0b', // Amber
    '#64748b', // Slate (Rest)
];

export const useRemixEngine = (
    holdings: Holding[],
    manualAssets: IPSState['manualAssets'],
    goals: FinancialGoals,
    usdRate: number
) => {
    // 1. Calculate Base State (Original)
    const baseState = useMemo(() => {
        // Consolidated holdings
        // Note: For remix, we flatten everything to a single list of tickers + weight
        // But to keep it simple, we'll re-use the existing extractFeatures which expects raw holdings.

        const features = extractFeatures(holdings, manualAssets, usdRate);
        const philosophy = scorePortfolio(features);
        const netWorth = features.totalNetWorthCAD;
        const fiStatus = computeFIStatus(netWorth, goals);

        // Identify Top 5 Tickers by Value
        const tickerMap = new Map<string, number>();

        // Sum holdings
        holdings.forEach(h => {
            const val = h.currency === 'USD' ? h.marketValue * usdRate : h.marketValue;
            tickerMap.set(h.ticker, (tickerMap.get(h.ticker) || 0) + val);
        });
        // Sum manual assets
        manualAssets.forEach(m => {
            const val = m.currency === 'USD' ? m.value * usdRate : m.value;
            // Use name as ticker for manual assets if ticker missing? 
            // ManualAssets don't have ticker field in current type, usually name.
            // Let's assume user wants to remix "Real Estate" or "Crypto" if manually added.
            tickerMap.set(m.name, (tickerMap.get(m.name) || 0) + val);
        });

        const sorted = Array.from(tickerMap.entries()).sort((a, b) => b[1] - a[1]);
        const top5 = sorted.slice(0, 5);
        const restValue = sorted.slice(5).reduce((sum, [, val]) => sum + val, 0);

        const total = netWorth || 1; // Avoid div/0

        const initialSliders: SliderItem[] = [
            ...top5.map((entry, i) => ({
                id: entry[0],
                label: entry[0],
                value: (entry[1] / total) * 100,
                color: COLORS[i]
            })),
            { id: 'REST', label: 'Everything Else', value: (restValue / total) * 100, color: COLORS[5] }
        ];

        return {
            netWorth,
            fiStatus,
            philosophy,
            sliders: initialSliders,
            topHoldings: top5.map(t => t[0]) // Keep track of who is who
        };
    }, [holdings, manualAssets, usdRate, goals]);


    // 2. Mutable State for Remix
    const [sliders, setSliders] = useState<SliderItem[]>([]);

    // Initialize sliders when base loads
    useEffect(() => {
        if (baseState.sliders.length > 0 && sliders.length === 0) {
            setSliders(baseState.sliders);
        }
    }, [baseState.sliders]);

    // 3. Re-Calculation Engine
    const remixResult = useMemo((): RemixResult | null => {
        if (sliders.length === 0) return null;

        // A. Construct "Virtual Holdings" based on Sliders
        // Logic: 
        // - Top 5 Tickers get set EXACTLY to their slider % of Total Net Worth
        // - "Rest" category gets scaled proportionally. 
        //   If Rest slider is X%, and original rest was Y%, we scale all Rest assets by X/Y.

        const totalNetWorth = baseState.netWorth;

        // Map slider values to target amounts
        const targets = new Map<string, number>();
        let targetRestVal = 0;

        sliders.forEach(s => {
            const val = (s.value / 100) * totalNetWorth;
            if (s.id === 'REST') targetRestVal = val;
            else targets.set(s.id, val);
        });

        // Create Virtual Holdings
        // Deep copy logic is expensive, so we'll be clever.
        // We only change marketValue.

        const virtualHoldings: Holding[] = holdings.map(h => {
            // Is this holding in Top 5?
            if (targets.has(h.ticker)) {
                // Determine this holding's share of that Ticker's total original weight
                // (In case multiple accounts hold VTI)
                // This is getting complex.
                // Simpler MVP: 
                // We just need `extractFeatures` to work. 
                // `extractFeatures` sums by ticker anyway.
                // So we can just emit ONE holding per Top 5 ticker with the new value.
                // And ONE holding for "Rest" with the new value? 
                // Wait, `extractFeatures` needs Asset Class. We lose Asset Class info if we merge "Rest".

                // Better approach:
                // Calculate scaling factors.

                return h; // Placeholder, see logic below
            }
            return h;
        });

        // Let's calculate scaling factors for specific tickers
        const tickerScaleFactors = new Map<string, number>();

        // Calculate original total values again to get denominators
        const originalValues = new Map<string, number>();
        holdings.forEach(h => {
            const val = h.currency === 'USD' ? h.marketValue * usdRate : h.marketValue;
            originalValues.set(h.ticker, (originalValues.get(h.ticker) || 0) + val);
        });

        // Top 5 Scaling
        targets.forEach((targetVal, ticker) => {
            const originalVal = originalValues.get(ticker) || 0;
            if (originalVal > 0) {
                tickerScaleFactors.set(ticker, targetVal / originalVal);
            } else {
                // If it was 0, we can't scale it up from nothing easily in this model unless we inject a dummy holding.
                // For MVP remix, let's assume we can only remix existing non-zero assets or we'd need to know asset class.
                tickerScaleFactors.set(ticker, 0);
            }
        });

        // Rest Scaling
        // Calculate original Rest value
        let originalRestTotal = 0;
        holdings.forEach(h => {
            if (!targets.has(h.ticker)) {
                const val = h.currency === 'USD' ? h.marketValue * usdRate : h.marketValue;
                originalRestTotal += val;
            }
        });

        const restScaleFactor = originalRestTotal > 0 ? targetRestVal / originalRestTotal : 0;

        // Apply Scaling
        const remixedHoldings = holdings.map(h => {
            let factor = 1;
            if (targets.has(h.ticker)) {
                factor = tickerScaleFactors.get(h.ticker) || 1;
            } else {
                factor = restScaleFactor;
            }

            return {
                ...h,
                marketValue: h.marketValue * factor,
                valueCAD: (h.valueCAD || 0) * factor // Update cached CAD too if present
            };
        });

        // Handle Manual Assets similarly
        const remixedManual = manualAssets.map(m => {
            // Check if name is in targets
            let factor = 1;
            if (targets.has(m.name)) {
                // Re-calculate original for manual to be safe? 
                // Simplification: just use same logic
                // Note: Manual assets might share name with ticker? Unlikely but possible.
                // We used "Ticker" map earlier.
                factor = tickerScaleFactors.get(m.name) || 1;
            } else {
                factor = restScaleFactor;
            }
            return {
                ...m,
                value: m.value * factor
            };
        });


        // B. Re-Score
        const features = extractFeatures(remixedHoldings, remixedManual, usdRate); // Recalc features
        const philosophy = scorePortfolio(features);
        // Note: New Net Worth might drift slightly due to rounding, but should be close to original if sliders sum to 100%
        // Actually, if we just scale, the total NW changes to match the sum of sliders.
        // In our UI, we will enforce sliders sum to 100, effectively keeping NW constant.

        const fiStatus = computeFIStatus(features.totalNetWorthCAD, goals);

        return {
            original: {
                netWorth: baseState.netWorth,
                fiStatus: baseState.fiStatus,
                philosophy: baseState.philosophy,
                allocations: {} // TODO if needed
            },
            remixed: {
                netWorth: features.totalNetWorthCAD,
                fiStatus,
                philosophy,
                allocations: {}
            },
            delta: {
                yearsToFI: fiStatus.yearsToFI - baseState.fiStatus.yearsToFI,
                philosophyMatchChange: 0 // TODO: Calculate score diff of top philosophy
            },
            holdings: remixedHoldings
        };

    }, [sliders, baseState, holdings, manualAssets, usdRate, goals]);

    const handleSliderChange = (id: string, newValue: number) => {
        // Normalization Logic
        // When one slider moves, others must adjust to keep sum = 100
        setSliders(prev => {
            const others = prev.filter(s => s.id !== id);
            // const oldValue = prev.find(s => s.id === id)?.value || 0;
            // const delta = newValue - oldValue;

            // Distribute delta negatively across others proportional to their weight?
            // Or simple subtraction from "Rest"?
            // Proportional is smoothest.

            const remainingSpace = 100 - newValue;
            const sumOthers = others.reduce((sum, s) => sum + s.value, 0);

            const newOthers = others.map(s => ({
                ...s,
                value: sumOthers > 0 ? s.value * (remainingSpace / sumOthers) : 0
            }));

            // Re-assemble in original order
            const next = prev.map(s => {
                if (s.id === id) return { ...s, value: newValue };
                return newOthers.find(o => o.id === s.id)!;
            });

            return next;
        });
    };

    return {
        baseState,
        remixResult,
        sliders,
        setSlider: handleSliderChange
    };
};
