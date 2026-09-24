import { DrugParameters } from "../types/pharmacokinetics";

export const DEMO_DRUGS: DrugParameters[] = [
  {
    id: "demo-a",
    name: "DemoDrug-A (Eliminación Renal)",
    description: "Fármaco hidrofílico modelo con eliminación predominantemente renal (80%) y volumen de distribución moderado.",
    bioavailability: 1.0,
    V1: 15.0, // L
    V2: 25.0, // L
    clearanceTotal: 6.0, // L/h
    clearanceRenal: 4.8, // L/h (80%)
    clearanceNonRenal: 1.2, // L/h (20%)
    Ka: 1.2, // 1/h
    K12: 0.8, // 1/h
    K21: 0.4, // 1/h
    renalFraction: 0.8,
  },
  {
    id: "demo-b",
    name: "DemoDrug-B (Amplia Distribución)",
    description: "Fármaco lipofílico con alta penetración tisular (V2 elevado) y cinética bicompartimental marcada con eliminación mixta.",
    bioavailability: 1.0,
    V1: 20.0, // L
    V2: 80.0, // L
    clearanceTotal: 10.0, // L/h
    clearanceRenal: 3.5, // L/h (35%)
    clearanceNonRenal: 6.5, // L/h (65%)
    Ka: 0.8, // 1/h
    K12: 1.4, // 1/h (rápida distribución)
    K21: 0.35, // 1/h (retorno periférico más lento)
    renalFraction: 0.35,
  },
  {
    id: "demo-c",
    name: "DemoDrug-C (Metabolismo Hepático)",
    description: "Fármaco con depuración predominantemente no-renal (hepática/metabólica 90%). La función renal tiene mínimo impacto en su cinética.",
    bioavailability: 1.0,
    V1: 25.0, // L
    V2: 30.0, // L
    clearanceTotal: 15.0, // L/h
    clearanceRenal: 1.5, // L/h (10%)
    clearanceNonRenal: 13.5, // L/h (90%)
    Ka: 1.5, // 1/h
    K12: 0.7, // 1/h
    K21: 0.5, // 1/h
    renalFraction: 0.1,
  },
];
