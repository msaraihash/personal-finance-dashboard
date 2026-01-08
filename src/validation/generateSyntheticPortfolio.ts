// generateSyntheticPortfolio.ts
export type CurrencyCode = string;

export type Holding = {
    ticker: string;
    value: number;
    currency: CurrencyCode;
    assetType?: "etf" | "stock" | "bond" | "cash_equivalent" | "crypto" | "other";
};

export type ManualAsset = {
    id: string;
    type: "cash" | "real_estate_equity" | "private_business_equity" | "pension_present_value" | "other";
    value: number;
    currency: CurrencyCode;
    liquidity?: "liquid" | "semi_liquid" | "illiquid";
};

export type SyntheticPortfolio = {
    baseCurrency: CurrencyCode;
    holdings: Holding[];
    manualAssets?: ManualAsset[];
};

export type SyntheticConfig = {
    seed?: number;
    baseCurrency?: CurrencyCode;
    totalValue?: number;
    mix?: {
        equity?: number;
        bonds?: number;
        cash?: number;
        crypto?: number;
        realAssets?: number;
    };
    nHoldings?: { min: number; max: number };
    concentration?: "low" | "medium" | "high";
    tilts?: {
        value?: number;
        growth?: number;
        em?: number;
        homeBiasCanada?: number;
    };
    includeTinyPositions?: boolean;
    includeManualRealEstate?: boolean;
    multiCurrency?: boolean;
};

type RNG = () => number;

function mulberry32(seed: number): RNG {
    let a = seed >>> 0;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function clamp01(x: number): number {
    return Math.max(0, Math.min(1, x));
}

function pick<T>(rng: RNG, arr: readonly T[]): T {
    return arr[Math.floor(rng() * arr.length)]!;
}

function normalizeWeights(ws: number[]): number[] {
    const sum = ws.reduce((a, b) => a + b, 0);
    if (sum <= 0) return ws.map(() => 0);
    return ws.map((w) => w / sum);
}

function randomWeights(rng: RNG, n: number, alpha: number): number[] {
    const raw: number[] = [];
    for (let i = 0; i < n; i++) {
        const u = Math.max(1e-9, rng());
        raw.push(-Math.log(u) * alpha);
    }
    return normalizeWeights(raw);
}

const UNIVERSE = {
    equityCore: ["VTI", "VOO", "ITOT", "SPY", "XEQT.TO"],
    intlCore: ["VXUS", "VEA", "XEF.TO"],
    em: ["VWO", "IEMG", "XEC.TO"],
    value: ["AVUV", "VTV", "IWD"],
    intlValue: ["AVDV"],
    growth: ["QQQ", "VUG", "ARKK"],
    bondsCore: ["BND", "AGG", "IEF", "TLT"],
    cashEq: ["BIL", "SGOV", "UBIL.U"],
    crypto: ["BTC", "ETH"],
    realAssets: ["VNQ", "GLD", "DBC"],
    canadaHome: ["XIC.TO", "VFV.TO", "XEQT.TO"]
} as const;

function resolveCurrency(baseCurrency: CurrencyCode, multiCurrency: boolean, rng: RNG): CurrencyCode {
    if (!multiCurrency) return baseCurrency;
    if (baseCurrency === "USD" && rng() < 0.2) return "CAD";
    if (baseCurrency === "CAD" && rng() < 0.2) return "USD";
    return baseCurrency;
}

export function generateSyntheticPortfolio(config: SyntheticConfig = {}): SyntheticPortfolio {
    const seed = config.seed ?? Math.floor(Math.random() * 1_000_000_000);
    const rng = mulberry32(seed);
    const baseCurrency = config.baseCurrency ?? "USD";
    const totalValue = config.totalValue ?? 100_000;

    const mix = {
        equity: config.mix?.equity ?? 0.7,
        bonds: config.mix?.bonds ?? 0.2,
        cash: config.mix?.cash ?? 0.05,
        crypto: config.mix?.crypto ?? 0.05,
        realAssets: config.mix?.realAssets ?? 0.0
    };

    const mixKeys = ["equity", "bonds", "cash", "crypto", "realAssets"] as const;
    const mixWeights = normalizeWeights(mixKeys.map((k) => mix[k]));
    const nMin = config.nHoldings?.min ?? 6;
    const nMax = config.nHoldings?.max ?? 18;
    const nHoldings = Math.max(1, Math.floor(nMin + rng() * (nMax - nMin + 1)));
    const concentration = config.concentration ?? "medium";
    const alpha = concentration === "low" ? 2.5 : concentration === "high" ? 0.6 : 1.2;

    const tilts = {
        value: clamp01(config.tilts?.value ?? 0),
        growth: clamp01(config.tilts?.growth ?? 0),
        em: clamp01(config.tilts?.em ?? 0),
        homeBiasCanada: clamp01(config.tilts?.homeBiasCanada ?? 0)
    };

    const holdings: Holding[] = [];
    const bucketCounts = { equity: 0, bonds: 0, cash: 0, crypto: 0, realAssets: 0 };

    for (let i = 0; i < nHoldings; i++) {
        const r = rng();
        let acc = 0;
        let chosen: keyof typeof bucketCounts = "equity";
        for (let j = 0; j < mixKeys.length; j++) {
            acc += mixWeights[j]!;
            if (r <= acc) { chosen = mixKeys[j]!; break; }
        }
        bucketCounts[chosen] += 1;
    }

    if (mixWeights[0]! > 0.05 && bucketCounts.equity === 0) bucketCounts.equity = 1;

    function addHoldings(bucket: keyof typeof bucketCounts, count: number): void {
        if (count <= 0) return;
        let tickers: string[] = [];
        if (bucket === "equity") {
            const wantsCanada = baseCurrency === "CAD" || tilts.homeBiasCanada > 0.5;
            tickers = wantsCanada ? [...UNIVERSE.canadaHome] : [...UNIVERSE.equityCore];
            tickers.push(...UNIVERSE.intlCore);
            if (tilts.value > 0.2) tickers.push(...UNIVERSE.value, ...UNIVERSE.intlValue);
            if (tilts.growth > 0.2) tickers.push(...UNIVERSE.growth);
            if (tilts.em > 0.2) tickers.push(...UNIVERSE.em);
        } else if (bucket === "bonds") tickers = [...UNIVERSE.bondsCore];
        else if (bucket === "cash") tickers = [...UNIVERSE.cashEq];
        else if (bucket === "crypto") tickers = [...UNIVERSE.crypto];
        else if (bucket === "realAssets") tickers = [...UNIVERSE.realAssets];

        const chosen = new Set<string>();
        while (chosen.size < count && chosen.size < tickers.length) chosen.add(pick(rng, tickers));
        for (const t of chosen) {
            const currency = resolveCurrency(baseCurrency, !!config.multiCurrency, rng);
            const assetType: Holding["assetType"] = bucket === "crypto" ? "crypto" : bucket === "cash" ? "cash_equivalent" : "etf";
            holdings.push({ ticker: t, value: 0, currency, assetType });
            if (holdings.length >= nHoldings) break;
        }
    }

    addHoldings("equity", bucketCounts.equity);
    addHoldings("bonds", bucketCounts.bonds);
    addHoldings("cash", bucketCounts.cash);
    addHoldings("crypto", bucketCounts.crypto);
    addHoldings("realAssets", bucketCounts.realAssets);

    const weights = randomWeights(rng, holdings.length, alpha);
    for (let i = 0; i < holdings.length; i++) {
        const t = holdings[i]!.ticker;
        let w = weights[i]!;
        if ((UNIVERSE.value as readonly string[]).includes(t)) w *= 1 + 1.5 * tilts.value;
        if ((UNIVERSE.intlValue as readonly string[]).includes(t)) w *= 1 + 1.2 * tilts.value;
        if ((UNIVERSE.growth as readonly string[]).includes(t)) w *= 1 + 1.5 * tilts.growth;
        if ((UNIVERSE.em as readonly string[]).includes(t)) w *= 1 + 1.8 * tilts.em;
        if ((UNIVERSE.canadaHome as readonly string[]).includes(t)) w *= 1 + 2.0 * tilts.homeBiasCanada;
        weights[i] = w;
    }

    const finalWeights = normalizeWeights(weights);
    for (let i = 0; i < holdings.length; i++) {
        holdings[i]!.value = Math.round(finalWeights[i]! * totalValue * 100) / 100;
    }

    if (config.includeTinyPositions) {
        holdings.push({ ticker: "GME", value: 25, currency: baseCurrency, assetType: "stock" });
        holdings.push({ ticker: "DOGE", value: 25, currency: baseCurrency, assetType: "crypto" });
    }

    const manualAssets: ManualAsset[] = [];
    if (config.includeManualRealEstate) {
        manualAssets.push({
            id: "real_estate_equity",
            type: "real_estate_equity",
            value: Math.round(totalValue * (0.8 + rng() * 2.0)),
            currency: baseCurrency,
            liquidity: "illiquid"
        });
    }

    return {
        baseCurrency,
        holdings: holdings.filter((h) => h.value > 0),
        manualAssets: manualAssets.length ? manualAssets : undefined
    };
}
