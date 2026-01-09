import React, { useState } from 'react';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
}

export const Tooltip = ({ content, children }: TooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: '8px',
                    padding: '8px 12px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    zIndex: 50,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    backdropFilter: 'blur(4px)',
                    pointerEvents: 'none', // Prevent tooltip from interfering with mouse events
                    minWidth: 'max-content'
                }}>
                    {content}
                    {/* Arrow */}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        borderWidth: '4px',
                        borderStyle: 'solid',
                        borderColor: 'rgba(15, 23, 42, 0.95) transparent transparent transparent'
                    }} />
                </div>
            )}
        </div>
    );
};
