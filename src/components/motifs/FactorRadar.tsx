import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { PortfolioFeatures } from '../../types/features';

interface FactorRadarProps {
    features: PortfolioFeatures;
}

interface FactorData {
    factor: string;
    value: number;
    fullMark: 1;
}

/**
 * FactorRadar - Shows factor exposures for Factor Investing philosophies.
 * 5 axes: Value, Size, Quality, Momentum, Low-Vol.
 * Values are normalized -1 to +1, displayed as 0 to 1 (shifted).
 */
export const FactorRadar = ({ features }: FactorRadarProps) => {
    // Shift from [-1, 1] to [0, 1] for radar display
    const normalize = (val: number) => (val + 1) / 2;

    const data: FactorData[] = [
        { factor: 'Value', value: normalize(features.tilt_value), fullMark: 1 },
        { factor: 'Size', value: normalize(features.tilt_size), fullMark: 1 },
        { factor: 'Quality', value: normalize(features.tilt_quality), fullMark: 1 },
        { factor: 'Momentum', value: normalize(features.tilt_momentum), fullMark: 1 },
        { factor: 'Low Vol', value: normalize(features.tilt_low_vol), fullMark: 1 }
    ];

    // Determine dominant factor
    const tilts = [
        { name: 'Value', val: features.tilt_value },
        { name: 'Size', val: features.tilt_size },
        { name: 'Quality', val: features.tilt_quality },
        { name: 'Momentum', val: features.tilt_momentum },
        { name: 'Low Vol', val: features.tilt_low_vol }
    ];
    const dominant = tilts.reduce((max, t) => Math.abs(t.val) > Math.abs(max.val) ? t : max, tilts[0]);
    const hasMeaningfulTilt = Math.abs(dominant.val) >= 0.2;

    return (
        <div className="motif-container" style={{
            width: '100%',
            height: '220px',
            position: 'relative'
        }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid
                        stroke="var(--glass-border)"
                        strokeOpacity={0.5}
                    />
                    <PolarAngleAxis
                        dataKey="factor"
                        tick={{
                            fill: 'var(--text-secondary)',
                            fontSize: 11,
                            fontWeight: 600
                        }}
                    />
                    <Radar
                        name="Factor Tilt"
                        dataKey="value"
                        stroke="var(--nebula-purple)"
                        fill="var(--nebula-purple)"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        animationBegin={0}
                        animationDuration={800}
                    />
                    <Tooltip
                        formatter={(value) => {
                            const original = (Number(value) * 2) - 1;
                            return original >= 0 ? `+${original.toFixed(2)}` : original.toFixed(2);
                        }}
                        contentStyle={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                            color: 'var(--text-primary)'
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>

            {/* Dominant Factor Badge */}
            {hasMeaningfulTilt && (
                <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center'
                }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: 'hsla(270, 80%, 60%, 0.15)',
                        color: 'var(--nebula-purple-dark)',
                        border: '1px solid var(--nebula-purple)40'
                    }}>
                        {dominant.val > 0 ? '↑' : '↓'} {dominant.name} Tilt
                    </span>
                </div>
            )}
        </div>
    );
};
