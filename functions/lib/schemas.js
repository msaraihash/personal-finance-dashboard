"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DISCLAIMER = exports.CoachResponseSchema = exports.CoachRequestSchema = void 0;
const zod_1 = require("zod");
/**
 * Zod schemas for request/response validation
 */
// Request schema
exports.CoachRequestSchema = zod_1.z.object({
    context: zod_1.z.object({
        holdings: zod_1.z.array(zod_1.z.object({
            ticker: zod_1.z.string(),
            weight: zod_1.z.number(),
        })),
        netWorthCAD: zod_1.z.number(),
        yearsToFI: zod_1.z.number(),
        topPhilosophies: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            score: zod_1.z.number(),
            displayName: zod_1.z.string(),
        })),
        targetPhilosophyId: zod_1.z.string(),
        goals: zod_1.z.object({
            currentAge: zod_1.z.number(),
            retirementAge: zod_1.z.number(),
            savingsRate: zod_1.z.number(),
        }),
    }),
});
// Response schema (what Gemini should return)
exports.CoachResponseSchema = zod_1.z.object({
    alignment: zod_1.z.object({
        score: zod_1.z.number().min(0).max(100),
        summary: zod_1.z.string(),
        strengths: zod_1.z.array(zod_1.z.string()),
        gaps: zod_1.z.array(zod_1.z.string()),
    }),
    actionPlan: zod_1.z.array(zod_1.z.object({
        step: zod_1.z.string(),
        rationale: zod_1.z.string(),
        impact: zod_1.z.enum(['high', 'medium', 'low']),
    })),
    philosophyInsight: zod_1.z.string(),
    disclaimer: zod_1.z.string(),
});
/**
 * Default disclaimer to inject if Gemini forgets
 */
exports.DEFAULT_DISCLAIMER = "This is AI-generated educational content, not personalized financial advice. " +
    "Consult a qualified advisor before making investment decisions.";
//# sourceMappingURL=schemas.js.map