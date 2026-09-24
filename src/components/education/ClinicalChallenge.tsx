import React, { useState } from "react";
import { useSimulation } from "../../context/SimulationContext";
import { CLINICAL_CHALLENGES, ClinicalChallenge as IClinicalChallenge } from "../../data/educationalCases";
import { Stethoscope, Play, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

export const ClinicalChallenge: React.FC = () => {
  const { loadClinicalChallenge } = useSimulation();
  const [selectedCaseId, setSelectedCaseId] = useState<string>(CLINICAL_CHALLENGES[0].id);
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  const currentCase = CLINICAL_CHALLENGES.find((c) => c.id === selectedCaseId) || CLINICAL_CHALLENGES[0];

  const toggleExplanation = (id: string) => {
    setShowExplanation((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-700">
              Desafío Clínico Simulado
            </h3>
            <p className="text-[11px] text-slate-500">
              Aplicación de principios PK en viñetas clínicas de pacientes
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {CLINICAL_CHALLENGES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                selectedCaseId === c.id
                  ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {c.id === "challenge-renal-failure" ? "Caso 1 (Renal)" : "Caso 2 (Inhalatorio)"}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Notice (Section 25 & 38) */}
      <div className="flex items-center text-[11px] text-amber-800 bg-amber-50 border border-amber-300/80 px-3 py-1.5 rounded-lg">
        <AlertTriangle className="w-4 h-4 mr-2 text-amber-600 shrink-0" />
        <span>
          <strong>Escenario educativo simulado:</strong> Este módulo tiene fines formativos conceptuales. Nunca debe emplearse como recomendación de dosificación para pacientes reales.
        </span>
      </div>

      {/* Patient Profile Card */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h4 className="font-bold text-sm text-slate-900">{currentCase.title}</h4>
            <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
              <span>Edad: {currentCase.patientProfile.age} años</span>
              <span>•</span>
              <span>Sexo: {currentCase.patientProfile.sex === "M" ? "Masculino" : "Femenino"}</span>
              <span>•</span>
              <span>Peso: {currentCase.patientProfile.weight} kg</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadClinicalChallenge(currentCase)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Cargar Parámetros del Caso</span>
          </button>
        </div>

        {/* Clinical Vignette */}
        <div className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
          <span className="font-semibold text-slate-900 block mb-1">Historia Clínica y Contexto:</span>
          <p>{currentCase.caseDescription}</p>
        </div>

        {/* Challenge Goal & Suggested Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
            <span className="font-semibold text-indigo-900 block">Objetivo del Estudiante:</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">{currentCase.challengeGoal}</p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
            <span className="font-semibold text-teal-900 block">Pasos Sugeridos:</span>
            <ul className="space-y-1 text-slate-600 text-[11px]">
              {currentCase.suggestedSteps.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Reflection Questions */}
        <div className="space-y-2 pt-1 text-xs">
          <span className="font-semibold text-slate-800 block">Preguntas de Reflexión Farmacocinética:</span>
          <div className="space-y-1.5">
            {currentCase.reflectionQuestions.map((q, i) => (
              <div key={i} className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 flex items-start space-x-2">
                <span className="font-bold text-indigo-600">{i + 1}.</span>
                <span className="text-[11px]">{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Model Explanation Accordion */}
        <div className="pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => toggleExplanation(currentCase.id)}
            className="w-full flex items-center justify-between text-xs font-semibold text-indigo-700 hover:text-indigo-900 py-1"
          >
            <span>Ver Discusión y Fundamentación del Caso</span>
            {showExplanation[currentCase.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showExplanation[currentCase.id] && (
            <div className="mt-2 p-3 bg-indigo-50/80 border border-indigo-200 rounded-lg text-xs text-indigo-950 leading-relaxed">
              <p>{currentCase.modelExplanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
