// ─── ONYX TERMINAL · Pattern Scanner ─────────────────────
// Detects candlestick patterns and chart structure patterns
// from processed OHLCV candle arrays.
//
// Each pattern returns: { name, type, desc, confidence, isChart? }
// type: 'BULLISH' | 'BEARISH' | 'NEUTRAL'

// ── Helpers ───────────────────────────────────────────────

const body       = (d) => Math.abs(d.close - d.open);
const range      = (d) => d.high - d.low;
const isUp       = (d) => d.close >= d.open;
const upperWick  = (d) => d.high  - Math.max(d.open, d.close);
const lowerWick  = (d) => Math.min(d.open, d.close) - d.low;

// ── Single-Candle Patterns ────────────────────────────────

const checkDoji = (c0) => {
  if (range(c0) === 0) return null;
  if (body(c0) < range(c0) * 0.08) {
    return { name: 'Doji', type: 'NEUTRAL', desc: 'Market indecision — watch for follow-through', confidence: 68 };
  }
  return null;
};

const checkHammer = (c0, c1, c2) => {
  if (body(c0) === 0) return null;
  if (lowerWick(c0) > body(c0) * 2 && upperWick(c0) < body(c0) * 0.5) {
    const prevDown = !isUp(c1) && !isUp(c2);
    return {
      name: prevDown ? 'Hammer' : 'Hanging Man',
      type: prevDown ? 'BULLISH' : 'BEARISH',
      desc: prevDown ? 'Bullish reversal — buyers rejected lower prices' : 'Bearish warning at potential resistance',
      confidence: prevDown ? 76 : 70,
    };
  }
  return null;
};

const checkShootingStar = (c0, c1, c2) => {
  if (body(c0) === 0) return null;
  if (upperWick(c0) > body(c0) * 2 && lowerWick(c0) < body(c0) * 0.5) {
    const prevUp = isUp(c1) && isUp(c2);
    return {
      name: prevUp ? 'Shooting Star' : 'Inverted Hammer',
      type: prevUp ? 'BEARISH' : 'BULLISH',
      desc: prevUp ? 'Bearish reversal — sellers rejected higher prices' : 'Potential bullish reversal with follow-up needed',
      confidence: prevUp ? 74 : 65,
    };
  }
  return null;
};

const checkMarubozu = (c0) => {
  if (range(c0) === 0) return null;
  if (body(c0) > range(c0) * 0.92 && upperWick(c0) < body(c0) * 0.05 && lowerWick(c0) < body(c0) * 0.05) {
    const bull = isUp(c0);
    return {
      name: bull ? 'Bullish Marubozu' : 'Bearish Marubozu',
      type: bull ? 'BULLISH' : 'BEARISH',
      desc: bull ? 'Full buyer control — strong momentum candle' : 'Full seller control — strong bearish momentum',
      confidence: 79,
    };
  }
  return null;
};

const checkSpinningTop = (c0) => {
  if (range(c0) === 0) return null;
  if (body(c0) < range(c0) * 0.25 && upperWick(c0) > body(c0) && lowerWick(c0) > body(c0)) {
    return { name: 'Spinning Top', type: 'NEUTRAL', desc: 'Balanced pressure — neither side in control', confidence: 60 };
  }
  return null;
};

// ── Two-Candle Patterns ───────────────────────────────────

const checkEngulfing = (c0, c1) => {
  if (body(c1) === 0) return null;
  if (!isUp(c1) && isUp(c0) && c0.open < c1.close && c0.close > c1.open && body(c0) > body(c1)) {
    return { name: 'Bullish Engulfing', type: 'BULLISH', desc: 'Buyers overwhelm sellers — strong reversal signal', confidence: 83 };
  }
  if (isUp(c1) && !isUp(c0) && c0.open > c1.close && c0.close < c1.open && body(c0) > body(c1)) {
    return { name: 'Bearish Engulfing', type: 'BEARISH', desc: 'Sellers overwhelm buyers — strong reversal signal', confidence: 83 };
  }
  return null;
};

const checkTweezer = (c0, c1) => {
  const tol = range(c0) * 0.05;
  if (!isUp(c1) && isUp(c0) && Math.abs(c0.low - c1.low) < tol) {
    return { name: 'Tweezer Bottom', type: 'BULLISH', desc: 'Double support test rejected — buyers stepping in', confidence: 74 };
  }
  if (isUp(c1) && !isUp(c0) && Math.abs(c0.high - c1.high) < tol) {
    return { name: 'Tweezer Top', type: 'BEARISH', desc: 'Double resistance test rejected — sellers stepping in', confidence: 74 };
  }
  return null;
};

const checkHarami = (c0, c1) => {
  if (body(c1) === 0) return null;
  if (body(c0) < body(c1) * 0.5 &&
      Math.max(c0.open, c0.close) < Math.max(c1.open, c1.close) &&
      Math.min(c0.open, c0.close) > Math.min(c1.open, c1.close)) {
    const bull = !isUp(c1) && isUp(c0);
    return {
      name: bull ? 'Bullish Harami' : 'Bearish Harami',
      type: bull ? 'BULLISH' : 'BEARISH',
      desc: bull ? 'Inside candle after bearish move — slowing momentum' : 'Inside candle after bullish move — slowing momentum',
      confidence: 67,
    };
  }
  return null;
};

const checkPiercingLine = (c0, c1) => {
  if (!isUp(c0) || isUp(c1)) return null;
  const mid = (c1.open + c1.close) / 2;
  if (c0.open < c1.close && c0.close > mid && body(c0) > body(c1) * 0.5) {
    return { name: 'Piercing Line', type: 'BULLISH', desc: 'Bullish counter-attack — buyers pierce bearish candle', confidence: 72 };
  }
  return null;
};

const checkDarkCloudCover = (c0, c1) => {
  if (isUp(c0) || !isUp(c1)) return null;
  const mid = (c1.open + c1.close) / 2;
  if (c0.open > c1.close && c0.close < mid && body(c0) > body(c1) * 0.5) {
    return { name: 'Dark Cloud Cover', type: 'BEARISH', desc: 'Bearish counter-attack — sellers pierce bullish candle', confidence: 72 };
  }
  return null;
};

// ── Three-Candle Patterns ─────────────────────────────────

const checkMorningStar = (c0, c1, c2) => {
  if (!isUp(c2) && body(c1) < body(c2) * 0.3 && isUp(c0) && c0.close > (c2.open + c2.close) / 2) {
    return { name: 'Morning Star', type: 'BULLISH', desc: '3-candle reversal — strong bottom confirmation', confidence: 86 };
  }
  return null;
};

const checkEveningStar = (c0, c1, c2) => {
  if (isUp(c2) && body(c1) < body(c2) * 0.3 && !isUp(c0) && c0.close < (c2.open + c2.close) / 2) {
    return { name: 'Evening Star', type: 'BEARISH', desc: '3-candle reversal — strong top confirmation', confidence: 86 };
  }
  return null;
};

const checkThreeWhiteSoldiers = (c0, c1, c2) => {
  if (isUp(c0) && isUp(c1) && isUp(c2) &&
      c0.close > c1.close && c1.close > c2.close &&
      c0.open > c1.open && c1.open > c2.open &&
      body(c0) > range(c0) * 0.55 && body(c1) > range(c1) * 0.55) {
    return { name: 'Three White Soldiers', type: 'BULLISH', desc: 'Sustained bullish momentum across 3 sessions', confidence: 89 };
  }
  return null;
};

const checkThreeBlackCrows = (c0, c1, c2) => {
  if (!isUp(c0) && !isUp(c1) && !isUp(c2) &&
      c0.close < c1.close && c1.close < c2.close &&
      body(c0) > range(c0) * 0.55 && body(c1) > range(c1) * 0.55) {
    return { name: 'Three Black Crows', type: 'BEARISH', desc: 'Sustained bearish pressure across 3 sessions', confidence: 89 };
  }
  return null;
};

// ── Chart / Structure Patterns ────────────────────────────

const checkTrendStructure = (data) => {
  const w = data.slice(-12);
  const highs = w.map(d => d.high);
  const lows  = w.map(d => d.low);

  const hhhl = highs[11] > highs[6] && highs[6] > highs[1] &&
               lows[11]  > lows[6]  && lows[6]  > lows[1];
  const lhll = highs[11] < highs[6] && highs[6] < highs[1] &&
               lows[11]  < lows[6]  && lows[6]  < lows[1];

  if (hhhl) return { name: 'HH + HL Uptrend',   type: 'BULLISH', desc: 'Higher highs & higher lows confirm active uptrend',   confidence: 91, isChart: true };
  if (lhll) return { name: 'LH + LL Downtrend',  type: 'BEARISH', desc: 'Lower highs & lower lows confirm active downtrend',   confidence: 91, isChart: true };
  return null;
};

const checkConsolidation = (data) => {
  const w = data.slice(-10);
  const priceRange = (Math.max(...w.map(d => d.high)) - Math.min(...w.map(d => d.low))) / data[data.length - 1].close;
  if (priceRange < 0.012) {
    return { name: 'Tight Consolidation', type: 'NEUTRAL', desc: 'Narrow range compression — expect volatility breakout', confidence: 72, isChart: true };
  }
  return null;
};

const checkVolumeClimax = (data) => {
  const last = data[data.length - 1];
  const vols = data.slice(-20).map(d => d.volume || 0);
  const avg  = vols.reduce((s, v) => s + v, 0) / vols.length;
  if (avg > 0 && (last.volume || 0) > avg * 2.5) {
    return {
      name: 'Volume Climax',
      type: isUp(last) ? 'BULLISH' : 'BEARISH',
      desc: 'Extreme volume spike — potential exhaustion or breakout',
      confidence: 81,
      isChart: true,
    };
  }
  return null;
};

const checkBBSqueeze = (data) => {
  const last = data[data.length - 1];
  if (last.bbWidth == null) return null;
  const recent = data.slice(-20).filter(d => d.bbWidth != null).map(d => d.bbWidth);
  const avgWidth = recent.reduce((s, v) => s + v, 0) / recent.length;
  if (last.bbWidth < avgWidth * 0.5) {
    return { name: 'Bollinger Squeeze', type: 'NEUTRAL', desc: 'Volatility contracting — directional move approaching', confidence: 77, isChart: true };
  }
  return null;
};

// ── Main Export ───────────────────────────────────────────

/**
 * Run all pattern detectors against the candle array.
 * Returns an array of detected patterns, newest first, max 8.
 *
 * @param {Array} data - Processed OHLCV candle array
 * @returns {Array} patterns
 */
export const detectPatterns = (data) => {
  if (!data || data.length < 5) return [];
  const n = data.length;
  const c0 = data[n - 1];
  const c1 = data[n - 2];
  const c2 = data[n - 3];

  const candidates = [
    // Single-candle
    checkDoji(c0),
    checkHammer(c0, c1, c2),
    checkShootingStar(c0, c1, c2),
    checkMarubozu(c0),
    checkSpinningTop(c0),
    // Two-candle
    checkEngulfing(c0, c1),
    checkTweezer(c0, c1),
    checkHarami(c0, c1),
    checkPiercingLine(c0, c1),
    checkDarkCloudCover(c0, c1),
    // Three-candle
    checkMorningStar(c0, c1, c2),
    checkEveningStar(c0, c1, c2),
    checkThreeWhiteSoldiers(c0, c1, c2),
    checkThreeBlackCrows(c0, c1, c2),
    // Chart/structure
    checkTrendStructure(data),
    checkConsolidation(data),
    checkVolumeClimax(data),
    checkBBSqueeze(data),
  ].filter(Boolean);

  // Sort by confidence descending, cap at 8
  return candidates.sort((a, b) => b.confidence - a.confidence).slice(0, 8);
};
