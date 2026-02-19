// ─── ONYX TERMINAL · CandleTooltip ───────────────────────
// Custom Recharts tooltip for candlestick chart.

import React from 'react';
import { formatUSD, formatDateTime } from '../config/formatters.js';

export const CandleTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  const rows = [
    ['O', d.open,  d.isUp],
    ['H', d.high,  null  ],
    ['L', d.low,   null  ],
    ['C', d.close, d.isUp],
  ];

  return (
    <div className="bg-[#080e1a] border border-[#1e3a5f]/70 p-3 rounded-lg shadow-2xl text-[11px] font-mono min-w-[175px] pointer-events-none">
      {/* Timestamp */}
      <div className="text-slate-500 mb-2 pb-1 border-b border-slate-800 text-[10px]">
        {formatDateTime(d.time)}
      </div>

      {/* OHLC */}
      {rows.map(([label, value, up]) => (
        <div key={label} className="flex justify-between gap-4">
          <span className="text-slate-600">{label}</span>
          <span className={
            up === null  ? 'text-slate-300' :
            up === true  ? 'text-emerald-400' :
            'text-rose-400'
          }>
            {formatUSD(value)}
          </span>
        </div>
      ))}

      {/* Indicators (when available) */}
      {d.ema9  != null && (
        <div className="mt-1.5 pt-1 border-t border-slate-800/50">
          <div className="flex justify-between"><span className="text-sky-500">EMA 9</span><span className="text-sky-400">{formatUSD(d.ema9)}</span></div>
        </div>
      )}
      {d.ema21 != null && (
        <div className="flex justify-between"><span className="text-violet-500">EMA 21</span><span className="text-violet-400">{formatUSD(d.ema21)}</span></div>
      )}
      {d.rsi  != null && (
        <div className="flex justify-between"><span className="text-amber-500">RSI</span><span className="text-amber-400">{d.rsi.toFixed(1)}</span></div>
      )}
      {d.bbUpper != null && (
        <div className="mt-1 pt-1 border-t border-slate-800/50">
          <div className="flex justify-between"><span className="text-slate-600">BB Upper</span><span className="text-slate-400">{formatUSD(d.bbUpper)}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">BB Lower</span><span className="text-slate-400">{formatUSD(d.bbLower)}</span></div>
        </div>
      )}
    </div>
  );
};
