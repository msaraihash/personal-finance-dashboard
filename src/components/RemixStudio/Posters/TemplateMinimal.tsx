
import type { RemixResult, SliderItem } from '../../../types/Remix';

interface TemplateProps {
    result: RemixResult;
    sliders: SliderItem[]; // To show the "Recipe"
}

export const TemplateMinimal = ({ result, sliders }: TemplateProps) => {
    const { remixed } = result;
    const { yearsToFI } = remixed.fiStatus;
    const philosophyName = remixed.philosophy.highestScoringPhilosophy.name;

    const top3 = sliders.slice(0, 3);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            background: '#000',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '120px 80px',
            boxSizing: 'border-box'
        }}>

            {/* Header */}
            <div>
                <h1 style={{ fontSize: '180px', lineHeight: '0.9', fontWeight: 800, letterSpacing: '-0.05em', margin: 0 }}>
                    FREEDOM<br />
                    <span style={{ color: '#34d399' }}>{yearsToFI.toFixed(1)} YRS</span>
                </h1>
                <div style={{ fontSize: '40px', marginTop: '40px', opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Projected Timeline
                </div>
            </div>

            {/* Middle: The Recipe */}
            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-end' }}>
                {top3.map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{
                            height: `${s.value * 8}px`,
                            width: '120px',
                            background: s.color,
                            borderRadius: '10px 10px 0 0'
                        }} />
                        <div style={{ fontSize: '32px', fontWeight: 700 }}>{s.label}</div>
                        <div style={{ fontSize: '24px', opacity: 0.6 }}>{s.value.toFixed(0)}%</div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{ borderTop: '2px solid rgba(255,255,255,0.2)', paddingTop: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: '24px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Strategy</div>
                    <div style={{ fontSize: '60px', fontWeight: 900 }}>{philosophyName}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '32px', fontWeight: 700 }}>My Financial DNA</div>
                    <div style={{ fontSize: '24px', opacity: 0.5 }}>Remixed & Generated</div>
                </div>
            </div>

        </div>
    );
};
