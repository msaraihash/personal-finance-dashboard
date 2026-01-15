import React, { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import type { Expense } from '../../types/Expense';
import { categorizeExpense, CATEGORY_COLORS } from '../../services/categorizer';

interface CategoryDonutChartProps {
    expenses: Expense[];
}

interface CategoryData {
    name: string;
    value: number;
    color: string;
    percentage: number;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ expenses }) => {
    const data = useMemo(() => {
        const categoryTotals = new Map<string, number>();
        let total = 0;

        for (const expense of expenses) {
            // Only count positive amounts (actual spending)
            if (expense.amount <= 0) continue;

            const category = expense.category || categorizeExpense(expense.payee);
            const existing = categoryTotals.get(category) || 0;
            categoryTotals.set(category, existing + expense.amount);
            total += expense.amount;
        }

        const result: CategoryData[] = [];
        for (const [name, value] of categoryTotals.entries()) {
            result.push({
                name,
                value: Math.round(value * 100) / 100,
                color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
                percentage: total > 0 ? Math.round((value / total) * 100) : 0,
            });
        }

        return result.sort((a, b) => b.value - a.value);
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
                No category data to display
            </div>
        );
    }

    const renderLegend = () => (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
            marginTop: '0.5rem'
        }}>
            {data.slice(0, 6).map((entry) => (
                <div
                    key={entry.name}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)'
                    }}
                >
                    <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: entry.color
                    }} />
                    <span>{entry.name}</span>
                    <span style={{ fontWeight: 600 }}>{entry.percentage}%</span>
                </div>
            ))}
        </div>
    );

    return (
        <div>
            <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            fontSize: '0.85rem',
                        }}
                        formatter={(value: number, name: string) => [
                            `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                            name
                        ]}
                    />
                </PieChart>
            </ResponsiveContainer>
            {renderLegend()}
        </div>
    );
};
