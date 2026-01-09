import { describe, it, expect } from 'vitest';
import { computeFIStatus, type FinancialGoals } from '../types/FinancialGoals';

// Base test configuration
const BASE_GOALS: FinancialGoals = {
    version: 2,
    currentAge: 30,
    targetRetirementAge: 60,
    grossIncomeAnnual: 100000,
    taxRate: 0.30,
    savingsRate: 0.20,
    realReturn: 0.04,
    safeWithdrawalRate: 0.04,
};

describe('Financial Independence Calculator (Math V2)', () => {

    it('should return 0 years if already FI (FV <= PV)', () => {
        // Target = Expenses / SWR
        // Net Income = 100k * 0.7 = 70k. Savings = 14k. Expenses = 56k.
        // Target = 56000 / 0.04 = 1.4M
        const res = computeFIStatus(1500000, BASE_GOALS);
        expect(res.isFI).toBe(true);
        expect(res.yearsToFI).toBe(0);
    });

    it('should handle linear growth when real return is 0', () => {
        const goals = { ...BASE_GOALS, realReturn: 0 };
        // Net Income = 70k. Savings = 14k. Expenses = 56k.
        // Target = 1.4M.
        // PV = 0.
        // Years = 1.4M / 14k = 100 years.
        const res = computeFIStatus(0, goals);
        expect(res.yearsToFI).toBeCloseTo(100, 1);
    });

    it('should return Infinity if annual savings <= 0 and no existing assets', () => {
        const goals = { ...BASE_GOALS, savingsRate: 0 };
        const res = computeFIStatus(0, goals);
        expect(res.yearsToFI).toBe(Infinity);
    });

    it('should return strict closed-form result for standard case', () => {
        // Net Income = 70k. Savings = 14k (20% of net). Expenses = 56k.
        // Target = 1.4M. PV = 100k. r = 0.04.
        const res = computeFIStatus(100000, BASE_GOALS);

        // Manual Check:
        // PMT = 14000
        // FV = 1400000
        // PV = 100000
        // r = 0.04
        // A = (1.4M + 14k/0.04) / (100k + 14k/0.04)
        // A = (1.4M + 350k) / (100k + 350k) = 1.75M / 450k = 3.888...
        // t = ln(3.888) / ln(1.04) = 1.358 / 0.0392 = ~34.6 years

        expect(res.yearsToFI).toBeGreaterThan(34);
        expect(res.yearsToFI).toBeLessThan(35);
        expect(res.isFI).toBe(false);
    });

    it('should handle negative real returns gracefully (iterative fallback scenario)', () => {
        // Even with negative returns, if savings are high enough, we can arrive.
        // But closed form formula works for negative r too, provided denominator > 0.
        const goals = { ...BASE_GOALS, realReturn: -0.02 };
        // Target = 1.4M. PV = 0. PMT = 14k. Decay = 2%.
        // It's really hard to reach target with 2% drag unless PMT is huge.
        // Let's check a case where it IS possible.
        // Target = 100k. PMT = 20k. r = -0.02.
        // Year 1 end: 20k
        // Year 5 end: ~94k
        // Year 6 end: ~112k -> Done.

        // Let's modify target via custom goals to test small numbers
        const customGoals = { ...goals, safeWithdrawalRate: 1.0 }; // Target = Expenses (56k)
        // PMT = 14k. Target = 56k. r = -0.02.
        // Y1: 14k
        // Y2: 14k*0.98 + 14k = 13.72 + 14 = 27.72
        // Y3: 27.72*0.98 + 14 = 27.16 + 14 = 41.16
        // Y4: 41.16*0.98 + 14 = 40.33 + 14 = 54.33
        // Y5: 54.33*0.98 + 14 = 53.24 + 14 = 67.24 -> Done in year 5.

        const res = computeFIStatus(0, customGoals);
        expect(res.yearsToFI).toBeGreaterThan(4);
        expect(res.yearsToFI).toBeLessThan(5);
    });
});
