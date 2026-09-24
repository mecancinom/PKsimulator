import { describe, it, expect } from "vitest";
import { runSimulation } from "../src/simulation/simulationEngine";
import { DEFAULT_PATIENT } from "../src/types/patient";
import { DEMO_DRUGS } from "../src/data/demoDrugs";
import { computeEffectivePKParameters } from "../src/models/physiology";

describe("One-Compartment Model & Linearity", () => {
  const baseDrug = DEMO_DRUGS[0]; // V1: 15, CL: 6.0, renal: 80%

  it("TEST 1: approximates analytical solution A(t) = A0 * e^(-Kel * t) accurately", () => {
    const dose = 100;
    const simResult = runSimulation(
      DEFAULT_PATIENT,
      baseDrug,
      { route: "IV", type: "BOLUS", dose, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "ONE_COMPARTMENT", duration: 10, timeStep: 0.01, speed: 1 }
    );

    const Kel = simResult.effectiveParams.Kel; // CL / V1 = 6.0 / 15 = 0.4 /h
    expect(Kel).toBeCloseTo(0.4, 4);

    // Check intermediate points against analytical solution
    for (const pt of simResult.points) {
      if (pt.time === 0 || pt.time === 1.0 || pt.time === 2.0 || pt.time === 5.0) {
        const expectedA = dose * Math.exp(-Kel * pt.time);
        expect(pt.A1).toBeCloseTo(expectedA, 1);
        const expectedC = expectedA / baseDrug.V1;
        expect(pt.C1).toBeCloseTo(expectedC, 1);
      }
    }
  });

  it("TEST 2: doubling dose doubles approximately Cmax and AUC in linear model", () => {
    const sim1 = runSimulation(
      DEFAULT_PATIENT,
      baseDrug,
      { route: "IV", type: "BOLUS", dose: 100, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "ONE_COMPARTMENT", duration: 24, timeStep: 0.01, speed: 1 }
    );

    const sim2 = runSimulation(
      DEFAULT_PATIENT,
      baseDrug,
      { route: "IV", type: "BOLUS", dose: 200, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "ONE_COMPARTMENT", duration: 24, timeStep: 0.01, speed: 1 }
    );

    // Cmax should double
    expect(sim2.summary.Cmax / sim1.summary.Cmax).toBeCloseTo(2.0, 3);
    // AUC should double
    expect(sim2.summary.AUC0_t / sim1.summary.AUC0_t).toBeCloseTo(2.0, 2);
  });

  it("TEST 3: if CL decreases, half-life t1/2 increases", () => {
    const highCLDrug = { ...baseDrug, clearanceTotal: 10.0, clearanceRenal: 8.0, clearanceNonRenal: 2.0 };
    const lowCLDrug = { ...baseDrug, clearanceTotal: 3.0, clearanceRenal: 2.4, clearanceNonRenal: 0.6 };

    const simHigh = runSimulation(
      DEFAULT_PATIENT,
      highCLDrug,
      { route: "IV", type: "BOLUS", dose: 100, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "ONE_COMPARTMENT", duration: 24, timeStep: 0.01, speed: 1 }
    );

    const simLow = runSimulation(
      DEFAULT_PATIENT,
      lowCLDrug,
      { route: "IV", type: "BOLUS", dose: 100, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "ONE_COMPARTMENT", duration: 24, timeStep: 0.01, speed: 1 }
    );

    expect(simLow.summary.tHalf).toBeGreaterThan(simHigh.summary.tHalf);
  });

  it("TEST 4: if CL increases, AUC decreases", () => {
    const drugA = { ...baseDrug, clearanceTotal: 4.0, clearanceRenal: 3.2, clearanceNonRenal: 0.8 };
    const drugB = { ...baseDrug, clearanceTotal: 8.0, clearanceRenal: 6.4, clearanceNonRenal: 1.6 };

    const simA = runSimulation(
      DEFAULT_PATIENT,
      drugA,
      { route: "IV", type: "BOLUS", dose: 100, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "ONE_COMPARTMENT", duration: 24, timeStep: 0.01, speed: 1 }
    );

    const simB = runSimulation(
      DEFAULT_PATIENT,
      drugB,
      { route: "IV", type: "BOLUS", dose: 100, doseUnit: "mg", infusionRate: 0, duration: 1 },
      { model: "ONE_COMPARTMENT", duration: 24, timeStep: 0.01, speed: 1 }
    );

    expect(simB.summary.AUC0_t).toBeLessThan(simA.summary.AUC0_t);
  });

  it("TEST 10: reducing GFR modifies solely the renal component of clearance", () => {
    const patientNormal = { ...DEFAULT_PATIENT, gfr: 100 };
    const patientImpaired = { ...DEFAULT_PATIENT, gfr: 50 };

    const effNormal = computeEffectivePKParameters(patientNormal, baseDrug, 100);
    const effImpaired = computeEffectivePKParameters(patientImpaired, baseDrug, 100);

    // Non-renal clearance should remain strictly unchanged
    expect(effImpaired.CL_nonrenal).toBeCloseTo(effNormal.CL_nonrenal, 5);
    // Renal clearance should be reduced by half (50/100)
    expect(effImpaired.CL_renal).toBeCloseTo(effNormal.CL_renal * 0.5, 4);
    // Total clearance reflects change
    expect(effImpaired.CL_total).toBeCloseTo(effImpaired.CL_renal + effImpaired.CL_nonrenal, 5);
  });

  it("TEST 11: if renalFraction = 0, changing GFR does not modify total clearance", () => {
    const hepaticOnlyDrug = {
      ...baseDrug,
      renalFraction: 0,
      clearanceRenal: 0,
      clearanceNonRenal: 8.0,
      clearanceTotal: 8.0,
    };

    const patientNormal = { ...DEFAULT_PATIENT, gfr: 120 };
    const patientSevere = { ...DEFAULT_PATIENT, gfr: 15 };

    const effNormal = computeEffectivePKParameters(patientNormal, hepaticOnlyDrug, 100);
    const effSevere = computeEffectivePKParameters(patientSevere, hepaticOnlyDrug, 100);

    expect(effSevere.CL_total).toBeCloseTo(effNormal.CL_total, 5);
    expect(effSevere.Kel).toBeCloseTo(effNormal.Kel, 5);
  });
});
