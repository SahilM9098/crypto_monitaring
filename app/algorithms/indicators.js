// ─── ONYX TERMINAL · Indicators ───────────────────────────
// Pure functions that compute technical indicators over OHLCV arrays.
// Each function receives and returns a data array — they are composable.

/**
 * Exponential Moving Average.
 * Adds `ema{period}` field to each candle.
 */
export const calcEMA = (data, period) => {
  const k = 2 / (period + 1);
  let ema = null;
  return data.map((item, i) => {
    if (i < period - 1) return { ...item, [`ema${period}`]: null };
    if (i === period - 1) {
      ema = data.slice(0, period).reduce((s, d) => s + d.close, 0) / period;
    } else {
      ema = item.close * k + ema * (1 - k);
    }
    return { ...item, [`ema${period}`]: ema };
  });
};

/**
 * Simple Moving Average.
 * Adds `sma{period}` field to each candle.
 */
export const calcSMA = (data, period) => {
  return data.map((item, i, arr) => {
    if (i < period - 1) return { ...item, [`sma${period}`]: null };
    const sum = arr.slice(i - period + 1, i + 1).reduce((s, d) => s + d.close, 0);
    return { ...item, [`sma${period}`]: sum / period };
  });
};

/**
 * MACD = EMA12 − EMA26, Signal = EMA9(MACD), Histogram = MACD − Signal.
 * Adds: macdLine, macdSignal, macdHist
 */
export const calcMACD = (data) => {
  let d = calcEMA(data, 12);
  d = calcEMA(d, 26);

  d = d.map(item => ({
    ...item,
    macdLine: item.ema12 != null && item.ema26 != null ? item.ema12 - item.ema26 : null,
  }));

  const k = 2 / 10; // EMA9 smoothing
  let prevSig = null;

  return d.map(item => {
    if (item.macdLine == null) return { ...item, macdSignal: null, macdHist: null };
    if (prevSig == null) prevSig = item.macdLine;
    const signal = item.macdLine * k + prevSig * (1 - k);
    prevSig = signal;
    return { ...item, macdSignal: signal, macdHist: item.macdLine - signal };
  });
};

/**
 * Relative Strength Index.
 * Adds `rsi` field to each candle.
 */
export const calcRSI = (data, period = 14) => {
  return data.map((item, i, arr) => {
    if (i < period) return { ...item, rsi: null };
    const slice = arr.slice(i - period, i);
    let gains = 0, losses = 0;
    for (let j = 1; j < slice.length; j++) {
      const diff = slice[j].close - slice[j - 1].close;
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const rs = losses === 0 ? 100 : gains / losses;
    return { ...item, rsi: 100 - 100 / (1 + rs) };
  });
};

/**
 * Bollinger Bands (period, multiplier).
 * Adds: bbUpper, bbMid, bbLower, bbWidth
 */
export const calcBollinger = (data, period = 20, mult = 2) => {
  return data.map((item, i, arr) => {
    if (i < period - 1) return { ...item, bbUpper: null, bbMid: null, bbLower: null, bbWidth: null };
    const slice = arr.slice(i - period + 1, i + 1);
    const mean  = slice.reduce((s, d) => s + d.close, 0) / period;
    const std   = Math.sqrt(slice.reduce((s, d) => s + (d.close - mean) ** 2, 0) / period);
    const upper = mean + mult * std;
    const lower = mean - mult * std;
    return { ...item, bbUpper: upper, bbMid: mean, bbLower: lower, bbWidth: (upper - lower) / mean };
  });
};

/**
 * Average Directional Index — measures trend strength.
 * Adds: adx, diPlus, diMinus
 */
export const calcADX = (data, period = 14) => {
  let smTR = null, smDMP = null, smDMN = null;
  return data.map((item, i, arr) => {
    if (i === 0) return { ...item, adx: null, diPlus: null, diMinus: null };
    const prev = arr[i - 1];
    const tr  = Math.max(item.high - item.low, Math.abs(item.high - prev.close), Math.abs(item.low - prev.close));
    const dmp = item.high - prev.high > prev.low - item.low ? Math.max(item.high - prev.high, 0) : 0;
    const dmn = prev.low - item.low > item.high - prev.high ? Math.max(prev.low - item.low, 0) : 0;
    smTR  = smTR  == null ? tr  : smTR  - smTR  / period + tr;
    smDMP = smDMP == null ? dmp : smDMP - smDMP / period + dmp;
    smDMN = smDMN == null ? dmn : smDMN - smDMN / period + dmn;
    const diP = smTR ? (smDMP / smTR) * 100 : 0;
    const diN = smTR ? (smDMN / smTR) * 100 : 0;
    const dx  = diP + diN > 0 ? (Math.abs(diP - diN) / (diP + diN)) * 100 : 0;
    return { ...item, adx: dx, diPlus: diP, diMinus: diN };
  });
};

/**
 * Stochastic Oscillator (%K, %D).
 * Adds: stochK, stochD
 */
export const calcStochastic = (data, kPeriod = 14, dPeriod = 3) => {
  const withK = data.map((item, i, arr) => {
    if (i < kPeriod - 1) return { ...item, stochK: null };
    const slice  = arr.slice(i - kPeriod + 1, i + 1);
    const lowest  = Math.min(...slice.map(d => d.low));
    const highest = Math.max(...slice.map(d => d.high));
    const k = highest === lowest ? 50 : ((item.close - lowest) / (highest - lowest)) * 100;
    return { ...item, stochK: k };
  });

  // %D = SMA(dPeriod) of %K
  return withK.map((item, i, arr) => {
    if (i < kPeriod + dPeriod - 2) return { ...item, stochD: null };
    const slice = arr.slice(i - dPeriod + 1, i + 1).filter(d => d.stochK != null);
    if (slice.length < dPeriod) return { ...item, stochD: null };
    const d = slice.reduce((s, d) => s + d.stochK, 0) / dPeriod;
    return { ...item, stochD: d };
  });
};

/**
 * On-Balance Volume — running cumulative volume directional signal.
 * Adds: obv
 */
export const calcOBV = (data) => {
  let obv = 0;
  return data.map((item, i, arr) => {
    if (i === 0) return { ...item, obv: 0 };
    const prev = arr[i - 1];
    if (item.close > prev.close) obv += (item.volume || 0);
    else if (item.close < prev.close) obv -= (item.volume || 0);
    return { ...item, obv };
  });
};
