import React from "react";
import { useSimulation } from "../../context/SimulationContext";
import { formatNumber } from "../../utils/units";
import { HelpCircle } from "lucide-react";

export const PKSummary: React.FC = () => {
  const { currentDataset, sim, advancedMode } = useSimulation();
  const { summary, effectiveParams } = currentDataset;
  const isTwoComp = sim.model === "TWO_COMPARTMENT";

  const cards = [
    {
      label: "Cmax",
      value: `${formatNumber(summary.Cmax, 2)}`,
      unit: "mg/L",
      description: "Concentración plasmática máxima alcanzada.",
      color: "border-teal-200 bg-teal-50/50 text-teal-900",
    },
    {
      label: "Tmax",
      value: `${formatNumber(summary.Tmax, 2)}`,
      unit: "h",
      description: "Tiempo transcurrido hasta alcanzar Cmax.",
      color: "border-teal-200 bg-teal-50/50 text-teal-900",
    },
    {
      label: "AUC₀₋ₜ",
      value: `${formatNumber(summary.AUC0_t, 2)}`,
      unit: "mg·h/L",
      description: "Área bajo la curva (integración trapezoidal); medida de exposición sistémica.",
      color: "border-blue-200 bg-blue-50/50 text-blue-900",
    },
    {
      label: isTwoComp ? "t₁/₂β (Terminal)" : "t₁/₂ (Eliminación)",
      value: `${formatNumber(summary.tHalf, 2)}`,
      unit: "h",
      description: "Vida media terminal: tiempo necesario para que la concentración decaiga al 50%.",
      color: "border-indigo-200 bg-indigo-50/50 text-indigo-900",
    },
    {
      label: "CL Total",
      value: `${formatNumber(summary.CL, 2)}`,
      unit: "L/h",
      description: "Aclaramiento total sistémico (renal + no-renal).",
      color: "border-slate-200 bg-slate-50 text-slate-800",
    },
    {
      label: isTwoComp ? "V_ss (V₁+V₂)" : "V_d (Aparente)",
      value: `${formatNumber(summary.Vd, 1)}`,
      unit: "L",
      description: "Volumen aparente de distribución total en estado estacionario.",
      color: "border-slate-200 bg-slate-50 text-slate-800",
    },
    {
      label: "Kel",
      value: `${formatNumber(summary.Kel, 3)}`,
      unit: "h⁻¹",
      description: "Constante de eliminación de primer orden desde el compartimento central (CL/V₁).",
      color: "border-slate-200 bg-slate-50 text-slate-800",
    },
  ];

  // Two-compartment macro coefficients
  const twoCompCards = isTwoComp
    ? [
        {
          label: "α (Fase Rápida)",
          value: `${formatNumber(effectiveParams.alpha || 0, 3)}`,
          unit: "h⁻¹",
          description: "Constante macro de disposición rápida (distribución predominante).",
          color: "border-purple-200 bg-purple-50/50 text-purple-900",
        },
        {
          label: "t₁/₂α",
          value: `${formatNumber(effectiveParams.tHalfAlpha || 0, 2)}`,
          unit: "h",
          description: "Vida media de la fase alfa de distribución (ln(2)/α).",
          color: "border-purple-200 bg-purple-50/50 text-purple-900",
        },
        {
          label: "β (Fase Lenta)",
          value: `${formatNumber(effectiveParams.beta || 0, 3)}`,
          unit: "h⁻¹",
          description: "Constante macro de disposición lenta (eliminación terminal).",
          color: "border-purple-200 bg-purple-50/50 text-purple-900",
        },
      ]
    : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-700">
          Indicadores Farmacocinéticos Resumen (Resultados PK)
        </h3>
        <span className="text-[11px] text-slate-500">
          Cálculo exacto sobre la trayectoria simulada
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`p-2.5 rounded-lg border flex flex-col justify-between ${card.color} group relative transition hover:shadow-xs`}
            title={card.description}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
              <span>{card.label}</span>
              <HelpCircle className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
            </div>

            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold font-mono tracking-tight">{card.value}</span>
              <span className="text-[10px] font-medium text-slate-500">{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two compartment macro parameters row */}
      {isTwoComp && (
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
            <span>Coeficientes Macro del Modelo Bicompartimental:</span>
            {advancedMode && effectiveParams.macroA !== undefined && (
              <span className="font-mono text-[10px] text-slate-500">
                A = {formatNumber(effectiveParams.macroA, 2)} mg/L | B = {formatNumber(effectiveParams.macroB || 0, 2)} mg/L
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {twoCompCards.map((card, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg border flex items-center justify-between ${card.color}`}
                title={card.description}
              >
                <div>
                  <span className="text-[10px] font-semibold block text-slate-600">{card.label}</span>
                  <span className="text-xs text-slate-500">{card.description}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-bold">{card.value}</span>
                  <span className="text-[10px] ml-1 text-slate-500">{card.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
