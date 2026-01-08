import type { Holding } from '../../types';

interface ConcentrationStackProps {
    holdings: Holding[];
    totalValue?: number;
}

const STACK_COLORS = [
    'var(--nebula-purple)',
    'var(--nebula-teal)',
    'var(--nebula-pink)',
    'var(--accent-green)',
    'hsl(45, 100%, 60%)'
];

/**
 * ConcentrationStack - Horizontal stacked bar showing top holdings.
 * Used by: Concentrated Stock Picking, Growth Investing.
 * Shows how much portfolio is dominated by top positions.
 */
export const ConcentrationStack = ({ holdings, totalValue }: ConcentrationStackProps) => {
    if (!holdings || holdings.length === 0) return null;

    // Sort by value descending
    const sorted = [...holdings].sort((a, b) => b.marketValue - a.marketValue);
    const top5 = sorted.slice(0, 5);

    // Calculate total if not provided
    const total = totalValue ?? holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const top5Total = top5.reduce((sum, h) => sum + h.marketValue, 0);
    const otherTotal = total - top5Total;

    const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

    return (
        <div className="motif-container" style={{ width: '100%', padding: '0.5rem 0' }}>
            {/* Stacked Bar */}
            <div style={{
                display: 'flex',
                height: '32px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)'
            }}>
                {top5.map((holding, index) => {
                    const pct = holding.marketValue / total;
                    if (pct < 0.02) return null; // Skip tiny slices
                    return (
                        <div
                            key={holding.ticker}
                            title={`${holding.ticker}: ${formatPercent(pct)}`}
                            style={{
                                width: `${pct * 100}%`,
                                background: STACK_COLORS[index % STACK_COLORS.length],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: pct > 0.08 ? 'auto' : '0',
                                transition: 'width 0.5s ease',
                                cursor: 'default'
                            }}
                        >
                            {pct > 0.08 && (
                                <span style={{
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    padding: '0 4px'
                                }}>
                                    {holding.ticker}
                                </span>
                            )}
                        </div>
                    );
                })}
                {/* Other slice */}
                {otherTotal > 0 && (
                    <div
                        title={`Other: ${formatPercent(otherTotal / total)}`}
                        style={{
                            width: `${(otherTotal / total) * 100}%`,
                            background: 'var(--text-secondary)',
                            opacity: 0.3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {(otherTotal / total) > 0.1 && (
                            <span style={{
                                color: 'var(--text-primary)',
                                fontSize: '0.65rem',
                                fontWeight: 600
                            }}>
                                Other
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginTop: '0.75rem',
                justifyContent: 'center'
            }}>
                {top5.map((holding, index) => {
                    const pct = holding.marketValue / total;
                    return (
                        <div
                            key={holding.ticker}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.7rem'
                            }}
                        >
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '2px',
                                background: STACK_COLORS[index % STACK_COLORS.length]
                            }} />
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                                {holding.ticker}
                            </span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                                {formatPercent(pct)}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Concentration Warning */}
            {top5Total / total >= 0.5 && (
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
                        background: 'hsla(45, 80%, 50%, 0.15)',
                        color: 'hsl(45, 80%, 35%)',
                        border: '1px solid hsl(45, 80%, 50%)40'
                    }}>
                        ⚠ Top 5 = {formatPercent(top5Total / total)}
                    </span>
                </div>
            )}
        </div>
    );
};
