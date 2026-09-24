import React, { useState } from "react";
import { SimulationProvider, useSimulation } from "./context/SimulationContext";
import { Header } from "./components/layout/Header";
import { PatientControls } from "./components/patient/PatientControls";
import { PKParameterPanel } from "./components/pharmacokinetics/PKParameterPanel";
import { CompartmentDiagram } from "./components/visualization/CompartmentDiagram";
import { SimulationControls } from "./components/visualization/SimulationControls";
import { ConcentrationChart } from "./components/visualization/ConcentrationChart";
import { AmountChart } from "./components/visualization/AmountChart";
import { PKSummary } from "./components/visualization/PKSummary";
import { ExplanationPanel } from "./components/education/ExplanationPanel";
import { ScenarioComparison } from "./components/comparison/ScenarioComparison";
import { VirtualLab } from "./components/education/VirtualLab";
import { ClinicalChallenge } from "./components/education/ClinicalChallenge";
import { LearningObjectives } from "./components/education/LearningObjectives";
import { EquationsModal } from "./components/education/EquationsModal";
import { TeacherMode } from "./components/teacher/TeacherMode";
import {
  Activity,
  Layers,
  FlaskConical,
  Stethoscope,
  BarChart2,
  Sliders,
  Heart,
  GitCompare,
} from "lucide-react";

const MainContent: React.FC = () => {
  const { appMode, selectedChart, setSelectedChart } = useSimulation();

  // Modals state
  const [showEquationsModal, setShowEquationsModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Active educational tab in bottom section
  const [activeTab, setActiveTab] = useState<"lab" | "challenge" | "comparison">("lab");

  // Mobile navigation tab
  const [mobileTab, setMobileTab] = useState<"controls" | "diagram" | "charts" | "results" | "education">("diagram");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenEquations={() => setShowEquationsModal(true)}
        onOpenGuide={() => setShowGuideModal(true)}
      />

      {/* Teacher Mode Panel Banner if active */}
      {appMode === "teacher" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <TeacherMode />
        </div>
      )}

      {/* Mobile Navigation Tabs */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 sticky top-16 z-20 overflow-x-auto flex space-x-2 text-xs">
        <button
          onClick={() => setMobileTab("controls")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center space-x-1 ${
            mobileTab === "controls" ? "bg-teal-600 text-white" : "text-slate-600 bg-slate-100"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Controles</span>
        </button>
        <button
          onClick={() => setMobileTab("diagram")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center space-x-1 ${
            mobileTab === "diagram" ? "bg-teal-600 text-white" : "text-slate-600 bg-slate-100"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Simulación</span>
        </button>
        <button
          onClick={() => setMobileTab("charts")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center space-x-1 ${
            mobileTab === "charts" ? "bg-teal-600 text-white" : "text-slate-600 bg-slate-100"
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Gráficas</span>
        </button>
        <button
          onClick={() => setMobileTab("results")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center space-x-1 ${
            mobileTab === "results" ? "bg-teal-600 text-white" : "text-slate-600 bg-slate-100"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Resultados</span>
        </button>
        <button
          onClick={() => setMobileTab("education")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center space-x-1 ${
            mobileTab === "education" ? "bg-teal-600 text-white" : "text-slate-600 bg-slate-100"
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Laboratorio</span>
        </button>
      </div>

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 space-y-5 w-full">
        {/* TOP SECTION: 3-COLUMN LAYOUT (DESKTOP) / TABBED (MOBILE) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Col 1: Patient Controls */}
          <div className={`lg:col-span-3 ${mobileTab !== "controls" ? "hidden lg:block" : "block"}`}>
            <PatientControls />
          </div>

          {/* Col 2: Central Simulation Diagram & Playback Controls */}
          <div className={`lg:col-span-6 space-y-3 ${mobileTab !== "diagram" && mobileTab !== "charts" ? "hidden lg:block" : "block"}`}>
            <CompartmentDiagram />
            <SimulationControls />
          </div>

          {/* Col 3: PK Parameters & Model Setup */}
          <div className={`lg:col-span-3 ${mobileTab !== "controls" ? "hidden lg:block" : "block"}`}>
            <PKParameterPanel />
          </div>
        </div>

        {/* MIDDLE SECTION: PK INDICATORS SUMMARY */}
        <div className={mobileTab !== "results" ? "hidden lg:block" : "block"}>
          <PKSummary />
        </div>

        {/* CHARTS SECTION */}
        <div className={`space-y-4 ${mobileTab !== "charts" ? "hidden lg:block" : "block"}`}>
          {/* Chart selector tabs */}
          <div className="flex items-center justify-between">
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setSelectedChart("concentration")}
                className={`px-3 py-1 rounded-md transition ${
                  selectedChart === "concentration"
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Concentración vs Tiempo
              </button>
              <button
                onClick={() => setSelectedChart("amount")}
                className={`px-3 py-1 rounded-md transition ${
                  selectedChart === "amount"
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Cantidad y Masa vs Tiempo
              </button>
              <button
                onClick={() => setSelectedChart("both")}
                className={`px-3 py-1 rounded-md transition ${
                  selectedChart === "both"
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Ambas Gráficas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {(selectedChart === "concentration" || selectedChart === "both") && (
              <div className={selectedChart === "concentration" ? "xl:col-span-2" : ""}>
                <ConcentrationChart />
              </div>
            )}
            {(selectedChart === "amount" || selectedChart === "both") && (
              <div className={selectedChart === "amount" ? "xl:col-span-2" : ""}>
                <AmountChart />
              </div>
            )}
          </div>
        </div>

        {/* DYNAMIC EXPLANATION PANEL */}
        <div>
          <ExplanationPanel />
        </div>

        {/* BOTTOM SECTION: EDUCATIONAL MODULES & EXPERIMENTS */}
        <div className={`space-y-3 ${mobileTab !== "education" ? "hidden lg:block" : "block"}`}>
          {/* Tabs header */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("lab")}
              className={`px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                activeTab === "lab"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Laboratorio Virtual (7 Experimentos)</span>
            </button>

            <button
              onClick={() => setActiveTab("challenge")}
              className={`px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                activeTab === "challenge"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Desafíos Clínicos con Pacientes</span>
            </button>

            <button
              onClick={() => setActiveTab("comparison")}
              className={`px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                activeTab === "comparison"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Tabla Comparativa A vs B</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          <div>
            {activeTab === "lab" && <VirtualLab />}
            {activeTab === "challenge" && <ClinicalChallenge />}
            {activeTab === "comparison" && <ScenarioComparison />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>PharmacoSim</strong> — Plataforma Educativa de Farmacocinética Médica.
          </span>
          <span className="text-[11px] text-slate-400">
            Inspirado conceptualmente en Virtual Anesthesia Machine (University of Florida).
          </span>
        </div>
      </footer>

      {/* Modals */}
      {showEquationsModal && (
        <EquationsModal onClose={() => setShowEquationsModal(false)} />
      )}
      {showGuideModal && (
        <LearningObjectives onClose={() => setShowGuideModal(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <MainContent />
    </SimulationProvider>
  );
}
