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
