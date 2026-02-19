// ─── ONYX TERMINAL · Oscillator Charts ───────────────────
// MACD histogram + signal line, and RSI with reference lines.
// These are rendered below the main price chart.

import React from 'react';
import {
  ComposedChart, AreaChart, Area, Bar, Line, XAxis, YAxis,
  ResponsiveContainer, Cell, ReferenceLine, Tooltip
} from 'recharts';

// ── MACD Chart ─────────────────────────────────────────────
export const MACDChart = ({ data, visibleCount = 60 }) => {
  const visible = data.slice(-visibleCount);

  return (
    <ResponsiveContainer width="100%" height={72}>
      <ComposedChart data={visible} margin={{ top: 2, right: 12, bottom: 0, left: 0 }}>
        <XAxis dataKey="time" hide />
        <YAxis hide domain={['auto', 'auto']} />
        <Tooltip content={() => null} />

        {/* Zero line */}
        <ReferenceLine y={0} stroke="#1e3a5f" strokeWidth={0.8} />

        {/* Histogram bars */}
        <Bar dataKey="macdHist" isAnimationActive={false} maxBarSize={6}>
          {visible.map((d, i) => (
            <Cell key={i} fill={d.macdHist >= 0 ? '#10b981' : '#f43f5e'} fillOpacity={0.7} />
          ))}
        </Bar>

        {/* MACD line */}
        <Line
          type="monotone"
          dataKey="macdLine"
          stroke="#38bdf8"
          strokeWidth={1.2}
          dot={false}
          isAnimationActive={false}
        />

        {/* Signal line */}
        <Line
          type="monotone"
          dataKey="macdSignal"
          stroke="#f59e0b"
          strokeWidth={1.2}
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

// ── RSI Chart ──────────────────────────────────────────────
export const RSIChart = ({ data, visibleCount = 60 }) => {
  const visible = data.slice(-visibleCount);

  return (
    <ResponsiveContainer width="100%" height={55}>
      <ComposedChart data={visible} margin={{ top: 2, right: 12, bottom: 0, left: 0 }}>
        <XAxis dataKey="time" hide />
        <YAxis hide domain={[0, 100]} />
        <Tooltip content={() => null} />

        {/* Overbought / oversold / midline */}
        <ReferenceLine y={70} stroke="#f43f5e" strokeWidth={0.6} strokeDasharray="4 3" />
        <ReferenceLine y={50} stroke="#334155" strokeWidth={0.6} />
        <ReferenceLine y={30} stroke="#10b981" strokeWidth={0.6} strokeDasharray="4 3" />

        {/* RSI area */}
        <Area
          type="monotone"
          dataKey="rsi"
          stroke="#f59e0b"
          strokeWidth={1.5}
          fill="#f59e0b"
          fillOpacity={0.06}
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
