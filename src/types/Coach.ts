/**
 * Coach Types
 * 
 * Shared types for the Philosophy Coaching feature.
 * These mirror the schemas in functions/src/schemas.ts
 */

export interface CoachRequest {
    context: {
        holdings: { ticker: string; weight: number }[];
        netWorthCAD: number;
        yearsToFI: number;
        topPhilosophies: { id: string; score: number; displayName: string }[];
        targetPhilosophyId: string;
        goals: {
            currentAge: number;
            retirementAge: number;
            savingsRate: number;
        };
    };
}

export interface CoachResponse {
    alignment: {
        score: number;
        summary: string;
        strengths: string[];
        gaps: string[];
    };
    actionPlan: {
        step: string;
        rationale: string;
        impact: 'high' | 'medium' | 'low';
    }[];
    philosophyInsight: string;
    disclaimer: string;
}
