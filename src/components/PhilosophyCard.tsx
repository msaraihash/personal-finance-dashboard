import { Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import type { PhilosophyMatch } from '../types/scoring';
import type { PortfolioFeatures } from '../types/features';
import type { Holding } from '../types';
import type { FinancialGoals } from '../types/FinancialGoals';
import { MOTIF_REGISTRY, isMotifImplemented, RunwayMeter } from './motifs';
import { Tooltip } from './ui/Tooltip';

interface PhilosophyCardProps {
    philosophy: PhilosophyMatch;
    rank: number;
    isBestMatch: boolean;
    features?: PortfolioFeatures;
    holdings?: Holding[];
    netWorthCAD?: number;
    financialGoals?: FinancialGoals;
}

/**
 * Displays a single matched Investment Philosophy.
 * Per DesignBrief: States are default, hover, best_match_glow.
 * Motif: constellation node with radial glow on best match.
 * 
 * Phase 6C: Now renders dynamic motifs based on visualMotifs from YAML.
 */
export const PhilosophyCard = ({
    philosophy,
    rank,
    isBestMatch,
    features,
    holdings,
    netWorthCAD,
    financialGoals
}: PhilosophyCardProps) => {
    const scoreColor = philosophy.score >= 75
        ? 'var(--accent-green-dark)'
        : philosophy.score >= 55
            ? 'var(--nebula-purple-dark)'
            : 'var(--text-secondary)';

    // Determine primary motif to render (first one in the list)
    const primaryMotif = philosophy.visualMotifs?.[0];

    // Special case: runway_meter needs custom props
    const isRunwayMeter = primaryMotif?.type === 'runway_meter';

    const MotifComponent = primaryMotif && !isRunwayMeter && isMotifImplemented(primaryMotif.type)
        ? MOTIF_REGISTRY[primaryMotif.type]
        : null;

    return (
        <div
            className="glass-card philosophy-card"
            style={{
                position: 'relative',
                overflow: 'hidden',
                borderColor: isBestMatch ? 'var(--nebula-purple)' : undefined,
                boxShadow: isBestMatch
                    ? '0 0 40px rgba(167, 139, 250, 0.3), 0 10px 30px -10px rgba(100, 116, 139, 0.15)'
                    : undefined,
                animationDelay: `${rank * 100}ms`,
            }}
        >
            {/* Radial glow for best match */}
            {isBestMatch && (
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-30%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    zIndex: 0,
                    pointerEvents: 'none',
                }} />
            )}

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header: Rank + Score */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {isBestMatch && (
                            <div style={{
                                padding: '6px',
                                background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-pink))',
                                borderRadius: '10px',
                            }}>
                                <Sparkles size={18} color="white" />
                            </div>
                        )}
                        <Tooltip content={
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 600, color: 'var(--nebula-purple)' }}>Fit Rank</div>
                                <div style={{ color: 'var(--text-secondary)' }}>How well this philosophy matches<br />your portfolio relative to others.</div>
                            </div>
                        }>
                            <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: isBestMatch ? 'var(--nebula-purple-dark)' : 'var(--text-secondary)',
                                cursor: 'help',
                            }}>
                                {isBestMatch ? 'Best Match' : `#${rank}`}
                            </span>
                        </Tooltip>
                    </div>

                    {/* Score Badge */}
                    <Tooltip content={
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 600, color: 'var(--nebula-purple)' }}>Match Score</div>
                            <div style={{ color: 'var(--text-secondary)' }}>0-100 rating based on signal alignment.</div>
                        </div>
                    }>
                        <div
                            className={isBestMatch ? 'score-pulse' : ''}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                background: isBestMatch ? 'var(--nebula-purple)' : 'var(--bg-color)',
                                color: isBestMatch ? 'white' : scoreColor,
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                border: isBestMatch ? 'none' : `1px solid ${scoreColor}40`,
                                cursor: 'help',
                            }}
                        >
                            {philosophy.score}
                        </div>
                    </Tooltip>
                </div>

                {/* Title */}
                <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    marginBottom: '0.5rem',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                }}>
                    {philosophy.displayName}
                </h3>

                {/* RunwayMeter - Special handling for time_to_financial_freedom */}
                {isRunwayMeter && netWorthCAD !== undefined && (
                    <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                        <RunwayMeter
                            features={features!}
                            netWorthCAD={netWorthCAD}
                            financialGoals={financialGoals}
                        />
                        {primaryMotif?.caption && (
                            <p style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-secondary)',
                                textAlign: 'center',
                                marginTop: '0.5rem',
                                fontStyle: 'italic'
                            }}>
                                {primaryMotif.caption}
                            </p>
                        )}
                    </div>
                )}

                {/* Dynamic Motif Visualization */}
                {MotifComponent && features && (
                    <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                        <MotifComponent features={features} holdings={holdings} />
                        {primaryMotif?.caption && (
                            <p style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-secondary)',
                                textAlign: 'center',
                                marginTop: '0.5rem',
                                fontStyle: 'italic'
                            }}>
                                {primaryMotif.caption}
                            </p>
                        )}
                    </div>
                )}

                {/* Matched Signals */}
                {philosophy.matchedSignals.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                        <p style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.5rem',
                        }}>
                            Matched Signals
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {philosophy.matchedSignals.slice(0, 3).map((signal) => (
                                <div key={signal.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle2 size={14} color="var(--accent-green-dark)" />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                        {signal.name}
                                    </span>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        color: 'var(--accent-green-dark)',
                                        fontWeight: 700,
                                    }}>
                                        +{signal.points}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Missing Signals (for non-best matches) */}
                {!isBestMatch && philosophy.missingSignals.length > 0 && (
                    <div style={{ marginTop: '0.75rem', opacity: 0.7 }}>
                        {philosophy.missingSignals.slice(0, 2).map((signal) => (
                            <div key={signal.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                <XCircle size={12} color="var(--text-secondary)" />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {signal.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Exclusion Warning */}
                {philosophy.isExcluded && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.5rem 0.75rem',
                        background: 'hsla(350, 100%, 60%, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid hsla(350, 100%, 60%, 0.2)',
                    }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)', fontWeight: 600 }}>
                            ⚠️ {philosophy.exclusionReason || 'Excluded by rule'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
