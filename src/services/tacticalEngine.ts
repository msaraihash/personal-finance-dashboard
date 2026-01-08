import type { IPSState, Metrics, RebalanceInstruction } from '../types';

export const calculateRebalance = (metrics: Omit<Metrics, 'rebalanceInstructions'>, ipsState: IPSState): RebalanceInstruction[] => {
    const actions: RebalanceInstruction[] = [];

    // 1. Check Liquidity Floor
    if (!metrics.compliance.liquidity) {
        const gap = ipsState.liquidityFloorCAD - metrics.totalLiquidityCAD;
        actions.push({
            ticker: 'CASH',
            action: 'BUY',
            amount: gap,
            targetAlloc: ipsState.liquidityFloorCAD / metrics.totalNetWorthCAD,
            reason: 'Liquidity Floor Violation'
        });
    }

    // 2. Check Tech Concentration
    if (!metrics.compliance.basketTech) {
        const excess = metrics.techBasketValueCAD - (metrics.totalNetWorthCAD * ipsState.techConcentrationBasketLimit);
        actions.push({
            ticker: 'TECH_BASKET',
            action: 'SELL',
            amount: excess,
            targetAlloc: ipsState.techConcentrationBasketLimit,
            reason: 'Tech Basket Limit Exceeded'
        });
    }

    // 3. Check Speculative Sleeve
    if (!metrics.compliance.speculative) {
        const excess = metrics.speculativeValueCAD - (metrics.totalNetWorthCAD * ipsState.speculativeLimit);
        actions.push({
            ticker: 'SPECULATIVE',
            action: 'SELL',
            amount: excess,
            targetAlloc: ipsState.speculativeLimit,
            reason: 'Speculative Limit Exceeded'
        });
    }

    return actions;
};

export const simulateCrash = (currentNW: number, dropPercent: number, liquidityAboveFloor: number) => {
    const crashNW = currentNW * (1 - dropPercent);

    let deployment = 0;
    if (dropPercent >= 0.50) deployment = liquidityAboveFloor * 1.0;
    else if (dropPercent >= 0.40) deployment = liquidityAboveFloor * 0.50;
    else if (dropPercent >= 0.30) deployment = liquidityAboveFloor * 0.25;

    return {
        crashNW,
        deploymentRequested: deployment,
        remainingLiquidity: liquidityAboveFloor - deployment
    };
};
