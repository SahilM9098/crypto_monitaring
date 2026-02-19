// ─── ONYX TERMINAL · Dashboard.jsx ─────────────────────────────
// Root component. Orchestrates state, data hooks, and layout.
"use client";

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Globe, BarChart2, Activity, Zap, Target } from 'lucide-react';

// ── Config ────────────────────────────────────────────────
import { COINS } from '../config/constants.js';
import { formatCompact, formatUSD } from '../config/formatters.js';

// ── Algorithms ────────────────────────────────────────────
import { classifyTrend } from '../algorithms/trendReading.js';
import { detectPatterns } from '../algorithms/patternScanner.js';
import { generateMockHistory, tickUpdate } from '../algorithms/candleProcessor.js';

// ── Hooks ─────────────────────────────────────────────────
import { useWebSocket }   from '../hooks/useWebSocket.js';
import { useCandleHistory, useOrderBook } from '../hooks/useBinanceData.js';

// ── Components ────────────────────────────────────────────
import { Header }              from './Header.jsx';
import { OrderBook }           from './OrderBook.jsx';
import { OnChainPanel }        from './OnChainPanel.jsx';
import { PatternScannerPanel } from './PatternScannerPanel.jsx';
import { StatCard, SectionHeader } from './ui.jsx';

// ── Chart ─────────────────────────────────────────────────
import { PriceChart }    from '../chart/PriceChart.jsx';
import { MACDChart, RSIChart } from '../chart/OscillatorCharts.jsx';

// ─────────────────────────────────────────────────────────
export default function Dashboard() {
  // ── Core state ──────────────────────────────────────────
  const [activeCoin,   setActiveCoin]   = useState(COINS[0]);
  const [chartRange,   setChartRange]   = useState('1h');
  const [currentPrice, setCurrentPrice] = useState(COINS[0].base);
  const [priceChange,  setPriceChange]  = useState(0);
  const [brushStart,   setBrushStart]   = useState(90);

  // ── Candle data ──────────────────────────────────────────
  const { data: fetchedData, setData: setCandles } = useCandleHistory(
    activeCoin.binance,
    chartRange,
    150
  );

  const [priceData, setPriceData] = useState([]);
  const [mounted, setMounted]     = useState(false);

  // Initial mount effect
  React.useEffect(() => {
    setMounted(true);
    // If no data, generate mock
    if (fetchedData.length === 0) {
      setPriceData(generateMockHistory(activeCoin.base));
    }
  }, []);

  // Sync when fetch lands or coin changes
  React.useEffect(() => {
    if (fetchedData.length > 0) {
      setPriceData(fetchedData);
    } else if (mounted) {
       // Only update mock if mounted (client-side)
       setPriceData(generateMockHistory(activeCoin.base));
    }
  }, [fetchedData, activeCoin, mounted]);

  // Sync price / change when fetch lands
  React.useEffect(() => {
    if (fetchedData.length > 0) {
      const last  = fetchedData[fetchedData.length - 1].close;
      const first = fetchedData[0].open;
      setCurrentPrice(last);
      setPriceChange(((last - first) / first) * 100);
      setBrushStart(Math.max(0, fetchedData.length - 60));
    }
  }, [fetchedData]);

  // ── Order book ───────────────────────────────────────────
  const { orderBook } = useOrderBook(activeCoin.binance, 10, 2500);

  // ── Live WebSocket tick ──────────────────────────────────
  const lastTickRef = useRef(0);

  const handlePriceTick = useCallback((price) => {
    setCurrentPrice(price);
    const now = Date.now();
    if (now - lastTickRef.current > 1500) {
      setPriceData(prev => tickUpdate(prev, price));
      lastTickRef.current = now;
    }
  }, []);

  const { status: wsStatus } = useWebSocket(activeCoin.binance, handlePriceTick);

  // ── Derived analytics (memoised) ────────────────────────
  const trendAnalysis = useMemo(() => classifyTrend(priceData), [priceData]);
  const patterns      = useMemo(() => detectPatterns(priceData),  [priceData]);

  // ── Handlers ─────────────────────────────────────────────
  const handleCoinChange = useCallback((coin) => {
    setActiveCoin(coin);
    setCurrentPrice(coin.base);
    setPriceChange(0);
    setPriceData([]); // Clear data to show loading/prevent flash of old data
  }, []);

  const handleRangeChange = useCallback((range) => {
    setChartRange(range);
    setPriceData([]); // Clear data to trigger loading state in chart
  }, []);

  // ── Stat card data ───────────────────────────────────────
  const stats = [
    { label: 'Mkt Cap',  value: formatCompact(currentPrice * 19.5e6), icon: Globe,    ac: 'text-cyan-400'   },
    { label: '24h Vol',  value: formatCompact(currentPrice * 42000),   icon: BarChart2,ac: 'text-violet-400' },
    { label: 'OI',       value: '$12.4B',                              icon: Activity, ac: 'text-amber-400'  },
    { label: 'Funding',  value: '0.010%',                              icon: Zap,      ac: 'text-emerald-400'},
  ];

  const lastCandle = priceData[priceData.length - 1];

  // ─────────────────────────────────────────────────────────
  return (
    <div className="bg-[#060b14] min-h-screen text-slate-200 font-mono selection:bg-cyan-500/20">

      {/* ── Dot grid texture ── */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(rgba(30,58,95,0.35) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* ── Header ── */}
      <Header
        activeCoin={activeCoin}
        onCoinChange={handleCoinChange}
        currentPrice={currentPrice}
        priceChange={priceChange}
        trendAnalysis={trendAnalysis}
        wsStatus={wsStatus}
        chartRange={chartRange}
      />

      {/* ── Main layout ── */}
      <main className="relative z-10 p-3 grid grid-cols-12 gap-3" style={{ maxWidth: 1920, margin: '0 auto' }}>

        {/* ── LEFT · Stats + Order Book ── */}
        <div className="col-span-2 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {stats.map(s => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accentClass={s.ac} />
            ))}
          </div>

          <div className="bg-slate-900/40 border border-[#1e3a5f]/40 rounded-lg overflow-hidden flex-1">
            <SectionHeader title="Order Book">
              <span className={`text-[9px] flex items-center gap-1 ${wsStatus === 'connected' ? 'text-emerald-500' : 'text-slate-600'}`}>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> LIVE
              </span>
            </SectionHeader>
            <div className="py-2">
              <OrderBook
                bids={orderBook.bids}
                asks={orderBook.asks}
                currentPrice={currentPrice}
              />
            </div>
          </div>
        </div>

        {/* ── CENTER · Chart + Oscillators + Macro ── */}
        <div className="col-span-7 flex flex-col gap-3">

          {/* Main price chart */}
          <PriceChart
            data={priceData}
            chartRange={chartRange}
            onRangeChange={handleRangeChange}
            brushStart={brushStart}
            onBrushChange={setBrushStart}
            coinId={activeCoin.id}
          />

          {/* MACD + RSI row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/40 border border-[#1e3a5f]/40 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] text-slate-600 uppercase tracking-widest">MACD (12, 26, 9)</span>
                <div className="flex gap-3 text-[9px]">
                  <span className="text-sky-400">── Line</span>
                  <span className="text-amber-400">── Signal</span>
                </div>
              </div>
              <MACDChart data={priceData} />
            </div>

            <div className="bg-slate-900/40 border border-[#1e3a5f]/40 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] text-slate-600 uppercase tracking-widest">RSI (14)</span>
                <span className={`text-[11px] font-bold font-mono ${
                  (lastCandle?.rsi ?? 50) > 70 ? 'text-rose-400' :
                  (lastCandle?.rsi ?? 50) < 30 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {lastCandle?.rsi?.toFixed(1) ?? '—'}
                </span>
              </div>
              <RSIChart data={priceData} />
              <div className="flex justify-between text-[9px] text-slate-700 mt-1">
                <span>30 — Oversold</span><span>70 — Overbought</span>
              </div>
            </div>
          </div>

          {/* Macro strip */}
          <div className="bg-slate-900/40 border border-[#1e3a5f]/40 rounded-lg px-5 py-3 flex justify-between items-center">
            {[
              { label: 'DXY',      value: '104.20', delta: '+0.1%', up: true  },
              { label: 'S&P Corr', value: '0.82',   delta: 'High',  up: true  },
              { label: 'US 10Y',   value: '4.15%',  delta: '−2bps', up: false },
              { label: 'F&G Index',value: '65',     delta: 'Greed', up: null  },
            ].map(({ label, value, delta, up }) => (
              <div key={label} className="text-center">
                <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-0.5">{label}</div>
                <div className="text-sm font-bold text-white">{value}</div>
                <div className={`text-[10px] ${up === null ? 'text-amber-400' : up ? 'text-emerald-400' : 'text-rose-400'}`}>{delta}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT · Pattern Scanner + On-Chain + Key Levels ── */}
        <div className="col-span-3 flex flex-col gap-3">

          {/* Pattern Scanner */}
          <div style={{ minHeight: 320 }} className="flex-1">
            <PatternScannerPanel patterns={patterns} trendAnalysis={trendAnalysis} />
          </div>

          {/* On-Chain */}
          <div style={{ minHeight: 220 }}>
            <OnChainPanel activeCoin={activeCoin} />
          </div>

          {/* Key Levels */}
          <div className="bg-slate-900/40 border border-[#1e3a5f]/40 rounded-lg p-3">
            <h3 className="text-[9px] text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Target size={9} className="text-cyan-400" /> Key Levels
            </h3>
            <div className="space-y-1.5">
              {[
                ['Resistance', currentPrice * 1.10, 'text-rose-400 bg-rose-500/8 border-rose-500/20'],
                ['Current',    currentPrice,         'text-cyan-400 bg-cyan-500/8 border-cyan-500/30'],
                ['Support',    currentPrice * 0.90,  'text-emerald-400 bg-emerald-500/8 border-emerald-500/20'],
              ].map(([label, value, cls]) => (
                <div key={label} className={`flex justify-between items-center px-2.5 py-1.5 rounded border text-[10px] font-mono font-bold ${cls}`}>
                  <span className="opacity-60 font-normal uppercase text-[9px] tracking-wider">{label}</span>
                  <span>{formatUSD(value)}</span>
                </div>
              ))}
            </div>

            {/* Fear & Greed */}
            <div className="mt-3 pt-3 border-t border-slate-800/60">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] text-slate-600 uppercase">Fear & Greed</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-400 font-mono">65</span>
                  <span className="text-[9px] text-amber-500 px-1.5 py-0.5 bg-amber-500/10 rounded uppercase font-bold">Greed</span>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full relative">
                <div className="absolute top-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md border border-slate-400"
                  style={{ left: '65%', transform: 'translate(-50%, -50%)' }} />
              </div>
              <div className="flex justify-between text-[9px] text-slate-700 mt-1">
                <span>Fear</span><span>Greed</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}


