import { SimulationPoint } from "../types/simulation";
import { PKSummaryResults, EffectivePKParameters } from "../types/pharmacokinetics";

/**
 * Calculates Area Under the Curve (AUC) using the trapezoidal rule.
 * AUC = Σ [(Ci + Ci+1) / 2] * Δt
 */
export function calculateTrapezoidalAUC(points: SimulationPoint[], seriesKey: "C1" | "C2" = "C1"): number {
  if (points.length < 2) return 0;
  let totalAUC = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dt = p2.time - p1.time;
    const avgC = (p1[seriesKey] + p2[seriesKey]) / 2;
    totalAUC += avgC * dt;
  }
  return totalAUC;
}

/**
 * Computes Cmax and Tmax from simulation points.
 */
export function calculateCmaxTmax(points: SimulationPoint[], seriesKey: "C1" | "C2" = "C1"): { Cmax: number; Tmax: number } {
  if (points.length === 0) return { Cmax: 0, Tmax: 0 };
  let Cmax = -Infinity;
  let Tmax = 0;

  for (const pt of points) {
    const val = pt[seriesKey];
    if (val > Cmax) {
      Cmax = val;
      Tmax = pt.time;
    }
  }

  return { Cmax: Math.max(0, Cmax), Tmax };
}

/**
 * Generates the full PKSummaryResults from points and effective parameters.
 */
export function computePKSummary(
  points: SimulationPoint[],
  effective: EffectivePKParameters,
  isTwoCompartment: boolean
): PKSummaryResults {
  const { Cmax, Tmax } = calculateCmaxTmax(points, "C1");
  const AUC0_t = calculateTrapezoidalAUC(points, "C1");

  // Terminal half life
  const tHalf = isTwoCompartment ? (effective.tHalfBeta ?? effective.tHalfMono ?? 0) : (effective.tHalfMono ?? 0);
  const Vd = isTwoCompartment ? effective.V1 + effective.V2 : effective.V1;

  return {
    Cmax,
    Tmax,
    AUC0_t,
    tHalf,
    CL: effective.CL_total,
    Vd,
    Kel: effective.Kel,
    alpha: effective.alpha,
    beta: effective.beta,
    tHalfAlpha: effective.tHalfAlpha,
    tHalfBeta: effective.tHalfBeta,
    macroA: effective.macroA,
    macroB: effective.macroB,
  };
}
