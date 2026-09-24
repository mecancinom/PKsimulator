import { PatientParameters } from "../types/patient";
import { AdministrationParameters, DrugParameters } from "../types/pharmacokinetics";
import { PKModelType, SimulationParameters } from "../types/simulation";
import { DEMO_DRUGS } from "./demoDrugs";

export interface VirtualExperiment {
  id: string;
  title: string;
  question: string;
  category: "dosis" | "fisiologia" | "vias" | "modelos" | "distribucion";
  description: string;
  setupA: {
    patient: Partial<PatientParameters>;
    drug: DrugParameters;
    admin: AdministrationParameters;
    sim: SimulationParameters;
  };
  setupB: {
    patient: Partial<PatientParameters>;
    drug: DrugParameters;
    admin: AdministrationParameters;
    sim: SimulationParameters;
  };
  keyLearnings: string[];
  quiz: {
    question: string;
    options: { id: string; text: string; correct: boolean; explanation: string }[];
  };
}

export const VIRTUAL_EXPERIMENTS: VirtualExperiment[] = [
  {
    id: "exp-1-dose-doubling",
    title: "Experimento 1: ¿Qué ocurre al duplicar la dosis?",
    question: "¿Cómo cambian la Cmax, el AUC y la vida media al duplicar la dosis en un modelo farmacocinético lineal de primer orden?",
    category: "dosis",
    description: "Compara una dosis IV bolo estándar de 100 mg frente a 200 mg del mismo fármaco.",
    setupA: {
      patient: { gfr: 100, respiratoryRate: 12, heartRate: 70, bodyWeight: 70, enableHemodynamicEffect: false },
      drug: DEMO_DRUGS[0],
      admin: { route: "IV", type: "BOLUS", dose: 100, doseUnit: "mg", infusionRate: 0, duration: 1 },
      sim: { model: "ONE_COMPARTMENT", duration: 12, timeStep: 0.01, speed: 1 },
    },
    setupB: {
      patient: { gfr: 100, respiratoryRate: 12, heartRate: 70, bodyWeight: 70, enableHemodynamicEffect: false },
      drug: DEMO_DRUGS[0],
      admin: { route: "IV", type: "BOLUS", dose: 200, doseUnit: "mg", infusionRate: 0, duration: 1 },
      sim: { model: "ONE_COMPARTMENT", duration: 12, timeStep: 0.01, speed: 1 },
    },
    keyLearnings: [
      "En cinética lineal de primer orden, Cmax y AUC aumentan de manera estrictamente proporcional a la dosis.",
      "El aclaramiento (CL), el volumen de distribución (Vd) y la constante de eliminación (Kel) son constantes biológicas independientes de la dosis.",
      "La vida media de eliminación (t1/2) permanece invariable al cambiar la dosis.",
    ],
    quiz: {
      question: "Al duplicar la dosis en cinética de primer orden, ¿qué ocurre con la vida media (t1/2)?",
      options: [
        { id: "opt1", text: "Se duplica proporcionalmente.", correct: false, explanation: "Incorrecto. La vida media depende de Vd y CL (t1/2 = ln(2)*Vd/CL), que son independientes de la dosis en cinética lineal." },
        { id: "opt2", text: "Permanece idéntica.", correct: true, explanation: "¡Correcto! En cinética lineal de primer orden, los parámetros de depuración y volumen no se saturan, por lo que la constante Kel y la vida media no cambian con la dosis." },
        { id: "opt3", text: "Se reduce a la mitad.", correct: false, explanation: "Incorrecto. Una mayor cantidad no acelera intrínsecamente la constante fraccional de eliminación en un modelo lineal." },
      ],
    },
  },
  {
    id: "exp-2-gfr-reduction",
    title: "Experimento 2: ¿Qué ocurre cuando disminuye la TFG?",
    question: "¿Cómo afecta la insuficiencia renal (disminución de TFG de 100 a 30 mL/min) al aclaramiento, AUC y vida media de un fármaco con 80% de eliminación renal?",
    category: "fisiologia",
    description: "Analiza la acumulación y aumento de exposición en un paciente con deterioro agudo de la función renal.",
    setupA: {
      patient: { gfr: 100, respiratoryRate: 12, heartRate: 70, bodyWeight: 70, enableHemodynamicEffect: false },
      drug: DEMO_DRUGS[0], // Demo-A has 80% renal fraction
      admin: { route: "IV", type: "BOLUS", dose: 150, doseUnit: "mg", infusionRate: 0, duration: 1 },
      sim: { model: "ONE_COMPARTMENT", duration: 24, timeStep: 0.01, speed: 1 },
    },
    setupB: {
      patient: { gfr: 30, respiratoryRate: 12, heartRate: 70, bodyWeight: 70, enableHemodynamicEffect: false },
      drug: DEMO_DRUGS[0],
      admin: { route: "IV", type: "BOLUS", dose: 150, doseUnit: "mg", infusionRate: 0, duration: 1 },
      sim: { model: "ONE_COMPARTMENT", duration: 24, timeStep: 0.01, speed: 1 },
    },
    keyLearnings: [
      "La reducción de la TFG disminuye proporcionalmente la fracción renal del clearance: CLrenal,GFR = CLrenal,baseline * (GFR / 100).",
      "Al reducirse el clearance total, la pendiente de eliminación se aplana (menor Kel = CL/Vd).",
      "La vida media se prolonga considerablemente y el AUC aumenta de forma inversa a la caída del aclaramiento total.",
    ],
    quiz: {
      question: "Si un fármaco tuviera eliminación 100% hepática (fracción renal = 0), ¿qué efecto tendría reducir la TFG a 15 mL/min?",
      options: [
        { id: "opt1", text: "El AUC aumentaría significativamente debido a la uremia.", correct: false, explanation: "En el modelo farmacocinético básico, la depuración no renal es independiente de la TFG." },
        { id: "opt2", text: "Ningún efecto directo sobre el clearance total ni sobre el AUC del fármaco.", correct: true, explanation: "¡Correcto! Si renalFraction = 0, CLrenal = 0 y CLtotal = CLnonrenal. La variación de TFG no modifica la eliminación sistémica de dicho fármaco." },
        { id: "opt3", text: "La Cmax caería a cero.", correct: false, explanation: "Incorrecto. La Cmax inicial depende de la dosis y del volumen central de distribución." },
      ],
    },
  },
  {
    id: "exp-3-inhalation-rr",
    title: "Experimento 3: ¿Qué ocurre al cambiar la FR en administración inhalatoria?",
    question: "¿Cómo modifica la taquipnea o bradipnea la ventilación alveolar y la constante de absorción pulmonar Ka?",
    category: "vias",
    description: "Compara la administración inhalatoria a frecuencia respiratoria normal (12 rpm) frente a hiperventilación (24 rpm).",
    setupA: {
      patient: { gfr: 100, respiratoryRate: 12, heartRate: 70, bodyWeight: 70, enableHemodynamicEffect: false },
      drug: DEMO_DRUGS[0],
      admin: { route: "INHALATION", type: "INHALATION", dose: 100, doseUnit: "mg", infusionRate: 0, duration: 1 },
      sim: { model: "ONE_COMPARTMENT", duration: 12, timeStep: 0.01, speed: 1 },
    },
    setupB: {
      patient: { gfr: 100, respiratoryRate: 24, heartRate: 70, bodyWeight: 70, enableHemodynamicEffect: false },
      drug: DEMO_DRUGS[0],
      admin: { route: "INHALATION", type: "INHALATION", dose: 100, doseUnit: "mg", infusionRate: 0, duration: 1 },
      sim: { model: "ONE_COMPARTMENT", duration: 12, timeStep: 0.01, speed: 1 },
    },
    keyLearnings: [
      "La ventilación alveolar VA = FR * (VT - Espacio Muerto) determina la renovación del gas alveolar.",
      "En el modelo pedagógico simplificado, mayor ventilación alveolar incrementa el factor de absorción y la Ka efectiva.",
      "Un Ka mayor produce un ascenso plasmático más rápido, adelantando el Tmax y aumentando la Cmax sin modificar el AUC total (si F = 1 y la dosis es constante).",
    ],
    quiz: {
      question: "Al aumentar la constante de absorción Ka por mayor ventilación alveolar, ¿qué ocurre con el AUC total infinito?",
      options: [
        { id: "opt1", text: "Permanece igual (si la biodisponibilidad y dosis son idénticas).", correct: true, explanation: "¡Correcto! AUC = F * Dosis / CL. Mientras no cambie la dosis absorbida total ni el aclaramiento sistémico, acelerar la absorción cambia la forma de la curva (Cmax más alta y Tmax más precoz) pero el AUC total no cambia." },
        { id: "opt2", text: "Se duplica automáticamente.", correct: false, explanation: "Incorrecto. La velocidad de absorción no añade más moléculas de fármaco al organismo." },
        { id: "opt3", text: "Disminuye a la mitad.", correct: false, explanation: "Incorrecto. Toda la dosis pulmonar termina absorbiéndose en el torrente sanguíneo." },
      ],
    },
  },
  {
    id: "exp-4-bolus-vs-infusion",
    title: "Experimento 4: Bolo IV vs Infusión IV",
    question: "¿Cuál es la diferencia en la concentración plasmática pico (Cmax) y perfil de seguridad entre un bolo rápido y una infusión continua de 2 horas?",
    category: "vias",
    description: "Compara 100 mg administrados en bolo instantáneo frente a los mismos 100 mg administrados como infusión a 50 mg/h durante 2 horas.",
    setupA: {
      patient: { gfr: 100, respiratoryRate: 12, heartRate: 70, bodyWeight: 70, enableHemodynamicEffect: false },
      drug: DEMO_DRUGS[1],
      admin: { route: "IV", type: "BOLUS", dose: 100, doseUnit: "mg", infusionRate: 0, duration: 0.1 },
      sim: { model: "ONE_COMPARTMENT", duration: 12, timeStep: 0.01, speed: 1 },
    },
    setupB: {
      patient: { gfr: 100, respiratoryRate: 12, heartRate: 70, bodyWeight: 70, enableHemodynamicEffect: false },
      drug: DEMO_DRUGS[1],
      admin: { route: "IV", type: "INFUSION", dose: 100, doseUnit: "mg", infusionRate: 50, duration: 2.0 },
      sim: { model: "ONE_COMPARTMENT", duration: 12, timeStep: 0.01, speed: 1 },
    },
    keyLearnings: [
      "El bolo IV produce una Cmax inicial inmediata mucho más alta (C0 = Dosis / V1), lo que puede elevar el riesgo de toxicidad por pico.",
      "La infusión lenta modera la Cmax y retrasa el pico hasta el cese de la infusión (Tmax = duración de infusión).",
      "Ambas vías alcanzan un AUC muy similar si la dosis total administrada es la misma y la depuración es lineal.",
    ],
    quiz: {
      question: "¿Cuándo se alcanza la concentración plasmática máxima (Cmax) durante una infusión IV de velocidad constante?",
      options: [
        { id: "opt1", text: "Justo en el momento en que finaliza la infusión.", correct: true, explanation: "¡Correcto! Mientras la tasa de infusión supere la tasa instantánea de eliminación, la concentración asciende, alcanzando su valor máximo exactamente al terminar la infusión." },
        { id: "opt2", text: "A los 5 minutos de iniciar la infusión.", correct: false, explanation: "Incorrecto. A los 5 minutos apenas ha ingresado una fracción pequeña de la dosis total." },
        { id: "opt3", text: "A las 24 horas después de finalizar.", correct: false, explanation: "Incorrecto. Tras finalizar la infusión, la concentración solo decae por eliminación de primer orden." },
      ],
    },
  },
  {
    id: "exp-5-mono-vs-bicompartmental",
    title: "Experimento 5: Modelo Monocompartimental vs Bicompartimental",
    question: "¿Cómo se distingue la fase alfa (distribución tisular rápida) de la fase beta (eliminación terminal) en la curva concentración-tiempo?",
    category: "modelos",
    description: "Compara el comportamiento de DemoDrug-B simulado como 1 compartimento versus 2 compartimentos.",
    setupA: {
      patient: { gfr: 100, respiratoryRate: 12, heartRate: 70, bodyWeight: 70, enableHemodynamicEffect: false },
      drug: DEMO_DRUGS[1],
      admin: { route: "IV", type: "BOLUS", dose: 200, doseUnit: "mg", infusionRate: 0, duration: 1 },
      sim: { model: "ONE_COMPARTMENT", duration: 18, timeStep: 0.01, speed: 1 },
    },
    setupB: {
      patient: { gfr: 100, respiratoryRate: 12, heartRate: 70, bodyWeight: 70, enableHemodynamicEffect: false },
      drug: DEMO_DRUGS[1],
      admin: { route: "IV", type: "BOLUS", dose: 200, doseUnit: "mg", infusionRate: 0, duration: 1 },
      sim: { model: "TWO_COMPARTMENT", duration: 18, timeStep: 0.01, speed: 1 },
    },
    keyLearnings: [
      "El modelo monocompartimental asume mezcla instantánea homogénea en todo el volumen corporal con un único decaimiento monoexponencial.",
      "El modelo bicompartimental revela una caída inicial muy rápida en el compartimento central debida al flujo simultáneo de distribución hacia los tejidos (K12) y eliminación (Kel).",
      "Posteriormente, se establece un seudoequilibrio de distribución y la curva plasmática decae con la pendiente terminal más lenta (beta).",
    ],
    quiz: {
      question: "En la fase alfa temprana del modelo bicompartimental, ¿a dónde va la mayor parte del fármaco que desaparece del plasma?",
      options: [
        { id: "opt1", text: "Se transfiere y distribuye hacia el compartimento periférico (tejidos).", correct: true, explanation: "¡Correcto! En fármacos con K12 significativo, la tasa de transferencia a tejidos periféricos (K12*A1) supera inicialmente con creces a la tasa de eliminación renal/hepática (Kel*A1)." },
        { id: "opt2", text: "Es eliminado instantáneamente por la orina.", correct: false, explanation: "Incorrecto. La eliminación está limitada por el aclaramiento metabólico/renal." },
        { id: "opt3", text: "Se destruye en los hematíes.", correct: false, explanation: "Incorrecto." },
      ],
    },
  },
  {
    id: "exp-6-distribution-rates",
    title: "Experimento 6: Distribución Rápida vs Lenta (K12 y K21)",
    question: "¿Qué efecto tiene aumentar la permeabilidad tisular K12 sobre el pico plasmático y el tiempo de redistribución?",
    category: "distribucion",
    description: "Compara una constante K12 baja (0.3 /h) frente a una alta (1.8 /h).",
    setupA: {
      patient: { gfr: 100, respiratoryRate: 12, heartRate: 70, bodyWeight: 70, enableHemodynamicEffect: false },
      drug: { ...DEMO_DRUGS[1], K12: 0.3 },
      admin: { route: "IV", type: "BOLUS", dose: 150, doseUnit: "mg", infusionRate: 0, duration: 1 },
      sim: { model: "TWO_COMPARTMENT", duration: 16, timeStep: 0.01, speed: 1 },
    },
    setupB: {
      patient: { gfr: 100, respiratoryRate: 12, heartRate: 70, bodyWeight: 70, enableHemodynamicEffect: false },
      drug: { ...DEMO_DRUGS[1], K12: 1.8 },
      admin: { route: "IV", type: "BOLUS", dose: 150, doseUnit: "mg", infusionRate: 0, duration: 1 },
      sim: { model: "TWO_COMPARTMENT", duration: 16, timeStep: 0.01, speed: 1 },
    },
    keyLearnings: [
      "Un K12 elevado produce un drenaje tisular muy acelerado desde el compartimento central, acelerando la caída de la fase alfa.",
      "El compartimento periférico acumula fármaco con mayor rapidez, alcanzando su concentración tisular máxima más temprano.",
      "La vida media terminal beta depende conjuntamente de Kel, K12 y K21.",
    ],
    quiz: {
      question: "Si K12 = 0, ¿cómo se comporta el compartimento periférico?",
      options: [
        { id: "opt1", text: "No recibe ninguna molécula de fármaco; su concentración permanece en cero durante toda la simulación.", correct: true, explanation: "¡Exacto! Si la tasa de transferencia hacia la periferia es cero, no existe flujo de entrada al compartimento periférico y el sistema colapsa operativamente en un modelo monocompartimental." },
        { id: "opt2", text: "Se satura al doble de la concentración central.", correct: false, explanation: "Incorrecto." },
        { id: "opt3", text: "Elimina el fármaco antes de que llegue al plasma.", correct: false, explanation: "Incorrecto." },
      ],
    },
  },
  {
    id: "exp-7-renal-vs-hepatic",
    title: "Experimento 7: Fármaco con eliminación renal alta vs baja ante nefropatía",
    question: "¿Por qué dos fármacos con el mismo aclaramiento total responden de forma radicalmente diferente a una caída en la función renal?",
    category: "fisiologia",
    description: "Compara DemoDrug-A (80% renal) y DemoDrug-C (10% renal) en un paciente con TFG = 25 mL/min.",
    setupA: {
      patient: { gfr: 25, respiratoryRate: 12, heartRate: 70, bodyWeight: 70, enableHemodynamicEffect: false },
      drug: DEMO_DRUGS[0], // Demo-A: renal fraction 0.8
      admin: { route: "IV", type: "BOLUS", dose: 100, doseUnit: "mg", infusionRate: 0, duration: 1 },
      sim: { model: "ONE_COMPARTMENT", duration: 24, timeStep: 0.01, speed: 1 },
    },
    setupB: {
      patient: { gfr: 25, respiratoryRate: 12, heartRate: 70, bodyWeight: 70, enableHemodynamicEffect: false },
      drug: DEMO_DRUGS[2], // Demo-C: renal fraction 0.1
      admin: { route: "IV", type: "BOLUS", dose: 100, doseUnit: "mg", infusionRate: 0, duration: 1 },
      sim: { model: "ONE_COMPARTMENT", duration: 24, timeStep: 0.01, speed: 1 },
    },
    keyLearnings: [
      "El impacto clínico de la insuficiencia renal en la farmacocinética depende críticamente de la fracción renal de eliminación (fe o renalFraction).",
      "Fármacos con eliminación renal > 70-80% experimentan descensos marcados en su depuración total y requieren ajuste posológico sustancial.",
      "Fármacos con eliminación renal < 20% mantienen prácticamente inalterada su depuración sistémica ante disfunción renal aislada.",
    ],
    quiz: {
      question: "¿Cuál de estos dos fármacos sufrirá mayor riesgo de intoxicación por acumulación si se administra a intervalos fijos en insuficiencia renal severa?",
      options: [
        { id: "opt1", text: "DemoDrug-A (80% renal), porque su depuración global se reduce a menos de la mitad y su vida media se prolonga drásticamente.", correct: true, explanation: "¡Correcto! Al depender primordialmente del riñón, su eliminación se desploma y se acumula peligrosamente si no se ajusta la dosis o el intervalo." },
        { id: "opt2", text: "DemoDrug-C (10% renal), porque el hígado deja de funcionar ante la uremia.", correct: false, explanation: "Incorrecto. En este modelo farmacocinético, la depuración metabólica no renal se preserva." },
      ],
    },
  },
];
