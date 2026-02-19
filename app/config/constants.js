// ─── ONYX TERMINAL · Config ───────────────────────────────
// Central place for all static config: coins, timeframes, theme tokens.

export const COINS = [
  { id: 'bitcoin',  symbol: 'BTC',  name: 'Bitcoin',  binance: 'BTCUSDT',  base: 65000 },
  { id: 'ethereum', symbol: 'ETH',  name: 'Ethereum', binance: 'ETHUSDT',  base: 3500  },
  { id: 'solana',   symbol: 'SOL',  name: 'Solana',   binance: 'SOLUSDT',  base: 145   },
  { id: 'xrp',      symbol: 'XRP',  name: 'XRP',      binance: 'XRPUSDT',  base: 0.60  },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', binance: 'DOGEUSDT', base: 0.12  },
];

export const TIME_RANGES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

export const CHART_MODES = [
  { label: 'EMA',   value: 'ema'   },
  { label: 'BB',    value: 'bb'    },
  { label: 'Clean', value: 'clean' },
];

export const CANDLE_COLORS = {
  bull: '#10b981',
  bear: '#f43f5e',
};

export const THEME = {
  bg:          '#060b14',
  bgCard:      'rgba(15,22,40,0.6)',
  border:      'rgba(30,58,95,0.45)',
  borderHover: 'rgba(30,58,95,0.85)',
  accent:      '#38bdf8',
  accentSoft:  'rgba(56,189,248,0.12)',
};
