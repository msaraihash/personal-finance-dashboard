import { Plane } from 'lucide-react';
import type { MotifProps } from './index';
import type { FinancialGoals } from '../../types/FinancialGoals';
import { computeFITarget, computeYearsToFI, DEFAULT_FINANCIAL_GOALS } from '../../types/FinancialGoals';

interface RunwayMeterProps extends MotifProps {
    netWorthCAD: number;
    financialGoals?: FinancialGoals;
}

/**
 * RunwayMeter - Visual motif showing years to financial independence.
 * Displays a horizontal progress gauge with FI target and current progress.
 */
export const RunwayMeter = ({
    netWorthCAD,
    financialGoals = DEFAULT_FINANCIAL_GOALS
}: RunwayMeterProps) => {
    const fiTarget = computeFITarget(financialGoals);
    const yearsToFI = computeYearsToFI(netWorthCAD, financialGoals);
    const progressPct = Math.min(100, (netWorthCAD / fiTarget) * 100);

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
        return `$${val.toFixed(0)}`;
    };

    const formatYears = (years: number) => {
        if (years === Infinity) return '∞';
        if (years === 0) return 'FI!';
        if (years < 1) return `${Math.round(years * 12)} mo`;
        return `${years.toFixed(1)} yrs`;
    };

    // Color based on progress
    const getProgressColor = () => {
        if (progressPct >= 75) return 'linear-gradient(90deg, #10b981, #34d399)';
        if (progressPct >= 50) return 'linear-gradient(90deg, #14b8a6, #2dd4bf)';
        if (progressPct >= 25) return 'linear-gradient(90deg, #8b5cf6, #a78bfa)';
        return 'linear-gradient(90deg, #6366f1, #818cf8)';
    };

    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            padding: '1rem',
            border: '1px solid rgba(148, 163, 184, 0.1)',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
            }}>
                <Plane size={16} color="var(--nebula-teal)" />
                <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}>
                    Runway to Financial Freedom
                </span>
            </div>

            {/* Progress Bar */}
            <div style={{
                height: '24px',
                background: 'rgba(30, 41, 59, 0.8)',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '0.75rem',
                position: 'relative',
            }}>
                <div style={{
                    width: `${progressPct}%`,
                    height: '100%',
                    background: getProgressColor(),
                    borderRadius: '12px',
                    transition: 'width 0.5s ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: progressPct > 15 ? '8px' : '0',
                }}>
                    {progressPct > 15 && (
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'white',
                        }}>
                            {progressPct.toFixed(0)}%
                        </span>
                    )}
                </div>
                {progressPct <= 15 && (
                    <span style={{
                        position: 'absolute',
                        left: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                    }}>
                        {progressPct.toFixed(0)}%
                    </span>
                )}
            </div>

            {/* Stats Row */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
            }}>
                <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Net Worth: </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {formatCurrency(netWorthCAD)}
                    </span>
                </div>
                <div>
                    <span style={{ color: 'var(--text-secondary)' }}>FI Target: </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {formatCurrency(fiTarget)}
                    </span>
                </div>
            </div>

            {/* Years To FI */}
            <div style={{
                marginTop: '0.75rem',
                padding: '0.5rem',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '8px',
                textAlign: 'center',
            }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    Time to FI at {(financialGoals.savingsRate * 100).toFixed(0)}% savings rate:
                </span>
                <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: yearsToFI === 0 ? '#10b981' : 'var(--text-primary)',
                    marginTop: '0.25rem',
                }}>
                    {formatYears(yearsToFI)}
                </div>
            </div>
        </div>
    );
};
