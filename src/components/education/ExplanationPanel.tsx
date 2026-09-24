import React, { useState } from "react";
import { useSimulation } from "../../context/SimulationContext";
import { MathFormula } from "../common/MathFormula";
import { BookOpen, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { formatNumber } from "../../utils/units";

export const ExplanationPanel: React.FC = () => {
  const {
    currentDataset,
    sim,
    admin,
    patient,
    drug,
    lastChangedParam,
    advancedMode,
  } = useSimulation();

  const [showEquations, setShowEquations] = useState(false);

  const isTwoComp = sim.model === "TWO_COMPARTMENT";
  const isInhalation = admin.route === "INHALATION";

  // Dynamic explanation logic (Section 27)
  const getDynamicExplanation = () => {
    if (lastChangedParam === "dose" || lastChangedParam === "doseUnit") {
      return `La dosis se ajustó a ${formatNumber(currentDataset.effectiveParams.effectiveDose, 0)} mg mientras los parámetros de depuración y volumen permanecieron constantes. En un modelo farmacocinético lineal de primer orden, esto produce una variación estrictamente proporcional de la exposición sistémica (AUC) y del pico plasmático (Cmax), sin alterar en lo absoluto la constante Kel ni la vida media de eliminación (t1/2).`;
    }

    if (lastChangedParam === "gfr") {
      if (drug.renalFraction > 0.4) {
        return `La variación de la TFG a ${patient.gfr} mL/min modificó notablemente el componente renal del clearance (CLrenal = ${formatNumber(currentDataset.effectiveParams.CL_renal, 2)} L/h). Como ${drug.name} tiene un ${formatNumber(drug.renalFraction * 100, 0)}% de eliminación renal, la depuración total cayó a ${formatNumber(currentDataset.effectiveParams.CL_total, 2)} L/h. Esto aplana la pendiente de decaimiento Kel, prolonga la vida media terminal y eleva el AUC.`;
      } else {
        return `La TFG se modificó a ${patient.gfr} mL/min, pero este fármaco presenta una baja fracción renal de eliminación (${formatNumber(drug.renalFraction * 100, 0)}%). Por tanto, la depuración total está dominada por el componente metabólico no-renal (${formatNumber(currentDataset.effectiveParams.CL_nonrenal, 2)} L/h), manteniendo la curva prácticamente insensible a la variación de función renal.`;
      }
    }

    if (lastChangedParam === "respiratoryRate" && isInhalation) {
      return `El cambio en la frecuencia respiratoria (${patient.respiratoryRate} rpm) alteró la ventilación alveolar neta. En este modelo pedagógico, esto modifica el factor de absorción pulmonar, variando la constante Ka efectiva a ${formatNumber(currentDataset.effectiveParams.effectiveKa, 2)} h⁻¹. Una mayor ventilación adelanta el Tmax plasmático e incrementa la Cmax.`;
    }

    if (lastChangedParam === "K12" || lastChangedParam === "K21") {
      return `El ajuste de las constantes de transferencia intercompartimental (K₁₂ = ${drug.K12} h⁻¹, K₂₁ = ${drug.K21} h⁻¹) modula el flujo bidireccional entre el plasma y los tejidos. K₁₂ determina la velocidad a la que el fármaco penetra en el compartimento periférico durante la fase alfa de distribución temprana.`;
    }

    if (lastChangedParam === "model") {
      return isTwoComp
        ? "Has seleccionado el Modelo Bicompartimental: el organismo se representa como un compartimento central (plasma y órganos altamente irrigados) en intercambio bidireccional reversible con un compartimento periférico (tejidos). La curva plasmática exhibe una fase inicial rápida de distribución (alfa) seguida de una fase lenta de eliminación terminal (beta)."
        : "Has seleccionado el Modelo Monocompartimental: se asume distribución instantánea y homogénea en todo el volumen corporal. La concentración plasmática decae de forma monoexponencial con una única constante de eliminación Kel.";
    }

    if (lastChangedParam === "route" || lastChangedParam === "adminType") {
      if (admin.route === "INHALATION") {
        return "Vía Inhalatoria seleccionada: el fármaco se deposita inicialmente en el compartimento pulmonar y se transfiere al compartimento central según la constante de absorción Ka modulada por la ventilación alveolar.";
      }
      if (admin.type === "INFUSION") {
        return `Infusión intravenosa continua seleccionada (${admin.infusionRate} mg/h durante ${admin.duration} h): la concentración plasmática asciende progresivamente mientras la tasa de entrada supera la eliminación, alcanzando su Cmax justo al finalizar el periodo de infusión.`;
      }
      return "Bolo intravenoso seleccionado: la dosis completa ingresa instantáneamente al compartimento central en t = 0, produciendo la concentración inicial más elevada (C0 = Dosis/V1).";
    }

    // Default pedagogical overview
    return `Simulación activa con ${drug.name} (${isTwoComp ? "Bicompartimental" : "Monocompartimental"}, vía ${admin.route} ${admin.type}). El sistema dinámico integra la fisiología del paciente (TFG ${patient.gfr} mL/min, FR ${patient.respiratoryRate} rpm) con la farmacología para resolver las ecuaciones diferenciales mediante el algoritmo Runge-Kutta 4.`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-700">
              Interpretación Farmacocinética Dinámica
            </h3>
            <p className="text-[11px] text-slate-500">
              Explicación pedagógica de los cambios en tiempo real
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowEquations(!showEquations)}
          className="text-xs text-teal-700 hover:text-teal-800 font-medium flex items-center space-x-1"
        >
          <span>{showEquations ? "Ocultar ecuaciones" : "Ver ecuaciones matemáticas"}</span>
          {showEquations ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Dynamic explanation callout */}
      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs leading-relaxed text-amber-950">
        <span className="font-semibold text-amber-800 block mb-1">Análisis del cambio:</span>
        <p>{getDynamicExplanation()}</p>
      </div>

      {/* Equations Drawer (Section 26) */}
      {showEquations && (
        <div className="p-3.5 bg-slate-900 text-slate-100 rounded-lg border border-slate-800 text-xs space-y-3">
          <div className="flex items-center space-x-2 text-teal-400 font-semibold border-b border-slate-800 pb-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Fundamento Matemático del Modelo (ODEs en tiempo continuo)</span>
          </div>

          {!isTwoComp ? (
            <div className="space-y-2">
              <div className="font-semibold text-slate-300">1. Modelo Monocompartimental Lineal:</div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-center">
                <MathFormula formula="\\frac{dA}{dt} = \\text{Input}(t) - K_{el} \\cdot A(t)" displayMode />
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
                <div className="bg-slate-950/60 p-2 rounded">
                  <MathFormula formula="C(t) = \\frac{A(t)}{V_d}" />
                </div>
                <div className="bg-slate-950/60 p-2 rounded">
                  <MathFormula formula="K_{el} = \\frac{CL}{V_d} \\quad \\implies \\quad t_{1/2} = \\frac{\\ln(2)}{K_{el}}" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="font-semibold text-slate-300">2. Modelo Bicompartimental con Transferencia:</div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-center space-y-1">
                <MathFormula formula="\\frac{dA_1}{dt} = \\text{Input}(t) - (K_{12} + K_{el})A_1 + K_{21}A_2" displayMode />
                <MathFormula formula="\\frac{dA_2}{dt} = K_{12}A_1 - K_{21}A_2" displayMode />
              </div>
              <div className="grid grid-cols-3 gap-2 text-slate-400 text-[11px]">
                <div className="bg-slate-950/60 p-2 rounded text-center">
                  <MathFormula formula="C_1 = \\frac{A_1}{V_1}, \\quad C_2 = \\frac{A_2}{V_2}" />
                </div>
                <div className="bg-slate-950/60 p-2 rounded text-center">
                  <MathFormula formula="\\lambda^2 - (K_{12}+K_{21}+K_{el})\\lambda + K_{21}K_{el} = 0" />
                </div>
                <div className="bg-slate-950/60 p-2 rounded text-center">
                  <MathFormula formula="t_{1/2\\alpha} = \\frac{\\ln(2)}{\\alpha}, \\quad t_{1/2\\beta} = \\frac{\\ln(2)}{\\beta}" />
                </div>
              </div>
            </div>
          )}

          {isInhalation && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="font-semibold text-sky-400">3. Absorción Pulmonar Inhalatoria:</div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-center">
                <MathFormula formula="\\frac{dA_L}{dt} = -K_a \\cdot A_L \\quad \\implies \\quad \\text{Input}_{sistémico} = F \\cdot K_a \\cdot A_L" displayMode />
              </div>
              <p className="text-[10px] text-slate-400">
                *Modelo educativo simplificado de absorción pulmonar vinculado a la ventilación alveolar VA.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
