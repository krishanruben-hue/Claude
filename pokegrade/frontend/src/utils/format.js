export function fmtNok(value) {
  if (value == null) return '–';
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(value);
}

export function fmtUsd(value) {
  if (value == null) return '–';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function fmtPct(value, withSign = true) {
  if (value == null) return '–';
  const pct = (value * 100).toFixed(1);
  return withSign && value > 0 ? `+${pct}%` : `${pct}%`;
}

export function fmtMultiplier(value) {
  if (value == null) return '–';
  return `${value.toFixed(1)}x`;
}

export function fmtNumber(value) {
  if (value == null) return '–';
  return new Intl.NumberFormat('nb-NO').format(value);
}

export function roiColor(roi) {
  if (roi == null) return 'text-gray-400';
  if (roi >= 1.0) return 'text-green-400';
  if (roi >= 0.5) return 'text-lime-400';
  if (roi >= 0) return 'text-yellow-400';
  return 'text-red-400';
}

export function deviationColor(dev) {
  if (dev == null) return 'text-gray-400';
  if (dev <= -0.05) return 'text-green-400';
  if (dev <= 0.1) return 'text-yellow-400';
  return 'text-red-400';
}
