import React, { useState, useEffect, useMemo } from 'react';
import { X, Rocket, TrendingUp, Target, Calendar, Sparkles } from 'lucide-react';
import { Slider } from './ui/Slider';
import type { FinancialGoals } from '../types/FinancialGoals';
import { computeFIStatus, DEFAULT_FINANCIAL_GOALS } from '../types/FinancialGoals';

interface FICalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    netWorthCAD: number;
    financialGoals: FinancialGoals;
    onApply: (goals: FinancialGoals) => void;
}

/**
 * Interactive Financial Independence Calculator Modal.
 * Sliders for all FI variables with live-updating projections.
 */
export const FICalculatorModal: React.FC<FICalculatorModalProps> = ({
    isOpen,
    onClose,
    netWorthCAD,
    financialGoals,
    onApply
}) => {
    const [localGoals, setLocalGoals] = useState<FinancialGoals>(financialGoals);

    // Reset local state when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalGoals(financialGoals);
        }
    }, [isOpen, financialGoals]);

    // Live FI calculation
    const fiStatus = useMemo(() => computeFIStatus(netWorthCAD, localGoals), [netWorthCAD, localGoals]);

    // Projected portfolio at target retirement age
    const projectedPortfolio = useMemo(() => {
        const years = Math.max(0, localGoals.targetRetirementAge - localGoals.currentAge);
        const netIncome = localGoals.grossIncomeAnnual * (1 - localGoals.taxRate);
        const annualSavings = netIncome * localGoals.savingsRate;
        const r = localGoals.realReturn;

        if (years <= 0) return netWorthCAD;
        if (Math.abs(r) < 1e-6) {
            // Linear growth
            return netWorthCAD + annualSavings * years;
        }

        // FV = PV*(1+r)^t + PMT*((1+r)^t - 1)/r
        const growthFactor = Math.pow(1 + r, years);
        return netWorthCAD * growthFactor + annualSavings * (growthFactor - 1) / r;
    }, [netWorthCAD, localGoals]);

    const formatCurrency = (val: number) => {
        if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000) return `$${Math.round(val / 1_000)}K`;
        return `$${Math.round(val)}`;
    };

    const formatYears = (years: number) => {
        if (years === Infinity) return '∞';
        if (years <= 0) return '0';
        return years.toFixed(1);
    };

    const updateGoal = <K extends keyof FinancialGoals>(key: K, value: FinancialGoals[K]) => {
        setLocalGoals(prev => ({ ...prev, [key]: value }));
    };

    // Handle expenses change - back-calculate savings rate
    const handleExpensesChange = (expenses: number) => {
        const netIncome = localGoals.grossIncomeAnnual * (1 - localGoals.taxRate);
        if (netIncome <= 0) return;

        // Clamp expenses to net income
        const clampedExpenses = Math.min(expenses, netIncome);
        const newSavingsRate = (netIncome - clampedExpenses) / netIncome;
        updateGoal('savingsRate', Math.max(0, Math.min(1, newSavingsRate)));
    };

    const handleApply = () => {
        onApply(localGoals);
        onClose();
    };

    const handleReset = () => {
        setLocalGoals(DEFAULT_FINANCIAL_GOALS);
    };

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 'clamp(0.5rem, 2vw, 1rem)'
            }}
            onClick={onClose}
        >
            <div
                className="fi-calculator-modal"
                style={{
                    background: 'linear-gradient(135deg, #fff1f2 0%, #fdfbf7 50%, #f0fdf4 100%)',
                    borderRadius: 'clamp(12px, 3vw, 24px)',
                    maxWidth: '800px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem)',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            padding: '10px',
                            background: 'linear-gradient(135deg, #ec4899, #c4b5fd)',
                            borderRadius: '12px'
                        }}>
                            <Rocket size={20} color="white" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                                Financial Freedom Calculator
                            </h2>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Adjust the variables to see how they impact your path to FI
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                    >
                        <X size={20} color="#64748b" />
                    </button>
                </div>

                {/* Content */}
                <div className="fi-calculator-content" style={{ padding: 'clamp(1rem, 4vw, 2rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'clamp(1.5rem, 4vw, 2rem)' }}>
                    {/* Left Column: Sliders */}
                    <div>
                        <Slider
                            label="Current Age"
                            value={localGoals.currentAge}
                            min={18}
                            max={80}
                            suffix=" years"
                            onChange={(v) => updateGoal('currentAge', v)}
                        />
                        <Slider
                            label="Target Retirement Age"
                            value={localGoals.targetRetirementAge}
                            min={30}
                            max={90}
                            suffix=" years"
                            onChange={(v) => updateGoal('targetRetirementAge', v)}
                        />
                        <Slider
                            label="Gross Annual Income"
                            value={localGoals.grossIncomeAnnual}
                            min={20000}
                            max={500000}
                            step={5000}
                            formatValue={(v) => formatCurrency(v)}
                            onChange={(v) => updateGoal('grossIncomeAnnual', v)}
                        />
                        <Slider
                            label="Tax Rate"
                            value={Math.round(localGoals.taxRate * 100)}
                            min={0}
                            max={60}
                            suffix="%"
                            onChange={(v) => updateGoal('taxRate', v / 100)}
                        />
                        <Slider
                            label="Annual Expenses"
                            value={Math.round(fiStatus.annualExpenses)}
                            min={10000}
                            max={Math.round(localGoals.grossIncomeAnnual * (1 - localGoals.taxRate))}
                            step={1000}
                            formatValue={(v) => formatCurrency(v)}
                            onChange={handleExpensesChange}
                        />
                        <Slider
                            label="Real Return"
                            value={Math.round(localGoals.realReturn * 100)}
                            min={0}
                            max={12}
                            suffix="%"
                            tooltip="Expected annual investment growth after inflation and fees. Historically, stocks average ~7% real return, bonds ~2-3%."
                            onChange={(v) => updateGoal('realReturn', v / 100)}
                        />
                        <Slider
                            label="Safe Withdrawal Rate"
                            value={localGoals.safeWithdrawalRate * 100}
                            min={2}
                            max={6}
                            step={0.1}
                            suffix="%"
                            formatValue={(v) => `${v.toFixed(1)}%`}
                            tooltip="The percentage of your portfolio you can withdraw annually in retirement without running out of money. The '4% rule' is a common benchmark."
                            onChange={(v) => updateGoal('safeWithdrawalRate', v / 100)}
                        />
                    </div>

                    {/* Right Column: Results */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '2rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        {/* Big Years Number */}
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'linear-gradient(135deg, #fff1f2, #fdf4ff)',
                                padding: '6px 14px',
                                borderRadius: '16px',
                                marginBottom: '1rem'
                            }}>
                                <Calendar size={14} color="#ec4899" />
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                    Years to Freedom
                                </span>
                            </div>
                            <div style={{
                                fontSize: '5rem',
                                fontWeight: 800,
                                lineHeight: 1,
                                background: '-webkit-linear-gradient(45deg, #1e293b 30%, #475569 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontFamily: '"Outfit", sans-serif'
                            }}>
                                {formatYears(fiStatus.yearsToFI)}
                            </div>
                            <div style={{ color: '#94a3b8', fontWeight: 600, marginTop: '0.5rem' }}>
                                {fiStatus.isFI ? 'You are financially free!' : `Age ${Math.round(fiStatus.ageAtFI)}`}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="fi-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                                padding: '1rem',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                                    <Target size={14} color="#16a34a" />
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                        FI Target
                                    </span>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
                                    {formatCurrency(fiStatus.fiTarget)}
                                </div>
                            </div>

                            <div style={{
                                background: 'linear-gradient(135deg, #fdf4ff, #fce7f3)',
                                padding: '1rem',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                                    <TrendingUp size={14} color="#c026d3" />
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                        Portfolio @ {localGoals.targetRetirementAge}
                                    </span>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c026d3' }}>
                                    {formatCurrency(projectedPortfolio)}
                                </div>
                            </div>

                            <div style={{
                                background: '#f8fafc',
                                padding: '1rem',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                    Annual Savings
                                </span>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155', marginTop: '0.25rem' }}>
                                    {formatCurrency(fiStatus.annualSavings)}
                                </div>
                            </div>

                            <div style={{
                                background: '#f8fafc',
                                padding: '1rem',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                    Savings Rate
                                </span>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155', marginTop: '0.25rem' }}>
                                    {Math.round(localGoals.savingsRate * 100)}%
                                </div>
                            </div>
                        </div>

                        {/* Encouragement */}
                        {!fiStatus.isFI && fiStatus.yearsToFI < 20 && (
                            <div style={{
                                marginTop: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '10px 16px',
                                background: 'linear-gradient(135deg, #fef3c7, #fef9c3)',
                                borderRadius: '12px'
                            }}>
                                <Sparkles size={16} color="#f59e0b" fill="#f59e0b" />
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400e' }}>
                                    You're on the fast track!
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="fi-calculator-footer" style={{
                    padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem)',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={handleReset}
                        style={{
                            background: 'transparent',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '10px 20px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#64748b',
                            cursor: 'pointer'
                        }}
                    >
                        Reset to Defaults
                    </button>
                    <button
                        onClick={handleApply}
                        style={{
                            background: 'linear-gradient(135deg, #ec4899, #c4b5fd)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 24px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: 'white',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                        }}
                    >
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
