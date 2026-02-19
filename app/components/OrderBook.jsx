// ─── ONYX TERMINAL · OrderBook Component ─────────────────
// Renders live bid/ask depth with proportional size bars.

import React from 'react';
import { Radio } from 'lucide-react';

const DepthRow = ({ price, size, maxSize, side }) => {
  const pct   = maxSize > 0 ? (size / maxSize) * 100 : 0;
  const color  = side === 'ask' ? 'bg-rose-500/10' : 'bg-emerald-500/10';
  const tColor = side === 'ask' ? 'text-rose-400'  : 'text-emerald-400';

  return (
    <div className="flex justify-between items-center relative h-[18px] px-2">
      <div className={`absolute inset-0 ${color}`} style={{ width: `${pct}%`, right: 0, left: 'auto' }} />
      <span className={`z-10 text-[11px] font-mono ${tColor}`}>{price.toFixed(2)}</span>
      <span className="z-10 text-[11px] font-mono text-slate-600">{size.toFixed(3)}</span>
    </div>
  );
};

export const OrderBook = ({ bids = [], asks = [], currentPrice }) => {
  if (!bids.length && !asks.length) {
    return (
      <div className="p-3 text-[11px] text-slate-600 animate-pulse flex items-center gap-2">
        <Radio size={11} /> Connecting to feed…
      </div>
    );
  }

  const maxSize = Math.max(
    ...asks.map(a => a.size),
    ...bids.map(b => b.size),
    0.0001
  );

  return (
    <div className="flex flex-col font-mono select-none">
      {/* Header */}
      <div className="flex justify-between text-[9px] text-slate-700 px-2 pb-1 uppercase tracking-wider">
        <span>Price (USD)</span>
        <span>Size</span>
      </div>

      {/* Asks (reversed so lowest ask is closest to mid) */}
      <div className="flex flex-col-reverse gap-px mb-1">
        {asks.map((a, i) => <DepthRow key={i} price={a.price} size={a.size} maxSize={maxSize} side="ask" />)}
      </div>

      {/* Mid price */}
      <div className="text-center py-1 text-slate-200 font-bold border-y border-[#1e3a5f]/50 bg-[#0a1220]/60 text-[12px] tracking-tight">
        {currentPrice?.toFixed(2) ?? '—'}
      </div>

      {/* Bids */}
      <div className="flex flex-col gap-px mt-1">
        {bids.map((b, i) => <DepthRow key={i} price={b.price} size={b.size} maxSize={maxSize} side="bid" />)}
      </div>
    </div>
  );
};
