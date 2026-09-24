import React, { useState } from "react";
import { useSimulation } from "../../context/SimulationContext";
import { DEMO_DRUGS } from "../../data/demoDrugs";
import { Sliders, Layers, Syringe, Wind, Info, HelpCircle } from "lucide-react";
import { formatNumber } from "../../utils/units";

export const PKParameterPanel: React.FC = () => {
  const {
    drug,
    updateDrug,
    selectDrug,
    admin,
    updateAdmin,
    sim,
    updateSim,
    currentDataset,
    advancedMode,
  } = useSimulation();

  const [hoveredParam, setHoveredParam] = useState<string | null>(null);

  const isTwoComp = sim.model === "TWO_COMPARTMENT";

  // Section 41 exact definitions
  const PARAM_DEFINITIONS: Record<string, string> = {
    K12: "Constante de transferencia desde el compartimento central hacia el compartimento periférico.",
    K21: "Constante de transferencia desde el compartimento periférico hacia el compartimento central.",
    Kel: "Constante de eliminación de primer orden desde el compartimento central.",
    CL: "Volumen de plasma del que se elimina completamente el fármaco por unidad de tiempo, según la definición aplicable al modelo.",
    V1: "Volumen aparente de distribución del compartimento central (sangre y órganos ricamente vascularizados).",
    V2: "Volumen aparente de distribución del compartimento periférico (tejidos magros, músculo, grasa).",
    Ka: "Constante de velocidad de absorción hacia el compartimento central.",
    renalFraction: "Fracción del aclaramiento total que depende de la eliminación renal por filtración/secreción.",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-800 tracking-tight">
              Modelo y Farmacocinética
            </h3>
            <p className="text-[11px] text-slate-500">Configuración estructural y cinética</p>
          </div>
        </div>
      </div>

      {/* 1. Model Selector (Section 16) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-teal-600" />
          <span>Modelo Farmacocinético</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            id="btn-model-one"
            onClick={() => updateSim({ model: "ONE_COMPARTMENT" }, "model")}
            className={`p-2 rounded-lg text-xs font-medium border text-left transition ${
              !isTwoComp
                ? "bg-teal-50 border-teal-500 text-teal-900 shadow-xs"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="font-semibold">Monocompartimental</div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              Distribución homogénea instantánea
            </div>
          </button>

          <button
            type="button"
            id="btn-model-two"
            onClick={() => updateSim({ model: "TWO_COMPARTMENT" }, "model")}
            className={`p-2 rounded-lg text-xs font-medium border text-left transition ${
              isTwoComp
                ? "bg-teal-50 border-teal-500 text-teal-900 shadow-xs"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="font-semibold">Bicompartimental</div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              Fase alfa (distribución) + beta (terminal)
            </div>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
          {!isTwoComp
            ? "“En el modelo monocompartimental se supone una distribución instantánea y homogénea dentro del volumen de distribución.”"
            : "“En el modelo bicompartimental se representa una fase inicial de distribución y una fase terminal.”"}
        </p>
      </div>

      {/* 2. Route & Administration Selector (Section 17) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
          <Syringe className="w-3.5 h-3.5 text-teal-600" />
          <span>Vía de Administración</span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            id="btn-route-iv"
            onClick={() => updateAdmin({ route: "IV", type: "BOLUS" }, "route")}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition ${
              admin.route === "IV"
                ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Intravenosa (IV)
          </button>

          <button
            type="button"
            id="btn-route-inh"
            onClick={() => updateAdmin({ route: "INHALATION", type: "INHALATION" }, "route")}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition ${
              admin.route === "INHALATION"
                ? "bg-sky-50 border-sky-500 text-sky-900 shadow-xs"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Inhalatoria
          </button>
        </div>

        {/* If IV: toggle Bolus vs Infusion */}
        {admin.route === "IV" && (
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Modalidad IV:</span>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => updateAdmin({ type: "BOLUS" }, "adminType")}
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    admin.type === "BOLUS" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  Bolo rápido
                </button>
                <button
                  type="button"
                  onClick={() => updateAdmin({ type: "INFUSION" }, "adminType")}
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    admin.type === "INFUSION" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  Infusión continua
                </button>
              </div>
            </div>

            {admin.type === "INFUSION" && (
              <div className="pt-2 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-inf-rate" className="text-slate-600">Velocidad Infusión:</label>
                  <div className="flex items-center space-x-1">
                    <input
                      id="input-inf-rate"
                      type="number"
                      min="1"
                      max="500"
                      value={admin.infusionRate}
                      onChange={(e) => updateAdmin({ infusionRate: Math.max(1, Number(e.target.value)) }, "infusionRate")}
                      className="w-16 px-1.5 py-0.5 border border-slate-300 rounded bg-white text-right font-semibold"
                    />
                    <span className="text-slate-500">mg/h</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="input-inf-dur" className="text-slate-600">Duración Infusión:</label>
                  <div className="flex items-center space-x-1">
                    <input
                      id="input-inf-dur"
                      type="number"
                      min="0.1"
                      max="24"
                      step="0.5"
                      value={admin.duration}
                      onChange={(e) => updateAdmin({ duration: Math.max(0.1, Number(e.target.value)) }, "duration")}
                      className="w-16 px-1.5 py-0.5 border border-slate-300 rounded bg-white text-right font-semibold"
                    />
                    <span className="text-slate-500">horas</span>
                  </div>
                </div>
                <div className="text-[11px] text-indigo-700 font-medium bg-indigo-50 p-1.5 rounded">
                  Dosis total infundida: {formatNumber(admin.infusionRate * admin.duration, 1)} mg
                </div>
              </div>
            )}
          </div>
        )}

        {/* If Inhalation: show Ka and ventilation */}
        {admin.route === "INHALATION" && (
          <div className="bg-sky-50/70 p-2.5 rounded-lg border border-sky-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sky-900 flex items-center">
                <Wind className="w-3.5 h-3.5 mr-1" /> Vía Inhalatoria Activa
              </span>
              <span className="text-[10px] text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                Depósito Pulmonar (AL)
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              El fármaco se deposita en el árbol respiratorio y se absorbe al compartimento central con constante:
            </p>
            <div className="flex justify-between items-center text-sky-950 font-medium">
              <span>Ka Base: {drug.Ka} h⁻¹</span>
              <span className="font-bold text-sky-800">
                Ka Efectivo: {formatNumber(currentDataset.effectiveParams.effectiveKa, 2)} h⁻¹
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Demo Drug Selector (Section 34) */}
      <div className="space-y-1.5">
        <label htmlFor="select-drug" className="text-xs font-semibold text-slate-700">Fármaco Modelo (Demostración)</label>
        <select
          id="select-drug"
          value={drug.id || ""}
          onChange={(e) => {
            const found = DEMO_DRUGS.find((d) => d.id === e.target.value);
            if (found) selectDrug(found);
          }}
          className="w-full text-xs font-medium p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
        >
          {DEMO_DRUGS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-slate-500">{drug.description}</p>
      </div>

      {/* 4. PK Parameters Editor & Inspector */}
      <div className="space-y-2 border-t border-slate-100 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Parámetros Farmacocinéticos</span>
          <span className="text-[10px] text-slate-400">Pasa el cursor para ver definición</span>
        </div>

        {/* Central Volume V1 */}
        <div
          className="p-2 rounded bg-slate-50 border border-slate-200/80 space-y-1"
          onMouseEnter={() => setHoveredParam("V1")}
          onMouseLeave={() => setHoveredParam(null)}
        >
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700 flex items-center">
              V₁ (Volumen Central)
              <HelpCircle className="w-3 h-3 ml-1 text-slate-400" />
            </span>
            <span className="font-bold text-slate-900">{drug.V1} L</span>
          </div>
          <input
            type="range"
            min="2"
            max="60"
            step="1"
            value={drug.V1}
            onChange={(e) => updateDrug({ V1: Number(e.target.value) }, "V1")}
            className="w-full accent-teal-600 h-1 bg-slate-200 rounded cursor-pointer"
          />
        </div>

        {/* Peripheral Volume V2 (if 2-comp) */}
        {isTwoComp && (
          <div
            className="p-2 rounded bg-slate-50 border border-slate-200/80 space-y-1"
            onMouseEnter={() => setHoveredParam("V2")}
            onMouseLeave={() => setHoveredParam(null)}
          >
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 flex items-center">
                V₂ (Volumen Periférico)
                <HelpCircle className="w-3 h-3 ml-1 text-slate-400" />
              </span>
              <span className="font-bold text-slate-900">{drug.V2} L</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={drug.V2}
              onChange={(e) => updateDrug({ V2: Number(e.target.value) }, "V2")}
              className="w-full accent-indigo-600 h-1 bg-slate-200 rounded cursor-pointer"
            />
          </div>
        )}

        {/* Total Clearance */}
        <div
          className="p-2 rounded bg-slate-50 border border-slate-200/80 space-y-1"
          onMouseEnter={() => setHoveredParam("CL")}
          onMouseLeave={() => setHoveredParam(null)}
        >
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700 flex items-center">
              Aclaramiento Total (CL Basal)
              <HelpCircle className="w-3 h-3 ml-1 text-slate-400" />
            </span>
            <span className="font-bold text-slate-900">{drug.clearanceTotal} L/h</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="30"
            step="0.5"
            value={drug.clearanceTotal}
            onChange={(e) => updateDrug({ clearanceTotal: Number(e.target.value) }, "clearanceTotal")}
            className="w-full accent-teal-600 h-1 bg-slate-200 rounded cursor-pointer"
          />
        </div>

        {/* Renal Fraction fe */}
        <div
          className="p-2 rounded bg-slate-50 border border-slate-200/80 space-y-1"
          onMouseEnter={() => setHoveredParam("renalFraction")}
          onMouseLeave={() => setHoveredParam(null)}
        >
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700 flex items-center">
              Fracción Renal de Eliminación (f_e)
              <HelpCircle className="w-3 h-3 ml-1 text-slate-400" />
            </span>
            <span className="font-bold text-slate-900">
              {formatNumber(drug.renalFraction * 100, 0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={drug.renalFraction}
            onChange={(e) => updateDrug({ renalFraction: Number(e.target.value) }, "renalFraction")}
            className="w-full accent-blue-600 h-1 bg-slate-200 rounded cursor-pointer"
          />
        </div>

        {/* Micro-constants (K12, K21) if two-compartment */}
        {isTwoComp && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div
              className="p-2 rounded bg-slate-50 border border-slate-200/80 space-y-1"
              onMouseEnter={() => setHoveredParam("K12")}
              onMouseLeave={() => setHoveredParam(null)}
            >
              <div className="flex justify-between text-[11px]">
                <span className="font-medium text-slate-700">K₁₂ (Central→Perif)</span>
                <span className="font-bold text-slate-900">{drug.K12} h⁻¹</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="3.0"
                step="0.05"
                value={drug.K12}
                onChange={(e) => updateDrug({ K12: Number(e.target.value) }, "K12")}
                className="w-full accent-indigo-600 h-1 bg-slate-200 rounded cursor-pointer"
              />
            </div>

            <div
              className="p-2 rounded bg-slate-50 border border-slate-200/80 space-y-1"
              onMouseEnter={() => setHoveredParam("K21")}
              onMouseLeave={() => setHoveredParam(null)}
            >
              <div className="flex justify-between text-[11px]">
                <span className="font-medium text-slate-700">K₂₁ (Perif→Central)</span>
                <span className="font-bold text-slate-900">{drug.K21} h⁻¹</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="2.0"
                step="0.05"
                value={drug.K21}
                onChange={(e) => updateDrug({ K21: Number(e.target.value) }, "K21")}
                className="w-full accent-indigo-600 h-1 bg-slate-200 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Ka absorption constant if inhalation or advanced */}
        {(admin.route === "INHALATION" || advancedMode) && (
          <div
            className="p-2 rounded bg-slate-50 border border-slate-200/80 space-y-1"
            onMouseEnter={() => setHoveredParam("Ka")}
            onMouseLeave={() => setHoveredParam(null)}
          >
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 flex items-center">
                K_a (Constante de Absorción)
                <HelpCircle className="w-3 h-3 ml-1 text-slate-400" />
              </span>
              <span className="font-bold text-slate-900">{drug.Ka} h⁻¹</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={drug.Ka}
              onChange={(e) => updateDrug({ Ka: Number(e.target.value) }, "Ka")}
              className="w-full accent-sky-600 h-1 bg-slate-200 rounded cursor-pointer"
            />
          </div>
        )}

        {/* Hover Information Banner (Section 41) */}
        {hoveredParam && PARAM_DEFINITIONS[hoveredParam] && (
          <div className="p-2 rounded bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start space-x-1.5 transition">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-teal-600" />
            <div>
              <span className="font-bold">{hoveredParam}: </span>
              <span>{PARAM_DEFINITIONS[hoveredParam]}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
