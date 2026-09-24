import { PatientParameters } from "../types/patient";
import { DrugParameters, EffectivePKParameters } from "../types/pharmacokinetics";

export const GFR_BASELINE = 100; // mL/min/1.73 m²
export const RR_BASELINE = 12; // breaths/min
export const VT_BASELINE = 500; // mL
export const DS_BASELINE = 150; // mL
export const VA_BASELINE = RR_BASELINE * (VT_BASELINE - DS_BASELINE); // 4200 mL/min

export const HR_BASELINE = 70; // bpm
export const SV_BASELINE = 70; // mL
export const CO_BASELINE = (HR_BASELINE * SV_BASELINE) / 1000; // 4.9 L/min

export interface PulmonaryVentilationResult {
  VE: number; // Minute ventilation (mL/min)
  VA: number; // Alveolar ventilation (mL/min)
  ventilationFactor: number; // VA / VA_baseline
  effectiveKa: number; // 1/h
}

export function calculatePulmonaryVentilation(
  respiratoryRate: number,
  tidalVolume: number = VT_BASELINE,
  deadSpace: number = DS_BASELINE,
  kaBase: number = 1.0
): PulmonaryVentilationResult {
  const safeDS = Math.min(deadSpace, tidalVolume * 0.8);
  const VE = respiratoryRate * tidalVolume;
  const VA = Math.max(0, respiratoryRate * (tidalVolume - safeDS));
  const ventilationFactor = VA / VA_BASELINE;
  const effectiveKa = kaBase * Math.max(0.1, ventilationFactor);

  return {
    VE,
    VA,
    ventilationFactor,
    effectiveKa,
  };
}

export interface HemodynamicResult {
  strokeVolume: number; // mL
  cardiacOutput: number; // L/min
  distributionFactor: number; // CO / CO_baseline
}

export function calculateCardiacOutput(
  heartRate: number,
  strokeVolume: number = SV_BASELINE
): HemodynamicResult {
  const cardiacOutput = (heartRate * strokeVolume) / 1000;
  const distributionFactor = cardiacOutput / CO_BASELINE;
  return {
    strokeVolume,
    cardiacOutput,
    distributionFactor,
  };
}

/**
 * Computes the effective PK parameters integrating patient physiology with drug properties.
 */
export function computeEffectivePKParameters(
  patient: PatientParameters,
  drug: DrugParameters,
  doseMg: number
): EffectivePKParameters {
  // 1. Renal clearance adjusted by GFR
  const clRenalBaseline = drug.clearanceRenal || drug.clearanceTotal * drug.renalFraction;
  const clNonRenalBaseline = drug.clearanceNonRenal || drug.clearanceTotal * (1 - drug.renalFraction);

  const gfrRatio = Math.max(0.05, patient.gfr / GFR_BASELINE);
  const CL_renal = clRenalBaseline * gfrRatio;
  const CL_nonrenal = clNonRenalBaseline;
  const CL_total = CL_renal + CL_nonrenal;

  const V1 = drug.V1;
  const V2 = drug.V2;
  const Kel = CL_total / V1;

  // 2. Hemodynamic effect on distribution (if enabled)
  let K12 = drug.K12;
  let K21 = drug.K21;
  if (patient.enableHemodynamicEffect) {
    const hemo = calculateCardiacOutput(patient.heartRate, patient.strokeVolume);
    K12 = drug.K12 * hemo.distributionFactor;
  }

  // 3. Pulmonary absorption
  const pulm = calculatePulmonaryVentilation(
    patient.respiratoryRate,
    patient.tidalVolume,
    patient.deadSpace,
    drug.Ka
  );
  const effectiveKa = pulm.effectiveKa;

  // 4. Macro constants for two-compartment model
  // lambda^2 - (K12 + K21 + Kel) lambda + K21 * Kel = 0
  const sumRates = K12 + K21 + Kel;
  const prodRates = K21 * Kel;
  const discriminant = Math.max(0, sumRates * sumRates - 4 * prodRates);
  const sqrtDisc = Math.sqrt(discriminant);

  const alpha = (sumRates + sqrtDisc) / 2; // Fast disposition rate constant (distribution phase)
  const beta = (sumRates - sqrtDisc) / 2; // Slow disposition rate constant (elimination phase)

  const tHalfAlpha = alpha > 0 ? Math.LN2 / alpha : 0;
  const tHalfBeta = beta > 0 ? Math.LN2 / beta : 0;
  const tHalfMono = Kel > 0 ? Math.LN2 / Kel : 0;

  // Bi-exponential coefficients for IV bolus: C(t) = A e^(-alpha*t) + B e^(-beta*t)
  // C(0) = Dose / V1 = A + B
  // A = (Dose / V1) * (alpha - K21) / (alpha - beta)
  // B = (Dose / V1) * (K21 - beta) / (alpha - beta)
  let macroA = 0;
  let macroB = 0;
  if (alpha !== beta && (alpha - beta) !== 0) {
    const C0 = doseMg / V1;
    macroA = C0 * ((alpha - K21) / (alpha - beta));
    macroB = C0 * ((K21 - beta) / (alpha - beta));
  } else {
    macroA = doseMg / V1;
    macroB = 0;
  }

  return {
    V1,
    V2,
    CL_renal,
    CL_nonrenal,
    CL_total,
    Kel,
    K12,
    K21,
    effectiveKa,
    effectiveDose: doseMg,
    alpha,
    beta,
    tHalfAlpha,
    tHalfBeta,
    tHalfMono,
    macroA,
    macroB,
  };
}
