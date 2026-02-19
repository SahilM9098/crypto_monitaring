// ─── ONYX TERMINAL · PatternScanner Panel ────────────────
// Displays detected candlestick + chart patterns with confidence scores.
"use client";

import React, { useState } from 'react';
import { Scan } from 'lucide-react';
import { PatternBadge, ConfidenceBar, SectionHeader, TabBar, SignalRow, TrendBadge } from './ui.jsx';

// ── Pattern Card ──────────────────────────────────────────
const PatternCard = ({ pattern }) => {
  const borderColor = {
    BULLISH: 'border-emerald-500/20 bg-emerald-500/4',
    BEARISH: 'border-rose-500/20    bg-rose-500/4',
    NEUTRAL: 'border-amber-500/20   bg-amber-500/4',
  }[pattern.type] ?? 'border-slate-700/30 bg-slate-800/20';

  return (
    <div className={`p-2.5 rounded-lg border transition-colors ${borderColor}`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-[11px] font-bold text-slate-200 leading-tight">{pattern.name}</span>
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {pattern.isChart && (
            <span className="text-[9px] text-slate-600 uppercase tracking-wider">chart</span>
          )}
          <PatternBadge type={pattern.type} />
        </div>
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed mb-1">{pattern.desc}</p>
      <ConfidenceBar value={pattern.confidence} type={pattern.type} />
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <Scan size={20} className="text-slate-700 mb-2" />
    <p className="text-[11px] text-slate-600">No patterns detected</p>
    <p className="text-[10px] text-slate-700 mt-0.5">Scanning last 5 candles…</p>
  </div>
);

// ── Trend Tab ─────────────────────────────────────────────
const TrendTab = ({ trendAnalysis }) => (
  <div className="space-y-2">
    {/* Summary card */}
    <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Composite Signal</span>
        <TrendBadge trend={trendAnalysis.trend} strength={trendAnalysis.strength} />
      </div>
      {/* Strength bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            trendAnalysis.trend?.includes('BULL') ? 'bg-emerald-500' :
            trendAnalysis.trend?.includes('BEAR') ? 'bg-rose-500' : 'bg-amber-400'
          }`}
          style={{ width: `${trendAnalysis.strength}%` }}
        />
      </div>
      {/* Bull/Bear/Neutral count */}
      <div className="flex gap-3 text-[10px]">
        <span className="text-emerald-400">{trendAnalysis.bullCount ?? 0} Bull</span>
        <span className="text-rose-400">{trendAnalysis.bearCount ?? 0} Bear</span>
        <span className="text-amber-400">{trendAnalysis.neutralCount ?? 0} Neutral</span>
      </div>
    </div>

    {/* Individual signals */}
    <div>
      {(trendAnalysis.signals ?? []).map((s, i) => (
        <SignalRow key={i} name={s.name} value={s.value} bull={s.bull} highlight={s.highlight} />
      ))}
    </div>

    {/* Commentary */}
    {trendAnalysis.commentary && (
      <div className="mt-2 p-2.5 bg-slate-800/30 rounded-lg border border-slate-700/20">
        <p className="text-[10px] text-slate-400 leading-relaxed">{trendAnalysis.commentary}</p>
        <div className="mt-1.5 text-[10px] text-slate-600">Momentum: {trendAnalysis.momentum}</div>
      </div>
    )}
  </div>
);

// ── Main Export ───────────────────────────────────────────
const TABS = [
  { label: 'Patterns', value: 'patterns' },
  { label: 'Trend',    value: 'trend'    },
];

export const PatternScannerPanel = ({ patterns = [], trendAnalysis = {} }) => {
  const [tab, setTab] = useState('patterns');

  return (
    <div className="bg-slate-900/40 border border-[#1e3a5f]/50 rounded-lg flex flex-col h-full">
      <SectionHeader icon={Scan} title="Pattern Scanner">
        <TabBar tabs={TABS} active={tab} onChange={setTab} />
      </SectionHeader>

      <div
        className="flex-1 overflow-y-auto p-2.5 space-y-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e3a5f transparent' }}
      >
        {tab === 'patterns' && (
          patterns.length === 0
            ? <EmptyState />
            : patterns.map((p, i) => <PatternCard key={i} pattern={p} />)
        )}
        {tab === 'trend' && <TrendTab trendAnalysis={trendAnalysis} />}
      </div>
    </div>
  );
};
