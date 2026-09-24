import React, { useState } from "react";
import { useSimulation } from "../../context/SimulationContext";
import { VIRTUAL_EXPERIMENTS, VirtualExperiment } from "../../data/scenarios";
import { FlaskConical, Play, CheckCircle2, XCircle, ArrowRight, HelpCircle } from "lucide-react";

export const VirtualLab: React.FC = () => {
  const { loadExperiment, scenarioA, scenarioB } = useSimulation();
  const [selectedExpId, setSelectedExpId] = useState<string>(VIRTUAL_EXPERIMENTS[0].id);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const currentExp = VIRTUAL_EXPERIMENTS.find((e) => e.id === selectedExpId) || VIRTUAL_EXPERIMENTS[0];

  const handleSelectOption = (expId: string, optionId: string) => {
    setUserAnswers((prev) => ({ ...prev, [expId]: optionId }));
    setShowFeedback((prev) => ({ ...prev, [expId]: true }));
  };

  const handleRunExperiment = (exp: VirtualExperiment) => {
    loadExperiment(exp);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-700">
              Laboratorio Virtual: Experimentos Guiados
            </h3>
            <p className="text-[11px] text-slate-500">
              Protocolos de indagación científica y evaluación formativa
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
          7 Experimentos Disponibles
        </span>
      </div>

      {/* Experiment Selector Carousel / Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-1">
        {VIRTUAL_EXPERIMENTS.map((exp, idx) => (
          <button
            key={exp.id}
            type="button"
            onClick={() => {
              setSelectedExpId(exp.id);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
              selectedExpId === exp.id
                ? "bg-teal-600 text-white border-teal-700 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Exp {idx + 1}: {exp.category.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Selected Experiment Card */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-sm text-slate-900">{currentExp.title}</h4>
            <p className="text-xs text-slate-600 mt-0.5">{currentExp.description}</p>
          </div>

          <button
            type="button"
            onClick={() => handleRunExperiment(currentExp)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-sm transition shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Cargar y Comparar A vs B</span>
          </button>
        </div>

        {/* Question Banner */}
        <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
          <span className="font-semibold text-teal-800 flex items-center">
            <HelpCircle className="w-3.5 h-3.5 mr-1" /> Pregunta de Indagación:
          </span>
          <p className="text-slate-800 font-medium italic">{currentExp.question}</p>
        </div>

        {/* Key Learnings Checklist */}
        <div className="space-y-1 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Puntos Clave a Observar:</span>
          <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
            {currentExp.keyLearnings.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>

        {/* Interactive Evaluation Quiz */}
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <div className="text-xs font-semibold text-slate-800">
            Comprobación de Concepto (Evaluación Inmediata):
          </div>
          <p className="text-xs text-slate-700">{currentExp.quiz.question}</p>

          <div className="space-y-1.5 pt-1">
            {currentExp.quiz.options.map((opt) => {
              const isSelected = userAnswers[currentExp.id] === opt.id;
              const answered = showFeedback[currentExp.id];

              let optClass = "bg-white border-slate-200 hover:border-slate-300 text-slate-700";
              if (answered) {
                if (opt.correct) {
                  optClass = "bg-emerald-50 border-emerald-400 text-emerald-900 font-medium";
                } else if (isSelected && !opt.correct) {
                  optClass = "bg-rose-50 border-rose-400 text-rose-900";
                }
              } else if (isSelected) {
                optClass = "bg-teal-50 border-teal-500 text-teal-900";
              }

              return (
                <div key={opt.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => handleSelectOption(currentExp.id, opt.id)}
                    className={`w-full text-left p-2 rounded-lg border text-xs flex items-start space-x-2 transition ${optClass}`}
                  >
                    <span className="font-mono mt-0.5 font-bold">
                      {opt.id === "opt1" ? "A." : opt.id === "opt2" ? "B." : "C."}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {answered && opt.correct && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {answered && isSelected && !opt.correct && (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                  </button>

                  {/* Feedback explanation for selected option */}
                  {answered && isSelected && (
                    <div
                      className={`p-2 rounded text-[11px] border ml-5 ${
                        opt.correct
                          ? "bg-emerald-50/80 border-emerald-200 text-emerald-800"
                          : "bg-rose-50/80 border-rose-200 text-rose-800"
                      }`}
                    >
                      {opt.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
