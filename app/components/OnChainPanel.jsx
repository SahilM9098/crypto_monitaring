// ─── ONYX TERMINAL · OnChain Panel ───────────────────────
// Exchange flows, whale tracker, and mining stats.
"use client";

import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, Database } from 'lucide-react';
import { SectionHeader, TabBar } from './ui.jsx';

const TABS = [
  { label: 'Flows',  value: 'flows'  },
  { label: 'Whales', value: 'whales' },
  { label: 'Mining', value: 'mining' },
];

// ── Whale row ─────────────────────────────────────────────
const WhaleRow = ({ symbol }) => {
  const [data, setData] = useState(null);

  React.useEffect(() => {
    const types  = ['Exchange Inflow', 'Exchange Outflow', 'Cold Wallet', 'DEX Swap'];
    const bear   = Math.random() > 0.5;
    const type   = types[Math.floor(Math.random() * types.length)];
    const amount = (Math.random() * 85 + 10).toFixed(1);
    const usd    = (Math.random() * 9 + 0.5).toFixed(1);
    const min    = Math.floor(Math.random() * 55) + 1;
    const hash   = '0x' + Math.random().toString(16).slice(2, 9) + '…';
    setData({ bear, type, amount, usd, min, hash });
  }, []);

  if (!data) return (
    <div className="h-12 rounded-lg bg-slate-800/30 border border-slate-700/25 animate-pulse" />
  );

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-700/25 hover:border-slate-700/50 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className={`p-1 rounded-md ${data.bear ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
          {data.bear ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-200">{data.type}</div>
          <div className="text-[9px] text-slate-600 font-mono">{data.hash}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[11px] font-mono font-bold text-white">{data.amount} {symbol}</div>
        <div className="text-[9px] text-slate-500">${data.usd}M · {data.min}m ago</div>
      </div>
    </div>
  );
};

// ── Flows Tab ─────────────────────────────────────────────
const FlowsTab = () => (
  <div className="space-y-3">
    <div>
      <div className="flex justify-between text-[10px] mb-1.5">
        <span className="text-slate-500">Net Exchange Flow (24h)</span>
        <span className="text-rose-400 font-bold font-mono">−$42.5M Outflow</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
        <div className="bg-rose-500/60 h-full w-[35%]" />
        <div className="bg-emerald-500    h-full w-[65%]" />
      </div>
      <div className="flex justify-between text-[9px] text-slate-700 mt-1">
        <span>Inflow 35%</span>
        <span>Outflow 65% ↑ Bullish</span>
      </div>
    </div>

    {[
      ['Active Addresses', '1.23M', '+4.2%', true],
      ['Exchange Reserve', '2.31M BTC', '−12K', false],
      ['New Addresses',    '42.8K', '+1.1%', true],
      ['Avg TX Value',     '$18,400', '+2.8%', true],
    ].map(([label, value, delta, up]) => (
      <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-800/40 last:border-0">
        <span className="text-[10px] text-slate-500">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-white font-mono">{value}</span>
          <span className={`text-[9px] ${up ? 'text-emerald-400' : 'text-rose-400'}`}>{delta}</span>
        </div>
      </div>
    ))}
  </div>
);

// ── Mining Tab ─────────────────────────────────────────────
const MiningTab = () => (
  <div className="space-y-2.5">
    {[
      { label: 'Hash Rate (Global)', value: '482.1 EH/s',  delta: '+2.4% vs 7D', up: true  },
      { label: 'Miner Revenue 24h',  value: '$28.4M',      delta: 'fees + block', up: null  },
      { label: 'Avg TX Fee',         value: '$4.21',        delta: '−5% vs 7D',   up: false },
      { label: 'Mempool Size',       value: '148 MB',       delta: 'Moderate',    up: null  },
      { label: 'Next Difficulty Δ',  value: '+1.8%',        delta: 'est. 6d',     up: false },
    ].map(({ label, value, delta, up }) => (
      <div key={label} className="bg-slate-800/30 px-3 py-2.5 rounded-lg border border-slate-700/20">
        <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-sm font-bold text-white font-mono">{value}</div>
        <div className={`text-[10px] mt-0.5 ${up === null ? 'text-slate-500' : up ? 'text-emerald-400' : 'text-rose-400'}`}>{delta}</div>
      </div>
    ))}
  </div>
);

// ── Main Export ───────────────────────────────────────────
export const OnChainPanel = ({ activeCoin }) => {
  const [tab, setTab] = useState('flows');

  // Regenerate whale data when coin changes
  const whaleKeys = useMemo(() => Array.from({ length: 5 }, (_, i) => i), [activeCoin.id]);

  return (
    <div className="bg-slate-900/40 border border-[#1e3a5f]/40 rounded-lg flex flex-col h-full">
      <SectionHeader icon={Database} title="On-Chain Intel">
        <TabBar tabs={TABS} active={tab} onChange={setTab} />
      </SectionHeader>

      <div
        className="flex-1 overflow-y-auto p-3 space-y-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e3a5f transparent' }}
      >
        {tab === 'flows'  && <FlowsTab />}
        {tab === 'whales' && whaleKeys.map(k => <WhaleRow key={k} symbol={activeCoin.symbol} />)}
        {tab === 'mining' && <MiningTab />}
      </div>
    </div>
  );
};
