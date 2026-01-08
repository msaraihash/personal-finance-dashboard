import React, { useState, useEffect } from 'react';
import {
  Settings,
  AlertTriangle,
  Upload,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import { parseWealthsimpleCSV, parseFidelityCSV } from './services/parser';
import { useIPSEngine } from './hooks/useIPSEngine';
import {
  loadHoldings,
  saveHoldings,
  loadIPSState,
  saveIPSState,
  saveSnapshot,
  loadHistory
} from './services/storage';
import { TacticalPanel } from './components/TacticalPanel';
import { IPSConfigModal } from './components/IPSConfigModal';
import { StrategicVisuals } from './components/StrategicVisuals';
import { HistoryView } from './components/HistoryView';
import type { Holding, IPSState, Snapshot } from './types';

// --- Sub-components ---

const ComplianceBanner = ({ compliance }: { compliance: Record<string, boolean> }) => {
  const isHealthy = Object.values(compliance).every(v => v);
  return (
    <div className="glass-card" style={{
      borderColor: isHealthy ? 'hsla(160, 100%, 50%, 0.4)' : 'hsla(350, 100%, 60%, 0.4)',
      background: isHealthy ? 'hsla(160, 100%, 10%, 0.2)' : 'hsla(350, 100%, 10%, 0.2)',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      padding: '1.25rem 2.5rem',
      boxShadow: isHealthy ? '0 0 30px hsla(160, 100%, 50%, 0.05)' : '0 0 30px hsla(350, 100%, 60%, 0.05)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '14px',
        background: isHealthy ? 'hsla(160, 100%, 50%, 0.1)' : 'hsla(350, 100%, 60%, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
      }}>
        {isHealthy ? <ShieldCheck color="#10b981" size={20} /> : <AlertTriangle color="#f43f5e" size={20} />}
      </div>
      <div>
        <h3 style={{ fontSize: '0.9rem', color: isHealthy ? 'var(--accent-green-dark)' : 'var(--accent-red-dark)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {isHealthy ? 'Governance Protocol: Optimal' : 'Governance Warning: Drift Detected'}
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {isHealthy ? 'All concentration and liquidity rules are within acceptable bounds.' : 'One or more portfolio parameters exceed defined safety limits.'}
        </p>
      </div>
    </div >
  );
};

export default function App() {
  const [holdings, setHoldings] = useState<Holding[]>(loadHoldings());
  const [ipsState, setIpsState] = useState<IPSState>(loadIPSState());
  const [history, setHistory] = useState<Snapshot[]>(loadHistory());
  const [usdRate, setUsdRate] = useState(1.40);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'individual' | 'consolidated'>('consolidated');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({
    key: 'valueCAD',
    direction: 'desc'
  });

  // Fetch exchange rate on mount
  useEffect(() => {
    fetch('https://api.frankfurter.app/latest?from=USD&to=CAD')
      .then(res => res.json())
      .then(data => setUsdRate(data.rates.CAD))
      .catch(() => console.log('Forex API fallback to 1.40'));
  }, []);

  // Sync persists
  useEffect(() => {
    saveHoldings(holdings);
    saveIPSState(ipsState);
  }, [holdings, ipsState]);

  const handleSnapshot = () => {
    const snapshot: Snapshot = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      totalNetWorthCAD: metrics.totalNetWorthCAD,
      holdings: JSON.parse(JSON.stringify(holdings)), // Deep copy
      exchangeRate: usdRate
    };
    saveSnapshot(snapshot);
    setHistory(loadHistory());

    // Celebration effect or alert
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => { }); // Fallback if blocked
    alert(`Portfolio Snapshot Captured: $${metrics.totalNetWorthCAD.toLocaleString()} CAD recorded.`);
  };

  const metrics = useIPSEngine(holdings, ipsState, usdRate);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'ws' | 'fid') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newHoldings = type === 'ws' ? parseWealthsimpleCSV(content) : parseFidelityCSV(content);

      const incomingSource = type === 'ws' ? 'Wealthsimple' : 'Fidelity';
      const newAccountKeys = new Set(newHoldings.map(h =>
        h.accountNumber ? `${h.source}-${h.accountNumber}` : `${h.source}-${h.accountName}-${h.accountType}`
      ));

      const otherHoldings = holdings.filter(h => {
        const key = h.accountNumber ? `${h.source}-${h.accountNumber}` : `${h.source}-${h.accountName}-${h.accountType}`;
        return h.source !== incomingSource || !newAccountKeys.has(key);
      });

      setHoldings([...otherHoldings, ...newHoldings]);
    };
    reader.readAsText(file);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const SortHeader = ({ label, sortKey, align = 'left' }: { label: string, sortKey: string, align?: 'left' | 'right' }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <th
        style={{ padding: '1rem', cursor: 'pointer', textAlign: align }}
        onClick={() => handleSort(sortKey)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
          {label}
          {isActive ? (
            sortConfig.direction === 'asc' ? <ChevronUp size={16} color="var(--accent-blue)" /> : <ChevronDown size={16} color="var(--accent-blue)" />
          ) : (
            <div style={{ width: 16 }}></div>
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="container" style={{ paddingBottom: '8rem' }}>
      <header className="navbar" style={{ padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-teal))',
            padding: '10px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(167, 139, 250, 0.3)'
          }}>
            <LayoutDashboard size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', letterSpacing: '-0.02em', fontWeight: 800, color: 'var(--text-primary)' }}>
              MICHAEL & PAM'S JOURNEY
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '4px' }}>Nurturing Our Shared Future</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.75rem', paddingRight: '1rem', borderRight: '1px solid var(--border-color)' }}>
            <input type="file" id="ws-upload" hidden onChange={(e) => handleFileUpload(e, 'ws')} />
            <label htmlFor="ws-upload" className="upload-label" style={{ borderRadius: '14px' }}>
              <Upload size={16} /> Wealthsimple
            </label>

            <input type="file" id="fid-upload" hidden onChange={(e) => handleFileUpload(e, 'fid')} />
            <label htmlFor="fid-upload" className="upload-label" style={{ borderRadius: '14px' }}>
              <Upload size={16} /> Fidelity
            </label>
          </div>

          <button onClick={() => setIsConfigOpen(true)} className="upload-label" style={{ padding: '0.85rem', borderRadius: '14px' }}>
            <Settings size={20} />
          </button>

          <button
            className="btn-primary"
            style={{
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0 1.5rem',
              background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
              color: '#000'
            }}
            onClick={handleSnapshot}
          >
            <Zap size={18} fill="currentColor" /> Snapshot
          </button>
        </div>
      </header>

      <main className="grid-layout stagger-reveal" style={{ marginTop: '0rem' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <StrategicVisuals metrics={metrics} ipsState={ipsState} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <ComplianceBanner compliance={metrics.compliance} />
        </div>

        <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
          <HistoryView history={history} />
        </div>

        <div style={{ gridColumn: '1 / 2' }}>
          <TacticalPanel metrics={metrics} ipsState={ipsState} />
        </div>

        <div className="glass-card" style={{ gridColumn: '2 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.75rem' }}>
              <Sparkles size={28} color="var(--nebula-teal)" /> Household Inventory
            </h3>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '6px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setViewMode('consolidated')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: viewMode === 'consolidated' ? 'white' : 'transparent',
                  color: viewMode === 'consolidated' ? 'black' : 'var(--text-secondary)',
                  transition: 'all 0.3s'
                }}
              >Consolidated</button>
              <button
                onClick={() => setViewMode('individual')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: viewMode === 'individual' ? 'white' : 'transparent',
                  color: viewMode === 'individual' ? 'black' : 'var(--text-secondary)',
                  transition: 'all 0.3s'
                }}
              >Individual</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <SortHeader label="Asset / Ticker" sortKey="ticker" />
                  <SortHeader label="Class" sortKey="assetClass" />
                  <SortHeader label={viewMode === 'consolidated' ? 'Portfolio Segments' : 'Source'} sortKey={viewMode === 'consolidated' ? 'accounts' : 'source'} />
                  <SortHeader label="Native Value" sortKey="marketValue" />
                  <SortHeader label="Value (CAD)" sortKey="valueCAD" align="right" />
                </tr>
              </thead>
              <tbody style={{ verticalAlign: 'middle' }}>
                {(() => {
                  const manualHoldings: Holding[] = [];

                  if (ipsState.manualAssets.propertyValueCAD > 0) {
                    manualHoldings.push({
                      id: 'manual-property',
                      ticker: 'PROPERTY',
                      name: 'Rental Property (Equity)',
                      assetClass: 'Property',
                      source: 'Direct',
                      accountName: 'Direct Ownership',
                      accountType: 'Real Estate',
                      marketValue: ipsState.manualAssets.propertyValueCAD - ipsState.manualAssets.mortgageBalanceCAD,
                      valueCAD: ipsState.manualAssets.propertyValueCAD - ipsState.manualAssets.mortgageBalanceCAD,
                      currency: 'CAD'
                    });
                  }

                  if (ipsState.manualAssets.wsChequingCAD > 0) {
                    manualHoldings.push({
                      id: 'manual-ws-cheq',
                      ticker: 'CASH',
                      name: 'Wealthsimple Chequing',
                      assetClass: 'Cash',
                      source: 'Wealthsimple',
                      accountName: 'Primary Cash',
                      accountType: 'Chequing',
                      marketValue: ipsState.manualAssets.wsChequingCAD,
                      valueCAD: ipsState.manualAssets.wsChequingCAD,
                      currency: 'CAD'
                    });
                  }

                  if (ipsState.manualAssets.rbcUsChequingUSD > 0) {
                    manualHoldings.push({
                      id: 'manual-rbc-us',
                      ticker: 'CASH',
                      name: 'RBC US Cross-Border',
                      assetClass: 'Cash',
                      source: 'Manual',
                      accountName: 'RBC USD',
                      accountType: 'Chequing',
                      marketValue: ipsState.manualAssets.rbcUsChequingUSD,
                      valueCAD: ipsState.manualAssets.rbcUsChequingUSD * usdRate,
                      currency: 'USD'
                    });
                  }

                  if (ipsState.manualAssets.usdHysaAmount > 0) {
                    manualHoldings.push({
                      id: 'manual-hysa',
                      ticker: 'HYSA',
                      name: 'USD High Yield Savings',
                      assetClass: 'Cash',
                      source: 'Manual',
                      accountName: 'USD Savings',
                      accountType: 'Cash',
                      marketValue: ipsState.manualAssets.usdHysaAmount,
                      valueCAD: ipsState.manualAssets.usdHysaAmount * usdRate,
                      currency: 'USD'
                    });
                  }

                  if (ipsState.manualAssets.spouseMutualFundCAD > 0) {
                    manualHoldings.push({
                      id: 'manual-spouse-mf',
                      ticker: 'MFUND',
                      name: 'Employer Mutual Fund',
                      assetClass: 'MutualFund',
                      source: 'Manual',
                      accountName: 'Pam/Spouse',
                      accountType: 'Investment',
                      marketValue: ipsState.manualAssets.spouseMutualFundCAD,
                      valueCAD: ipsState.manualAssets.spouseMutualFundCAD,
                      currency: 'CAD'
                    });
                  }

                  const combined: (Holding & { accounts?: string; sources?: string })[] = [...(viewMode === 'consolidated' ? metrics.consolidatedHoldings : holdings), ...manualHoldings];

                  return combined
                    .sort((a, b) => {
                      const aVal = (a as any)[sortConfig.key] || (sortConfig.key === 'valueCAD' ? (a.currency === 'USD' ? a.marketValue * usdRate : a.marketValue) : 0);
                      const bVal = (b as any)[sortConfig.key] || (sortConfig.key === 'valueCAD' ? (b.currency === 'USD' ? b.marketValue * usdRate : b.marketValue) : 0);

                      if (typeof aVal === 'string') {
                        return sortConfig.direction === 'asc'
                          ? aVal.localeCompare(bVal)
                          : bVal.localeCompare(aVal);
                      }
                      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
                    })
                    .map((h, idx) => {
                      // @ts-ignore - valueCAD might be on consolidated but not base Holding
                      const valueCAD = h.valueCAD || (h.currency === 'USD' ? h.marketValue * usdRate : h.marketValue);
                      const isPam = h.accountName?.toLowerCase().includes('pam') || h.accountName?.toLowerCase().includes('spouse');

                      return (
                        <tr key={h.id || idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', background: isPam ? '#fff1f2' : 'transparent' }}>
                          <td style={{ padding: '1.5rem 1rem' }}>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{h.ticker}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '300px' }}>{h.name}</div>
                          </td>
                          <td>
                            <span className="status-badge" style={{
                              background: h.assetClass === 'Equity' ? 'hsla(180, 70%, 50%, 0.1)' : h.assetClass === 'Cash' ? 'hsla(160, 100%, 50%, 0.1)' : 'hsla(240, 10%, 100%, 0.05)',
                              color: h.assetClass === 'Equity' ? 'var(--nebula-teal)' : h.assetClass === 'Cash' ? '#34d399' : 'var(--text-secondary)',
                              fontSize: '0.6rem',
                              border: `1px solid ${h.assetClass === 'Equity' ? 'hsla(180, 70%, 50%, 0.2)' : 'transparent'}`
                            }}>
                              {h.assetClass}
                            </span>
                          </td>
                          <td style={{ padding: '1.5rem 1rem', color: isPam ? 'var(--nebula-pink)' : 'var(--text-secondary)', fontWeight: isPam ? 800 : 500, fontStyle: isPam ? 'italic' : 'normal' }} title={viewMode === 'consolidated' ? h.accounts : h.accountName}>
                            {viewMode === 'consolidated' ? h.accounts : `${h.source} · ${h.accountName}`}
                          </td>
                          <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{h.marketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{h.currency}</span></td>
                          <td style={{ textAlign: 'right', padding: '1.5rem 1rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontSize: '1.1rem' }}>
                            ${Math.round(valueCAD).toLocaleString()}
                          </td>
                        </tr>
                      )
                    })
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <IPSConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        ipsState={ipsState}
        setIpsState={setIpsState}
        usdRate={usdRate}
        setUsdRate={setUsdRate}
        holdings={holdings}
        setHoldings={setHoldings}
        history={history}
        setHistory={setHistory}
      />
    </div>
  );
}
