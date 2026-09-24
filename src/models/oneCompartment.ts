import { AdministrationParameters } from "../types/pharmacokinetics";
import { EffectivePKParameters } from "../types/pharmacokinetics";
import { SimulationParameters, SimulationPoint } from "../types/simulation";
import { rk4Step } from "../simulation/numericalSolver";

export function simulateOneCompartment(
  effective: EffectivePKParameters,
  admin: AdministrationParameters,
  sim: SimulationParameters
): SimulationPoint[] {
  const { V1, Kel, effectiveKa } = effective;
  const { route, type, duration: infDuration, infusionRate } = admin;
  const dose = effective.effectiveDose;
  const dt = sim.timeStep;
  const totalSteps = Math.round(sim.duration / dt);

  const points: SimulationPoint[] = [];

  // State vector:
  // [0]: A1 (amount in body/central compartment, mg)
  // [1]: AL (amount in lung depot for inhalation, mg)
  // [2]: cumulativeElimination (mg)
  // [3]: cumulativeInput (mg)

  let y = [0, 0, 0, 0];

  if (route === "IV" && type === "BOLUS") {
    y[0] = dose; // Instantaneous bolus
    y[3] = dose;
  } else if (route === "INHALATION") {
    y[1] = dose; // Deposited into pulmonary depot at t=0
  }

  const getSystemicInput = (t: number, curY: number[]): number => {
    if (route === "IV") {
      if (type === "INFUSION") {
        return t <= infDuration ? infusionRate : 0;
      }
      return 0; // Bolus handled at t=0
    }
    if (route === "INHALATION") {
      // Absorption from lung depot into central: Input = Ka * AL
      return effectiveKa * curY[1];
    }
    return 0;
  };

  const derivatives = (t: number, curY: number[]): number[] => {
    const A1 = Math.max(0, curY[0]);
    const AL = Math.max(0, curY[1]);

    const sysInput = getSystemicInput(t, curY);
    const elimRate = Kel * A1;

    // dA1/dt
    const dA1_dt = sysInput - elimRate;

    // dAL/dt (for inhalation)
    const dAL_dt = route === "INHALATION" ? -effectiveKa * AL : 0;

    // Cumulative tracking derivatives
    const dCumElim_dt = elimRate;
    const dCumInput_dt = route === "IV" && type === "INFUSION" && t <= infDuration ? infusionRate : 0;

    return [dA1_dt, dAL_dt, dCumElim_dt, dCumInput_dt];
  };

  // Record t = 0
  const initialInputRate = getSystemicInput(0, y);
  points.push({
    time: 0,
    A1: y[0],
    A2: 0,
    AL: y[1],
    C1: y[0] / V1,
    C2: 0,
    eliminationRate: Kel * y[0],
    inputRate: initialInputRate,
    cumulativeElimination: y[2],
    cumulativeInput: y[3],
  });

  let t = 0;
  for (let step = 1; step <= totalSteps; step++) {
    y = rk4Step(t, y, dt, derivatives);
    t = step * dt;

    // If inhalation, cumulative input to systemic is dose - AL
    const cumIn = route === "INHALATION" ? (dose - y[1]) : y[3];
    const elimRate = Kel * y[0];
    const inRate = getSystemicInput(t, y);

    points.push({
      time: Math.round(t * 1000) / 1000,
      A1: Math.max(0, y[0]),
      A2: 0,
      AL: Math.max(0, y[1]),
      C1: Math.max(0, y[0]) / V1,
      C2: 0,
      eliminationRate: elimRate,
      inputRate: inRate,
      cumulativeElimination: y[2],
      cumulativeInput: cumIn,
    });
  }

  return points;
}
