import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { PortfolioFeatures } from '../../types/features';

interface AllocationDonutProps {
    features: PortfolioFeatures;
}

interface SliceData {
    name: string;
    value: number;
    color: string;
    [key: string]: string | number; // Index signature for Recharts
}

const SLICE_COLORS: Record<string, string> = {
    'Equity': 'var(--nebula-purple)',
    'Bonds': 'var(--nebula-teal)',
    'Cash': 'var(--accent-green)',
    'Real Assets': 'var(--nebula-pink)',
    'Crypto': 'hsl(45, 100%, 60%)',
    'Alternatives': 'hsl(200, 70%, 50%)'
};

/**
 * AllocationDonut - Simple diversified core visualization.
 * Used by: Passive Indexing (Bogleheads), Lifecycle/Target-Date.
 * Shows stocks/bonds/cash/real assets split.
 */
export const AllocationDonut = ({ features }: AllocationDonutProps) => {
    const data: SliceData[] = [
        { name: 'Equity', value: features.pct_equity, color: SLICE_COLORS['Equity'] },
        { name: 'Bonds', value: features.pct_bonds, color: SLICE_COLORS['Bonds'] },
        { name: 'Cash', value: features.pct_cash, color: SLICE_COLORS['Cash'] },
        { name: 'Real Assets', value: features.pct_real_assets, color: SLICE_COLORS['Real Assets'] },
        { name: 'Crypto', value: features.pct_crypto, color: SLICE_COLORS['Crypto'] },
        { name: 'Alternatives', value: features.pct_alternatives, color: SLICE_COLORS['Alternatives'] }
    ].filter(d => d.value > 0.01); // Only show slices > 1%

    const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

    return (
        <div className="motif-container" style={{
            width: '100%',
            height: '200px',
            position: 'relative'
        }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        animationBegin={0}
                        animationDuration={800}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="var(--bg-color)"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => formatPercent(Number(value))}
                        contentStyle={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                            color: 'var(--text-primary)'
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none'
            }}>
                <div style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--text-secondary)'
                }}>
                    Core
                </div>
                <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)'
                }}>
                    {formatPercent(features.pct_equity + features.pct_bonds)}
                </div>
            </div>
        </div>
    );
};
