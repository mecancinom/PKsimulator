import { PatientParameters } from "../types/patient";
import { AdministrationParameters, DrugParameters } from "../types/pharmacokinetics";
import { SimulationParameters } from "../types/simulation";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSimulationInputs(
  patient: PatientParameters,
  drug: DrugParameters,
  admin: AdministrationParameters,
  sim: SimulationParameters
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Patient checks
  if (patient.respiratoryRate < 4 || patient.respiratoryRate > 60) {
    errors.push("La frecuencia respiratoria debe estar entre 4 y 60 rpm.");
  }
  if (patient.heartRate < 30 || patient.heartRate > 220) {
    errors.push("La frecuencia cardiaca debe estar entre 30 y 220 lpm.");
  }
  if (patient.gfr < 5 || patient.gfr > 200) {
    errors.push("La TFG debe estar entre 5 y 200 mL/min/1.73 m².");
  }
  if (patient.bodyWeight <= 0 || patient.bodyWeight > 300) {
    errors.push("El peso corporal debe ser mayor a 0 y menor a 300 kg.");
  }

  // Drug checks
  if (drug.V1 <= 0) {
    errors.push("El volumen del compartimento central V1 debe ser estrictamente positivo.");
  }
  if (drug.clearanceTotal <= 0) {
    errors.push("El clearance total basal debe ser estrictamente positivo.");
  }
  if (drug.renalFraction < 0 || drug.renalFraction > 1) {
    errors.push("La fracción renal debe encontrarse entre 0 y 1.");
  }
  if (sim.model === "TWO_COMPARTMENT" && drug.V2 <= 0) {
    errors.push("El volumen periférico V2 debe ser positivo en el modelo bicompartimental.");
  }

  // Admin checks
  if (admin.dose <= 0) {
    errors.push("La dosis administrada debe ser mayor a 0.");
  }
  if (admin.type === "INFUSION") {
    if (admin.infusionRate <= 0) {
      errors.push("La velocidad de infusión debe ser mayor a 0 mg/h.");
    }
    if (admin.duration <= 0) {
      errors.push("La duración de la infusión debe ser mayor a 0 h.");
    }
  }

  // Simulation checks
  if (sim.duration <= 0 || sim.duration > 120) {
    errors.push("La duración de la simulación debe estar entre 0.1 y 120 h.");
  }
  if (sim.timeStep <= 0 || sim.timeStep > 0.1) {
    errors.push("El paso temporal (timeStep) debe estar entre 0.001 y 0.1 h.");
  }

  if (patient.gfr < 30) {
    warnings.push("TFG < 30 mL/min indica insuficiencia renal severa; espere prolongación marcada de vida media en fármacos con alta fracción renal.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
