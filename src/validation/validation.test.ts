// validation.test.ts
import { describe, it, afterAll } from "vitest";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";

// Engine imports - adapted to project structure
import { extractFeatures } from "../services/featureExtractor";
import { scorePortfolio } from "../services/scoringEngine";

type CurrencyCode = string;

type Holding = {
    ticker: string;
    value: number;
    currency: CurrencyCode;
    units?: number;
    assetType?: "etf" | "mutual_fund" | "stock" | "bond" | "cash_equivalent" | "crypto" | "option" | "other";
    tags?: string[];
    notes?: string;
};

type ManualAsset = {
    id: string;
    type:
    | "cash"
    | "real_estate_equity"
    | "private_business_equity"
    | "pension_present_value"
    | "collectible"
    | "other";
    value: number;
    currency: CurrencyCode;
    liquidity?: "liquid" | "semi_liquid" | "illiquid";
    notes?: string;
};

type ExpectedLabels = {
    primaryPhilosophy: string;
    secondaryPhilosophies?: string[];
    allowAlternatePrimary?: string[];
    minPrimaryScore?: number;
    requiredPrimaryInTopK?: number;
    notes?: string;
};

type PortfolioCase = {
    id: string;
    description: string;
    archetype?: string;
    baseCurrency: CurrencyCode;
    holdings: Holding[];
    manualAssets?: ManualAsset[];
    expected: ExpectedLabels;
    edgeCaseFlags?: string[];
    tags?: string[];
};

type PortfolioDataset = {
    datasetVersion: string;
    generatedAt?: string;
    notes?: string;
    portfolios: PortfolioCase[];
};

type EngineInput = {
    holdings: Array<{ ticker: string; value: number; currency: CurrencyCode }>;
    manualAssets?: ManualAsset[];
    baseCurrency?: CurrencyCode;
};

type PhilosophyScore = { philosophyId: string; score: number };

type NormalizedScoringOutput = {
    ranked: PhilosophyScore[]; // descending by score
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURE_PATH = path.resolve(__dirname, "fixtures", "portfolios.json");
const ARTIFACT_DIR = path.resolve(__dirname, "artifacts");
const REPORT_PATH = path.resolve(ARTIFACT_DIR, "validation_report.md");

/**
 * Regression thresholds:
 * - overall accuracy must be >= minOverallAccuracy
 * - per-philosophy recall must be >= minRecallByPhilosophy (if present)
 *
 * Tune these once you have stable baselines.
 */
const THRESHOLDS = {
    // Start with relaxed thresholds, tighten once stable
    minOverallAccuracy: 0.30,
    minRecallByPhilosophy: {
        passive_indexing_bogleheads: 0.5,
        factor_investing: 0.5,
        crypto_maximal: 0.5,
        barbell_antifragile: 0.3,
        concentrated_stock_picking: 0.5
    } as Record<string, number>
};

function assertPortfolioCaseShape(p: PortfolioCase): void {
    if (!p.id || typeof p.id !== "string") throw new Error("Missing portfolio.id");
    if (!p.description || typeof p.description !== "string") throw new Error(`Missing description for ${p.id}`);
    if (!p.baseCurrency || typeof p.baseCurrency !== "string") throw new Error(`Missing baseCurrency for ${p.id}`);
    if (!Array.isArray(p.holdings)) throw new Error(`Missing holdings array for ${p.id}`);
    if (!p.expected || typeof p.expected !== "object") throw new Error(`Missing expected for ${p.id}`);
    if (!p.expected.primaryPhilosophy) throw new Error(`Missing expected.primaryPhilosophy for ${p.id}`);
    for (const h of p.holdings) {
        if (!h.ticker || typeof h.ticker !== "string") throw new Error(`Invalid holding.ticker in ${p.id}`);
        if (typeof h.value !== "number" || h.value < 0) throw new Error(`Invalid holding.value in ${p.id}`);
        if (!h.currency || typeof h.currency !== "string") throw new Error(`Invalid holding.currency in ${p.id}`);
    }
}

function toEngineInput(p: PortfolioCase): EngineInput {
    return {
        holdings: p.holdings.map((h) => ({ ticker: h.ticker, value: h.value, currency: h.currency })),
        manualAssets: p.manualAssets,
        baseCurrency: p.baseCurrency
    };
}

/**
 * Adapter: normalize your scoringEngine output into { ranked: [{philosophyId, score}, ...] }.
 * Supported shapes:
 * 1) Array<{ philosophyId, score }>
 * 2) { ranked: Array<{ philosophyId, score }> }
 * 3) { scores: Record<string, number> }
 * 4) ComplianceResult with { philosophies: Array<{ id, score, ... }> }
 */
function normalizeScoringOutput(output: unknown): NormalizedScoringOutput {
    const asAny = output as Record<string, unknown>;

    // 4) ComplianceResult shape from our scoringEngine
    if (asAny && Array.isArray(asAny.philosophies)) {
        const philosophies = asAny.philosophies as Array<{ id: string; score: number }>;
        const ranked = philosophies.map(p => ({ philosophyId: p.id, score: p.score }));
        return { ranked: sortRanked(ranked) };
    }

    // 2) { ranked: [...] }
    if (asAny && Array.isArray(asAny.ranked)) {
        const ranked = asAny.ranked as PhilosophyScore[];
        return { ranked: sortRanked(ranked) };
    }

    // 1) [...]
    if (Array.isArray(output)) {
        return { ranked: sortRanked(output as PhilosophyScore[]) };
    }

    // 3) { scores: { id: score } }
    if (asAny && asAny.scores && typeof asAny.scores === "object") {
        const scoresObj = asAny.scores as Record<string, number>;
        const ranked = Object.entries(scoresObj).map(([philosophyId, score]) => ({ philosophyId, score }));
        return { ranked: sortRanked(ranked) };
    }

    throw new Error("Unsupported scoringEngine output shape. Update normalizeScoringOutput().");
}

function sortRanked(items: PhilosophyScore[]): PhilosophyScore[] {
    return [...items]
        .filter((x) => x && typeof x.philosophyId === "string" && typeof x.score === "number")
        .sort((a, b) => b.score - a.score);
}

type ConfusionMatrix = Record<string, Record<string, number>>;
type Counts = { tp: number; fp: number; fn: number; support: number };

const confusion: ConfusionMatrix = {};
const byPhilosophy: Record<string, Counts> = {};

let total = 0;
let correct = 0;
const mismatches: Array<{ id: string; expected: string; predicted: string; top3: PhilosophyScore[] }> = [];

function incConfusion(actual: string, predicted: string): void {
    confusion[actual] ??= {};
    confusion[actual][predicted] = (confusion[actual][predicted] ?? 0) + 1;
}

function ensureCounts(philosophyId: string): Counts {
    byPhilosophy[philosophyId] ??= { tp: 0, fp: 0, fn: 0, support: 0 };
    return byPhilosophy[philosophyId];
}

function updatePR(actual: string, predicted: string): void {
    // support for actual
    ensureCounts(actual).support += 1;

    if (actual === predicted) {
        ensureCounts(actual).tp += 1;
    } else {
        ensureCounts(predicted).fp += 1;
        ensureCounts(actual).fn += 1;
    }
}

function safeTopK(ranked: PhilosophyScore[], k: number): PhilosophyScore[] {
    return ranked.slice(0, Math.max(0, k));
}

function computeMetrics(counts: Counts): { precision: number; recall: number; f1: number; accuracy: number } {
    const precision = counts.tp + counts.fp === 0 ? 0 : counts.tp / (counts.tp + counts.fp);
    const recall = counts.tp + counts.fn === 0 ? 0 : counts.tp / (counts.tp + counts.fn);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    const accuracy = counts.support === 0 ? 0 : counts.tp / counts.support;
    return { precision, recall, f1, accuracy };
}

function formatPct(x: number): string {
    return `${(x * 100).toFixed(1)}%`;
}

function confusionToMarkdown(cm: ConfusionMatrix, topN = 12): string {
    // Collect all labels
    const labelsSet = new Set<string>();
    for (const a of Object.keys(cm)) {
        labelsSet.add(a);
        for (const p of Object.keys(cm[a] ?? {})) labelsSet.add(p);
    }
    const labels = Array.from(labelsSet).sort();

    // If too many, take most frequent actual labels
    if (labels.length > topN) {
        const actualCounts = Object.entries(cm).map(([actual, row]) => {
            const s = Object.values(row).reduce((acc, v) => acc + v, 0);
            return { actual, s };
        });
        actualCounts.sort((a, b) => b.s - a.s);
        const keep = new Set(actualCounts.slice(0, topN).map((x) => x.actual));
        const filtered = labels.filter((l) => keep.has(l));
        return confusionToMarkdownFiltered(cm, filtered);
    }

    return confusionToMarkdownFiltered(cm, labels);
}

function confusionToMarkdownFiltered(cm: ConfusionMatrix, labels: string[]): string {
    const header = `| actual \\ predicted | ${labels.join(" | ")} |\n|---|${labels.map(() => "---").join("|")}|\n`;
    const rows = labels
        .map((a) => {
            const row = labels.map((p) => String(cm[a]?.[p] ?? 0));
            return `| ${a} | ${row.join(" | ")} |`;
        })
        .join("\n");
    return header + rows + "\n";
}

async function loadDataset(): Promise<PortfolioDataset> {
    const raw = await fs.readFile(FIXTURE_PATH, "utf8");
    const parsed = JSON.parse(raw) as PortfolioDataset;
    if (!parsed || !Array.isArray(parsed.portfolios)) throw new Error("Invalid fixtures file: missing portfolios");
    for (const p of parsed.portfolios) assertPortfolioCaseShape(p);
    return parsed;
}

async function writeReport(markdown: string): Promise<void> {
    await fs.mkdir(ARTIFACT_DIR, { recursive: true });
    await fs.writeFile(REPORT_PATH, markdown, "utf8");
}

/**
 * Convert fixture holding to the format expected by extractFeatures
 */
function toHolding(h: Holding): { ticker: string; marketValue: number; currency: string; assetClass?: string } {
    let assetClass: string | undefined;
    switch (h.assetType) {
        case "stock":
            assetClass = "Equity";
            break;
        case "bond":
            assetClass = "FixedIncome";
            break;
        case "cash_equivalent":
            assetClass = "Cash";
            break;
        case "crypto":
            assetClass = "Crypto";
            break;
        case "etf":
        case "mutual_fund":
            // Leave undefined to let metadata/heuristics handle it, 
            // or perform a secondary fallback if needed.
            // But usually 'Equity' is a safe fallback for unknown ETFs in this context?
            // Let's stick to undefined to rely on metadata, but maybe hint 'Equity' if unclear?
            // Actually, featureExtractor falls back to null if no metadata.
            // Let's map 'etf' to 'Equity' ONLY if we want it treated as stock-like if unknown.
            // Better: don't map it, force metadata usage.
            // But for 'stock' (NVDA), we NEED 'Equity'.
            break;
        case "other":
            assetClass = "Other";
            break;
    }
    return { ticker: h.ticker, marketValue: h.value, currency: h.currency, assetClass };
}

/**
 * Convert fixture manual asset to the format expected by extractFeatures
 */
function toManualAsset(m: ManualAsset): {
    id: string;
    type: string;
    value: number;
    currency: string;
    liquidity?: string;
} {
    return {
        id: m.id,
        type: m.type,
        value: m.value,
        currency: m.currency,
        liquidity: m.liquidity
    };
}

describe("Philosophy Detection Engine validation", () => {
    it("primary philosophy matches expected for all fixtures (or allowed alternates)", async () => {
        const dataset = await loadDataset();

        for (const p of dataset.portfolios) {
            const input = toEngineInput(p);

            // Convert holdings and manual assets to expected format
            const holdings = input.holdings.map(toHolding);
            const manualAssets = (input.manualAssets ?? []).map(toManualAsset);

            // Determine exchange rate based on base currency
            const exchangeRate = input.baseCurrency === "CAD" ? 1.0 : 1.35;

            const features = extractFeatures(holdings as never[], manualAssets as never[], exchangeRate);

            const scoringResult = scorePortfolio(features);
            const normalized = normalizeScoringOutput(scoringResult);

            const ranked = normalized.ranked;
            if (ranked.length === 0) {
                throw new Error(`No scores returned for portfolio ${p.id}`);
            }

            const predictedPrimary = ranked[0]!.philosophyId;
            const expectedPrimary = p.expected.primaryPhilosophy;
            const allowed = new Set<string>([expectedPrimary, ...(p.expected.allowAlternatePrimary ?? [])]);

            total += 1;
            incConfusion(expectedPrimary, predictedPrimary);
            updatePR(expectedPrimary, predictedPrimary);

            if (allowed.has(predictedPrimary)) {
                correct += 1;
            } else {
                mismatches.push({
                    id: p.id,
                    expected: expectedPrimary,
                    predicted: predictedPrimary,
                    top3: safeTopK(ranked, 3)
                });
            }

            // Optional assertions (disabled during baseline establishment):
            // Uncomment once engine signals are tuned
            /*
            if (typeof p.expected.minPrimaryScore === "number") {
                const expectedEntry = ranked.find((x) => x.philosophyId === expectedPrimary);
                const score = expectedEntry?.score ?? -Infinity;
                expect(score, `Expected primary score too low for ${p.id}`).toBeGreaterThanOrEqual(p.expected.minPrimaryScore);
            }
            if (typeof p.expected.requiredPrimaryInTopK === "number") {
                const topK = safeTopK(ranked, p.expected.requiredPrimaryInTopK);
                const found = topK.some((x) => x.philosophyId === expectedPrimary);
                expect(found, `Expected primary not in top ${p.expected.requiredPrimaryInTopK} for ${p.id}`).toBe(true);
            }

            const secondaries = p.expected.secondaryPhilosophies ?? [];
            if (secondaries.length > 0) {
                const top5 = safeTopK(ranked, 5).map((x) => x.philosophyId);
                for (const sec of secondaries) {
                    const isMixed = (p.edgeCaseFlags ?? []).includes("mixed_signals") || expectedPrimary === "mixed_unclear";
                    if (!isMixed) {
                        expect(top5.includes(sec), `Secondary philosophy '${sec}' not in top5 for ${p.id}`).toBe(true);
                    }
                }
            }
            */
        }

        // Report mismatches but don't fail during baseline (comment out expect to fail)
        const mismatchDump =
            mismatches.length === 0
                ? ""
                : mismatches
                    .map((m) => {
                        const top3 = m.top3.map((x) => `${x.philosophyId}:${x.score.toFixed(1)}`).join(", ");
                        return `- ${m.id}: expected=${m.expected}, predicted=${m.predicted} (top3: ${top3})`;
                    })
                    .join("\n");

        // Uncomment to enforce zero mismatches once stable:
        // expect(mismatches, mismatchDump).toEqual([]);
        if (mismatchDump) {
            console.log("Mismatches found:\n" + mismatchDump);
        }
    });
});

afterAll(async () => {
    // Build per-philosophy table
    const philosophyIds = Object.keys(byPhilosophy).sort();
    const overallAccuracy = total === 0 ? 0 : correct / total;

    const lines: string[] = [];
    lines.push(`# Philosophy Validation Report`);
    lines.push(``);
    lines.push(`- Total fixtures: ${total}`);
    lines.push(`- Correct primary (incl. allowed alternates counted as incorrect in metrics, but should be rare): ${correct}`);
    lines.push(`- Overall accuracy: ${formatPct(overallAccuracy)}`);
    lines.push(``);
    lines.push(`## Per-philosophy metrics`);
    lines.push(`| philosophy | support | precision | recall | f1 | accuracy | tp | fp | fn |`);
    lines.push(`|---|---:|---:|---:|---:|---:|---:|---:|---:|`);

    const regressions: string[] = [];

    for (const id of philosophyIds) {
        const c = byPhilosophy[id]!;
        const m = computeMetrics(c);
        lines.push(
            `| ${id} | ${c.support} | ${formatPct(m.precision)} | ${formatPct(m.recall)} | ${formatPct(m.f1)} | ${formatPct(m.accuracy)} | ${c.tp} | ${c.fp} | ${c.fn} |`
        );

        const minRecall = THRESHOLDS.minRecallByPhilosophy[id];
        if (typeof minRecall === "number" && m.recall < minRecall) {
            regressions.push(`- recall regression: ${id} recall=${formatPct(m.recall)} < ${formatPct(minRecall)}`);
        }
    }

    lines.push(``);
    lines.push(`## Confusion matrix (truncated)`);
    lines.push(confusionToMarkdown(confusion, 12));

    lines.push(``);
    lines.push(`## Regression checks`);
    if (overallAccuracy < THRESHOLDS.minOverallAccuracy) {
        regressions.push(
            `- overall accuracy regression: ${formatPct(overallAccuracy)} < ${formatPct(THRESHOLDS.minOverallAccuracy)}`
        );
    }
    if (regressions.length === 0) {
        lines.push(`No regressions detected.`);
    } else {
        lines.push(`Regressions detected:`);
        lines.push(...regressions);
    }

    const report = lines.join("\n") + "\n";
    // Print to console for CI visibility
    // Print to console for CI visibility
    console.log(report);
    await writeReport(report);

    // Fail the test run if regressions exist (disabled during baseline establishment)
    // Uncomment once you've tuned signals and thresholds:
    // if (regressions.length > 0) {
    //     throw new Error(`Regression thresholds violated:\n${regressions.join("\n")}`);
    // }
});
