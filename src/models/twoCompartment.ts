import { AdministrationParameters, EffectivePKParameters } from "../types/pharmacokinetics";
import { SimulationParameters, SimulationPoint } from "../types/simulation";
import { rk4Step } from "../simulation/numericalSolver";

export function simulateTwoCompartment(
  effective: EffectivePKParameters,
  admin: AdministrationParameters,
  sim: SimulationParameters
): SimulationPoint[] {
  const { V1, V2, Kel, K12, K21, effectiveKa } = effective;
  const { route, type, duration: infDuration, infusionRate } = admin;
  const dose = effective.effectiveDose;
  const dt = sim.timeStep;
  const totalSteps = Math.round(sim.duration / dt);

  const points: SimulationPoint[] = [];

  // State vector:
  // [0]: A1 (amount in central compartment, mg)
  // [1]: A2 (amount in peripheral compartment, mg)
  // [2]: AL (amount in pulmonary depot, mg)
  // [3]: cumulativeElimination (mg)
  // [4]: cumulativeInput (mg)

  let y = [0, 0, 0, 0, 0];

  if (route === "IV" && type === "BOLUS") {
    y[0] = dose; // Instantaneous central delivery
    y[4] = dose;
  } else if (route === "INHALATION") {
    y[2] = dose; // Pulmonary depot
  }

  const getSystemicInput = (t: number, curY: number[]): number => {
    if (route === "IV") {
      if (type === "INFUSION") {
        return t <= infDuration ? infusionRate : 0;
      }
      return 0; // Bolus already at t=0
    }
    if (route === "INHALATION") {
      return effectiveKa * curY[2];
    }
    return 0;
  };

  const derivatives = (t: number, curY: number[]): number[] => {
    const A1 = Math.max(0, curY[0]);
    const A2 = Math.max(0, curY[1]);
    const AL = Math.max(0, curY[2]);

    const sysInput = getSystemicInput(t, curY);
    const elimRate = Kel * A1;

    // dA1/dt = Input - (K12 + Kel)*A1 + K21*A2
    const dA1_dt = sysInput - (K12 + Kel) * A1 + K21 * A2;

    // dA2/dt = K12*A1 - K21*A2
    const dA2_dt = K12 * A1 - K21 * A2;

    // dAL/dt (inhalation)
    const dAL_dt = route === "INHALATION" ? -effectiveKa * AL : 0;

    // Cumulative tracking
    const dCumElim_dt = elimRate;
    const dCumInput_dt = route === "IV" && type === "INFUSION" && t <= infDuration ? infusionRate : 0;

    return [dA1_dt, dA2_dt, dAL_dt, dCumElim_dt, dCumInput_dt];
  };

  // Record t = 0
  const initialInputRate = getSystemicInput(0, y);
  points.push({
    time: 0,
    A1: y[0],
    A2: y[1],
    AL: y[2],
    C1: y[0] / V1,
    C2: y[1] / V2,
    eliminationRate: Kel * y[0],
    inputRate: initialInputRate,
    cumulativeElimination: y[3],
    cumulativeInput: y[4],
  });

  let t = 0;
  for (let step = 1; step <= totalSteps; step++) {
    y = rk4Step(t, y, dt, derivatives);
    t = step * dt;

    const cumIn = route === "INHALATION" ? (dose - y[2]) : y[4];
    const elimRate = Kel * y[0];
    const inRate = getSystemicInput(t, y);

    points.push({
      time: Math.round(t * 1000) / 1000,
      A1: Math.max(0, y[0]),
      A2: Math.max(0, y[1]),
      AL: Math.max(0, y[2]),
      C1: Math.max(0, y[0]) / V1,
      C2: Math.max(0, y[1]) / V2,
      eliminationRate: elimRate,
      inputRate: inRate,
      cumulativeElimination: y[3],
      cumulativeInput: cumIn,
    });
  }

  return points;
}
