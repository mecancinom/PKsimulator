import { describe, it, expect } from "vitest";
import { runSimulation } from "../src/simulation/simulationEngine";
import { DEFAULT_PATIENT } from "../src/types/patient";
import { DEMO_DRUGS } from "../src/data/demoDrugs";
import { calculatePulmonaryVentilation } from "../src/models/physiology";

describe("Inhalation Route & Pulmonary Absorption", () => {
  it("calculates alveolar ventilation correctly with dead space", () => {
    // VE = 12 * 500 = 6000 mL/min
    // VA = 12 * (500 - 150) = 4200 mL/min
    const res = calculatePulmonaryVentilation(12, 500, 150, 1.0);
    expect(res.VE).toBe(6000);
    expect(res.VA).toBe(4200);
    expect(res.ventilationFactor).toBeCloseTo(1.0, 4);
    expect(res.effectiveKa).toBeCloseTo(1.0, 4);

    // If RR doubles to 24:
    const resFast = calculatePulmonaryVentilation(24, 500, 150, 1.0);
    expect(resFast.VA).toBe(8400);
    expect(resFast.ventilationFactor).toBeCloseTo(2.0, 4);
    expect(resFast.effectiveKa).toBeCloseTo(2.0, 4);
  });

  it("TEST 12: increasing Ka accelerates systemic entry, shifting Tmax earlier", () => {
    const baseDrug = DEMO_DRUGS[0];
    const dose = 100;

    const patientNormal = { ...DEFAULT_PATIENT, respiratoryRate: 12 };
    const patientTachypneic = { ...DEFAULT_PATIENT, respiratoryRate: 24 };

    const simNormal = runSimulation(
      patientNormal,
      baseDrug,
      { route: "INHALATION", type: "INHALATION", dose, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "ONE_COMPARTMENT", duration: 12, timeStep: 0.01, speed: 1 }
    );

    const simFast = runSimulation(
      patientTachypneic,
      baseDrug,
      { route: "INHALATION", type: "INHALATION", dose, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "ONE_COMPARTMENT", duration: 12, timeStep: 0.01, speed: 1 }
    );

    // Effective Ka is higher with faster RR
    expect(simFast.effectiveParams.effectiveKa).toBeGreaterThan(simNormal.effectiveParams.effectiveKa);

    // Peak concentration is reached earlier or higher
    expect(simFast.summary.Cmax).toBeGreaterThanOrEqual(simNormal.summary.Cmax);
    expect(simFast.summary.Tmax).toBeLessThanOrEqual(simNormal.summary.Tmax);
  });

  it("conserves total mass in pulmonary inhalation: AL + A1 + A2 + cumulativeElimination = dose", () => {
    const baseDrug = DEMO_DRUGS[0];
    const dose = 150;

    const sim = runSimulation(
      DEFAULT_PATIENT,
      baseDrug,
      { route: "INHALATION", type: "INHALATION", dose, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "TWO_COMPARTMENT", duration: 24, timeStep: 0.01, speed: 1 }
    );

    for (const pt of sim.points) {
      const totalMass = pt.AL + pt.A1 + pt.A2 + pt.cumulativeElimination;
      expect(totalMass).toBeCloseTo(dose, 1);
    }
  });
});
