
export interface FinancialGoalsV1 {
    annualExpensesCAD: number;
    savingsRate: number;
    fiTargetCAD?: number;
}




export interface FinancialGoals {
    version: 2;
    currentAge: number;
    targetRetirementAge: number;
    grossIncomeAnnual: number;
    taxRate: number; // 0.0 - 1.0
    savingsRate: number; // 0.0 - 1.0. ALWAYS applies to Net Income (Post-Tax).
    realReturn: number; // 0.0 - 1.0 (after inflation/fees)
    safeWithdrawalRate: number; // 0.0 - 1.0
}

export const DEFAULT_FINANCIAL_GOALS: FinancialGoals = {
    version: 2,
    currentAge: 35,
    targetRetirementAge: 60,
    grossIncomeAnnual: 100000,
    taxRate: 0.30,
    savingsRate: 0.20,
    realReturn: 0.04, // 4% real return
    safeWithdrawalRate: 0.04, // 4% rule
};

export interface FICalculationResult {
    netIncome: number;
    annualSavings: number;
    annualExpenses: number;
    fiTarget: number;
    yearsToFI: number; // Infinity if never
    ageAtFI: number; // Infinity if never
    isFI: boolean;
}

/**
 * Robust Financial Independence Calculator
 * Derived from user-specified optimized plan.
 */
export const computeFIStatus = (
    netWorthCAD: number,
    goals: FinancialGoals
): FICalculationResult => {
    const {
        grossIncomeAnnual,
        taxRate,
        savingsRate,
        safeWithdrawalRate,
        realReturn,
        currentAge
    } = goals;

    // 1. Derive cash flows
    const netIncome = grossIncomeAnnual * (1 - taxRate);

    // ENFORCED: Savings Rate always applies to Net Income.
    // "100% savings rate cannot equal gross income."
    const annualSavings = netIncome * savingsRate;

    // Derived expenses: Net Income - Savings
    const annualExpenses = netIncome - annualSavings;

    // 2. FI Target
    // Edge case: SWR <= 0 -> infinite target
    const fiTarget = (safeWithdrawalRate > 0 && annualExpenses > 0)
        ? annualExpenses / safeWithdrawalRate
        : 0; // If expenses <= 0, target is 0 (already FI)

    const isFI = netWorthCAD >= fiTarget;
    if (isFI) {
        return {
            netIncome,
            annualSavings,
            annualExpenses,
            fiTarget,
            yearsToFI: 0,
            ageAtFI: currentAge,
            isFI: true
        };
    }

    // 3. Compound Math (Closed Form)
    // PV = netWorthCAD
    // PMT = annualSavings
    // r = realReturn
    // FV = fiTarget

    let years = Infinity;

    if (annualSavings <= 0) {
        // Can't save our way there. Only growth can help (if PV > 0)
        // If PV < FV and r > 0, we can calculate growth only
        if (netWorthCAD > 0 && realReturn > 0) {
            // FV = PV * (1+r)^t => t = ln(FV/PV) / ln(1+r)
            years = Math.log(fiTarget / netWorthCAD) / Math.log(1 + realReturn);
        } else {
            years = Infinity;
        }
    } else if (Math.abs(realReturn) < 1e-6) {
        // Linear case: r approx 0
        years = (fiTarget - netWorthCAD) / annualSavings;
    } else {
        // Standard Annuity Formula with PV
        // FV = PV*(1+r)^t + PMT * ((1+r)^t - 1)/r
        // Solve for t:
        // FV + PMT/r = (1+r)^t * (PV + PMT/r)
        // A = (FV + PMT/r) / (PV + PMT/r)
        // t = ln(A) / ln(1+r)

        const term = annualSavings / realReturn;
        const numerator = fiTarget + term;
        const denominator = netWorthCAD + term;

        if (Math.abs(denominator) < 1e-9) {
            // Singularity: PV + PMT/r = 0
            years = Infinity;
        } else {
            const A = numerator / denominator;
            if (A <= 0) {
                // Log domain error calculation: Target unreachable with given parameters
                years = Infinity;
            } else {
                years = Math.log(A) / Math.log(1 + realReturn);
            }
        }
    }

    // Sanity clamp
    years = Math.max(0, years);

    return {
        netIncome,
        annualSavings,
        annualExpenses,
        fiTarget,
        yearsToFI: years,
        ageAtFI: years === Infinity ? Infinity : currentAge + years,
        isFI: false
    };
};
