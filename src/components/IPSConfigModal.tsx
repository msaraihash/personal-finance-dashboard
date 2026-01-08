import { useState } from 'react';
import { Settings, X, Trash2, Plus, DollarSign, Wallet } from 'lucide-react';
import type { IPSState, Holding, Snapshot, AssetClass, Currency } from '../types';
import type { ManualAsset } from '../types/Assets';

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
    onResetOnboarding: () => void;
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
    setHistory,
    onResetOnboarding
}: IPSConfigModalProps) => {
    const [newAsset, setNewAsset] = useState<Partial<ManualAsset>>({
        currency: 'CAD',
        assetClass: 'Cash',
        name: '',
        value: 0
    });

    if (!isOpen) return null;

    const addAsset = () => {
        if (!newAsset.name || newAsset.value === undefined) return;
        const asset: ManualAsset = {
            id: crypto.randomUUID(),
            name: newAsset.name,
            value: newAsset.value,
            currency: newAsset.currency as Currency,
            assetClass: newAsset.assetClass as AssetClass
        };

        setIpsState({
            ...ipsState,
            manualAssets: [...ipsState.manualAssets, asset]
        });
        setNewAsset({ currency: 'CAD', assetClass: 'Cash', name: '', value: 0 });
    };

    const removeAsset = (id: string) => {
        setIpsState({
            ...ipsState,
            manualAssets: ipsState.manualAssets.filter(a => a.id !== id)
        });
    };

    const removeAccount = (source: string, name: string, number?: string) => {
        if (confirm(`Are you sure you want to remove all data for ${source} (${name})?`)) {
            setHoldings(holdings.filter(h =>
                h.source !== source || h.accountName !== name || h.accountNumber !== number
            ));
        }
    };

    const clearHistory = () => {
        if (confirm('Are you sure you want to clear your snapshot history? This cannot be undone.')) {
            setHistory([]);
            localStorage.setItem('pfd_history', JSON.stringify([]));
        }
    };

    const uniqueAccounts = Array.from(new Set(holdings.map(h =>
        JSON.stringify({ source: h.source, name: h.accountName, type: h.accountType, number: h.accountNumber })
    ))).map(str => JSON.parse(str));

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', border: '1px solid white', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.75rem', color: 'var(--text-primary)' }}>
                            <Settings size={28} className="text-blue-400" /> Configuration
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', marginLeft: '3rem' }}>Manage your data sources and manual assets.</p>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.75rem', borderRadius: '50%', transition: 'all 0.2s' }}><X size={24} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Left Column: Data Sources */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <section>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                <Wallet size={16} /> Connected Accounts
                            </h4>
                            <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1rem', minHeight: '150px' }}>
                                {uniqueAccounts.length === 0 ? (
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem', fontStyle: 'italic' }}>No CSV data uploaded.</p>
                                ) : (
                                    uniqueAccounts.map((acc, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'white', borderRadius: '10px', marginBottom: '0.5rem', border: '1px solid var(--border-color)' }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{acc.source}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{acc.name}</div>
                                            </div>
                                            <button onClick={() => removeAccount(acc.source, acc.name, acc.number)} style={{ color: 'var(--accent-red)', border: 'none', background: 'transparent', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <section>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                <DollarSign size={16} /> Global Settings
                            </h4>
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', marginBottom: '0.5rem', fontWeight: 700 }}>USD/CAD Rate</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={usdRate}
                                    onChange={(e) => setUsdRate(parseFloat(e.target.value) || 0)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                                />
                                <button onClick={clearHistory} style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', background: '#fef2f2', color: '#dc2626', border: '1px dashed #fca5a5', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                                    Clear History Snapshots
                                </button>
                                <button onClick={onResetOnboarding} style={{ marginTop: '0.5rem', width: '100%', padding: '0.75rem', background: '#f0f9ff', color: '#0ea5e9', border: '1px dashed #7dd3fc', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                                    Restart Onboarding Wizard
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Manual Assets */}
                    <section style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
                            <Plus size={16} /> Manual Assets (Real Estate, Cash, etc.)
                        </h4>

                        {/* List */}
                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {ipsState.manualAssets.map(asset => (
                                <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{asset.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {asset.currency === 'USD' ? 'USD' : 'CAD'} · <span style={{ textTransform: 'uppercase', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{asset.assetClass}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{asset.value.toLocaleString()}</div>
                                        <button onClick={() => removeAsset(asset.id)} style={{ color: '#faa', border: 'none', background: 'transparent', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Form */}
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <input
                                    placeholder="Asset Name (e.g. Condo)"
                                    value={newAsset.name}
                                    onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                                    style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Value"
                                    value={newAsset.value || ''}
                                    onChange={e => setNewAsset({ ...newAsset, value: parseFloat(e.target.value) || 0 })}
                                    style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <select
                                    value={newAsset.currency}
                                    onChange={e => setNewAsset({ ...newAsset, currency: e.target.value as Currency })}
                                    style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                                >
                                    <option value="CAD">CAD</option>
                                    <option value="USD">USD</option>
                                </select>
                                <select
                                    value={newAsset.assetClass}
                                    onChange={e => setNewAsset({ ...newAsset, assetClass: e.target.value as AssetClass })}
                                    style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', gridColumn: '2 / 4' }}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Property">Property</option>
                                    <option value="Equity">Equity</option>
                                    <option value="FixedIncome">Fixed Income</option>
                                    <option value="Speculative">Speculative</option>
                                    <option value="MutualFund">Mutual Fund</option>
                                </select>
                            </div>
                            <button
                                onClick={addAsset}
                                disabled={!newAsset.name || !newAsset.value}
                                style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', background: (!newAsset.name || !newAsset.value) ? '#e2e8f0' : 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: (!newAsset.name || !newAsset.value) ? 'not-allowed' : 'pointer' }}
                            >
                                Add Manual Asset
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
