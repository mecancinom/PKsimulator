import React, { useState } from "react";
import { GraduationCap, CheckCircle2, Circle } from "lucide-react";

export const LearningObjectives: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  const OBJECTIVES = [
    {
      id: 1,
      title: "Diferenciar modelos mono y bicompartimentales",
      desc: "Distinguir la distribución instantánea homogénea del modelo de 1 compartimento frente a las fases de distribución alfa y eliminación beta del modelo de 2 compartimentos.",
    },
    {
      id: 2,
      title: "Interpretar curvas concentración-tiempo",
      desc: "Analizar visualmente el pico inicial, la tasa de aclaramiento, los regímenes de infusión y el comportamiento no instantáneo de la inhalación.",
    },
    {
      id: 3,
      title: "Identificar distribución y eliminación",
      desc: "Reconocer en qué fase temporal predomina el flujo hacia los tejidos periféricos frente a la depuración metabólica o excreción renal.",
    },
    {
      id: 4,
      title: "Explicar el significado de K₁₂ y K₂₁",
      desc: "Comprender las constantes de transferencia de primer orden entre el compartimento central y periférico y su impacto sobre la redistribución.",
    },
    {
      id: 5,
      title: "Relacionar clearance con eliminación",
      desc: "Diferenciar la tasa de eliminación (mg/h = Kel · A) del aclaramiento (L/h = volumen de plasma depurado por unidad de tiempo).",
    },
    {
      id: 6,
      title: "Influencia de la función renal (TFG)",
      desc: "Entender que la reducción de TFG reduce exclusivamente el componente renal del aclaramiento y que el impacto sobre el AUC depende de la fracción renal fe.",
    },
    {
      id: 7,
      title: "Comprender la absorción pulmonar",
      desc: "Relacionar la ventilación alveolar VA = FR · (VT - Espacio Muerto) con la velocidad de absorción Ka hacia el compartimento central.",
    },
    {
      id: 8,
      title: "Diferenciar variables clínicas de parámetros PK",
      desc: "Reconocer que variables como FC, FR o peso son intermediarios fisiológicos y no constantes farmacocinéticas directas.",
    },
    {
      id: 9,
      title: "Interpretar Cmax, AUC y vida media (t₁/₂)",
      desc: "Correlacionar Cmax con toxicidad aguda de pico, AUC con exposición sistémica acumulada y t1/2 con el tiempo de permanencia en el organismo.",
    },
    {
      id: 10,
      title: "Consecuencias de modificar dosis y fisiología",
      desc: "Verificar experimentalmente la proporcionalidad lineal de dosis frente a las alteraciones patológicas de aclaramiento en insuficiencia renal.",
    },
  ];

  const toggleObjective = (id: number) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(completed).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">
                Objetivos de Aprendizaje Farmacocinético
              </h3>
              <p className="text-xs text-slate-500">
                Competencias a desarrollar durante la simulación interactiva
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
              {completedCount} / 10 completados
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-teal-600 h-full transition-all duration-300"
            style={{ width: `${(completedCount / 10) * 100}%` }}
          />
        </div>

        {/* List of Objectives */}
        <div className="overflow-y-auto space-y-2 pr-1 flex-1">
          {OBJECTIVES.map((obj) => {
            const isDone = !!completed[obj.id];
            return (
              <div
                key={obj.id}
                onClick={() => toggleObjective(obj.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start space-x-3 ${
                  isDone
                    ? "bg-teal-50/60 border-teal-300 text-teal-950"
                    : "bg-slate-50/80 border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 flex items-center">
                    <span className="mr-1.5 font-mono text-teal-700 font-bold">{obj.id}.</span>
                    <span>{obj.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{obj.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition"
          >
            Entendido, volver a la simulación
          </button>
        </div>
      </div>
    </div>
  );
};
