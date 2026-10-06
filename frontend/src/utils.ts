import { CURRENCY } from './config';

export const money = (n: number, type?: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 }).format(n || 0) +
  (type === 'rent' ? ' / month' : '');

export const compact = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY, notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);

export const dateShort = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#e1eee8'/><stop offset='1' stop-color='#f4ead3'/></linearGradient></defs><rect width='1200' height='800' fill='url(#g)'/><path d='M600 250 380 450h80v200h280V450h80z' fill='#0e4a3c' opacity='.18'/></svg>`;
export const FALLBACK_IMG = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
