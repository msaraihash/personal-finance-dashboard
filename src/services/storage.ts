import type { Holding, IPSState, Snapshot } from '../types';

const KEYS = {
    HOLDINGS: 'pfd_holdings',
    IPS_STATE: 'pfd_ips_state',
    HISTORY: 'pfd_history',
};

export const DEFAULT_IPS_STATE: IPSState = {
    liquidityFloorCAD: 200000,
    targetCADLiquidity: 120000,
    targetUSDLiquidityCAD: 80000,
    techConcentrationBasketLimit: 0.10,
    techConcentrationSingleLimit: 0.05,
    speculativeLimit: 0.02,
    manualAssets: [
        { id: 'default-1', name: 'Emergency Fund', value: 10000, currency: 'CAD', assetClass: 'Cash' }
    ],
};

export const saveHoldings = (holdings: Holding[]) => {
    localStorage.setItem(KEYS.HOLDINGS, JSON.stringify(holdings));
};

export const loadHoldings = (): Holding[] => {
    const data = localStorage.getItem(KEYS.HOLDINGS);
    return data ? JSON.parse(data) : [];
};

export const saveIPSState = (state: IPSState) => {
    localStorage.setItem(KEYS.IPS_STATE, JSON.stringify(state));
};

export const loadIPSState = (): IPSState => {
    const data = localStorage.getItem(KEYS.IPS_STATE);
    return data ? JSON.parse(data) : DEFAULT_IPS_STATE;
};

export const saveSnapshot = (snapshot: Snapshot) => {
    const history = loadHistory();
    history.push(snapshot);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
};

export const loadHistory = (): Snapshot[] => {
    const data = localStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
};

const ONBOARDING_KEY = 'pfd_onboarding_state';
const FINANCIAL_GOALS_KEY = 'pfd_financial_goals';

export interface OnboardingState {
    isComplete: boolean;
    targetPhilosophyId?: string; // If manually selected
}

export const saveOnboardingState = (state: OnboardingState) => {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
};

export const loadOnboardingState = (): OnboardingState => {
    const data = localStorage.getItem(ONBOARDING_KEY);
    return data ? JSON.parse(data) : { isComplete: false };
};


// Helper from Types (avoiding circular dep if I import logic, but types are fine)
import { DEFAULT_FINANCIAL_GOALS, type FinancialGoals, type FinancialGoalsV1 } from '../types/FinancialGoals';

export const saveFinancialGoals = (goals: FinancialGoals) => {
    localStorage.setItem(FINANCIAL_GOALS_KEY, JSON.stringify(goals));
};

export const loadFinancialGoals = (): FinancialGoals => {
    const data = localStorage.getItem(FINANCIAL_GOALS_KEY);
    if (!data) return DEFAULT_FINANCIAL_GOALS;

    const parsed = JSON.parse(data);

    // Version Check & Migration
    if (!parsed.version || parsed.version < 2) {
        console.log('Migrating Financial Goals to V2...');
        const old = parsed as FinancialGoalsV1;

        // Infer defaults from old data if possible
        // If old expenses existed, try to reverse-engineer income?
        // Let's stick to safe defaults as per plan, but preserve known values.

        return {
            version: 2,
            currentAge: 35, // Default
            targetRetirementAge: 60, // Default
            // Estimate gross income: Expenses / (1 - SavingsRate) / (1 - TaxRate) -> Very rough proxy
            // Safer: Just use a reasonable default. 100k.
            grossIncomeAnnual: 100000,
            taxRate: 0.30,
            savingsRate: old.savingsRate || 0.20,
            realReturn: 0.04,
            safeWithdrawalRate: 0.04,
            // If they had a custom target, it's tricky since V2 calculates it dynamically.
            // We can respect it by adjusting SWR? Or just let V2 recalculate based on expenses?
            // V2 definition: Target = Expenses / SWR.
            // Let's rely on Expenses migration if present.
        };
    }

    return parsed as FinancialGoals;
};


// --- Expenses Storage ---

import type { Expense } from '../types/Expense';

const EXPENSES_KEY = 'pfd_expenses';

export const saveExpenses = (expenses: Expense[]) => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

export const loadExpenses = (): Expense[] => {
    const data = localStorage.getItem(EXPENSES_KEY);
    return data ? JSON.parse(data) : [];
};
