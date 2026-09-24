export interface DrugParameters {
  id?: string;
  name: string;
  description?: string;
  bioavailability: number; // F (0 to 1), 1 for IV
  V1: number; // Central volume (L)
  V2: number; // Peripheral volume (L)
  clearanceTotal: number; // Total baseline clearance (L/h)
  clearanceRenal: number; // Renal baseline clearance (L/h)
  clearanceNonRenal: number; // Non-renal clearance (L/h)
  Ka: number; // Absorption rate constant (1/h)
  K12: number; // Transfer rate constant central -> peripheral (1/h)
  K21: number; // Transfer rate constant peripheral -> central (1/h)
  renalFraction: number; // Fraction of total clearance via renal route (0 to 1)
}

export type AdministrationRoute = "IV" | "INHALATION";
export type AdministrationType = "BOLUS" | "INFUSION" | "INHALATION";

export interface AdministrationParameters {
  route: AdministrationRoute;
  type: AdministrationType;
  dose: number; // numerical dose value
  doseUnit: "mg" | "mg/kg";
  infusionRate: number; // mg/h (used when type === "INFUSION")
  duration: number; // h (infusion duration)
}

export interface EffectivePKParameters {
  V1: number; // L
  V2: number; // L
  CL_renal: number; // L/h
  CL_nonrenal: number; // L/h
  CL_total: number; // L/h
  Kel: number; // 1/h = CL_total / V1
  K12: number; // 1/h (adjusted by CO if enabled)
  K21: number; // 1/h
  effectiveKa: number; // 1/h (adjusted by ventilation in inhalation)
  effectiveDose: number; // mg (total administered)
  // Bi-compartmental macro coefficients:
  alpha?: number; // fast rate constant (1/h)
  beta?: number; // slow rate constant (1/h)
  tHalfAlpha?: number; // h
  tHalfBeta?: number; // h
  tHalfMono?: number; // h = ln(2)/Kel
  macroA?: number; // mg/L (for IV bolus)
  macroB?: number; // mg/L (for IV bolus)
}

export interface PKSummaryResults {
  Cmax: number; // mg/L
  Tmax: number; // h
  AUC0_t: number; // (mg·h)/L trapezoidal integration
  tHalf: number; // h (terminal half life)
  CL: number; // L/h
  Vd: number; // L (V1 for 1-comp, V1+V2 for 2-comp steady-state)
  Kel: number; // 1/h
  alpha?: number;
  beta?: number;
  tHalfAlpha?: number;
  tHalfBeta?: number;
  macroA?: number;
  macroB?: number;
}
