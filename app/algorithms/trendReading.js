// ─── ONYX TERMINAL · Trend Reading Engine ────────────────
// Aggregates multiple indicator signals into a composite trend verdict.
// Designed to be called after indicators have been applied to candle data.
//
// Returns: { trend, strength, score, signals, momentum, bias }

/**
 * RSI signal interpretation.
 */
const signalRSI = (last) => {
  if (last.rsi == null) return null;
  const bull = last.rsi > 50;
  const label = last.rsi > 70 ? 'Overbought' : last.rsi < 30 ? 'Oversold' : bull ? 'Bullish' : 'Bearish';
  return {
    name:  'RSI (14)',
    value: `${last.rsi.toFixed(1)} — ${label}`,
    raw:   last.rsi,
    bull,
    weight: 1,
  };
};

/**
 * EMA 9/21 crossover signal.
 */
const signalEMACross = (last) => {
  if (last.ema9 == null || last.ema21 == null) return null;
  const bull = last.ema9 > last.ema21;
  const pctGap = ((last.ema9 - last.ema21) / last.ema21 * 100).toFixed(2);
  return {
    name:  'EMA 9 / 21 Cross',
    value: bull ? `↑ Bullish (${pctGap}%)` : `↓ Bearish (${pctGap}%)`,
    raw:   parseFloat(pctGap),
    bull,
    weight: 1.5,
  };
};

/**
 * MACD histogram + crossover signal.
 */
const signalMACD = (last, prev) => {
  if (last.macdHist == null) return null;
  const bull        = last.macdHist > 0;
  const crossing    = prev?.macdHist != null && Math.sign(last.macdHist) !== Math.sign(prev.macdHist);
  const suffix      = crossing ? ' ⚡ Cross!' : '';
  return {
    name:  'MACD Histogram',
    value: `${bull ? '+' : ''}${last.macdHist.toFixed(2)}${suffix}`,
    raw:   last.macdHist,
    bull,
    weight: crossing ? 2 : 1,
    highlight: crossing,
  };
};

/**
 * ADX directional signal — only counts when trend is strong (ADX > 20).
 */
const signalADX = (last) => {
  if (last.adx == null) return null;
  const strong  = last.adx > 20;
  const bull    = last.diPlus > last.diMinus;
  const quality = last.adx > 30 ? 'Strong' : last.adx > 20 ? 'Moderate' : 'Weak';
  return {
    name:  'ADX Directional',
    value: `${last.adx.toFixed(1)} — ${quality} (${bull ? '+DI' : '-DI'} dominant)`,
    raw:   last.adx,
    bull:  strong ? bull : null, // null = no directional opinion when weak
    weight: strong ? 1.5 : 0.5,
  };
};

/**
 * Bollinger Band position relative to middle band.
 */
const signalBollinger = (last) => {
  if (last.bbMid == null) return null;
  const bull      = last.close > last.bbMid;
  const nearUpper = last.bbUpper != null && last.close > last.bbUpper * 0.99;
  const nearLower = last.bbLower != null && last.close < last.bbLower * 1.01;
  const suffix    = nearUpper ? ' (Near upper)' : nearLower ? ' (Near lower)' : '';
  return {
    name:  'Bollinger Position',
    value: `${bull ? 'Above' : 'Below'} midline${suffix}`,
    raw:   ((last.close - last.bbMid) / last.bbMid) * 100,
    bull,
    weight: 1,
  };
};

/**
 * Price vs 50-candle SMA — long-term bias check.
 * Requires sma50 field (from calcSMA(data, 50)).
 */
const signalSMA50 = (last) => {
  if (last.sma50 == null) return null;
  const bull = last.close > last.sma50;
  const pct  = ((last.close - last.sma50) / last.sma50 * 100).toFixed(2);
  return {
    name:  'Price vs SMA 50',
    value: bull ? `↑ ${pct}% above` : `↓ ${Math.abs(pct)}% below`,
    raw:   parseFloat(pct),
    bull,
    weight: 1,
  };
};

/**
 * Momentum: compares close vs N candles ago.
 */
const signalMomentum = (data, lookback = 10) => {
  if (data.length < lookback + 1) return null;
  const last = data[data.length - 1];
  const past = data[data.length - 1 - lookback];
  const pct  = ((last.close - past.close) / past.close) * 100;
  const bull = pct > 0;
  return {
    name:  `Momentum (${lookback}c)`,
    value: `${bull ? '+' : ''}${pct.toFixed(2)}%`,
    raw:   pct,
    bull,
    weight: 0.75,
  };
};

// ── Label Helpers ─────────────────────────────────────────

const TREND_LABELS = {
  STRONG_BULL:  { label: 'STRONG BULL',    color: '#10b981' },
  BULLISH:      { label: 'BULLISH',        color: '#34d399' },
  CONSOLIDATING:{ label: 'CONSOLIDATING',  color: '#f59e0b' },
  BEARISH:      { label: 'BEARISH',        color: '#fb7185' },
  STRONG_BEAR:  { label: 'STRONG BEAR',    color: '#f43f5e' },
  LOADING:      { label: 'LOADING',        color: '#64748b' },
};

/**
 * Master trend classifier.
 *
 * @param {Array} data - Fully processed candle array (indicators applied)
 * @returns {Object} { trend, label, color, strength, score, signals, momentum, commentary }
 */
export const classifyTrend = (data) => {
  if (!data || data.length < 30) {
    return { trend: 'LOADING', ...TREND_LABELS.LOADING, strength: 0, score: 0, signals: [], commentary: 'Waiting for data…' };
  }

  const last = data[data.length - 1];
  const prev = data[data.length - 2];

  const rawSignals = [
    signalEMACross(last),
    signalMACD(last, prev),
    signalRSI(last),
    signalADX(last),
    signalBollinger(last),
    signalSMA50(last),
    signalMomentum(data, 10),
  ].filter(Boolean);

  // Weighted score
  let weightedScore = 0;
  let totalWeight   = 0;

  for (const s of rawSignals) {
    if (s.bull === null) continue; // neutral / no opinion
    weightedScore += s.bull ? s.weight : -s.weight;
    totalWeight   += s.weight;
  }

  const normalizedScore = totalWeight > 0 ? weightedScore / totalWeight : 0; // −1 to +1
  const strength        = Math.round(Math.abs(normalizedScore) * 100);

  // Classify
  let trend;
  if      (normalizedScore >  0.65) trend = 'STRONG_BULL';
  else if (normalizedScore >  0.20) trend = 'BULLISH';
  else if (normalizedScore < -0.65) trend = 'STRONG_BEAR';
  else if (normalizedScore < -0.20) trend = 'BEARISH';
  else                               trend = 'CONSOLIDATING';

  // Momentum reading
  const mom = signalMomentum(data, 10);
  const momentumStr = mom
    ? `${mom.bull ? 'Positive' : 'Negative'} ${Math.abs(mom.raw).toFixed(2)}% over 10 candles`
    : '—';

  // Auto commentary
  const rsiVal = last.rsi?.toFixed(0) ?? '—';
  const commentary = [
    trend === 'STRONG_BULL'   && `Strong bullish confluence. RSI ${rsiVal}, EMA stack bullish, MACD positive.`,
    trend === 'BULLISH'       && `Moderate bullish bias. RSI ${rsiVal}. Monitor for pullback entries.`,
    trend === 'CONSOLIDATING' && `No directional edge detected. RSI ${rsiVal}. Await breakout confirmation.`,
    trend === 'BEARISH'       && `Moderate bearish bias. RSI ${rsiVal}. Watch for relief bounce traps.`,
    trend === 'STRONG_BEAR'   && `Strong bearish confluence. RSI ${rsiVal}, EMA stack bearish, MACD negative.`,
  ].find(Boolean) || '—';

  return {
    trend,
    ...TREND_LABELS[trend],
    strength,
    score:        normalizedScore,
    signals:      rawSignals,
    momentum:     momentumStr,
    commentary,
    bullCount:    rawSignals.filter(s => s.bull === true).length,
    bearCount:    rawSignals.filter(s => s.bull === false).length,
    neutralCount: rawSignals.filter(s => s.bull === null).length,
  };
};
