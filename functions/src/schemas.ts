import { z } from 'zod';

/**
 * Zod schemas for request/response validation
 */

// Request schema
export const CoachRequestSchema = z.object({
    context: z.object({
        holdings: z.array(z.object({
            ticker: z.string(),
            weight: z.number(),
        })),
        netWorthCAD: z.number(),
        yearsToFI: z.number(),
        topPhilosophies: z.array(z.object({
            id: z.string(),
            score: z.number(),
            displayName: z.string(),
        })),
        targetPhilosophyId: z.string(),
        goals: z.object({
            currentAge: z.number(),
            retirementAge: z.number(),
            savingsRate: z.number(),
        }),
    }),
});

export type CoachRequest = z.infer<typeof CoachRequestSchema>;

// Response schema (what Gemini should return)
export const CoachResponseSchema = z.object({
    alignment: z.object({
        score: z.number().min(0).max(100),
        summary: z.string(),
        strengths: z.array(z.string()),
        gaps: z.array(z.string()),
    }),
    actionPlan: z.array(z.object({
        step: z.string(),
        rationale: z.string(),
        impact: z.enum(['high', 'medium', 'low']),
    })),
    philosophyInsight: z.string(),
    disclaimer: z.string(),
});

export type CoachResponse = z.infer<typeof CoachResponseSchema>;

/**
 * Default disclaimer to inject if Gemini forgets
 */
export const DEFAULT_DISCLAIMER =
    "This is AI-generated educational content, not personalized financial advice. " +
    "Consult a qualified advisor before making investment decisions.";
