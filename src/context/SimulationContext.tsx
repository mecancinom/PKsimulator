import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { PatientParameters, DEFAULT_PATIENT } from "../types/patient";
import {
  DrugParameters,
  AdministrationParameters,
  PKSummaryResults,
  EffectivePKParameters,
} from "../types/pharmacokinetics";
import {
  PKModelType,
  SimulationDataset,
  SimulationParameters,
  SimulationPoint,
  AppMode,
} from "../types/simulation";
import { DEMO_DRUGS } from "../data/demoDrugs";
import { runSimulation } from "../simulation/simulationEngine";
import { VirtualExperiment } from "../data/scenarios";
import { ClinicalChallenge } from "../data/educationalCases";

interface SimulationContextType {
  // Config & Parameters
  patient: PatientParameters;
  drug: DrugParameters;
  admin: AdministrationParameters;
  sim: SimulationParameters;
  currentDataset: SimulationDataset;

  // Animation & Playback
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  currentPoint: SimulationPoint;

  // Comparison Scenarios
  scenarioA: SimulationDataset | null;
  scenarioB: SimulationDataset | null;

  // UI & Modes
  appMode: AppMode;
  advancedMode: boolean;
  selectedChart: "concentration" | "amount" | "both";
  lastChangedParam: string | null;
  lockedParameters: Record<string, boolean>;

  // Actions
  updatePatient: (partial: Partial<PatientParameters>, paramName?: string) => void;
  updateDrug: (partial: Partial<DrugParameters>, paramName?: string) => void;
  updateAdmin: (partial: Partial<AdministrationParameters>, paramName?: string) => void;
  updateSim: (partial: Partial<SimulationParameters>, paramName?: string) => void;
  selectDrug: (drug: DrugParameters) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  stepSimulation: (direction: 1 | -1) => void;
  resetPlayback: () => void;
  saveAsScenarioA: () => void;
  saveAsScenarioB: () => void;
  clearComparison: () => void;
  setAppMode: (mode: AppMode) => void;
  setAdvancedMode: (advanced: boolean) => void;
  setSelectedChart: (chart: "concentration" | "amount" | "both") => void;
  toggleParamLock: (paramKey: string) => void;
  loadExperiment: (exp: VirtualExperiment) => void;
  loadClinicalChallenge: (challenge: ClinicalChallenge) => void;
  exportCSV: () => void;
  copyScenarioLink: () => string;
  copyConfigurationJSON: () => string;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State
  const [patient, setPatient] = useState<PatientParameters>(DEFAULT_PATIENT);
  const [drug, setDrug] = useState<DrugParameters>(DEMO_DRUGS[0]);
  const [admin, setAdmin] = useState<AdministrationParameters>({
    route: "IV",
    type: "BOLUS",
    dose: 100,
    doseUnit: "mg",
    infusionRate: 25,
    duration: 2,
  });
  const [sim, setSim] = useState<SimulationParameters>({
    model: "TWO_COMPARTMENT",
    duration: 16,
    timeStep: 0.01,
    speed: 1,
  });

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const [scenarioA, setScenarioA] = useState<SimulationDataset | null>(null);
  const [scenarioB, setScenarioB] = useState<SimulationDataset | null>(null);

  const [appMode, setAppMode] = useState<AppMode>("student");
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  const [selectedChart, setSelectedChart] = useState<"concentration" | "amount" | "both">("both");
  const [lastChangedParam, setLastChangedParam] = useState<string | null>(null);
  const [lockedParameters, setLockedParameters] = useState<Record<string, boolean>>({});

  // 2. Compute current dataset reactively with memoization
  const currentDataset = useMemo(() => {
    return runSimulation(patient, drug, admin, sim);
  }, [patient, drug, admin, sim]);

  // Find point closest to currentTime
  const currentPoint = useMemo(() => {
    if (!currentDataset.points.length) {
      return {
        time: 0,
        A1: 0,
        A2: 0,
        AL: 0,
        C1: 0,
        C2: 0,
        eliminationRate: 0,
        inputRate: 0,
        cumulativeElimination: 0,
        cumulativeInput: 0,
      };
    }
    const idx = Math.min(
      currentDataset.points.length - 1,
      Math.max(0, Math.round(currentTime / sim.timeStep))
    );
    return currentDataset.points[idx] || currentDataset.points[0];
  }, [currentDataset, currentTime, sim.timeStep]);

  // 3. Animation Loop with requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) return;

    let animFrameId: number;
    let lastTimestamp: number | null = null;

    const tick = (timestamp: number) => {
      if (lastTimestamp !== null) {
        const deltaSeconds = (timestamp - lastTimestamp) / 1000;
        // In this simulation: 1 real second = 1 sim hour * playbackSpeed
        const simHoursElapsed = deltaSeconds * playbackSpeed;
        setCurrentTime((prev) => {
          const next = prev + simHoursElapsed;
          if (next >= sim.duration) {
            setIsPlaying(false);
            return sim.duration;
          }
          return next;
        });
      }
      lastTimestamp = timestamp;
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [isPlaying, playbackSpeed, sim.duration]);

  // Read URL parameters on initial mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const modelParam = urlParams.get("model");
      const routeParam = urlParams.get("route");
      const doseParam = urlParams.get("dose");
      const gfrParam = urlParams.get("gfr");
      const rrParam = urlParams.get("rr");
      const hrParam = urlParams.get("hr");
      const drugIdParam = urlParams.get("drug");

      if (modelParam === "one" || modelParam === "ONE_COMPARTMENT") {
        setSim((prev) => ({ ...prev, model: "ONE_COMPARTMENT" }));
      } else if (modelParam === "two" || modelParam === "TWO_COMPARTMENT") {
        setSim((prev) => ({ ...prev, model: "TWO_COMPARTMENT" }));
      }

      if (routeParam === "inhalation" || routeParam === "INHALATION") {
        setAdmin((prev) => ({ ...prev, route: "INHALATION", type: "INHALATION" }));
      } else if (routeParam === "infusion" || routeParam === "INFUSION") {
        setAdmin((prev) => ({ ...prev, route: "IV", type: "INFUSION" }));
      } else if (routeParam === "iv" || routeParam === "IV") {
        setAdmin((prev) => ({ ...prev, route: "IV", type: "BOLUS" }));
      }

      if (doseParam && !isNaN(Number(doseParam))) {
        setAdmin((prev) => ({ ...prev, dose: Math.max(1, Number(doseParam)) }));
      }
      if (gfrParam && !isNaN(Number(gfrParam))) {
        setPatient((prev) => ({ ...prev, gfr: Math.max(10, Math.min(180, Number(gfrParam))) }));
      }
      if (rrParam && !isNaN(Number(rrParam))) {
        setPatient((prev) => ({ ...prev, respiratoryRate: Math.max(6, Math.min(50, Number(rrParam))) }));
      }
      if (hrParam && !isNaN(Number(hrParam))) {
        setPatient((prev) => ({ ...prev, heartRate: Math.max(40, Math.min(180, Number(hrParam))) }));
      }
      if (drugIdParam) {
        const found = DEMO_DRUGS.find((d) => d.id === drugIdParam);
        if (found) setDrug(found);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  // Update handlers
  const updatePatient = useCallback(
    (partial: Partial<PatientParameters>, paramName?: string) => {
      setPatient((prev) => ({ ...prev, ...partial }));
      if (paramName) setLastChangedParam(paramName);
    },
    []
  );

  const updateDrug = useCallback(
    (partial: Partial<DrugParameters>, paramName?: string) => {
      setDrug((prev) => ({ ...prev, ...partial }));
      if (paramName) setLastChangedParam(paramName);
    },
    []
  );

  const updateAdmin = useCallback(
    (partial: Partial<AdministrationParameters>, paramName?: string) => {
      setAdmin((prev) => ({ ...prev, ...partial }));
      if (paramName) setLastChangedParam(paramName);
    },
    []
  );

  const updateSim = useCallback(
    (partial: Partial<SimulationParameters>, paramName?: string) => {
      setSim((prev) => ({ ...prev, ...partial }));
      if (paramName) setLastChangedParam(paramName);
    },
    []
  );

  const selectDrug = useCallback((newDrug: DrugParameters) => {
    setDrug(newDrug);
    setLastChangedParam("drug");
  }, []);

  const resetPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const stepSimulation = useCallback(
    (direction: 1 | -1) => {
      setIsPlaying(false);
      setCurrentTime((prev) => {
        const step = 0.25; // 15 minutes step
        const next = prev + direction * step;
        return Math.max(0, Math.min(sim.duration, Math.round(next * 100) / 100));
      });
    },
    [sim.duration]
  );

  const saveAsScenarioA = useCallback(() => {
    setScenarioA({ ...currentDataset });
  }, [currentDataset]);

  const saveAsScenarioB = useCallback(() => {
    setScenarioB({ ...currentDataset });
  }, [currentDataset]);

  const clearComparison = useCallback(() => {
    setScenarioA(null);
    setScenarioB(null);
  }, []);

  const toggleParamLock = useCallback((paramKey: string) => {
    setLockedParameters((prev) => ({
      ...prev,
      [paramKey]: !prev[paramKey],
    }));
  }, []);

  const loadExperiment = useCallback((exp: VirtualExperiment) => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDrug(exp.setupA.drug);
    setAdmin(exp.setupA.admin);
    setSim(exp.setupA.sim);
    setPatient((prev) => ({ ...prev, ...exp.setupA.patient }));

    // Run setup A and save
    const simA = runSimulation(
      { ...DEFAULT_PATIENT, ...exp.setupA.patient },
      exp.setupA.drug,
      exp.setupA.admin,
      exp.setupA.sim
    );
    setScenarioA(simA);

    // Run setup B and save
    const simB = runSimulation(
      { ...DEFAULT_PATIENT, ...exp.setupB.patient },
      exp.setupB.drug,
      exp.setupB.admin,
      exp.setupB.sim
    );
    setScenarioB(simB);
    setLastChangedParam(`experiment_${exp.id}`);
  }, []);

  const loadClinicalChallenge = useCallback((challenge: ClinicalChallenge) => {
    setIsPlaying(false);
    setCurrentTime(0);
    setPatient(challenge.baselineSetup.patient);
    setDrug(challenge.baselineSetup.drug);
    setAdmin(challenge.baselineSetup.admin);
    setSim(challenge.baselineSetup.sim);
    setLastChangedParam(`challenge_${challenge.id}`);
  }, []);

  const exportCSV = useCallback(() => {
    const headers = [
      "time_h",
      "A1_central_mg",
      "A2_peripheral_mg",
      "AL_lung_mg",
      "C1_central_mg_L",
      "C2_peripheral_mg_L",
      "eliminationRate_mg_h",
      "inputRate_mg_h",
      "cumulativeElimination_mg",
      "cumulativeInput_mg",
    ];
    const rows = currentDataset.points.map((p) => [
      p.time.toFixed(3),
      p.A1.toFixed(3),
      p.A2.toFixed(3),
      p.AL.toFixed(3),
      p.C1.toFixed(4),
      p.C2.toFixed(4),
      p.eliminationRate.toFixed(3),
      p.inputRate.toFixed(3),
      p.cumulativeElimination.toFixed(3),
      p.cumulativeInput.toFixed(3),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PharmacoSim_${drug.id}_${sim.model}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentDataset, drug.id, sim.model]);

  const copyScenarioLink = useCallback((): string => {
    const url = new URL(window.location.href);
    url.searchParams.set("model", sim.model === "ONE_COMPARTMENT" ? "one" : "two");
    url.searchParams.set("route", admin.route === "INHALATION" ? "inhalation" : admin.type === "INFUSION" ? "infusion" : "iv");
    url.searchParams.set("dose", admin.dose.toString());
    url.searchParams.set("gfr", patient.gfr.toString());
    url.searchParams.set("rr", patient.respiratoryRate.toString());
    url.searchParams.set("hr", patient.heartRate.toString());
    if (drug.id) url.searchParams.set("drug", drug.id);

    const shareUrl = url.toString();
    navigator.clipboard?.writeText(shareUrl);
    return shareUrl;
  }, [sim.model, admin.route, admin.type, admin.dose, patient.gfr, patient.respiratoryRate, patient.heartRate, drug.id]);

  const copyConfigurationJSON = useCallback((): string => {
    const config = {
      patient,
      drug,
      admin,
      sim,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(config, null, 2);
    navigator.clipboard?.writeText(jsonStr);
    return jsonStr;
  }, [patient, drug, admin, sim]);

  return (
    <SimulationContext.Provider
      value={{
        patient,
        drug,
        admin,
        sim,
        currentDataset,
        currentTime,
        isPlaying,
        playbackSpeed,
        currentPoint,
        scenarioA,
        scenarioB,
        appMode,
        advancedMode,
        selectedChart,
        lastChangedParam,
        lockedParameters,
        updatePatient,
        updateDrug,
        updateAdmin,
        updateSim,
        selectDrug,
        setCurrentTime,
        setIsPlaying,
        setPlaybackSpeed,
        stepSimulation,
        resetPlayback,
        saveAsScenarioA,
        saveAsScenarioB,
        clearComparison,
        setAppMode,
        setAdvancedMode,
        setSelectedChart,
        toggleParamLock,
        loadExperiment,
        loadClinicalChallenge,
        exportCSV,
        copyScenarioLink,
        copyConfigurationJSON,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};
