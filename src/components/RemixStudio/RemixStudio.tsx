import { useRef } from 'react';
import { useRemixEngine } from '../../hooks/useRemixEngine';
import type { Holding, IPSState } from '../../types';
import type { FinancialGoals } from '../../types/FinancialGoals';
import { AllocationSliders } from './AllocationSliders';
import { LiveStats } from './LiveStats';
import { RefreshCcw } from 'lucide-react';
import { PosterCanvas, PosterPreviewWrapper } from './PosterCanvas';
import { TemplateMinimal } from './Posters/TemplateMinimal';
import { ExportControls } from './ExportControls';

interface RemixStudioProps {
    holdings: Holding[];
    manualAssets: IPSState['manualAssets'];
    goals: FinancialGoals;
    usdRate: number;
    onClose: () => void;
}

export const RemixStudio = ({ holdings, manualAssets, goals, usdRate, onClose }: RemixStudioProps) => {

    const exportRef = useRef<HTMLDivElement>(null);
    const { sliders, setSlider, remixResult } = useRemixEngine(holdings, manualAssets, goals, usdRate);

    return (
        <div style={{ minHeight: '80vh', paddingBottom: '4rem' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '1.5rem'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                        <span style={{ color: 'var(--nebula-teal)' }}>Remix</span> Studio
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        What if you changed your strategy? Experiment with allocations to see how it impacts your freedom date.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={onClose}>
                        Exit Studio
                    </button>
                    <ExportControls targetRef={exportRef} />
                </div>
            </header>

            <div className="grid-layout" style={{ gridTemplateColumns: '350px 1fr', gap: '2rem' }}>

                {/* Left: Controls */}
                <div style={{ gridColumn: '1 / 2' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Allocations</h3>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Reset">
                                <RefreshCcw size={14} />
                            </button>
                        </div>

                        <AllocationSliders sliders={sliders} onChange={setSlider} />
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        {/* Hints or tips could go here */}
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <strong>Pro Tip:</strong> Try increasing "VTI" or highly diversified assets to see your Philosophy shift towards "Boglehead".
                        </div>
                    </div>
                </div>

                {/* Right: Preview */}
                <div style={{ gridColumn: '2 / -1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <LiveStats result={remixResult} />

                    {/* Visual Preview */}
                    <div className="glass-card" style={{
                        flex: 1,
                        minHeight: '600px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#0f172a',
                        position: 'relative',
                        overflow: 'hidden',
                        padding: 0
                    }}>
                        {remixResult && (
                            <>
                                {/* Hidden Canvas for Export */}
                                <PosterCanvas ref={exportRef}>
                                    <TemplateMinimal result={remixResult} sliders={sliders} />
                                </PosterCanvas>

                                {/* Visible Preview */}
                                <PosterPreviewWrapper>
                                    <TemplateMinimal result={remixResult} sliders={sliders} />
                                </PosterPreviewWrapper>
                            </>
                        )}

                        {!remixResult && (
                            <div style={{ color: 'var(--text-secondary)' }}>Loading Remix Engine...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
