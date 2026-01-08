import type { Holding } from '../types';
import type { ComplianceResult } from '../types/scoring';
import type { FICalculationResult } from '../types/FinancialGoals';

// A "Remix" is a delta on the current portfolio
export interface RemixScenario {
    id: string;
    name: string;
    description?: string;
    // Map of Ticker -> New Weight (0-1) OR Multiplier
    // For MVP, let's use explicit target allocation for Top 5 + Rest
    // If a ticker is in this map, use the value. 
    // If 'REST' is in this map, scale all other assets to fit the remaining bucket.
    allocations: Record<string, number>;
}

// Result of the Remix Engine
export interface RemixResult {
    original: {
        netWorth: number;
        fiStatus: FICalculationResult;
        philosophy: ComplianceResult;
        allocations: Record<string, number>; // Normalized 0-1
    };
    remixed: {
        netWorth: number; // Will equal original in MVP (re-allocation only)
        fiStatus: FICalculationResult;
        philosophy: ComplianceResult;
        allocations: Record<string, number>;
    };
    delta: {
        yearsToFI: number; // Remixed - Original (Negative is good)
        philosophyMatchChange: number; // Points change for top philosophy
    };
    holdings: Holding[]; // The virtual holdings list after remix
}

export type SliderItem = {
    id: string; // Ticker or 'REST'
    label: string;
    value: number; // 0-100
    color: string;
};
