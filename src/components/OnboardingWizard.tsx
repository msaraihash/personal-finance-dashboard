import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle, Target, BrainCircuit } from 'lucide-react';
import type { OnboardingState } from '../services/storage';
import rawPhilosophyData from '../data/investment_philosophies.v1.yml';

interface PhilosophyYaml {
    philosophies: Array<{
        id: string;
        display_name: string;
        one_liner: string;
    }>;
}

const philosophyData = rawPhilosophyData as unknown as PhilosophyYaml;

const AVAILABLE_PHILOSOPHIES = philosophyData.philosophies.map(p => ({
    id: p.id,
    name: p.display_name,
    desc: p.one_liner
}));

interface OnboardingWizardProps {
    onComplete: (state: OnboardingState) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
    const [step, setStep] = useState<'welcome' | 'philosophy'>('welcome');
    const [selectedPhilosophyId, setSelectedPhilosophyId] = useState<string | null>(null);

    const handleStart = () => {
        setStep('philosophy');
    };

    const handleSelect = (id: string | null) => {
        // null means "Auto-detect"
        setSelectedPhilosophyId(id);
    };

    const handleFinish = () => {
        const finalState: OnboardingState = {
            isComplete: true,
            targetPhilosophyId: selectedPhilosophyId || undefined
        };
        onComplete(finalState);
    };

    if (step === 'welcome') {
        return (
            <div className="onboarding-overlay" style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center', maxWidth: '600px', padding: '2rem' }}>
                    <div style={{
                        width: '80px', height: '80px', background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-teal))',
                        borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem',
                        boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)'
                    }}>
                        <Sparkles size={40} color="white" />
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }}>
                        Your Financial<br />
                        Command Center
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '3rem', lineHeight: 1.6 }}>
                        A local-first, privacy-focused dashboard to visualize your wealth, analyze your strategy, and maintain discipline.
                    </p>
                    <button onClick={handleStart} className="btn-primary" style={{
                        fontSize: '1.25rem', padding: '1rem 3rem', borderRadius: '16px',
                        background: 'white', color: '#0f172a', fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', gap: '12px',
                        transition: 'transform 0.2s', cursor: 'pointer', border: 'none'
                    }}>
                        Get Started <ArrowRight size={24} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="onboarding-overlay" style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#f8fafc',
            color: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            overflowY: 'auto'
        }}>
            <div style={{
                maxWidth: '900px', width: '100%', padding: '4rem 2rem',
                display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100vh'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Select Your Philosophy</h2>
                    <p style={{ color: '#64748b' }}>We'll use this to tailor your insights and alerts. You can change this later.</p>
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem',
                    flex: 1, overflowY: 'auto', paddingBottom: '2rem'
                }}>
                    {/* Manual Selections */}
                    {AVAILABLE_PHILOSOPHIES.map(p => {
                        const isSelected = selectedPhilosophyId === p.id;
                        return (
                            <div
                                key={p.id}
                                onClick={() => handleSelect(p.id)}
                                style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    border: isSelected ? '2px solid var(--nebula-purple)' : '1px solid #e2e8f0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    transition: 'all 0.2s',
                                    boxShadow: isSelected ? '0 10px 30px rgba(139, 92, 246, 0.15)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    transform: isSelected ? 'translateY(-4px)' : 'none'
                                }}
                            >
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                                }}>
                                    <div style={{
                                        padding: '10px', borderRadius: '12px',
                                        background: isSelected ? 'rgba(139, 92, 246, 0.1)' : '#f1f5f9'
                                    }}>
                                        <Target size={24} color={isSelected ? 'var(--nebula-purple)' : '#64748b'} />
                                    </div>
                                    {isSelected && <CheckCircle size={24} fill="var(--nebula-purple)" color="white" />}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{p.name}</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>{p.desc}</p>
                                </div>
                            </div>
                        );
                    })}

                    {/* Auto-Detect Option */}
                    <div
                        onClick={() => handleSelect(null)}
                        style={{
                            background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            border: selectedPhilosophyId === null ? '2px solid var(--nebula-teal)' : '1px solid #e2e8f0',
                            borderStyle: 'dashed',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            transition: 'all 0.2s',
                            boxShadow: selectedPhilosophyId === null ? '0 10px 30px rgba(20, 184, 166, 0.15)' : 'none',
                            transform: selectedPhilosophyId === null ? 'translateY(-4px)' : 'none'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{
                                padding: '10px', borderRadius: '12px',
                                background: selectedPhilosophyId === null ? 'rgba(20, 184, 166, 0.1)' : '#f1f5f9'
                            }}>
                                <BrainCircuit size={24} color={selectedPhilosophyId === null ? 'var(--nebula-teal)' : '#64748b'} />
                            </div>
                            {selectedPhilosophyId === null && <CheckCircle size={24} fill="var(--nebula-teal)" color="white" />}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>I'm Unsure (Auto-Detect)</h3>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                                Analyze my holdings and tell me what fits best based on my actual portfolio.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
                    <button
                        onClick={handleFinish}
                        className="btn-primary"
                        style={{
                            fontSize: '1.1rem', padding: '0.85rem 2.5rem', borderRadius: '12px',
                            background: '#0f172a', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer'
                        }}
                    >
                        Confirm & Enter Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};
