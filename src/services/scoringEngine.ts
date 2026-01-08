
import { PortfolioFeatures } from '../types/features';
import { ComplianceResult, PhilosophyMatch, SignalMatch } from '../types/scoring';
import { evaluateRule } from './ruleEvaluator';
import yamlData from '../data/investment_philosophies.v1.yml';

// --- Types needed for YAML shape ---
// We define these locally as they map to the raw YAML structure
interface YamlSignal {
    name: string;
    rule: string;
    points: number;
}

interface YamlPhilosophy {
    id: string;
    display_name: string;
    detection: {
        weight: number;
        signals: YamlSignal[];
    };
    exclusions: string[];
}

interface YamlRoot {
    philosophies: YamlPhilosophy[];
}

// Cast the imported YAML to the typed shape
const PHILOSOPHIES = (yamlData as unknown as YamlRoot).philosophies;

/**
 * Scores the portfolio features against all defined philosophies.
 */
export const scorePortfolio = (features: PortfolioFeatures): ComplianceResult => {
    // Convert features to a context record for the evaluator
    // We treat everything as safe primitives
    const ctx = features as unknown as Record<string, number | string | boolean>;

    const results: PhilosophyMatch[] = PHILOSOPHIES.map(p => {
        let isExcluded = false;
        let exclusionReason: string | undefined;

        // 1. Check exclusions
        for (const rule of p.exclusions) {
            if (evaluateRule(rule, ctx)) {
                isExcluded = true;
                exclusionReason = `Likely violated exclusion rule: "${rule}"`;
                break;
            }
        }

        if (isExcluded) {
            return {
                id: p.id,
                displayName: p.display_name,
                score: 0,
                matchedSignals: [],
                missingSignals: [],
                isExcluded: true,
                exclusionReason
            };
        }

        // 2. Evaluate Signals
        const matchedSignals: SignalMatch[] = [];
        const missingSignals: SignalMatch[] = [];
        let rawScore = 0;
        let maxPossibleScore = 0;

        for (const sig of p.detection.signals) {
            maxPossibleScore += sig.points;
            if (evaluateRule(sig.rule, ctx)) {
                matchedSignals.push({ name: sig.name, points: sig.points, rule: sig.rule });
                rawScore += sig.points;
            } else {
                missingSignals.push({ name: sig.name, points: sig.points, rule: sig.rule });
            }
        }

        // 3. Normalize Score (0-100)
        // If maxPossibleScore is 0 (shouldn't happen), score is 0.
        let normalized = 0;
        if (maxPossibleScore > 0) {
            normalized = (rawScore / maxPossibleScore) * 100;
        }

        // Apply weight if needed (though weight is typically for sorting importance, 
        // here we might just store it. For now, let's keep score as pure match %)

        return {
            id: p.id,
            displayName: p.display_name,
            score: Math.round(normalized),
            matchedSignals,
            missingSignals,
            isExcluded: false
        };
    });

    // Sort by score descending
    const sorted = results.sort((a, b) => b.score - a.score);

    return {
        philosophies: sorted,
        bestMatch: sorted.length > 0 && sorted[0].score > 0 ? sorted[0] : null,
        features
    };
};
