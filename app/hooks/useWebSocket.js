// ─── ONYX TERMINAL · useWebSocket ────────────────────────
// Manages the Binance trade stream WebSocket connection.
// Calls onPrice(price) on every trade tick.
// Automatically reconnects when the coin changes.

import { useEffect, useRef, useState } from 'react';

/**
 * @param {string} binanceSymbol - e.g. 'BTCUSDT'
 * @param {Function} onPrice     - callback(price: number)
 * @returns {{ status: 'connecting'|'connected'|'disconnected'|'error' }}
 */
export const useWebSocket = (binanceSymbol, onPrice) => {
  const [status, setStatus] = useState('connecting');
  const wsRef = useRef(null);

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setStatus('connecting');
    const url = `wss://stream.binance.com:9443/ws/${binanceSymbol.toLowerCase()}@trade`;
    const ws  = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus('connected');

    ws.onmessage = (event) => {
      try {
        const msg   = JSON.parse(event.data);
        const price = parseFloat(msg.p);
        if (!isNaN(price)) onPrice(price);
      } catch {}
    };

    ws.onerror = () => setStatus('error');
    ws.onclose = () => setStatus('disconnected');

    return () => ws.close();
  }, [binanceSymbol]);

  return { status };
};
