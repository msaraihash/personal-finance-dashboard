/**
 * CoachPanel Component
 * 
 * AI-powered coaching panel for the Remix Studio.
 * Displays philosophy alignment analysis with streaming-style reveals.
 */

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Target, Lightbulb } from 'lucide-react';
import type { CoachResponse } from '../../types/Coach';
import type { PhilosophyMatch } from '../../types/scoring';

interface CoachPanelProps {
    topPhilosophies: PhilosophyMatch[];
    onAnalyze: (philosophyId: string) => Promise<void>;
    response: CoachResponse | null;
    isLoading: boolean;
    error: string | null;
    currentPhilosophyId: string | null;
}

export const CoachPanel = ({
    topPhilosophies,
    onAnalyze,
    response,
    isLoading,
    error,
    currentPhilosophyId,
}: CoachPanelProps) => {
    const [selectedPhilosophy, setSelectedPhilosophy] = useState<string>(
        topPhilosophies[0]?.id || ''
    );
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['alignment']));

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) next.delete(section);
            else next.add(section);
            return next;
        });
    };

    const handleAnalyze = () => {
        if (selectedPhilosophy) {
            onAnalyze(selectedPhilosophy);
            setExpandedSections(new Set(['alignment', 'actions', 'insight']));
        }
    };

    const selectedName = topPhilosophies.find(p => p.id === selectedPhilosophy)?.displayName || selectedPhilosophy;

    return (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Sparkles size={20} style={{ color: 'var(--nebula-purple)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>AI Coach</h3>
                <span style={{
                    fontSize: '0.65rem',
                    background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-teal))',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    color: 'white',
                    fontWeight: 600,
                }}>
                    BETA
                </span>
            </div>

            {/* Philosophy Selector */}
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                    Compare your portfolio to:
                </label>
                <select
                    value={selectedPhilosophy}
                    onChange={(e) => setSelectedPhilosophy(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                    }}
                >
                    {topPhilosophies.map(p => (
                        <option key={p.id} value={p.id} style={{ background: 'var(--card-bg)' }}>
                            {p.displayName} (Score: {p.score})
                        </option>
                    ))}
                </select>
            </div>

            {/* Analyze Button */}
            <button
                onClick={handleAnalyze}
                disabled={isLoading || !selectedPhilosophy}
                style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '10px',
                    background: isLoading
                        ? 'var(--text-secondary)'
                        : 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-teal))',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                }}
            >
                {isLoading ? (
                    <>
                        <span className="loading-spinner" style={{ width: 16, height: 16 }} />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Sparkles size={16} />
                        Analyze Alignment
                    </>
                )}
            </button>

            {/* Error State */}
            {error && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}>
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {/* Response Display */}
            {response && currentPhilosophyId === selectedPhilosophy && (
                <div style={{ marginTop: '1.5rem' }}>

                    {/* Alignment Section */}
                    <Section
                        title="Alignment"
                        icon={<Target size={14} />}
                        isExpanded={expandedSections.has('alignment')}
                        onToggle={() => toggleSection('alignment')}
                    >
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 900,
                                    background: getScoreGradient(response.alignment.score),
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    {response.alignment.score}%
                                </div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                    alignment with {selectedName}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                {response.alignment.summary}
                            </p>
                        </div>

                        {/* Strengths */}
                        {response.alignment.strengths.length > 0 && (
                            <div style={{ marginBottom: '0.75rem' }}>
                                <h5 style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    ✅ Strengths
                                </h5>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                    {response.alignment.strengths.map((s, i) => (
                                        <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Gaps */}
                        {response.alignment.gaps.length > 0 && (
                            <div>
                                <h5 style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    🎯 Opportunities
                                </h5>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                    {response.alignment.gaps.map((g, i) => (
                                        <li key={i} style={{ marginBottom: '0.25rem' }}>{g}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Section>

                    {/* Action Plan Section */}
                    {response.actionPlan.length > 0 && (
                        <Section
                            title="Action Plan"
                            icon={<CheckCircle size={14} />}
                            isExpanded={expandedSections.has('actions')}
                            onToggle={() => toggleSection('actions')}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {response.actionPlan.map((action, i) => (
                                    <div key={i} style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border-color)',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {action.step}
                                            </span>
                                            <span style={{
                                                fontSize: '0.6rem',
                                                padding: '0.15rem 0.4rem',
                                                borderRadius: '4px',
                                                background: getImpactColor(action.impact),
                                                color: 'white',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                            }}>
                                                {action.impact}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                                            {action.rationale}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Philosophy Insight Section */}
                    <Section
                        title="Learn More"
                        icon={<Lightbulb size={14} />}
                        isExpanded={expandedSections.has('insight')}
                        onToggle={() => toggleSection('insight')}
                    >
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                            {response.philosophyInsight}
                        </p>
                    </Section>

                    {/* Disclaimer */}
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.02)',
                        fontSize: '0.65rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        fontStyle: 'italic',
                    }}>
                        {response.disclaimer}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Components

interface SectionProps {
    title: string;
    icon: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

const Section = ({ title, icon, isExpanded, onToggle, children }: SectionProps) => (
    <div style={{ marginBottom: '0.75rem' }}>
        <button
            onClick={onToggle}
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-color)',
            }}
        >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                {icon}
                {title}
            </span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {isExpanded && (
            <div style={{ padding: '0.75rem 0', animation: 'fadeIn 0.2s ease-out' }}>
                {children}
            </div>
        )}
    </div>
);

// Helpers

function getScoreGradient(score: number): string {
    if (score >= 75) return 'linear-gradient(135deg, #10b981, #3b82f6)';
    if (score >= 50) return 'linear-gradient(135deg, #f59e0b, #10b981)';
    return 'linear-gradient(135deg, #ef4444, #f59e0b)';
}

function getImpactColor(impact: 'high' | 'medium' | 'low'): string {
    switch (impact) {
        case 'high': return '#10b981';
        case 'medium': return '#f59e0b';
        case 'low': return '#6b7280';
    }
}
