import { PatientParameters } from "./patient";
import {
  AdministrationParameters,
  DrugParameters,
  EffectivePKParameters,
  PKSummaryResults,
} from "./pharmacokinetics";

export type PKModelType = "ONE_COMPARTMENT" | "TWO_COMPARTMENT";

export interface SimulationParameters {
  model: PKModelType;
  duration: number; // h (total simulation time, e.g. 12h, 24h, 48h)
  timeStep: number; // h (default 0.01h)
  speed: number; // playback speed multiplier (0.25x, 0.5x, 1x, 2x, 4x)
}

export interface SimulationPoint {
  time: number; // h
  A1: number; // mg in central / single compartment
  A2: number; // mg in peripheral compartment (0 for one-compartment)
  AL: number; // mg in pulmonary depot (for inhalation, 0 otherwise)
  C1: number; // mg/L central concentration
  C2: number; // mg/L peripheral concentration (0 for one-compartment)
  eliminationRate: number; // mg/h
  inputRate: number; // mg/h
  cumulativeElimination: number; // mg
  cumulativeInput: number; // mg
}

export interface SimulationDataset {
  points: SimulationPoint[];
  summary: PKSummaryResults;
  effectiveParams: EffectivePKParameters;
  patient: PatientParameters;
  drug: DrugParameters;
  admin: AdministrationParameters;
  model: PKModelType;
}

export interface SavedScenario {
  id: string;
  name: string;
  timestamp: number;
  dataset: SimulationDataset;
}

export type AppMode = "student" | "teacher";
