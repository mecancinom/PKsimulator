import { PatientParameters } from "../types/patient";
import { AdministrationParameters, DrugParameters } from "../types/pharmacokinetics";
import { SimulationParameters } from "../types/simulation";
import { DEMO_DRUGS } from "./demoDrugs";

export interface ClinicalChallenge {
  id: string;
  title: string;
  caseDescription: string;
  patientProfile: {
    age: number;
    sex: "F" | "M";
    weight: number;
    clinicalContext: string;
  };
  baselineSetup: {
    patient: PatientParameters;
    drug: DrugParameters;
    admin: AdministrationParameters;
    sim: SimulationParameters;
  };
  challengeGoal: string;
  suggestedSteps: string[];
  reflectionQuestions: string[];
  modelExplanation: string;
}

export const CLINICAL_CHALLENGES: ClinicalChallenge[] = [
  {
    id: "challenge-renal-failure",
    title: "Caso 1: Paciente de 72 años con Enfermedad Renal Crónica Estadio 4",
    patientProfile: {
      age: 72,
      sex: "M",
      weight: 68,
      clinicalContext: "Paciente hospitalizado con infección bacteriana que requiere tratamiento antimicrobiano intravenoso. Su creatinina sérica arroja una TFG estimada de 28 mL/min/1.73 m² frente al valor de referencia normal (90 mL/min).",
    },
    caseDescription: "El paciente recibe una dosis IV estándar de 150 mg de DemoDrug-A (80% eliminación renal). Compara el comportamiento farmacocinético entre su función renal basal esperada (TFG = 90) y su TFG actual patológica (TFG = 28 mL/min).",
    baselineSetup: {
      patient: {
        gfr: 28,
        respiratoryRate: 14,
        heartRate: 72,
        bodyWeight: 68,
        tidalVolume: 500,
        deadSpace: 150,
        strokeVolume: 70,
        enableHemodynamicEffect: false,
      },
      drug: DEMO_DRUGS[0],
      admin: {
        route: "IV",
        type: "BOLUS",
        dose: 150,
        doseUnit: "mg",
        infusionRate: 0,
        duration: 1,
      },
      sim: {
        model: "TWO_COMPARTMENT",
        duration: 24,
        timeStep: 0.01,
        speed: 1,
      },
    },
    challengeGoal: "Identificar la prolongación de la vida media beta y el incremento masivo de exposición (AUC), y formular la justificación farmacológica del ajuste por espaciamiento o reducción de dosis.",
    suggestedSteps: [
      "1. Ejecuta la simulación con la TFG del paciente (28 mL/min).",
      "2. Haz clic en 'Guardar Escenario' como Escenario A.",
      "3. Sube el slider de TFG a 90 mL/min (simulando función renal normal) y simula nuevamente.",
      "4. Compara ambas curvas y observa la diferencia en AUC, Kel y t1/2beta en la tabla de comparación.",
    ],
    reflectionQuestions: [
      "¿Por qué la Cmax inicial no se modifica significativamente a pesar del fallo renal?",
      "¿Cómo cambia la pendiente de eliminación en la fase terminal?",
      "¿Qué sucedería con los niveles valle si este paciente recibiera dosis repetidas cada 8 horas sin ajuste posológico?",
    ],
    modelExplanation: "En este modelo educativo simulado, la Cmax depende primordialmente de la dosis y del volumen central de distribución (C0 = Dosis/V1). Sin embargo, al tener el fármaco un 80% de depuración renal, la caída de TFG de 90 a 28 mL/min reduce el aclaramiento total drásticamente. Esto disminuye la constante de eliminación Kel, prolongando la vida media e incrementando notablemente el AUC, predisponiendo a toxicidad si no se ajusta la posología.",
  },
  {
    id: "challenge-inhalation-copd",
    title: "Caso 2: Crisis Broncoobstructiva y Frecuencia Respiratoria en Inhalación",
    patientProfile: {
      age: 58,
      sex: "F",
      weight: 62,
      clinicalContext: "Paciente con broncoespasmo agudo que presenta taquipnea superficial (FR = 32 rpm, volumen corriente reducido a 350 mL con espacio muerto de 150 mL).",
    },
    caseDescription: "Se administra un aerosol de DemoDrug-A por vía inhalatoria (dosis 100 mg). Explora cómo la ventilación alveolar efectiva modula la tasa de absorción pulmonar Ka y la concentración plasmática alcanzada.",
    baselineSetup: {
      patient: {
        gfr: 95,
        respiratoryRate: 32,
        heartRate: 110,
        bodyWeight: 62,
        tidalVolume: 350,
        deadSpace: 150,
        strokeVolume: 65,
        enableHemodynamicEffect: false,
      },
      drug: DEMO_DRUGS[0],
      admin: {
        route: "INHALATION",
        type: "INHALATION",
        dose: 100,
        doseUnit: "mg",
        infusionRate: 0,
        duration: 1,
      },
      sim: {
        model: "ONE_COMPARTMENT",
        duration: 12,
        timeStep: 0.01,
        speed: 1,
      },
    },
    challengeGoal: "Comprender la diferencia entre ventilación minuto total y ventilación alveolar neta, y cómo la absorción pulmonar depende del intercambio gas-alveolar en el modelo educativo.",
    suggestedSteps: [
      "1. Revisa los valores calculados de Ventilación Minuto (VE) vs Ventilación Alveolar (VA).",
      "2. Modifica la frecuencia respiratoria y observa el efecto en la constante Ka efectiva.",
      "3. Identifica el Tmax plasmático: ¿cuánto tarda en alcanzarse el pico de concentración sistémica?",
    ],
    reflectionQuestions: [
      "¿Por qué un patrón respiratorio rápido pero muy superficial puede ser ineficiente para la absorción alveolar?",
      "¿Cómo influye el espacio muerto anatómico en el factor de absorción?",
    ],
    modelExplanation: "La ventilación alveolar real está dada por FR * (VT - Espacio Muerto). Cuando la respiración es rápida pero superficial (volumen corriente cercano al espacio muerto), la fracción que ventila los alvéolos activos disminuye. En nuestro modelo pedagógico, una menor ventilación alveolar efectiva reduce la tasa de transferencia Ka desde el depósito pulmonar al compartimento central.",
  },
];
