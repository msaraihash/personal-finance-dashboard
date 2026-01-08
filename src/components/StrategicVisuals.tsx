import { Target, Shield, Cpu, Zap, CreditCard } from 'lucide-react';
import type { Metrics, IPSState } from '../types';

interface StrategicVisualsProps {
    metrics: Metrics;
    ipsState: IPSState;
}

export const StrategicVisuals = ({ metrics, ipsState }: StrategicVisualsProps) => {
    const goal = 5000000;
    // Ensure we don't divide by zero if totalNetWorthCAD is missing or 0
    const totalNW = metrics.totalNetWorthCAD || 0;
    const progressPercent = totalNW > 0 ? Math.min((totalNW / goal) * 100, 100) : 0;

    // Custom progress arc calculation
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    return (
        <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Desktop: Grid layout that puts Hero left and Metrics right if space permits */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '1.5rem',
                alignItems: 'stretch'
            }}>

                {/* Hero Section: Retirement Runway */}
                <div className="glass-card" style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #fff 0%, #fefce8 100%)', // Very subtle warm white
                    border: '1px solid #fff',
                    gridColumn: 'span 1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    {/* Decorative Glow */}
                    <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(253, 230, 138, 0.4) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}></div>

                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                        <div style={{ flex: 1, paddingRight: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ padding: '8px', background: '#f3e8ff', borderRadius: '12px' }}>
                                    <Target size={24} color="var(--nebula-purple-dark)" />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', color: 'var(--nebula-purple-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Freedom Path</h3>
                            </div>

                            <div className="metric-value">
                                ${(totalNW / 1000000).toFixed(2)}M
                                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginLeft: '12px', fontWeight: 600 }}>/ $5.00M Goal</span>
                            </div>

                            <div style={{ marginTop: '1.5rem', width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--nebula-purple)' }}>
                                    <span>WORK OPTIONAL PROGRESS</span>
                                    <span>{progressPercent.toFixed(1)}%</span>
                                </div>
                                <div style={{ width: '100%', height: '12px', background: 'hsla(240, 10%, 100%, 0.05)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                    <div style={{
                                        width: `${progressPercent}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, var(--nebula-purple), var(--nebula-pink))',
                                        boxShadow: '0 0 20px hsla(280, 80%, 60%, 0.4)',
                                        borderRadius: '6px',
                                        transition: 'width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
                                    }} />
                                </div>
                            </div>
                        </div>

                        {/* Animated Ring */}
                        <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="70" cy="70" r={radius} stroke="hsla(240, 10%, 100%, 0.05)" strokeWidth="10" fill="transparent" />
                                <circle
                                    cx="70"
                                    cy="70"
                                    r={radius}
                                    stroke="url(#gradient)"
                                    strokeWidth="10"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="var(--nebula-purple)" />
                                        <stop offset="100%" stopColor="var(--nebula-pink)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div style={{ position: 'absolute', textAlign: 'center' }}>
                                <Zap size={28} color="var(--nebula-gold)" style={{ filter: 'drop-shadow(0 0 10px hsla(45, 90%, 60%, 0.5))' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Metrics Column */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                    {/* Tech Concentration */}
                    <div className="glass-card" style={{ borderTop: '4px solid var(--nebula-teal-dark)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Cpu size={20} color="var(--nebula-teal-dark)" />
                            <h4 style={{ color: 'var(--nebula-teal-dark)' }}>GROWTH GARDEN</h4>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Innovation Balance</span>
                                <span style={{ fontWeight: 700 }}>
                                    {totalNW > 0
                                        ? ((metrics.techBasketValueCAD / totalNW) * 100).toFixed(1)
                                        : '0.0'}%
                                </span>
                            </div>

                            <div style={{ width: '100%', height: '8px', background: 'var(--bg-color)', borderRadius: '4px', display: 'flex', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                {(() => {
                                    const filteredEntries = Object.entries(metrics.individualTechValues || {})
                                        .filter(([ticker]) => ['NVDA', 'META', 'GOOG'].includes(ticker))
                                        .sort((a, b) => (b[1] as number) - (a[1] as number));

                                    const totalFiltered = filteredEntries.reduce((sum, [, val]) => sum + (val as number), 0);

                                    return filteredEntries.map(([ticker, val]) => {
                                        // Normalize to 100% of the bar (Composition View)
                                        const widthPct = totalFiltered > 0 ? ((val as number) / totalFiltered) * 100 : 0;

                                        const colorMap: Record<string, string> = {
                                            'NVDA': '#34d399', // Green
                                            'META': '#60a5fa', // Blue
                                            'GOOG': '#fbbf24'  // Amber
                                        };
                                        const color = colorMap[ticker] || '#ccc';

                                        return (
                                            <div key={ticker} style={{ width: `${widthPct}%`, height: '100%', background: color }} title={`${ticker}: ${widthPct.toFixed(1)}%`} />
                                        );
                                    });
                                })()}
                            </div>

                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '6px', textAlign: 'right' }}>
                                Target: {(ipsState.techConcentrationBasketLimit * 100).toFixed(0)}%
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {Object.entries(metrics.individualTechValues || {})
                                .filter(([tick]) => ['NVDA', 'META', 'GOOG'].includes(tick))
                                .map(([tick]) => {
                                    const colorMap: Record<string, string> = {
                                        'NVDA': '#34d399', // Green
                                        'META': '#60a5fa', // Blue
                                        'GOOG': '#fbbf24'  // Amber
                                    };
                                    const color = colorMap[tick] || '#ccc';

                                    return (
                                        <span key={tick} className="status-badge" style={{
                                            background: `${color}15`, // Digits for opacity
                                            color: color,
                                            border: `1px solid ${color}40`
                                        }}>
                                            {tick}
                                        </span>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Liquidity Moat */}
                    <div className="glass-card" style={{ borderTop: '4px solid var(--accent-green-dark)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Shield size={20} color="var(--accent-green-dark)" />
                                <h4 style={{ color: 'var(--accent-green-dark)' }}>PEACE OF MIND</h4>
                            </div>
                            {(metrics.totalLiquidityCAD || 0) >= ipsState.liquidityFloorCAD ? (
                                <span className="status-badge" style={{ background: '#dcfce7', color: '#15803d' }}>HEALTHY</span>
                            ) : (
                                <span className="status-badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>ATTENTION</span>
                            )}
                        </div>

                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                ${((metrics.totalLiquidityCAD || 0) / 1000).toFixed(1)}k
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
                                Safety Net (CAD)
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CreditCard size={14} color="var(--text-secondary)" />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Floor Target</span>
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>${(ipsState.liquidityFloorCAD / 1000).toFixed(0)}k CAD</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
