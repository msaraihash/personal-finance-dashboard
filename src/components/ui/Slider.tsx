import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    prefix?: string;
    suffix?: string;
    tooltip?: string;
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
    tooltip,
    onChange,
    formatValue
}) => {
    const [showTooltip, setShowTooltip] = useState(false);
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
                    <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                    }}>
                        {label}
                    </span>
                    {tooltip && (
                        <div
                            style={{ position: 'relative', display: 'inline-flex' }}
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <Info size={14} color="#94a3b8" style={{ cursor: 'help' }} />
                            {showTooltip && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    marginBottom: '8px',
                                    padding: '10px 14px',
                                    background: 'rgba(15, 23, 42, 0.95)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    borderRadius: '10px',
                                    color: '#e2e8f0',
                                    fontSize: '0.75rem',
                                    lineHeight: 1.5,
                                    zIndex: 100,
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                    backdropFilter: 'blur(4px)',
                                    pointerEvents: 'none',
                                    width: '220px',
                                    whiteSpace: 'normal'
                                }}>
                                    {tooltip}
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        borderWidth: '5px',
                                        borderStyle: 'solid',
                                        borderColor: 'rgba(15, 23, 42, 0.95) transparent transparent transparent'
                                    }} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
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
