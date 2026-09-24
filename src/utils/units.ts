/**
 * Unit conversion utilities for clinical pharmacokinetics and physiology.
 * Ensures consistent conversion between mL/min and L/h.
 */

// 1 mL/min = (1 mL * 60 min/h) / (1000 mL/L) = 0.06 L/h
export function mlMinToLHour(mlMin: number): number {
  return (mlMin * 60) / 1000;
}

// 1 L/h = (1 L * 1000 mL/L) / (60 min/h) = 16.6667 mL/min
export function lHourToMlMin(lHour: number): number {
  return (lHour * 1000) / 60;
}

export function formatNumber(val: number, decimals: number = 2): string {
  if (val === undefined || val === null || isNaN(val)) return "—";
  if (Math.abs(val) >= 1000) return val.toFixed(1);
  if (Math.abs(val) < 0.001 && val !== 0) return val.toExponential(2);
  if (Math.abs(val) < 0.1) return val.toFixed(3);
  return val.toFixed(decimals);
}
