
import { useMemo } from 'react';
import type { PortfolioFeatures } from '../types/features';
import { scorePortfolio } from '../services/scoringEngine';
import type { ComplianceResult } from '../types/scoring';

/**
 * React hook that runs the Philosophy Engine against the provided features.
 * Memoized to prevent re-running on every render unless features change.
 */
export const usePhilosophyEngine = (features: PortfolioFeatures | null): ComplianceResult | null => {
    return useMemo(() => {
        if (!features) return null;
        return scorePortfolio(features);
    }, [features]);
};
