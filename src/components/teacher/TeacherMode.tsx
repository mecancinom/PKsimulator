import React, { useState } from "react";
import { useSimulation } from "../../context/SimulationContext";
import { Settings2, Lock, Unlock, Download, Copy, Check } from "lucide-react";

export const TeacherMode: React.FC = () => {
  const {
    lockedParameters,
    toggleParamLock,
    copyConfigurationJSON,
    sim,
    updateSim,
  } = useSimulation();

  const [copied, setCopied] = useState(false);

  const lockableParams = [
    { key: "dose", label: "Dosis Administrada" },
    { key: "gfr", label: "Filtración Glomerular (TFG)" },
    { key: "respiratoryRate", label: "Frecuencia Respiratoria" },
    { key: "heartRate", label: "Frecuencia Cardiaca" },
  ];

  const handleCopy = () => {
    copyConfigurationJSON();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-indigo-950/20 border border-indigo-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Settings2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-indigo-900">
              Panel del Modo Docente
            </h3>
            <p className="text-[11px] text-indigo-700">
              Control pedagógico de variables y diseño de exámenes prácticos
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>Copiar Configuración JSON</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Parameter Lock Manager */}
        <div className="bg-white p-3.5 rounded-lg border border-indigo-100 space-y-2">
          <span className="font-semibold text-slate-800 block">
            Bloqueo de Parámetros para Estudiantes:
          </span>
          <p className="text-[11px] text-slate-500">
            Bloquea variables para que el estudiante deba concentrarse exclusivamente en el parámetro que deseas evaluar.
          </p>

          <div className="space-y-1.5 pt-1">
            {lockableParams.map((p) => {
              const isLocked = !!lockedParameters[p.key];
              return (
                <div
                  key={p.key}
                  className="flex items-center justify-between p-2 rounded border border-slate-200 bg-slate-50"
                >
                  <span className="font-medium text-slate-700">{p.label}</span>
                  <button
                    type="button"
                    onClick={() => toggleParamLock(p.key)}
                    className={`px-2 py-1 rounded text-xs font-semibold flex items-center space-x-1 transition ${
                      isLocked
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-3 h-3 text-amber-700" />
                        <span>Bloqueado</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3 text-slate-500" />
                        <span>Libre</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Simulation Duration & Step Configuration */}
        <div className="bg-white p-3.5 rounded-lg border border-indigo-100 space-y-3">
          <span className="font-semibold text-slate-800 block">
            Ajustes Globales del Entorno de Simulación:
          </span>

          <div className="space-y-1">
            <label className="text-slate-600 block">
              Duración de la Ventana Temporal de Simulación:
            </label>
            <div className="flex items-center space-x-2">
              {[8, 12, 16, 24, 48].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => updateSim({ duration: h }, "duration")}
                  className={`px-2.5 py-1 rounded border font-mono font-semibold text-xs ${
                    sim.duration === h
                      ? "bg-indigo-600 text-white border-indigo-700"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {h} h
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
            <strong>Instrucción para el docente:</strong> Puedes enviar a tus alumnos el enlace del navegador tras configurar el caso; todas las variables fijadas se reproducirán idénticamente en sus pantallas.
          </div>
        </div>
      </div>
    </div>
  );
};
