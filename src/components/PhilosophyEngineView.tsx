import { Compass } from 'lucide-react';
import type { ComplianceResult } from '../types/scoring';
import type { FinancialGoals } from '../types/FinancialGoals';
import { PhilosophyCard } from './PhilosophyCard';

interface PhilosophyEngineViewProps {
    complianceResult: ComplianceResult | null;
    netWorthCAD?: number;
    financialGoals?: FinancialGoals;
    onExploreFI?: () => void;
}

/**
 * Container for Philosophy Engine results.
 * Per DesignBrief: "Staggered Constellation Reveal" animation on load.
 * Motif: constellation map with glowing nodes.
 */
export const PhilosophyEngineView = ({
    complianceResult,
    netWorthCAD,
    financialGoals,
    onExploreFI
}: PhilosophyEngineViewProps) => {
    if (!complianceResult) {
        return (
            <div className="glass-card" style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'var(--glass-bg)',
            }}>
                <Compass size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    No Portfolio Loaded
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
                    Upload a Wealthsimple CSV to discover your Investment Philosophy matches.
                </p>
            </div>
        );
    }

    const { philosophies, bestMatch } = complianceResult;

    // 1. Get strong matches (score >= 55)
    // Filter out 'time_to_financial_freedom' initially to avoid dupes/confusion, we will add it back specifically.
    const strongMatches = philosophies
        .filter(p => p.score >= 55 && !p.isExcluded && p.id !== 'time_to_financial_freedom')
        .slice(0, 3); // Take top 3 actual philosophy matches

    // 2. Always grab the "Time to Financial Freedom" philosophy
    const timeToFreedom = philosophies.find(p => p.id === 'time_to_financial_freedom');

    // 3. Assemble display list: Strong Matches + Time To Freedom
    const displayPhilosophies = [...strongMatches];

    // Always append Time to Freedom if it exists (it should)
    if (timeToFreedom) {
        displayPhilosophies.push(timeToFreedom);
    }

    // Fallback: If absolutely no strong matches and no TimeToFreedom (unlikely), shows empty state below.
    // If only TimeToFreedom exists, it shows just that card.

    return (
        <div className="philosophy-engine-view" style={{ padding: '1rem 0' }}>
            {/* Section Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem',
                paddingLeft: '1rem',
            }}>
                <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-teal))',
                    borderRadius: '14px',
                    boxShadow: '0 4px 12px rgba(167, 139, 250, 0.3)',
                }}>
                    <Compass size={24} color="white" />
                </div>
                <div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                    }}>
                        Your Investment Philosophies
                    </h2>
                    <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        marginTop: '4px',
                    }}>
                        Based on your portfolio's characteristics
                    </p>
                </div>
            </div>

            {/* Philosophy Cards Grid */}
            <div
                className="stagger-reveal"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '1.5rem',
                    padding: '0 1rem',
                }}
            >
                {displayPhilosophies.map((philosophy, index) => (
                    <PhilosophyCard
                        key={philosophy.id}
                        philosophy={philosophy}
                        rank={index + 1}
                        isBestMatch={bestMatch?.id === philosophy.id}
                        features={complianceResult.features}
                        netWorthCAD={netWorthCAD}
                        financialGoals={financialGoals}
                        onExploreFI={philosophy.id === 'time_to_financial_freedom' ? onExploreFI : undefined}
                    />
                ))}
            </div>

            {/* No matches state */}
            {displayPhilosophies.length === 0 && (
                <div className="glass-card" style={{
                    textAlign: 'center',
                    padding: '2rem',
                    margin: '0 1rem',
                }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        No strong philosophy matches found. Your portfolio may be too unconventional to classify—or brilliantly unique.
                    </p>
                </div>
            )}
        </div>
    );
};
