import { describe, it, expect } from "vitest";
import { runSimulation } from "../src/simulation/simulationEngine";
import { DEFAULT_PATIENT } from "../src/types/patient";
import { DEMO_DRUGS } from "../src/data/demoDrugs";

describe("Two-Compartment Model Dynamics", () => {
  const baseDrug = DEMO_DRUGS[1]; // V1: 20, V2: 80, K12: 1.4, K21: 0.35, CL: 10

  it("TEST 5: total rate of change dA1/dt + dA2/dt equals Input - Kel * A1", () => {
    const sim = runSimulation(
      DEFAULT_PATIENT,
      baseDrug,
      { route: "IV", type: "BOLUS", dose: 200, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "TWO_COMPARTMENT", duration: 10, timeStep: 0.005, speed: 1 }
    );

    const Kel = sim.effectiveParams.Kel;
    const pts = sim.points;

    // Check derivative sum at multiple points (numerical central difference)
    for (let i = 10; i < pts.length - 10; i += 50) {
      const pPrev = pts[i - 1];
      const pNext = pts[i + 1];
      const pCur = pts[i];
      const dt = pNext.time - pPrev.time;

      const dA1_dt = (pNext.A1 - pPrev.A1) / dt;
      const dA2_dt = (pNext.A2 - pPrev.A2) / dt;
      const rateSum = dA1_dt + dA2_dt;

      const expectedRate = pCur.inputRate - Kel * pCur.A1;
      expect(rateSum).toBeCloseTo(expectedRate, 0); // within numerical derivative tolerance
    }
  });

  it("TEST 8: if K12 = 0, no transfer to peripheral compartment occurs (A2 = 0)", () => {
    const noTransferDrug = { ...baseDrug, K12: 0 };
    const sim = runSimulation(
      DEFAULT_PATIENT,
      noTransferDrug,
      { route: "IV", type: "BOLUS", dose: 100, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "TWO_COMPARTMENT", duration: 10, timeStep: 0.01, speed: 1 }
    );

    for (const pt of sim.points) {
      expect(pt.A2).toBeCloseTo(0, 8);
      expect(pt.C2).toBeCloseTo(0, 8);
    }
  });

  it("TEST 9: if K21 increases, redistribution back to central compartment accelerates", () => {
    const slowReturnDrug = { ...baseDrug, K21: 0.1 };
    const fastReturnDrug = { ...baseDrug, K21: 0.8 };

    const simSlow = runSimulation(
      DEFAULT_PATIENT,
      slowReturnDrug,
      { route: "IV", type: "BOLUS", dose: 100, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "TWO_COMPARTMENT", duration: 12, timeStep: 0.01, speed: 1 }
    );

    const simFast = runSimulation(
      DEFAULT_PATIENT,
      fastReturnDrug,
      { route: "IV", type: "BOLUS", dose: 100, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "TWO_COMPARTMENT", duration: 12, timeStep: 0.01, speed: 1 }
    );

    // Fast return should have lower peripheral amount at later times because it returns to central
    const midPointSlow = simSlow.points.find(p => p.time >= 6.0)!;
    const midPointFast = simFast.points.find(p => p.time >= 6.0)!;

    expect(midPointFast.A2).toBeLessThan(midPointSlow.A2);
  });
});
