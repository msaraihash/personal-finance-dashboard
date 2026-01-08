import type { PortfolioFeatures } from '../../types/features';

interface BarbellVisualProps {
    features: PortfolioFeatures;
}

/**
 * BarbellVisual - Taleb-style antifragile allocation.
 * Shows safe core (cash + bonds) on one end, convex tail (crypto + thematic + stocks) on other.
 * The "middle" is visually suppressed to emphasize the barbell strategy.
 */
export const BarbellVisual = ({ features }: BarbellVisualProps) => {
    const safeCore = features.pct_cash + features.pct_bonds;
    const convexTail = features.pct_crypto + features.pct_sector_thematic + (features.pct_single_stocks * 0.5);
    const middle = 1 - safeCore - convexTail;

    const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`;

    // Barbell health: ideal is high safe + small convex, minimal middle
    const isTrueBarbell = safeCore >= 0.5 && convexTail >= 0.05 && middle < 0.3;

    return (
        <div className="motif-container" style={{
            width: '100%',
            padding: '1rem 0'
        }}>
            {/* Visual Barbell */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                marginBottom: '1rem'
            }}>
                {/* Safe Core Weight */}
                <div style={{
                    width: `${Math.max(40, safeCore * 100)}px`,
                    height: `${Math.max(40, safeCore * 100)}px`,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--nebula-teal), var(--accent-green))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(45, 212, 191, 0.3)',
                    transition: 'all 0.3s ease'
                }}>
                    <span style={{
                        color: 'white',
                        fontWeight: 800,
                        fontSize: safeCore > 0.3 ? '1rem' : '0.8rem'
                    }}>
                        {formatPercent(safeCore)}
                    </span>
                </div>

                {/* The Bar (middle/fragile portion) */}
                <div style={{
                    flex: 1,
                    height: '8px',
                    maxWidth: '120px',
                    background: middle > 0.3
                        ? 'linear-gradient(90deg, var(--nebula-teal), hsl(0, 70%, 60%), var(--nebula-pink))'
                        : 'linear-gradient(90deg, var(--nebula-teal), var(--text-secondary), var(--nebula-pink))',
                    borderRadius: '4px',
                    opacity: middle > 0.3 ? 1 : 0.5
                }} />

                {/* Convex Tail Weight */}
                <div style={{
                    width: `${Math.max(30, convexTail * 150)}px`,
                    height: `${Math.max(30, convexTail * 150)}px`,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--nebula-pink), var(--nebula-purple))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(236, 72, 153, 0.3)',
                    transition: 'all 0.3s ease'
                }}>
                    <span style={{
                        color: 'white',
                        fontWeight: 800,
                        fontSize: convexTail > 0.15 ? '0.9rem' : '0.7rem'
                    }}>
                        {formatPercent(convexTail)}
                    </span>
                </div>
            </div>

            {/* Labels */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                <span>Safe Core</span>
                <span>Convex Tail</span>
            </div>

            {/* Status Badge */}
            <div style={{
                marginTop: '0.75rem',
                textAlign: 'center'
            }}>
                <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: isTrueBarbell
                        ? 'hsla(160, 80%, 40%, 0.15)'
                        : 'hsla(45, 80%, 50%, 0.15)',
                    color: isTrueBarbell
                        ? 'var(--accent-green-dark)'
                        : 'hsl(45, 80%, 40%)',
                    border: `1px solid ${isTrueBarbell ? 'var(--accent-green)' : 'hsl(45, 80%, 50%)'}40`
                }}>
                    {isTrueBarbell ? '✓ True Barbell' : '⚠ Fragile Middle'}
                </span>
            </div>
        </div>
    );
};
