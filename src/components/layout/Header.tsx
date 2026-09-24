import React, { useState } from "react";
import { useSimulation } from "../../context/SimulationContext";
import {
  Activity,
  Share2,
  Download,
  Code2,
  GraduationCap,
  Settings2,
  BookOpen,
  Check,
  AlertTriangle,
} from "lucide-react";

interface HeaderProps {
  onOpenEquations: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenEquations, onOpenGuide }) => {
  const {
    appMode,
    setAppMode,
    advancedMode,
    setAdvancedMode,
    copyScenarioLink,
    copyConfigurationJSON,
    exportCSV,
  } = useSimulation();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);

  const handleCopyLink = () => {
    copyScenarioLink();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyJSON = () => {
    copyConfigurationJSON();
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2500);
  };

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg tracking-tight text-white">PharmacoSim</h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-teal-900/60 text-teal-300 border border-teal-700/50">
                  Laboratorio Virtual PK
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                Simulador interactivo de farmacocinética para educación médica
              </p>
            </div>
          </div>

          {/* Educational safety badge */}
          <div className="hidden xl:flex items-center text-xs text-amber-300 bg-amber-950/40 border border-amber-700/40 px-3 py-1 rounded-md">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400 shrink-0" />
            <span>Modelo educativo simulado — No apto para prescripción clínica</span>
          </div>

          {/* Quick Controls & Tools */}
          <div className="flex items-center space-x-2">
            {/* Mode Toggle (Student / Teacher) */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                id="btn-mode-student"
                onClick={() => setAppMode("student")}
                className={`flex items-center px-2.5 py-1 rounded-md font-medium transition ${
                  appMode === "student"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Modo Estudiante: Experimenta y responde desafíos"
              >
                <GraduationCap className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Estudiante</span>
              </button>
              <button
                id="btn-mode-teacher"
                onClick={() => setAppMode("teacher")}
                className={`flex items-center px-2.5 py-1 rounded-md font-medium transition ${
                  appMode === "teacher"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Modo Docente: Configuración y bloqueo de variables"
              >
                <Settings2 className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Docente</span>
              </button>
            </div>

            {/* Advanced Mode Toggle */}
            <button
              id="btn-toggle-advanced"
              onClick={() => setAdvancedMode(!advancedMode)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition flex items-center ${
                advancedMode
                  ? "bg-slate-700 text-teal-300 border-teal-500/50"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
              title="Alternar modo avanzado con todas las ecuaciones y constantes micro"
            >
              <Code2 className="w-3.5 h-3.5 mr-1" />
              <span className="hidden md:inline">Avanzado</span>
            </button>

            {/* View Math Equations */}
            <button
              id="btn-equations-modal"
              onClick={onOpenEquations}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Ver ecuaciones diferenciales y fórmulas del modelo"
            >
              <span className="font-serif italic font-bold px-1 text-sm">ƒ(x)</span>
            </button>

            {/* View Guide */}
            <button
              id="btn-guide-modal"
              onClick={onOpenGuide}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Guía Pedagógica y Objetivos"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Share link */}
            <button
              id="btn-share-link"
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition relative"
              title="Copiar enlace del escenario actual"
            >
              {copiedLink ? <Check className="w-4 h-4 text-teal-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Export CSV */}
            <button
              id="btn-export-csv"
              onClick={exportCSV}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Descargar datos en CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
