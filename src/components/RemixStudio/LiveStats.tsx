
import { Clock, TrendingUp, Sparkles, Scale } from 'lucide-react';
import type { RemixResult } from '../../types/Remix';

interface LiveStatsProps {
    result: RemixResult | null;
}

export const LiveStats = ({ result }: LiveStatsProps) => {
    if (!result) return null;

    const { original, remixed } = result;
    const deltaYears = remixed.fiStatus.yearsToFI - original.fiStatus.yearsToFI;

    // Format net worth
    const formatMoney = (val: number) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
        return `$${(val / 1000).toFixed(0)}K`;
    };

    const isYearsImproved = deltaYears < 0; // Negative delta means FASTER to FI (good)
    const deltaYearsAbs = Math.abs(deltaYears);
    const deltaText = deltaYears === 0
        ? 'No Change'
        : `${deltaYearsAbs.toFixed(1)} Year${deltaYearsAbs !== 1 ? 's' : ''} ${isYearsImproved ? 'Faster' : 'Slower'}`;

    // Philosophy Change
    const originalPhil = original.philosophy.highestScoringPhilosophy;
    const remixedPhil = remixed.philosophy.highestScoringPhilosophy;
    const isPhilChanged = originalPhil.id !== remixedPhil.id;

    return (
        <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="var(--nebula-teal)" /> LIVE PREVIEW
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* FI Time */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} /> Time to Freedom
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem', color: isYearsImproved ? '#34d399' : deltaYears > 0 ? '#f43f5e' : 'var(--text-primary)' }}>
                        {remixed.fiStatus.yearsToFI === Infinity ? '∞' : remixed.fiStatus.yearsToFI.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>yrs</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', marginTop: '4px', color: isYearsImproved ? '#34d399' : deltaYears > 0 ? '#f43f5e' : 'gray' }}>
                        {deltaText}
                    </div>
                </div>

                {/* Net Worth */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={12} /> Net Worth
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>
                        {formatMoney(remixed.netWorth)}
                    </div>
                    <div style={{ fontSize: '0.7rem', marginTop: '4px', color: 'gray' }}>
                        Same (Re-allocated)
                    </div>
                </div>

                {/* Philosophy */}
                <div style={{ gridColumn: '1 / -1', background: isPhilChanged ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: isPhilChanged ? '1px solid rgba(139, 92, 246, 0.3)' : 'none' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Scale size={12} /> Detected Strategy
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--nebula-purple)' }}>
                        {remixedPhil.name}
                    </div>
                    {isPhilChanged && (
                        <div style={{ fontSize: '0.7rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
                            Shifted from {originalPhil.name}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
