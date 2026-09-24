import { describe, it, expect } from "vitest";
import { runSimulation } from "../src/simulation/simulationEngine";
import { DEFAULT_PATIENT } from "../src/types/patient";
import { DEMO_DRUGS } from "../src/data/demoDrugs";

describe("Mass Conservation Law", () => {
  it("TEST 6: without input or elimination, A1 + A2 remains strictly constant", () => {
    const zeroElimDrug = {
      ...DEMO_DRUGS[1],
      clearanceTotal: 0.000000000001,
      clearanceRenal: 0,
      clearanceNonRenal: 0,
    };
    const dose = 100;

    const sim = runSimulation(
      DEFAULT_PATIENT,
      zeroElimDrug,
      { route: "IV", type: "BOLUS", dose, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "TWO_COMPARTMENT", duration: 12, timeStep: 0.01, speed: 1 }
    );

    for (const pt of sim.points) {
      const totalAmount = pt.A1 + pt.A2;
      expect(totalAmount).toBeCloseTo(dose, 2);
    }
  });

  it("TEST 7: with elimination, A1 + A2 + cumulativeElimination = initial Dose + cumulativeInput within tight tolerance", () => {
    const drug = DEMO_DRUGS[1];
    const dose = 250;

    const sim = runSimulation(
      DEFAULT_PATIENT,
      drug,
      { route: "IV", type: "BOLUS", dose, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "TWO_COMPARTMENT", duration: 24, timeStep: 0.01, speed: 1 }
    );

    for (const pt of sim.points) {
      const totalMass = pt.A1 + pt.A2 + pt.cumulativeElimination;
      expect(totalMass).toBeCloseTo(dose, 1);
    }
  });

  it("TEST 7 (Infusion): mass conservation holds during and after IV infusion", () => {
    const drug = DEMO_DRUGS[0];
    const infRate = 40; // mg/h
    const infDur = 2; // h => total dose 80 mg

    const sim = runSimulation(
      DEFAULT_PATIENT,
      drug,
      { route: "IV", type: "INFUSION", dose: 80, doseUnit: "mg", infusionRate: infRate, duration: infDur },
      { model: "TWO_COMPARTMENT", duration: 12, timeStep: 0.01, speed: 1 }
    );

    for (const pt of sim.points) {
      const totalMass = pt.A1 + pt.A2 + pt.cumulativeElimination;
      expect(totalMass).toBeCloseTo(pt.cumulativeInput, 1);
    }
  });
});
