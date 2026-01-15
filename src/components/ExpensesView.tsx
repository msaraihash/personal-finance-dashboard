import React, { useState, useMemo } from 'react';
import { Upload, CreditCard, Calendar, Search, TrendingUp, PieChart } from 'lucide-react';
import type { Expense } from '../types/Expense';
import { parseWealthsimpleCardCSV } from '../services/csvParsers/wealthsimpleCardParser';
import { categorizeExpense, CATEGORY_COLORS } from '../services/categorizer';
import { MonthlySpendingChart } from './charts/MonthlySpendingChart';
import { CategoryDonutChart } from './charts/CategoryDonutChart';

interface ExpensesViewProps {
    expenses: Expense[];
    onExpensesLoaded: (newExpenses: Expense[]) => void;
    onClearExpenses: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, onExpensesLoaded }) => {
    const [filter, setFilter] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log('[ExpensesView] File selected:', file.name, file.size);

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            console.log('[ExpensesView] File read, length:', content.length, 'First 500 chars:', content.substring(0, 500));
            const newExpenses = parseWealthsimpleCardCSV(content);
            console.log('[ExpensesView] Parsed expenses:', newExpenses.length, newExpenses.slice(0, 3));
            // Filter out duplicates (if any, based on ID)
            const existingIds = new Set(expenses.map(e => e.id));
            const uniqueNew = newExpenses.filter(e => !existingIds.has(e.id));
            console.log('[ExpensesView] Unique new expenses:', uniqueNew.length);

            onExpensesLoaded(uniqueNew);
        };
        reader.readAsText(file);
    };

    const filteredExpenses = useMemo(() => {
        if (!filter) return expenses;
        const lower = filter.toLowerCase();
        return expenses.filter(e =>
            e.payee.toLowerCase().includes(lower) ||
            e.amount.toString().includes(lower)
        );
    }, [expenses, filter]);

    const totalSpent = useMemo(() => {
        return expenses.filter(e => e.amount > 0).reduce((sum, e) => sum + e.amount, 0);
    }, [expenses]);

    const { averageMonthlySpend, monthCount } = useMemo(() => {
        const monthlyTotals = new Map<string, number>();
        for (const expense of expenses) {
            if (expense.amount <= 0) continue;
            const date = new Date(expense.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + expense.amount);
        }
        const values = Array.from(monthlyTotals.values());
        if (values.length === 0) return { averageMonthlySpend: 0, monthCount: 0 };
        const total = values.reduce((sum, v) => sum + v, 0);
        return {
            averageMonthlySpend: total / values.length,
            monthCount: values.length
        };
    }, [expenses]);

    return (
        <div className="glass-card" style={{
            gridColumn: '1 / -1',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            minHeight: '400px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #f472b6, #ec4899)',
                        padding: '12px',
                        borderRadius: '16px',
                        boxShadow: '0 8px 20px -6px rgba(236, 72, 153, 0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <CreditCard color="white" size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            Expenses
                        </h2>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            Track your Wealthsimple Card spending
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            style={{
                                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                minWidth: '240px',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="file" id="expense-upload" hidden onChange={handleFileUpload} accept=".csv" />
                        <label htmlFor="expense-upload" className="upload-label" style={{
                            borderRadius: '14px',
                            background: 'var(--text-primary)',
                            color: 'white',
                            borderColor: 'var(--text-primary)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}>
                            <Upload size={16} /> Upload CSV
                        </label>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Monthly Spending Chart */}
                <div style={{
                    padding: '1.5rem',
                    background: 'white',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <TrendingUp size={18} color="#ec4899" />
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Monthly Spending</h4>
                    </div>
                    <MonthlySpendingChart expenses={expenses} />
                </div>

                {/* Category Breakdown */}
                <div style={{
                    padding: '1.5rem',
                    background: 'white',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <PieChart size={18} color="#a78bfa" />
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>By Category</h4>
                    </div>
                    <CategoryDonutChart expenses={expenses} />
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
                {/* Sidebar / Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, rgba(244,114,182,0.1), rgba(236,72,153,0.05))',
                        borderRadius: '20px',
                        border: '1px solid rgba(244,114,182,0.2)'
                    }}>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: '#be185d', letterSpacing: '0.05em', marginBottom: '8px' }}>
                            Total Spend
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#9d174d', letterSpacing: '-0.02em', lineHeight: 1 }}>
                            ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#be185d', marginTop: '8px', fontWeight: 500 }}>
                            {expenses.filter(e => e.amount > 0).length} transactions
                        </div>
                    </div>

                    {/* Average Monthly Spend */}
                    <div style={{
                        padding: '1.25rem',
                        background: 'linear-gradient(135deg, rgba(96,165,250,0.1), rgba(59,130,246,0.05))',
                        borderRadius: '20px',
                        border: '1px solid rgba(96,165,250,0.2)'
                    }}>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.05em', marginBottom: '8px' }}>
                            Avg Monthly
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e40af', letterSpacing: '-0.02em', lineHeight: 1 }}>
                            ${averageMonthlySpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '6px', fontWeight: 500 }}>
                            across {monthCount} months
                        </div>
                    </div>

                    {/* Top Payees */}
                    <div style={{
                        padding: '1.5rem',
                        background: 'white',
                        borderRadius: '20px',
                        border: '1px solid var(--border-color)',
                        flex: 1
                    }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Top Payees</h4>
                        {Object.entries(expenses.reduce((acc, curr) => {
                            if (curr.amount > 0) acc[curr.payee] = (acc[curr.payee] || 0) + curr.amount;
                            return acc;
                        }, {} as Record<string, number>))
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([payee, amount], idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: idx < 4 ? '1px solid #f1f5f9' : 'none' }}>
                                    <span style={{ fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{payee}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>${amount.toFixed(0)}</span>
                                </div>
                            ))}

                        {expenses.length === 0 && (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                No transactions loaded.
                            </div>
                        )}
                    </div>
                </div>

                {/* Transaction List */}
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: '#f8fafc', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'minmax(100px, 1fr) 2.5fr 1fr 1fr', gap: '1rem' }}>
                        <div>Date</div>
                        <div>Payee</div>
                        <div>Category</div>
                        <div style={{ textAlign: 'right' }}>Amount</div>
                    </div>

                    <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
                        {filteredExpenses.length > 0 ? (
                            filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((e) => (
                                <div key={e.id} style={{
                                    padding: '1rem 1.5rem',
                                    borderBottom: '1px solid #f1f5f9',
                                    display: 'grid',
                                    gridTemplateColumns: 'minmax(100px, 1fr) 2.5fr 1fr 1fr',
                                    gap: '1rem',
                                    alignItems: 'center',
                                    transition: 'background 0.2s'
                                }}
                                    className="hover:bg-slate-50"
                                >
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={14} />
                                        {e.date}
                                    </div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                        {e.payee}
                                    </div>
                                    <div>
                                        {(() => {
                                            const category = e.category || categorizeExpense(e.payee);
                                            const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
                                            return (
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: `${color}20`,
                                                    color: color,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {category}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: e.amount > 0 ? '#1e293b' : '#16a34a', fontVariantNumeric: 'tabular-nums' }}>
                                        {e.amount > 0 ? '' : '+'} ${Math.abs(e.amount).toFixed(2)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                {expenses.length === 0 ? 'Upload a Wealthsimple CSV to see your expenses.' : 'No transactions match your search.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
