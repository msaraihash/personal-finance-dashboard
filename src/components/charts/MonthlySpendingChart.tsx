import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import type { Expense } from '../../types/Expense';

interface MonthlySpendingChartProps {
    expenses: Expense[];
}

interface MonthData {
    month: string;
    total: number;
    sortKey: string;
}

export const MonthlySpendingChart: React.FC<MonthlySpendingChartProps> = ({ expenses }) => {
    const data = useMemo(() => {
        const monthMap = new Map<string, number>();

        for (const expense of expenses) {
            // Only count positive amounts (actual spending, not refunds/payments)
            if (expense.amount <= 0) continue;

            const date = new Date(expense.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const displayMonth = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            const existing = monthMap.get(monthKey) || 0;
            monthMap.set(monthKey, existing + expense.amount);
        }

        // Sort by date and format for display
        const result: MonthData[] = [];
        for (const [sortKey, total] of monthMap.entries()) {
            const [year, month] = sortKey.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            result.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                total: Math.round(total * 100) / 100,
                sortKey,
            });
        }

        return result.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }, [expenses]);

    if (data.length === 0) {
        return (
            <div style={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
            }}>
                No spending data to display
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
                    width={50}
                />
                <Tooltip
                    contentStyle={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontSize: '0.9rem',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Spent']}
                    cursor={{ fill: 'rgba(244, 114, 182, 0.1)' }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {data.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={`url(#barGradient)`}
                        />
                    ))}
                </Bar>
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f472b6" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                </defs>
            </BarChart>
        </ResponsiveContainer>
    );
};
