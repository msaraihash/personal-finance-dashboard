import React, { useState, useEffect } from 'react';
import {
  Settings,
  Upload,
  ChevronUp,
  ChevronDown,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { parseWealthsimpleCSV } from './services/parser';
import { useIPSEngine } from './hooks/useIPSEngine';
import { extractFeatures } from './services/featureExtractor';
import { usePhilosophyEngine } from './hooks/usePhilosophyEngine';
import {
  loadHoldings,
  saveHoldings,
  loadIPSState,
  saveIPSState,
  loadOnboardingState,
  saveOnboardingState,
  loadFinancialGoals,
  saveFinancialGoals,
  type OnboardingState
} from './services/storage';
import type { FinancialGoals } from './types/FinancialGoals';
import { OnboardingWizard } from './components/OnboardingWizard';
import { IPSConfigModal } from './components/IPSConfigModal';

import { PhilosophyEngineView } from './components/PhilosophyEngineView';
import type { Holding, IPSState } from './types';
import { RemixStudio } from './components/RemixStudio/RemixStudio';

// --- Sub-components ---



const SortHeader = (
  { label, sortKey, align = 'left', sortConfig, onSort }:
    { label: string, sortKey: string, align?: 'left' | 'right', sortConfig: { key: string, direction: 'asc' | 'desc' }, onSort: (key: string) => void }
) => {
  const isActive = sortConfig.key === sortKey;
  return (
    <th
      style={{ padding: '1rem', cursor: 'pointer', textAlign: align }}
      onClick={() => onSort(sortKey)}
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

export default function App() {
  const [holdings, setHoldings] = useState<Holding[]>(loadHoldings());
  const [ipsState, setIpsState] = useState<IPSState>(loadIPSState());
  const [usdRate, setUsdRate] = useState(1.40);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isRemixOpen, setIsRemixOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'individual' | 'consolidated'>('consolidated');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({
    key: 'valueCAD',
    direction: 'desc'
  });

  const [onboardingState, setOnboardingState] = useState(loadOnboardingState());
  const [financialGoals, setFinancialGoals] = useState<FinancialGoals>(loadFinancialGoals());

  const handleOnboardingComplete = (state: OnboardingState) => {
    saveOnboardingState(state);
    setOnboardingState(state);
  };

  const handleFinancialGoalsSet = (goals: FinancialGoals) => {
    saveFinancialGoals(goals);
    setFinancialGoals(goals);
  };

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



  const metrics = useIPSEngine(holdings, ipsState, usdRate);

  // Philosophy Engine Integration
  const portfolioFeatures = React.useMemo(() => {
    if (holdings.length === 0 && ipsState.manualAssets.length === 0) return null;
    return extractFeatures(holdings, ipsState.manualAssets, usdRate);
  }, [holdings, ipsState.manualAssets, usdRate]);
  const complianceResult = usePhilosophyEngine(portfolioFeatures);

  if (!onboardingState.isComplete) {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        onHoldingsLoaded={(newHoldings) => setHoldings(newHoldings)}
        onFinancialGoalsSet={handleFinancialGoalsSet}
      />
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newHoldings = parseWealthsimpleCSV(content);

      const incomingSource = 'Wealthsimple';
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



  const handleResetOnboarding = () => {
    const newState: OnboardingState = { isComplete: false };
    saveOnboardingState(newState);
    setOnboardingState(newState);
    setIsConfigOpen(false);
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
              INVESTMENT DASHBOARD
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '4px' }}>Private • Secure • Local</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.75rem', paddingRight: '1rem', borderRight: '1px solid var(--border-color)' }}>
            <input type="file" id="ws-upload" hidden onChange={(e) => handleFileUpload(e)} />
            <label htmlFor="ws-upload" className="upload-label" style={{ borderRadius: '14px' }}>
              <Upload size={16} /> Wealthsimple
            </label>
          </div>

          <button onClick={() => setIsConfigOpen(true)} className="upload-label" style={{ padding: '0.85rem', borderRadius: '14px' }}>
            <Settings size={20} />
          </button>



          <button
            className="btn-secondary"
            style={{
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0 1.5rem',
              background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '14px', // Match other buttons
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
            }}
            onClick={() => setIsRemixOpen(true)}
          >
            <Sparkles size={18} fill="currentColor" /> Remix
          </button>
        </div>
      </header>

      {isRemixOpen ? (
        <RemixStudio
          holdings={holdings}
          manualAssets={ipsState.manualAssets}
          goals={financialGoals}
          usdRate={usdRate}
          onClose={() => setIsRemixOpen(false)}
        />
      ) : (
        <main className="grid-layout stagger-reveal" style={{ marginTop: '0rem' }}>


          {/* Phase 5: Philosophy Engine View */}
          <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
            <PhilosophyEngineView
              complianceResult={complianceResult}
              netWorthCAD={metrics.totalNetWorthCAD}
              financialGoals={financialGoals}
            />
          </div>



          <div className="glass-card" style={{
            gridColumn: '1 / -1',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            border: '1px solid rgba(255,255,255,0.9)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative gradient orb */}
            <div style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, hsla(180, 70%, 80%, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            {/* Hero Section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              marginBottom: '2rem',
              position: 'relative',
              zIndex: 1
            }}>
              {/* Top row: Title + Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, var(--nebula-teal), var(--nebula-purple))',
                    padding: '10px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sparkles size={20} color="white" />
                  </div>
                  Portfolio Holdings
                </h3>
                <div style={{ display: 'flex', background: 'rgba(241,245,249,0.8)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => setViewMode('consolidated')}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: viewMode === 'consolidated' ? 'white' : 'transparent',
                      color: viewMode === 'consolidated' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      boxShadow: viewMode === 'consolidated' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >Merged</button>
                  <button
                    onClick={() => setViewMode('individual')}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: viewMode === 'individual' ? 'white' : 'transparent',
                      color: viewMode === 'individual' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      boxShadow: viewMode === 'individual' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >By Account</button>
                </div>
              </div>

              {/* Hero Metrics Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                padding: '1.25rem',
                background: 'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(153,246,228,0.08) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(167,139,250,0.15)'
              }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Total Value</div>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    fontFamily: 'Outfit, sans-serif',
                    background: 'linear-gradient(135deg, var(--nebula-purple-dark), var(--nebula-teal-dark))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    ${metrics.totalNetWorthCAD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>CAD</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Positions</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {(viewMode === 'consolidated' ? metrics.consolidatedHoldings.length : holdings.length) + ipsState.manualAssets.length}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>holdings</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Asset Mix</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--nebula-teal-dark)' }}>
                    {Math.round(metrics.equityPercent)}%
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>equity</div>
                </div>
              </div>
            </div>

            {/* Holdings Table/List */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <SortHeader label="Asset" sortKey="ticker" sortConfig={sortConfig} onSort={handleSort} />
                    <SortHeader label="Type" sortKey="assetClass" sortConfig={sortConfig} onSort={handleSort} />
                    <SortHeader label={viewMode === 'consolidated' ? 'Accounts' : 'Source'} sortKey={viewMode === 'consolidated' ? 'accounts' : 'source'} sortConfig={sortConfig} onSort={handleSort} />
                    <SortHeader label="Amount" sortKey="marketValue" sortConfig={sortConfig} onSort={handleSort} />
                    <SortHeader label="CAD Value" sortKey="valueCAD" align="right" sortConfig={sortConfig} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody style={{ verticalAlign: 'middle' }}>
                  {(() => {
                    const manualHoldings: Holding[] = ipsState.manualAssets.map(asset => ({
                      id: asset.id,
                      ticker: '💎',
                      name: asset.name,
                      assetClass: asset.assetClass,
                      source: 'Manual',
                      accountName: 'Manual Entry',
                      accountType: 'Asset',
                      marketValue: asset.value,
                      valueCAD: asset.currency === 'USD' ? asset.value * usdRate : asset.value,
                      currency: asset.currency
                    }));

                    const combined: (Holding & { accounts?: string; sources?: string })[] = [...(viewMode === 'consolidated' ? metrics.consolidatedHoldings : holdings), ...manualHoldings];

                    return combined
                      .sort((a, b) => {
                        const aVal = (a as unknown as Record<string, string | number>)[sortConfig.key] || (sortConfig.key === 'valueCAD' ? (a.currency === 'USD' ? a.marketValue * usdRate : a.marketValue) : 0);
                        const bVal = (b as unknown as Record<string, string | number>)[sortConfig.key] || (sortConfig.key === 'valueCAD' ? (b.currency === 'USD' ? b.marketValue * usdRate : b.marketValue) : 0);

                        if (typeof aVal === 'string' && typeof bVal === 'string') {
                          return sortConfig.direction === 'asc'
                            ? aVal.localeCompare(bVal)
                            : bVal.localeCompare(aVal);
                        }
                        // @ts-expect-error - mixed types sorting
                        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
                      })
                      .map((h, idx) => {
                        const valueCAD = (h as { valueCAD?: number }).valueCAD || (h.currency === 'USD' ? h.marketValue * usdRate : h.marketValue);
                        const isPam = h.accountName?.toLowerCase().includes('pam') || h.accountName?.toLowerCase().includes('spouse');
                        const isTopHolding = idx < 3;

                        return (
                          <tr key={h.id || idx} style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'all 0.2s',
                            background: isPam ? 'rgba(251,207,232,0.15)' : isTopHolding ? 'rgba(167,139,250,0.03)' : 'transparent'
                          }}>
                            <td style={{ padding: '1.25rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '10px',
                                  background: h.assetClass === 'Equity'
                                    ? 'linear-gradient(135deg, #99f6e4, #5eead4)'
                                    : h.assetClass === 'Cash'
                                      ? 'linear-gradient(135deg, #86efac, #4ade80)'
                                      : h.assetClass === 'Property'
                                        ? 'linear-gradient(135deg, #fde68a, #fbbf24)'
                                        : 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  color: 'white',
                                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                  flexShrink: 0
                                }}>
                                  {h.ticker === '💎' ? '💎' : h.ticker.slice(0, 3)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{h.ticker === '💎' ? h.name : h.ticker}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.ticker === '💎' ? 'Manual Asset' : h.name}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                background: h.assetClass === 'Equity' ? 'rgba(20, 184, 166, 0.1)' : h.assetClass === 'Cash' ? 'rgba(34, 197, 94, 0.1)' : h.assetClass === 'Property' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                color: h.assetClass === 'Equity' ? '#0d9488' : h.assetClass === 'Cash' ? '#16a34a' : h.assetClass === 'Property' ? '#d97706' : 'var(--text-secondary)'
                              }}>
                                {h.assetClass}
                              </span>
                            </td>
                            <td style={{ padding: '1.25rem 1rem', color: isPam ? '#ec4899' : 'var(--text-secondary)', fontWeight: isPam ? 700 : 400, fontSize: '0.8rem' }} title={viewMode === 'consolidated' ? h.accounts : h.accountName}>
                              {viewMode === 'consolidated' ? h.accounts : `${h.source} · ${h.accountName}`}
                            </td>
                            <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500, fontSize: '0.85rem' }}>
                              {h.marketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              <span style={{ fontSize: '0.65rem', opacity: 0.5, marginLeft: '4px' }}>{h.currency}</span>
                            </td>
                            <td style={{ textAlign: 'right', padding: '1.25rem 1rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
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
      )}

      <IPSConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        ipsState={ipsState}
        setIpsState={setIpsState}
        usdRate={usdRate}
        setUsdRate={setUsdRate}
        holdings={holdings}
        setHoldings={setHoldings}
        onResetOnboarding={handleResetOnboarding}
        financialGoals={financialGoals}
        setFinancialGoals={handleFinancialGoalsSet}
      />
    </div>
  );
}
