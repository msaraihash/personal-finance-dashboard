
import type { PortfolioFeatures } from './features';

export interface SignalMatch {
    name: string;
    points: number;
    rule: string;
}

export interface VisualMotif {
    type: string;
    caption: string;
}

export interface PhilosophyMatch {
    id: string; // matches id in YAML
    displayName: string;
    score: number; // 0-100 normalized
    matchedSignals: SignalMatch[];
    missingSignals: SignalMatch[]; // Signals that failed (for "Why not?" UI)
    isExcluded: boolean;
    exclusionReason?: string;
    visualMotifs: VisualMotif[]; // From YAML visual_motifs
}

export interface ComplianceResult {
    philosophies: PhilosophyMatch[]; // Sorted by score desc
    bestMatch: PhilosophyMatch | null;
    features: PortfolioFeatures; // The input features, passed through for reference
}

