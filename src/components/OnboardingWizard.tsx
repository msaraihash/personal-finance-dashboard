import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle, Target, BrainCircuit, Upload, FileText, Plus } from 'lucide-react';
import type { OnboardingState } from '../services/storage';
import { parseWealthsimpleCSV } from '../services/parser';
import type { Holding } from '../types';
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
    onHoldingsLoaded?: (holdings: Holding[]) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onHoldingsLoaded }) => {
    const [step, setStep] = useState<'welcome' | 'philosophy' | 'import'>('welcome');
    const [selectedPhilosophyId, setSelectedPhilosophyId] = useState<string | null>(null);
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [filesUploaded, setFilesUploaded] = useState<{ user: boolean; partner: boolean }>({ user: false, partner: false });

    const handleStart = () => {
        setStep('philosophy');
    };

    const handlePhilosophySelect = (id: string | null) => {
        // null means "Auto-detect"
        setSelectedPhilosophyId(id);
    };

    const goToImport = () => {
        setStep('import');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'user' | 'partner') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            try {
                const newHoldings = parseWealthsimpleCSV(content);
                setHoldings(prev => [...prev, ...newHoldings]);
                setFilesUploaded(prev => ({ ...prev, [type]: true }));
            } catch (err) {
                console.error("Failed to parse CSV", err);
                alert("Failed to parse CSV. Please ensure it is a valid Wealthsimple holdings export.");
            }
        };
        reader.readAsText(file);
    };

    const handleFinish = () => {
        if (onHoldingsLoaded && holdings.length > 0) {
            onHoldingsLoaded(holdings);
        }

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

    if (step === 'philosophy') {
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
                                    onClick={() => handlePhilosophySelect(p.id)}
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
                            onClick={() => handlePhilosophySelect(null)}
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
                            onClick={goToImport}
                            className="btn-primary"
                            style={{
                                fontSize: '1.1rem', padding: '0.85rem 2.5rem', borderRadius: '12px',
                                background: '#0f172a', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            Next: Import Data <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Import Step
    return (
        <div className="onboarding-overlay" style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#f8fafc',
            color: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            overflowY: 'auto'
        }}>
            <div style={{
                maxWidth: '800px', width: '100%', padding: '4rem 2rem',
                display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100vh'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        width: '60px', height: '60px', background: '#e0f2fe', color: '#0284c7',
                        borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                    }}>
                        <Upload size={28} />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Import Your Data</h2>
                    <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>
                        To get started, we need your portfolio data. We currently support <strong>Wealthsimple</strong> CSV exports.
                    </p>
                </div>

                {/* Instructions */}
                <div style={{
                    background: '#fff', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem',
                    border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'flex-start'
                }}>
                    <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '8px' }}><FileText size={20} color="#64748b" /></div>
                    <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>How to find your Wealthsimple CSV</h4>
                        <ol style={{ fontSize: '0.9rem', color: '#64748b', paddingLeft: '1.2rem', lineHeight: 1.6, margin: 0 }}>
                            <li>Log in to Wealthsimple on your desktop.</li>
                            <li>Go to <strong>Documents</strong> (or my.wealthsimple.com/app/docs).</li>
                            <li>Click <strong>Request documents</strong> &rarr; <strong>Holdings report (CSV)</strong>.</li>
                            <li>Wait for the email and download the file.</li>
                        </ol>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* User Upload */}
                    <div style={{
                        border: filesUploaded.user ? '2px solid #10b981' : '2px dashed #cbd5e1',
                        borderRadius: '16px', padding: '2rem', textAlign: 'center',
                        background: filesUploaded.user ? '#ecfdf5' : '#fff',
                        transition: 'all 0.2s', position: 'relative'
                    }}>
                        {filesUploaded.user && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                <CheckCircle size={20} color="#10b981" fill="#ecfdf5" />
                            </div>
                        )}
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your Holdings</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Upload your primary CSV file.</p>

                        <input
                            type="file"
                            id="user-csv"
                            accept=".csv"
                            hidden
                            onChange={(e) => handleFileUpload(e, 'user')}
                        />
                        <label
                            htmlFor="user-csv"
                            className="btn-secondary"
                            style={{
                                padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid #cbd5e1',
                                background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                                display: 'inline-flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            {filesUploaded.user ? 'Replace File' : 'Select File'}
                        </label>
                    </div>

                    {/* Partner Upload */}
                    <div style={{
                        border: filesUploaded.partner ? '2px solid #10b981' : '2px dashed #cbd5e1',
                        borderRadius: '16px', padding: '2rem', textAlign: 'center',
                        background: filesUploaded.partner ? '#ecfdf5' : '#fff',
                        transition: 'all 0.2s', position: 'relative'
                    }}>
                        {filesUploaded.partner && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                <CheckCircle size={20} color="#10b981" fill="#ecfdf5" />
                            </div>
                        )}
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Partner Holdings</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Optional: Merge a second CSV.</p>

                        <input
                            type="file"
                            id="partner-csv"
                            accept=".csv"
                            hidden
                            onChange={(e) => handleFileUpload(e, 'partner')}
                        />
                        <label
                            htmlFor="partner-csv"
                            className="btn-secondary"
                            style={{
                                padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid #cbd5e1',
                                background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                                display: 'inline-flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            {filesUploaded.partner ? <><Plus size={16} /> Add File</> : <><Plus size={16} /> Add File</>}
                        </label>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic' }}>
                        {holdings.length > 0 ? `${holdings.length} positions loaded` : 'No data loaded (you can do this later)'}
                    </div>
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
