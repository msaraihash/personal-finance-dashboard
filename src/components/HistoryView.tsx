import { TrendingUp, Clock, Calendar } from 'lucide-react';
import type { Snapshot } from '../types';

interface HistoryViewProps {
    history: Snapshot[];
}

export const HistoryView = ({ history }: HistoryViewProps) => {
    if (history.length === 0) {
        return (
            <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: 'hsla(240, 15%, 5%, 0.4)' }}>
                <Clock size={48} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>No Snapshots Recorded</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.7 }}>
                    Capture your first snapshot to start tracking your progress over time.
                </p>
            </div>
        );
    }

    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const goal = 5000000;
    const latestNW = sortedHistory[0].totalNetWorthCAD;
    const progressPercent = (latestNW / goal) * 100;

    return (
        <div className="glass-card" style={{ gridColumn: '1 / -1', borderLeft: '4px solid var(--nebula-purple)', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                    <TrendingUp size={24} color="var(--nebula-purple)" /> Progress History
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-color)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    {history.length} Snapshots
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                {/* Left: Progress Summary */}
                <div style={{ paddingRight: '1rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Journey to Work-Optional</label>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
                            {progressPercent.toFixed(1)}%
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'hsla(240, 10%, 100%, 0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '1rem' }}>
                            <div style={{
                                width: `${Math.min(100, progressPercent)}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--nebula-purple), var(--nebula-pink))',
                                boxShadow: '0 0 15px hsla(280, 80%, 60%, 0.4)',
                                borderRadius: '4px'
                            }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-color)', borderRadius: '12px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current State</span>
                            <span style={{ fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>${(latestNW / 1000000).toFixed(2)}M</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                            <span style={{ fontSize: '0.8rem', color: '#b45309' }}>Target Goal</span>
                            <span style={{ fontWeight: 800, color: '#b45309', fontFamily: 'Space Grotesk, sans-serif' }}>$5.00M</span>
                        </div>
                    </div>
                </div>

                {/* Right: Snapshot List */}
                <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {sortedHistory.map((snap) => (
                            <div key={snap.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                background: 'var(--bg-color)',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: '#f3e8ff', padding: '8px', borderRadius: '10px' }}>
                                        <Calendar size={16} color="var(--nebula-purple)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                                            {new Date(snap.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                            {snap.holdings.length} Holdings · USD/CAD: {snap.exchangeRate.toFixed(4)}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                                        ${snap.totalNetWorthCAD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--nebula-teal)', fontWeight: 700, letterSpacing: '0.05em' }}>CAD</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
