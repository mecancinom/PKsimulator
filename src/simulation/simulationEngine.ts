import { PatientParameters } from "../types/patient";
import { AdministrationParameters, DrugParameters } from "../types/pharmacokinetics";
import { SimulationDataset, SimulationParameters, SimulationPoint } from "../types/simulation";
import { computeEffectivePKParameters } from "../models/physiology";
import { simulateOneCompartment } from "../models/oneCompartment";
import { simulateTwoCompartment } from "../models/twoCompartment";
import { computePKSummary } from "../utils/calculations";

export function runSimulation(
  patient: PatientParameters,
  drug: DrugParameters,
  admin: AdministrationParameters,
  sim: SimulationParameters
): SimulationDataset {
  // 1. Calculate effective dose in mg
  const effectiveDoseMg =
    admin.doseUnit === "mg/kg"
      ? admin.dose * patient.bodyWeight
      : admin.dose;

  // 2. Compute effective physiological & derived PK parameters
  const effective = computeEffectivePKParameters(patient, drug, effectiveDoseMg);

  // 3. Solve ODEs using Runge-Kutta 4
  let points: SimulationPoint[];
  if (sim.model === "ONE_COMPARTMENT") {
    points = simulateOneCompartment(effective, admin, sim);
  } else {
    points = simulateTwoCompartment(effective, admin, sim);
  }

  // 4. Compute comprehensive summary metrics (AUC, Cmax, Tmax, half-lives)
  const isTwoComp = sim.model === "TWO_COMPARTMENT";
  const summary = computePKSummary(points, effective, isTwoComp);

  return {
    points,
    summary,
    effectiveParams: effective,
    patient: { ...patient },
    drug: { ...drug },
    admin: { ...admin },
    model: sim.model,
  };
}
