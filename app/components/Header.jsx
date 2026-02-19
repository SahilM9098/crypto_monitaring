// ─── ONYX TERMINAL · Header ───────────────────────────────
// Top navigation bar: logo, coin selector, live price, trend badge.
"use client";

import React, { useState } from 'react';
import { Terminal, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { COINS } from '../config/constants.js';
import { formatUSD } from '../config/formatters.js';
import { TrendBadge, StatusDot } from './ui.jsx';

export const Header = ({
  activeCoin,
  onCoinChange,
  currentPrice,
  priceChange,
  trendAnalysis,
  wsStatus,
  chartRange,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="relative z-50 flex items-center justify-between px-5 py-2.5 border-b border-[#1e3a5f]/40 bg-[#060b14]/95 backdrop-blur-sm sticky top-0"
      onClick={() => open && setOpen(false)}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-700/20 border border-cyan-500/25 p-1.5 rounded-lg">
          <Terminal className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="text-white font-bold tracking-[0.15em] text-sm leading-none font-mono">ONYX TERMINAL</div>
          <div className="flex items-center gap-2 text-[9px] text-slate-600 mt-0.5 font-mono">
            <StatusDot status={wsStatus} />
            <span className="text-slate-800">·</span>
            <span className="uppercase">{chartRange}</span>
          </div>
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-5">

        {/* Coin dropdown */}
        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
            className="flex items-center gap-2 bg-slate-900/80 border border-[#1e3a5f]/60 px-3 py-1.5 rounded-lg hover:border-cyan-500/40 transition-colors text-sm font-mono"
          >
            <span className="font-bold text-cyan-400">{activeCoin.symbol}</span>
            <span className="text-slate-500 text-xs hidden sm:block">{activeCoin.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-600" />
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-[#0a1628] border border-[#1e3a5f]/60 rounded-lg overflow-hidden shadow-2xl z-50 font-mono">
              {COINS.map(c => (
                <button
                  key={c.id}
                  onClick={() => { onCoinChange(c); setOpen(false); }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800/80 hover:text-cyan-400 text-xs transition-colors flex justify-between"
                >
                  <span className="font-bold">{c.symbol}</span>
                  <span className="text-slate-600">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live price */}
        <div className="text-right font-mono">
          <div className="text-xl font-bold text-white tracking-tight leading-none">
            {formatUSD(currentPrice)}
          </div>
          <div className={`text-[11px] flex items-center justify-end gap-1 mt-0.5 ${priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {priceChange >= 0
              ? <TrendingUp size={10} />
              : <TrendingDown size={10} />}
            {Math.abs(priceChange).toFixed(2)}% 24h
          </div>
        </div>

        <TrendBadge trend={trendAnalysis.trend} strength={trendAnalysis.strength} />
      </div>
    </header>
  );
};
