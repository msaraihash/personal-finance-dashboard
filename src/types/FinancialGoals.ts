/**
 * Financial Goals - User-provided data for "Time to Financial Freedom" calculations.
 * Collected during onboarding (optional step) or via settings.
 */

export interface FinancialGoals {
    /** Annual expenses in CAD (for FI number calculation: 25x) */
    annualExpensesCAD: number;
    /** Savings rate as decimal (0-1), e.g., 0.35 = 35% */
    savingsRate: number;
    /** Target financial independence number (computed or overridden) */
    fiTargetCAD?: number;
}

export const DEFAULT_FINANCIAL_GOALS: FinancialGoals = {
    annualExpensesCAD: 60000,  // Conservative default
    savingsRate: 0.20,         // 20% default
};

/**
 * Calculate FI target (25x annual expenses) if not explicitly set.
 */
export const computeFITarget = (goals: FinancialGoals): number => {
    return goals.fiTargetCAD ?? goals.annualExpensesCAD * 25;
};

/**
 * Calculate years to FI based on net worth, savings rate, and FI target.
 * Uses simplified formula: years = (FI_target - net_worth) / annual_savings
 */
export const computeYearsToFI = (
    netWorthCAD: number,
    goals: FinancialGoals
): number => {
    const fiTarget = computeFITarget(goals);
    if (netWorthCAD >= fiTarget) return 0; // Already FI!

    // Annual savings = income * savings rate
    // Approximate income from expenses: income ≈ expenses / (1 - savings_rate)
    const estimatedIncome = goals.annualExpensesCAD / (1 - goals.savingsRate);
    const annualSavings = estimatedIncome * goals.savingsRate;

    if (annualSavings <= 0) return Infinity;

    // Simple linear projection (ignoring compound growth for conservatism)
    const yearsToFI = (fiTarget - netWorthCAD) / annualSavings;
    return Math.max(0, yearsToFI);
};
