/**
 * Motif Registry - Maps YAML motif types to React components.
 * Used by PhilosophyCard to dynamically render the correct motif.
 */

import type { ComponentType } from 'react';
import type { PortfolioFeatures } from '../../types/features';
import type { Holding } from '../../types';

import { AllocationDonut } from './AllocationDonut';
import { BarbellVisual } from './BarbellVisual';
import { FactorRadar } from './FactorRadar';
import { ConcentrationStack } from './ConcentrationStack';

// Re-export components for direct imports
export { AllocationDonut } from './AllocationDonut';
export { BarbellVisual } from './BarbellVisual';
export { FactorRadar } from './FactorRadar';
export { ConcentrationStack } from './ConcentrationStack';
export { RunwayMeter } from './RunwayMeter';

/**
 * Props that all motif components can receive.
 * Individual components may only use a subset.
 */
export interface MotifProps {
    features: PortfolioFeatures;
    holdings?: Holding[];
}

/**
 * Registry mapping YAML motif type strings to components.
 * Tier 1 motifs are implemented; Tier 2 return placeholders.
 */
export const MOTIF_REGISTRY: Record<string, ComponentType<MotifProps>> = {
    // Tier 1 - Implemented
    'allocation_donut': AllocationDonut as ComponentType<MotifProps>,
    'barbell_visual': BarbellVisual as ComponentType<MotifProps>,
    'factor_radar': FactorRadar as ComponentType<MotifProps>,
    'concentration_stack': ConcentrationStack as ComponentType<MotifProps>,
    // Note: 'runway_meter' requires special handling (needs netWorthCAD, financialGoals)
    // It's rendered directly in PhilosophyCard for time_to_financial_freedom philosophy
};

/**
 * Get the primary motif for a philosophy from its visual_motifs array.
 */
export const getPrimaryMotifType = (visualMotifs?: Array<{ type: string; caption: string }>): string | null => {
    if (!visualMotifs || visualMotifs.length === 0) return null;
    return visualMotifs[0].type;
};

/**
 * Check if a motif type is implemented.
 */
export const isMotifImplemented = (type: string): boolean => {
    return type in MOTIF_REGISTRY;
};
