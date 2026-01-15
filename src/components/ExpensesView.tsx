import React, { useState, useMemo } from 'react';
import { Upload, CreditCard, DollarSign, Calendar, Search } from 'lucide-react';
import type { Expense } from '../types/Expense';
import { parseWealthsimpleCardCSV } from '../services/csvParsers/wealthsimpleCardParser';

interface ExpensesViewProps {
    expenses: Expense[];
    onExpensesLoaded: (newExpenses: Expense[]) => void;
    onClearExpenses: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, onExpensesLoaded, onClearExpenses }) => {
    const [filter, setFilter] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const newExpenses = parseWealthsimpleCardCSV(content);
            // Filter out duplicates (if any, based on ID)
            const existingIds = new Set(expenses.map(e => e.id));
            const uniqueNew = newExpenses.filter(e => !existingIds.has(e.id));

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
        return expenses.reduce((sum, e) => sum + e.amount, 0);
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
                            \${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#be185d', marginTop: '8px', fontWeight: 500 }}>
                            {expenses.length} transactions
                        </div>
                    </div>

                    {/* Placeholder for future categories */}
                    <div style={{
                        padding: '1.5rem',
                        background: 'white',
                        borderRadius: '20px',
                        border: '1px solid var(--border-color)',
                        flex: 1
                    }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Top Payees</h4>
                        {Object.entries(expenses.reduce((acc, curr) => {
                            acc[curr.payee] = (acc[curr.payee] || 0) + curr.amount;
                            return acc;
                        }, {} as Record<string, number>))
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([payee, amount], idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: idx < 4 ? '1px solid #f1f5f9' : 'none' }}>
                                    <span style={{ fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{payee}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>\${amount.toFixed(0)}</span>
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
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: '#f8fafc', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'minmax(120px, 1.5fr) 3fr 1.5fr', gap: '1rem' }}>
                        <div>Date</div>
                        <div>Payee</div>
                        <div style={{ textAlign: 'right' }}>Amount</div>
                    </div>

                    <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
                        {filteredExpenses.length > 0 ? (
                            filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((e) => (
                                <div key={e.id} style={{
                                    padding: '1rem 1.5rem',
                                    borderBottom: '1px solid #f1f5f9',
                                    display: 'grid',
                                    gridTemplateColumns: 'minmax(120px, 1.5fr) 3fr 1.5fr',
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
                                    <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: e.amount > 0 ? '#1e293b' : '#16a34a', fontVariantNumeric: 'tabular-nums' }}>
                                        {e.amount > 0 ? '' : '+'} \${Math.abs(e.amount).toFixed(2)}
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
