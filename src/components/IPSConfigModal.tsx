import { Settings, X, Home, Landmark, CreditCard, Trash2, Database, History } from 'lucide-react';
import type { IPSState, Holding, Snapshot } from '../types';

const FormattedInput = ({ label, value, onChange, prefix = "" }: { label: string, value: number, onChange: (val: number) => void, prefix?: string }) => {
    return (
        <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{label}</label>
            <div style={{ position: 'relative' }}>
                {prefix && <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{prefix}</span>}
                <input
                    style={{
                        width: '100%',
                        background: 'white',
                        border: '1px solid var(--border-color)',
                        borderRadius: '14px',
                        padding: '1rem',
                        paddingLeft: prefix ? '2.5rem' : '1rem',
                        textAlign: 'left',
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                        fontFamily: 'Outfit, sans-serif'
                    }}
                    type="text"
                    value={value === 0 ? "" : value.toLocaleString()}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/,/g, '');
                        const num = parseFloat(raw);
                        if (!isNaN(num) || raw === "") {
                            onChange(num || 0);
                        }
                    }}
                    placeholder="0"
                />
            </div>
        </div>
    );
};

interface IPSConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    ipsState: IPSState;
    setIpsState: (s: IPSState) => void;
    usdRate: number;
    setUsdRate: (r: number) => void;
    holdings: Holding[];
    setHoldings: (h: Holding[]) => void;
    history: Snapshot[];
    setHistory: (h: Snapshot[]) => void;
}

export const IPSConfigModal = ({
    isOpen,
    onClose,
    ipsState,
    setIpsState,
    usdRate,
    setUsdRate,
    holdings,
    setHoldings,
    history,
    setHistory
}: IPSConfigModalProps) => {
    if (!isOpen) return null;

    const handleChange = (field: string, value: number) => {
        if (field.startsWith('manual.')) {
            const key = field.split('.')[1];
            setIpsState({
                ...ipsState,
                manualAssets: { ...ipsState.manualAssets, [key]: value }
            });
        } else {
            setIpsState({ ...ipsState, [field]: value });
        }
    };

    const uniqueAccounts = Array.from(new Set(holdings.map(h =>
        JSON.stringify({ source: h.source, name: h.accountName, type: h.accountType, number: h.accountNumber })
    ))).map(str => JSON.parse(str));

    const removeAccount = (source: string, name: string, number?: string) => {
        if (confirm(`Are you sure you want to remove all data for ${source} (${name})?`)) {
            setHoldings(holdings.filter(h =>
                h.source !== source || h.accountName !== name || h.accountNumber !== number
            ));
        }
    };

    const clearAllData = () => {
        if (confirm('FRESH START: Are you sure you want to wipe ALL uploaded holdings? Your manual property and cash values will remain.')) {
            setHoldings([]);
        }
    };

    const clearHistory = () => {
        if (confirm('Are you sure you want to clear your snapshot history? This cannot be undone.')) {
            setHistory([]);
            localStorage.setItem('pfd_history', JSON.stringify([]));
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '3rem', border: '1px solid white', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '3rem' }}>
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '2rem', color: 'var(--text-primary)' }}>
                            <Settings size={32} className="text-blue-400" /> Values & Configuration
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', marginLeft: '3.5rem' }}>Configure baseline assets and manage your data sources.</p>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.75rem', borderRadius: '50%', transition: 'all 0.2s' }}><X size={24} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {/* Data Management Section */}
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h4 style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                <Database size={16} /> Data Sources & Audit
                            </h4>
                            <button
                                onClick={clearHistory}
                                style={{ background: 'hsla(240, 10%, 100%, 0.05)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: 600 }}
                            >
                                <History size={14} /> Clear History ({history.length})
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                            {uniqueAccounts.length === 0 ? (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem', fontStyle: 'italic' }}>No data sources uploaded yet.</p>
                            ) : (
                                uniqueAccounts.map((acc, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>{acc.source}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                {acc.name} {acc.number ? `· ${acc.number}` : ''}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeAccount(acc.source, acc.name, acc.number)}
                                            style={{ color: 'var(--accent-red)', opacity: 0.7, cursor: 'pointer', background: 'hsla(350, 100%, 60%, 0.1)', border: 'none', padding: '8px', borderRadius: '8px' }}
                                            title="Remove source"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}

                            {uniqueAccounts.length > 0 && (
                                <button
                                    onClick={clearAllData}
                                    style={{
                                        marginTop: '1rem',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '1px dashed #fca5a5',
                                        background: '#fef2f2',
                                        color: '#ef4444',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        width: '100%',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}
                                >
                                    ⚠️ Fresh Start (Wipe Data)
                                </button>
                            )}
                        </div>
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Real Estate Section */}
                        <section style={{ padding: '2rem', background: '#fff', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <h4 style={{ marginBottom: '1.5rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                <Home size={18} /> Rental Property
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <FormattedInput label="Property Value (CAD)" value={ipsState.manualAssets.propertyValueCAD} onChange={(v) => handleChange('manual.propertyValueCAD', v)} prefix="$" />
                                <FormattedInput label="Mortgage Balance (CAD)" value={ipsState.manualAssets.mortgageBalanceCAD} onChange={(v) => handleChange('manual.mortgageBalanceCAD', v)} prefix="$" />
                            </div>
                        </section>

                        {/* Liquid Assets Section */}
                        <section style={{ padding: '2rem', background: '#fff', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <h4 style={{ marginBottom: '1.5rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                <CreditCard size={18} /> Liquid Accounts
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <FormattedInput label="Ws Chequing (CAD)" value={ipsState.manualAssets.wsChequingCAD} onChange={(v) => handleChange('manual.wsChequingCAD', v)} prefix="$" />
                                <FormattedInput label="RBC US Bank (USD)" value={ipsState.manualAssets.rbcUsChequingUSD} onChange={(v) => handleChange('manual.rbcUsChequingUSD', v)} prefix="$" />
                            </div>
                        </section>
                    </div>

                    {/* Savings & FX Section */}
                    <section style={{ padding: '2rem', background: '#fff', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ marginBottom: '1.5rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            <Landmark size={18} /> Savings & Conversion
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                            <FormattedInput label="USD HYSA (USD)" value={ipsState.manualAssets.usdHysaAmount} onChange={(v) => handleChange('manual.usdHysaAmount', v)} prefix="$" />
                            <FormattedInput label="Spouse MF (CAD)" value={ipsState.manualAssets.spouseMutualFundCAD} onChange={(v) => handleChange('manual.spouseMutualFundCAD', v)} prefix="$" />
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>USD/CAD Rate</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}
                                        type="number"
                                        step="0.0001"
                                        value={usdRate}
                                        onChange={(e) => setUsdRate(parseFloat(e.target.value) || 0)}
                                    />
                                    <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', color: 'var(--accent-blue)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auto-Fetched</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button className="btn-primary" onClick={onClose} style={{ flex: 1, padding: '1.25rem', fontSize: '1rem' }}>
                            Apply Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
