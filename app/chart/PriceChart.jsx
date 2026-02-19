// ─── ONYX TERMINAL · PriceChart ──────────────────────────
// Main candlestick chart with EMA overlays, Bollinger Bands,
// zoom brush, and a mode toggle (EMA / BB / Clean).
"use client";

import React, { useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Brush
} from 'recharts';
import { Eye } from 'lucide-react';
import { TIME_RANGES } from '../config/constants.js';
import { formatTime } from '../config/formatters.js';
import { CandleTooltip } from './CandleTooltip.jsx';

const MODES = ['EMA', 'BB', 'Clean'];

export const PriceChart = React.memo(({
  data         = [],
  chartRange,
  onRangeChange,
  brushStart,
  onBrushChange,
  coinId,
}) => {
  const [mode, setMode] = useState('EMA');
  const showEMA = mode !== 'Clean';
  const showBB  = mode === 'BB';

  return (
    <div className="bg-slate-900/40 border border-[#1e3a5f]/40 rounded-lg p-3 flex flex-col" style={{ height: 420 }}>

      {/* ── Toolbar ── */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Label */}
          <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Eye size={10} className="text-cyan-400" /> Price Action
          </span>

          {/* Time range selector */}
          <div className="flex gap-px bg-slate-800/60 rounded p-0.5">
            {TIME_RANGES.map(r => (
              <button
                key={r}
                onClick={() => onRangeChange(r)}
                className={`px-2 py-0.5 text-[9px] rounded transition-colors uppercase font-bold ${
                  chartRange === r ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-600 hover:text-slate-400'
                }`}
              >{r}</button>
            ))}
          </div>

          {/* Overlay mode toggle */}
          <div className="flex gap-px bg-slate-800/60 rounded p-0.5">
            {MODES.map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2 py-0.5 text-[9px] rounded transition-colors ${
                  mode === m ? 'bg-slate-700 text-white' : 'text-slate-600 hover:text-slate-400'
                }`}
              >{m}</button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[9px] shrink-0">
          {showEMA && <>
            <span className="flex items-center gap-1 text-sky-400">
              <span className="w-3 h-px bg-sky-400 inline-block" /> EMA9
            </span>
            <span className="flex items-center gap-1 text-violet-400">
              <span className="w-3 h-px bg-violet-400 inline-block" /> EMA21
            </span>
          </>}
          {showBB && (
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-3 h-px bg-slate-600 inline-block" style={{ borderBottom: '1px dashed' }} /> BB(20)
            </span>
          )}
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="flex-1 min-h-0">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 72, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#0d1f35" vertical={false} />

              {/* Primary X axis (for body bars) */}
              <XAxis
                dataKey="time"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatTime}
                stroke="#1e3a5f"
                fontSize={10}
                tickMargin={5}
                minTickGap={55}
                xAxisId={0}
              />
              {/* Secondary X axis (for wick bars — must overlap body exactly) */}
              <XAxis
                dataKey="time"
                type="number"
                domain={['dataMin', 'dataMax']}
                hide
                xAxisId={1}
              />

              <YAxis
                orientation="right"
                domain={['auto', 'auto']}
                stroke="#1e3a5f"
                fontSize={10}
                tickFormatter={v => v.toLocaleString()}
                width={70}
              />

              <Tooltip
                content={<CandleTooltip />}
                cursor={{ stroke: '#1e3a5f', strokeWidth: 1, strokeDasharray: '3 3' }}
                isAnimationActive={false}
              />

              {/* Bollinger Bands */}
              {showBB && <>
                <Line type="monotone" dataKey="bbUpper" stroke="#1e3a5f" strokeWidth={0.8} dot={false} isAnimationActive={false} strokeDasharray="5 4" />
                <Line type="monotone" dataKey="bbMid"   stroke="#0d1f35" strokeWidth={0.6} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="bbLower" stroke="#1e3a5f" strokeWidth={0.8} dot={false} isAnimationActive={false} strokeDasharray="5 4" />
              </>}

              {/* EMAs */}
              {showEMA && <>
                <Line type="monotone" dataKey="ema9"  stroke="#38bdf8" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="ema21" stroke="#a78bfa" strokeWidth={1.2} dot={false} isAnimationActive={false} />
              </>}

              {/* Wicks — xAxisId=1 so they overlay bodies without side-by-side grouping */}
              <Bar dataKey="wick" barSize={1.5} xAxisId={1} isAnimationActive={false}>
                {data.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>

              {/* Bodies — xAxisId=0 */}
              <Bar dataKey="body" barSize={6} xAxisId={0} isAnimationActive={false}>
                {data.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.9} />)}
              </Bar>

              {/* Zoom brush */}
              <Brush
                key={`${coinId}-${chartRange}`}
                dataKey="time"
                height={22}
                stroke="#1e3a5f"
                fill="#060b14"
                tickFormatter={() => ''}
                startIndex={brushStart}
                onChange={e => e.startIndex !== undefined && onBrushChange(e.startIndex)}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-600 text-xs animate-pulse">
            Initializing data stream…
          </div>
        )}
      </div>
    </div>
  );
});
