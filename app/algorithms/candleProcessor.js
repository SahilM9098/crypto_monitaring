// ─── ONYX TERMINAL · Candle Processor ────────────────────
// Takes raw OHLCV arrays and runs the full indicator pipeline.
// Also handles mock data generation for offline/fallback use.

import { calcEMA, calcMACD, calcRSI, calcBollinger, calcADX, calcSMA, calcOBV } from './indicators.js';
import { CANDLE_COLORS } from '../config/constants.js';

/**
 * Enrich a raw OHLCV candle with display fields.
 * (color, isUp, body range, wick range for the Recharts bars)
 */
const enrichCandle = (item) => {
  const isUp = item.close >= item.open;
  return {
    ...item,
    value: item.close,
    isUp,
    color: isUp ? CANDLE_COLORS.bull : CANDLE_COLORS.bear,
    body:  [Math.min(item.open, item.close), Math.max(item.open, item.close)],
    wick:  [item.low, item.high],
  };
};

/**
 * Full processing pipeline.
 * Applies every indicator then enriches display fields.
 *
 * @param {Array} rawCandles - [{time, open, high, low, close, volume?}]
 * @returns {Array} Fully enriched candle array
 */
export const processCandles = (rawCandles) => {
  if (!rawCandles || rawCandles.length === 0) return [];

  let d = rawCandles;
  d = calcEMA(d, 9);
  d = calcEMA(d, 21);
  d = calcSMA(d, 50);
  d = calcMACD(d);
  d = calcRSI(d, 14);
  d = calcBollinger(d, 20, 2);
  d = calcADX(d, 14);
  d = calcOBV(d);
  d = d.map(enrichCandle);

  return d;
};

/**
 * Update the last candle in-place from a live price tick.
 * Preserves all computed indicator fields, just updates OHLCV.
 *
 * @param {Array} prevData - Current candle array
 * @param {number} price   - Latest trade price
 * @returns {Array} New array with updated last candle
 */
export const tickUpdate = (prevData, price) => {
  if (!prevData.length) return prevData;
  const arr  = [...prevData];
  const last = { ...arr[arr.length - 1] };

  last.close = price;
  last.high  = Math.max(last.high, price);
  last.low   = Math.min(last.low, price);
  last.value = price;
  last.isUp  = price >= last.open;
  last.color = last.isUp ? CANDLE_COLORS.bull : CANDLE_COLORS.bear;
  last.body  = [Math.min(last.open, price), Math.max(last.open, price)];
  last.wick  = [last.low, last.high];

  arr[arr.length - 1] = last;
  return arr;
};

/**
 * Generate mock OHLCV history for a given base price.
 * Used as a fallback before the API responds.
 *
 * @param {number} basePrice
 * @param {number} count
 * @returns {Array} Processed candle array
 */
export const generateMockHistory = (basePrice, count = 150) => {
  const raw  = [];
  const now  = Date.now();
  let price  = basePrice;

  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * 60 * 1000;
    const vol  = basePrice * 0.0022;
    const open = price;
    const close = price + (Math.random() - 0.475) * vol;
    const high  = Math.max(open, close) + Math.random() * vol * 0.4;
    const low   = Math.min(open, close) - Math.random() * vol * 0.4;
    const volume = Math.random() * 1200 + 200;
    price = close;
    raw.push({ time, open, high, low, close, volume });
  }

  return processCandles(raw);
};
