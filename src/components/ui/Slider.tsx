import React from 'react';

interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    prefix?: string;
    suffix?: string;
    onChange: (value: number) => void;
    formatValue?: (value: number) => string;
}

/**
 * Custom styled slider component matching the pastel/aurora aesthetic.
 */
export const Slider: React.FC<SliderProps> = ({
    label,
    value,
    min,
    max,
    step = 1,
    prefix = '',
    suffix = '',
    onChange,
    formatValue
}) => {
    const displayValue = formatValue ? formatValue(value) : `${prefix}${value.toLocaleString()}${suffix}`;
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            {/* Label Row */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
            }}>
                <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                }}>
                    {label}
                </span>
                <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    fontFamily: '"Outfit", sans-serif'
                }}>
                    {displayValue}
                </span>
            </div>

            {/* Slider Track */}
            <div style={{ position: 'relative', height: '8px' }}>
                {/* Background Track */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '8px',
                    background: '#f1f5f9',
                    borderRadius: '4px'
                }} />

                {/* Filled Track */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${percentage}%`,
                    height: '8px',
                    background: 'linear-gradient(90deg, #fbcfe8 0%, #c4b5fd 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.1s ease-out'
                }} />

                {/* Hidden Range Input */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    style={{
                        position: 'absolute',
                        top: '-6px',
                        left: 0,
                        width: '100%',
                        height: '20px',
                        opacity: 0,
                        cursor: 'pointer',
                        margin: 0
                    }}
                />

                {/* Custom Thumb */}
                <div style={{
                    position: 'absolute',
                    top: '-6px',
                    left: `calc(${percentage}% - 10px)`,
                    width: '20px',
                    height: '20px',
                    background: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)',
                    border: '3px solid #c4b5fd',
                    pointerEvents: 'none',
                    transition: 'left 0.1s ease-out'
                }} />
            </div>

            {/* Min/Max Labels */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.5rem'
            }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                    {prefix}{min.toLocaleString()}{suffix}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                    {prefix}{max.toLocaleString()}{suffix}
                </span>
            </div>
        </div>
    );
};
