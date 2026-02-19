// ─── ONYX TERMINAL · Formatters ───────────────────────────
// Pure utility functions for number and date formatting.

/**
 * Format a number as USD currency.
 * Automatically uses 4 decimal places for sub-$1 assets.
 */
export const formatUSD = (v) => {
  if (v == null) return '$—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: v < 1 ? 4 : 2,
    maximumFractionDigits: v < 1 ? 4 : 2,
  }).format(v);
};

/**
 * Compact number: 1,230,000 → $1.23M
 */
export const formatCompact = (v) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(v ?? 0);

/**
 * Unix ms timestamp → HH:MM
 */
export const formatTime = (unix) =>
  new Date(unix).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/**
 * Unix ms timestamp → full locale string
 */
export const formatDateTime = (unix) => new Date(unix).toLocaleString();

/**
 * Signed percent string with + prefix
 */
export const formatPct = (v, decimals = 2) =>
  `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}%`;
