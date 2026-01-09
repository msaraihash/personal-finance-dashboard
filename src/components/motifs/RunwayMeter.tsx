import { Info, Rocket, Sparkles } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import type { MotifProps } from './index';
import type { FinancialGoals } from '../../types/FinancialGoals';
import { computeFIStatus, DEFAULT_FINANCIAL_GOALS } from '../../types/FinancialGoals';

interface RunwayMeterProps extends MotifProps {
    netWorthCAD: number;
    financialGoals?: FinancialGoals;
}

/**
 * RunwayMeter - "The Viral Edition"
 * Designed for maximum visual impact, emotional resonance, and clarity.
 * Uses a pastel/aurora aesthetic with massive typography.
 */
export const RunwayMeter = ({
    netWorthCAD,
    financialGoals = DEFAULT_FINANCIAL_GOALS
}: RunwayMeterProps) => {

    const status = computeFIStatus(netWorthCAD, financialGoals);
    const { fiTarget, yearsToFI, isFI } = status;
    const progressPct = fiTarget > 0 ? Math.min(100, (netWorthCAD / fiTarget) * 100) : 100;

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
        return `$${val.toFixed(0)}`;
    };

    const formatYears = (years: number) => {
        if (years === Infinity) return '∞';
        if (years <= 0) return 'Free!';
        if (years < 1) return `${Math.round(years * 12)}`;
        return `${years.toFixed(1)}`;
    };

    // "Pastel Aurora" Gradients
    const containerBg = 'linear-gradient(135deg, #fff1f2 0%, #fdfbf7 50%, #f0fdf4 100%)';
    const progressBarBg = 'linear-gradient(90deg, #fbcfe8 0%, #c4b5fd 100%)'; // Pink -> Lavender
    const numberColor = '#1e293b'; // Slate 800 for contrast against soft bg

    return (
        <div style={{
            background: containerBg,
            borderRadius: '32px',
            padding: '2.5rem',
            border: '1px solid white',
            boxShadow: '0 20px 40px -10px rgba(244, 63, 94, 0.1), 0 10px 20px -5px rgba(167, 139, 250, 0.1)', // Warm colored shadows
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
        }}>
            {/* Background Decor */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-20%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(251, 207, 232, 0.4) 0%, transparent 70%)',
                filter: 'blur(50px)',
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>

                {/* Header Badge */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                    marginBottom: '2rem'
                }}>
                    <Rocket size={14} color="#ec4899" />
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Time to Freedom
                    </span>
                </div>

                {/* THE BIG NUMBER */}
                <div style={{
                    fontSize: '6.5rem',
                    lineHeight: '1',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    color: numberColor,
                    background: '-webkit-linear-gradient(45deg, #1e293b 30%, #475569 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem',
                    fontFamily: '"Outfit", sans-serif',
                }}>
                    {formatYears(yearsToFI)}
                </div>

                <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                    marginBottom: '3rem'
                }}>
                    {yearsToFI < 1 && yearsToFI > 0 ? 'months to go' : yearsToFI <= 0 ? 'You are free.' : 'years to go'}
                </div>

                {/* Progress Bar - Minimal */}
                <div style={{ position: 'relative', height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
                    <div style={{
                        width: `${progressPct}%`,
                        height: '100%',
                        background: progressBarBg,
                        borderRadius: '6px',
                        transition: 'width 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }} />
                </div>

                {/* Bottom Stats */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '3rem',
                    borderTop: '1px solid rgba(0,0,0,0.04)',
                    paddingTop: '1.5rem',
                    maxWidth: '80%',
                    margin: '0 auto'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.05em' }}>NET WORTH</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155' }}>{formatCurrency(netWorthCAD)}</div>
                    </div>

                    <div style={{ width: '1px', background: 'rgba(0,0,0,0.04)' }}></div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.05em' }}>FI TARGET</div>
                            <Tooltip content={
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '4px', color: '#ec4899' }}>Financial Independence Target</div>
                                    <div style={{ marginBottom: '4px' }}>Annual Expenses ({formatCurrency(status.annualExpenses)}) / SWR ({(financialGoals.safeWithdrawalRate * 100).toFixed(1)}%)</div>
                                    <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginBottom: '4px' }}>
                                        *Expenses = Net Income ({formatCurrency(status.netIncome)}) - Savings ({formatCurrency(status.annualSavings)})
                                    </div>
                                </div>
                            }>
                                <Info size={12} color="#cbd5e1" style={{ cursor: 'help', marginTop: '-4px' }} />
                            </Tooltip>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155' }}>
                            {formatCurrency(fiTarget)}
                        </div>
                    </div>
                </div>

                {/* Encouragement Pill */}
                {!isFI && (
                    <div style={{
                        marginTop: '2rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem',
                        color: '#64748b',
                        background: 'white',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        <Sparkles size={14} color="#fbbf24" fill="#fbbf24" />
                        <span style={{ fontWeight: 600 }}>You are on your way</span>
                    </div>
                )}
            </div>
        </div>
    );
};
