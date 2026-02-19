// ─── ONYX TERMINAL · useBinanceData ──────────────────────
// Fetches OHLCV candle history and order book depth from Binance REST API.
// Handles loading state, errors, and auto-refresh for the order book.

import { useState, useEffect, useCallback } from 'react';
import { processCandles, generateMockHistory } from '../algorithms/candleProcessor.js';

/**
 * Fetch and process OHLCV candle history.
 *
 * @param {string} binanceSymbol - e.g. 'BTCUSDT'
 * @param {string} interval      - e.g. '1h'
 * @param {number} limit         - Number of candles (max 500)
 */
export const useCandleHistory = (binanceSymbol, interval, limit = 150) => {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`
        );
        const json = await res.json();

        if (!Array.isArray(json)) throw new Error('Unexpected API response');

        const raw = json.map(c => ({
          time:   c[0],
          open:   parseFloat(c[1]),
          high:   parseFloat(c[2]),
          low:    parseFloat(c[3]),
          close:  parseFloat(c[4]),
          volume: parseFloat(c[5]),
        }));

        if (!cancelled) {
          setData(processCandles(raw));
          setLoading(false);
        }
      } catch (err) {
        console.warn('[useCandleHistory] Fetch failed, using mock data:', err);
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [binanceSymbol, interval, limit]);

  return { data, setData, loading, error };
};

/**
 * Fetch and auto-refresh order book depth.
 *
 * @param {string} binanceSymbol
 * @param {number} depthLimit    - Number of bid/ask levels (max 20)
 * @param {number} refreshMs     - Polling interval in ms
 */
export const useOrderBook = (binanceSymbol, depthLimit = 10, refreshMs = 2500) => {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });

  const fetchDepth = useCallback(async () => {
    try {
      const res  = await fetch(`https://api.binance.com/api/v3/depth?symbol=${binanceSymbol}&limit=${depthLimit}`);
      const data = await res.json();
      if (data.bids && data.asks) {
        setOrderBook({
          bids: data.bids.map(b => ({ price: parseFloat(b[0]), size: parseFloat(b[1]) })),
          asks: data.asks.map(a => ({ price: parseFloat(a[0]), size: parseFloat(a[1]) })),
        });
      }
    } catch {}
  }, [binanceSymbol, depthLimit]);

  useEffect(() => {
    fetchDepth();
    const iv = setInterval(fetchDepth, refreshMs);
    return () => clearInterval(iv);
  }, [fetchDepth, refreshMs]);

  return { orderBook };
};
