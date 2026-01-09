/**
 * usePhilosophyCoach Hook
 * 
 * Manages AI coaching state and Firebase function calls.
 * Supports streaming display via progressive state updates.
 */

import { useState, useCallback, useRef } from 'react';
import type { CoachResponse, CoachRequest } from '../types/Coach';
import { callCoachPhilosophy } from '../services/firebase';
import type { Holding, IPSState } from '../types';
import type { FinancialGoals } from '../types/FinancialGoals';
import type { PhilosophyMatch } from '../types/scoring';

interface UsePhilosophyCoachOptions {
    holdings: Holding[];
    manualAssets: IPSState['manualAssets'];
    goals: FinancialGoals;
    usdRate: number;
    netWorthCAD: number;
    yearsToFI: number;
    topPhilosophies: PhilosophyMatch[];
}

interface UsePhilosophyCoachReturn {
    analyze: (targetPhilosophyId: string) => Promise<void>;
    response: CoachResponse | null;
    isLoading: boolean;
    error: string | null;
    reset: () => void;
    currentPhilosophyId: string | null;
}

// Simple hash for cache key
function hashHoldings(holdings: Holding[]): string {
    return holdings
        .slice(0, 10)
        .map(h => `${h.ticker}:${h.marketValue.toFixed(0)}`)
        .join('|');
}

export function usePhilosophyCoach(options: UsePhilosophyCoachOptions): UsePhilosophyCoachReturn {
    const { holdings, manualAssets, goals, usdRate, netWorthCAD, yearsToFI, topPhilosophies } = options;

    const [response, setResponse] = useState<CoachResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPhilosophyId, setCurrentPhilosophyId] = useState<string | null>(null);

    // Cache to avoid duplicate calls
    const cacheRef = useRef<Map<string, CoachResponse>>(new Map());

    const analyze = useCallback(async (targetPhilosophyId: string) => {
        // Build cache key
        const holdingsHash = hashHoldings(holdings);
        const cacheKey = `${targetPhilosophyId}:${holdingsHash}`;

        // Check cache
        const cached = cacheRef.current.get(cacheKey);
        if (cached) {
            setResponse(cached);
            setCurrentPhilosophyId(targetPhilosophyId);
            return;
        }

        setIsLoading(true);
        setError(null);
        setCurrentPhilosophyId(targetPhilosophyId);

        try {
            // Build holdings with weights
            const totalValue = holdings.reduce((sum, h) => {
                const val = h.currency === 'USD' ? h.marketValue * usdRate : h.marketValue;
                return sum + val;
            }, 0);

            const holdingsWithWeight = holdings
                .map(h => {
                    const val = h.currency === 'USD' ? h.marketValue * usdRate : h.marketValue;
                    return { ticker: h.ticker, weight: totalValue > 0 ? val / totalValue : 0 };
                })
                .filter(h => h.weight > 0.01) // Only include > 1%
                .sort((a, b) => b.weight - a.weight)
                .slice(0, 15);

            const request: CoachRequest = {
                context: {
                    holdings: holdingsWithWeight,
                    netWorthCAD,
                    yearsToFI,
                    topPhilosophies: topPhilosophies.map(p => ({
                        id: p.id,
                        score: p.score,
                        displayName: p.displayName,
                    })),
                    targetPhilosophyId,
                    goals: {
                        currentAge: goals.currentAge,
                        retirementAge: goals.targetRetirementAge,
                        savingsRate: goals.savingsRate,
                    },
                },
            };

            const result = await callCoachPhilosophy(request);

            // Cache result
            cacheRef.current.set(cacheKey, result);
            setResponse(result);

        } catch (err) {
            console.error('Coach analysis failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to analyze portfolio');
        } finally {
            setIsLoading(false);
        }
    }, [holdings, manualAssets, goals, usdRate, netWorthCAD, yearsToFI, topPhilosophies]);

    const reset = useCallback(() => {
        setResponse(null);
        setError(null);
        setCurrentPhilosophyId(null);
    }, []);

    return {
        analyze,
        response,
        isLoading,
        error,
        reset,
        currentPhilosophyId,
    };
}
