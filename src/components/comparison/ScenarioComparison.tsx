import React from "react";
import { useSimulation } from "../../context/SimulationContext";
import { formatNumber } from "../../utils/units";
import { Bookmark, Check, Trash2, ArrowRight, GitCompare } from "lucide-react";

export const ScenarioComparison: React.FC = () => {
  const {
    scenarioA,
    scenarioB,
    currentDataset,
    saveAsScenarioA,
    saveAsScenarioB,
    clearComparison,
  } = useSimulation();

  const comparisonRows = [
    {
      param: "Dosis Administrada",
      unit: "mg",
      valA: scenarioA?.effectiveParams.effectiveDose,
      valB: scenarioB?.effectiveParams.effectiveDose,
    },
    {
      param: "TFG (Filtración Glomerular)",
      unit: "mL/min",
      valA: scenarioA?.patient.gfr,
      valB: scenarioB?.patient.gfr,
    },
    {
      param: "Frecuencia Respiratoria",
      unit: "rpm",
      valA: scenarioA?.patient.respiratoryRate,
      valB: scenarioB?.patient.respiratoryRate,
    },
    {
      param: "Frecuencia Cardiaca",
      unit: "lpm",
      valA: scenarioA?.patient.heartRate,
      valB: scenarioB?.patient.heartRate,
    },
    {
      param: "Aclaramiento Total (CL)",
      unit: "L/h",
      valA: scenarioA?.summary.CL,
      valB: scenarioB?.summary.CL,
    },
    {
      param: "Constante Kel",
      unit: "h⁻¹",
      valA: scenarioA?.summary.Kel,
      valB: scenarioB?.summary.Kel,
    },
    {
      param: "Concentración Pico (Cmax)",
      unit: "mg/L",
      valA: scenarioA?.summary.Cmax,
      valB: scenarioB?.summary.Cmax,
    },
    {
      param: "Exposición Sistémica (AUC)",
      unit: "mg·h/L",
      valA: scenarioA?.summary.AUC0_t,
      valB: scenarioB?.summary.AUC0_t,
    },
    {
      param: "Vida Media Terminal (t1/2)",
      unit: "h",
      valA: scenarioA?.summary.tHalf,
      valB: scenarioB?.summary.tHalf,
    },
    {
      param: "Volumen de Distribución",
      unit: "L",
      valA: scenarioA?.summary.Vd,
      valB: scenarioB?.summary.Vd,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-700">
              Comparación de Escenarios (A vs B)
            </h3>
            <p className="text-[11px] text-slate-500">
              Contrasta hipótesis clínicas y cambios paramétricos
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={saveAsScenarioA}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 transition flex items-center space-x-1"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-600" />
            <span>Guardar actual como A</span>
          </button>
          <button
            type="button"
            onClick={saveAsScenarioB}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-pink-50 border border-pink-300 text-pink-900 hover:bg-pink-100 transition flex items-center space-x-1"
          >
            <Bookmark className="w-3.5 h-3.5 text-pink-600" />
            <span>Guardar actual como B</span>
          </button>
          {(scenarioA || scenarioB) && (
            <button
              type="button"
              onClick={clearComparison}
              className="p-1 text-slate-400 hover:text-rose-600 transition"
              title="Borrar comparación"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Comparison Status / Table */}
      {!scenarioA && !scenarioB ? (
        <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-lg space-y-2">
          <p className="font-medium text-slate-600">No hay escenarios guardados para comparar aún.</p>
          <p className="text-slate-400 max-w-md mx-auto">
            Configura una condición basal y presiona <strong className="text-amber-700">“Guardar actual como A”</strong>. Luego modifica un parámetro fisiológico (como TFG o FR) y presiona <strong className="text-pink-700">“Guardar actual como B”</strong>.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2 px-3">Parámetro Farmacocinético</th>
                <th className="py-2 px-3 text-amber-800 bg-amber-50/50">
                  Escenario A {scenarioA ? `(${scenarioA.drug.name.split(" ")[0]})` : ""}
                </th>
                <th className="py-2 px-3 text-pink-800 bg-pink-50/50">
                  Escenario B {scenarioB ? `(${scenarioB.drug.name.split(" ")[0]})` : ""}
                </th>
                <th className="py-2 px-3 text-slate-700">Diferencia (B - A)</th>
                <th className="py-2 px-3 text-slate-700">Cambio Relativo (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {comparisonRows.map((r, idx) => {
                const hasBoth = r.valA !== undefined && r.valB !== undefined;
                const diff = hasBoth ? (r.valB as number) - (r.valA as number) : null;
                const pct = hasBoth && (r.valA as number) !== 0 ? ((diff as number) / (r.valA as number)) * 100 : null;

                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-3 font-sans font-medium text-slate-700">
                      {r.param} <span className="text-[10px] text-slate-400">({r.unit})</span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-amber-900 bg-amber-50/30">
                      {r.valA !== undefined ? formatNumber(r.valA, 2) : "—"}
                    </td>
                    <td className="py-2 px-3 font-semibold text-pink-900 bg-pink-50/30">
                      {r.valB !== undefined ? formatNumber(r.valB, 2) : "—"}
                    </td>
                    <td className="py-2 px-3">
                      {diff !== null ? (
                        <span className={diff > 0 ? "text-emerald-600" : diff < 0 ? "text-rose-600" : "text-slate-500"}>
                          {diff > 0 ? "+" : ""}
                          {formatNumber(diff, 2)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {pct !== null ? (
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          pct > 0 ? "bg-emerald-50 text-emerald-700" : pct < 0 ? "bg-rose-50 text-rose-700" : "text-slate-500"
                        }`}>
                          {pct > 0 ? "+" : ""}
                          {formatNumber(pct, 1)}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
