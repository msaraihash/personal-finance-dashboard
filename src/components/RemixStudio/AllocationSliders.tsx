
import type { SliderItem } from '../../types/Remix';

interface AllocationSlidersProps {
    sliders: SliderItem[];
    onChange: (id: string, value: number) => void;
}

export const AllocationSliders = ({ sliders, onChange }: AllocationSlidersProps) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                Target Allocation
            </h3>
            {sliders.map((item) => (
                <div key={item.id} className="range-container" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                        <span style={{ color: item.color }}>{item.label}</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{item.value.toFixed(1)}%</span>
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.5"
                        value={item.value}
                        onChange={(e) => onChange(item.id, parseFloat(e.target.value))}
                        style={{
                            width: '100%',
                            accentColor: item.color, // Convenient modern CSS
                        }}
                    />

                    {/* Visual Bar Background for older browsers / extra style? 
                        The native input is decent, but let's just stick to default for MVP unless requested.
                        Actually, let's add a colored track background if possible, but accentColor handles the thumb.
                     */}
                </div>
            ))}

            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Note: Sliders auto-balance to maintain 100% total allocation.
            </div>
        </div>
    );
};
