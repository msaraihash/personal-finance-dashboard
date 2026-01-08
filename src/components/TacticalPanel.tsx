import { ArrowRight, CheckCircle, RefreshCcw, DollarSign } from 'lucide-react';
import type { Metrics, IPSState, RebalanceInstruction } from '../types';

interface TacticalPanelProps {
    metrics: Metrics;
    ipsState: IPSState;
}

export const TacticalPanel = ({ metrics }: TacticalPanelProps) => {
    const instructions = metrics.rebalanceInstructions || [];

    return (
        <div className="glass-card" style={{ height: '100%', borderTop: instructions.length > 0 ? '4px solid var(--accent-gold)' : '4px solid var(--accent-green)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <RefreshCcw size={20} color={instructions.length > 0 ? "var(--accent-gold)" : "var(--accent-green)"} />
                <h3 style={{ fontSize: '1.25rem', color: instructions.length > 0 ? "var(--accent-gold)" : "var(--accent-green)", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Tactical Rebalance
                </h3>
            </div>

            {instructions.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', background: '#f0fdf4', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
                    <CheckCircle size={48} color="#34d399" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                    <h4 style={{ color: '#15803d', fontSize: '1.25rem', marginBottom: '0.5rem' }}>All Is Well</h4>
                    <p style={{ color: '#166534', fontSize: '0.85rem' }}>
                        Your portfolio is beautifully balanced. Enjoy the day.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                    {/* Summary Header */}
                    <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Adjustments needed to restore target allocation.
                        </p>
                    </div>

                    {instructions.map((inst: RebalanceInstruction, idx: number) => {
                        const isBuy = inst.action === 'BUY';
                        return (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1.25rem',
                                background: 'white',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        background: isBuy ? '#dcfce7' : '#fee2e2',
                                        padding: '10px',
                                        borderRadius: '12px'
                                    }}>
                                        <DollarSign size={20} color={isBuy ? '#16a34a' : '#dc2626'} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>{inst.ticker}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                            Target: {(inst.targetAlloc * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.85rem',
                                        fontWeight: 800,
                                        color: isBuy ? '#15803d' : '#991b1b',
                                        background: isBuy ? '#dcfce7' : '#fee2e2',
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        fontFamily: 'Space Grotesk, sans-serif'
                                    }}>
                                        {inst.action} ${inst.amount.toLocaleString()}
                                        {isBuy ? <ArrowRight size={14} style={{ transform: 'rotate(-45deg)' }} /> : <ArrowRight size={14} style={{ transform: 'rotate(45deg)' }} />}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};
