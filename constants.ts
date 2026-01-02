import type { Diameter } from './types';

export const DIAMETERS: Readonly<Diameter[]> = [45, 70, 110];

/**
 * Divisors 'K' for the formula: ΔP = (L/100) * (Q/K)²
 * Where:
 * ΔP = Pressure loss in bars
 * L = Length in meters
 * Q = Flow rate in L/min
 *
 * These values are calibrated to match standard firefighter rules of thumb:
 * - Ø 45mm: ~1.5 bar loss per 100m at 250 L/min
 * - Ø 70mm: ~0.55 bar loss per 100m at 500 L/min
 * - Ø 110mm: ~0.28 bar loss per 100m at 1000 L/min
 */
export const DIVISORS: Record<Diameter, number> = {
  45: 204,
  70: 674,
  110: 1890,
};