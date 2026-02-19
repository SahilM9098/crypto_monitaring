// ─── ONYX TERMINAL · UI Primitives ───────────────────────
// Small, reusable display components shared across panels.

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

// ── TrendBadge ─────────────────────────────────────────────
const TREND_CFG = {
  STRONG_BULL:   { cls: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300', dot: 'bg-emerald-400' },
  BULLISH:       { cls: 'bg-emerald-500/12 border-emerald-500/35 text-emerald-400', dot: 'bg-emerald-500' },
  CONSOLIDATING: { cls: 'bg-amber-500/12  border-amber-500/35  text-amber-400',    dot: 'bg-amber-400'   },
  BEARISH:       { cls: 'bg-rose-500/12   border-rose-500/35   text-rose-400',     dot: 'bg-rose-500'    },
  STRONG_BEAR:   { cls: 'bg-rose-500/20   border-rose-400/50   text-rose-300',     dot: 'bg-rose-400'    },
  LOADING:       { cls: 'bg-slate-800/60  border-slate-700/40  text-slate-500',    dot: 'bg-slate-500'   },
};

export const TrendBadge = ({ trend, strength, size = 'sm' }) => {
  const cfg  = TREND_CFG[trend] || TREND_CFG.LOADING;
  const text = size === 'lg' ? 'text-xs' : 'text-[10px]';
  const px   = size === 'lg' ? 'px-3 py-1.5' : 'px-2 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-bold tracking-widest uppercase ${text} ${px} ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {(trend ?? 'LOADING').replace('_', ' ')}
      {strength > 0 && <span className="opacity-50 font-normal">· {strength}%</span>}
    </span>
  );
};

// ── PatternBadge ───────────────────────────────────────────
const PATTERN_CFG = {
  BULLISH: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  BEARISH: 'text-rose-400    bg-rose-500/10    border-rose-500/30',
  NEUTRAL: 'text-amber-400   bg-amber-500/10   border-amber-500/30',
};

export const PatternBadge = ({ type }) => (
  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${PATTERN_CFG[type] ?? PATTERN_CFG.NEUTRAL}`}>
    {type}
  </span>
);

// ── SignalRow ──────────────────────────────────────────────
export const SignalRow = ({ name, value, bull, highlight }) => (
  <div className={`flex justify-between items-center py-1.5 border-b border-slate-800/40 last:border-0 ${highlight ? 'bg-cyan-500/5 -mx-2 px-2 rounded' : ''}`}>
    <span className="text-[10px] text-slate-500">{name}</span>
    <span className={`text-[10px] font-mono font-semibold ${
      bull === true  ? 'text-emerald-400' :
      bull === false ? 'text-rose-400' :
      'text-amber-400'
    }`}>{value}</span>
  </div>
);

// ── StatCard ───────────────────────────────────────────────
export const StatCard = ({ label, value, delta, deltaUp, icon: Icon, accentClass = 'text-cyan-400' }) => (
  <div className="bg-slate-900/40 border border-[#1e3a5f]/40 rounded-lg p-3 hover:border-[#1e3a5f]/70 transition-colors">
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-[9px] text-slate-600 uppercase tracking-widest">{label}</span>
      {Icon && <Icon className={`w-3 h-3 ${accentClass}`} />}
    </div>
    <div className="text-sm font-bold text-white leading-none">{value}</div>
    {delta && (
      <div className={`flex items-center gap-0.5 mt-1 text-[10px] ${deltaUp ? 'text-emerald-400' : 'text-rose-400'}`}>
        {deltaUp ? <ArrowUp size={9} /> : <ArrowDown size={9} />}
        {delta}
      </div>
    )}
  </div>
);

// ── ConfidenceBar ──────────────────────────────────────────
export const ConfidenceBar = ({ value, type }) => {
  const color = type === 'BULLISH' ? 'bg-emerald-500' : type === 'BEARISH' ? 'bg-rose-500' : 'bg-amber-400';
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[9px] text-slate-600 font-mono w-7 text-right">{value}%</span>
    </div>
  );
};

// ── SectionHeader ──────────────────────────────────────────
export const SectionHeader = ({ icon: Icon, title, children }) => (
  <div className="px-3 py-2 border-b border-[#1e3a5f]/40 flex items-center justify-between">
    <h3 className="text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
      {Icon && <Icon size={9} className="text-cyan-400" />}
      {title}
    </h3>
    {children}
  </div>
);

// ── TabBar ─────────────────────────────────────────────────
export const TabBar = ({ tabs, active, onChange }) => (
  <div className="flex gap-1">
    {tabs.map(t => (
      <button key={t.value} onClick={() => onChange(t.value)}
        className={`px-2 py-0.5 text-[9px] rounded uppercase font-bold transition-colors ${
          active === t.value
            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            : 'text-slate-600 hover:text-slate-400'
        }`}
      >{t.label}</button>
    ))}
  </div>
);

// ── StatusDot ─────────────────────────────────────────────
export const StatusDot = ({ status }) => {
  const connected = status === 'connected';
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] ${connected ? 'text-emerald-500' : 'text-slate-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
      {status.toUpperCase()}
    </span>
  );
};
