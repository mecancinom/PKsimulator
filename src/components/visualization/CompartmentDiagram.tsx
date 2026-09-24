import React, { useMemo } from "react";
import { useSimulation } from "../../context/SimulationContext";
import { formatNumber } from "../../utils/units";
import { ArrowRight, ArrowDown, ArrowLeftRight, Clock, Wind, Syringe } from "lucide-react";

export const CompartmentDiagram: React.FC = () => {
  const { currentPoint, currentDataset, sim, admin, currentTime } = useSimulation();

  const isTwoComp = sim.model === "TWO_COMPARTMENT";
  const isInhalation = admin.route === "INHALATION";

  // Calculate percentage of dose currently in each compartment for particle count
  const effectiveDose = currentDataset.effectiveParams.effectiveDose || 100;

  const pctCentral = Math.min(100, Math.max(0, (currentPoint.A1 / effectiveDose) * 100));
  const pctPeripheral = Math.min(100, Math.max(0, (currentPoint.A2 / effectiveDose) * 100));
  const pctLung = Math.min(100, Math.max(0, (currentPoint.AL / effectiveDose) * 100));
  const pctEliminated = Math.min(100, Math.max(0, (currentPoint.cumulativeElimination / effectiveDose) * 100));

  // Generate deterministic particle dots for visual density
  const centralDots = useMemo(() => {
    const count = Math.min(48, Math.round(pctCentral * 0.48));
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 10 + ((i * 37) % 80),
      top: 15 + ((i * 53) % 70),
      size: 4 + (i % 3),
      delay: (i * 0.2) % 2,
    }));
  }, [pctCentral]);

  const peripheralDots = useMemo(() => {
    const count = Math.min(48, Math.round(pctPeripheral * 0.48));
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 10 + ((i * 41) % 80),
      top: 15 + ((i * 61) % 70),
      size: 4 + (i % 3),
      delay: (i * 0.25) % 2,
    }));
  }, [pctPeripheral]);

  const lungDots = useMemo(() => {
    const count = Math.min(36, Math.round(pctLung * 0.36));
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 10 + ((i * 29) % 80),
      top: 15 + ((i * 43) % 70),
      size: 4 + (i % 2),
      delay: (i * 0.15) % 2,
    }));
  }, [pctLung]);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between z-10 border-b border-slate-800/80 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
          <h3 className="font-semibold text-xs tracking-wide uppercase text-slate-300">
            Diagrama Compartimental Dinámico
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">
            {isTwoComp ? "2-COMP (CENTRAL ⇄ PERIFÉRICO)" : "1-COMP (SISTÉMICO)"}
          </span>
        </div>

        <div className="flex items-center space-x-1 text-xs font-mono bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-md text-teal-300">
          <Clock className="w-3.5 h-3.5 text-teal-400 mr-1" />
          <span>t = {formatNumber(currentTime, 2)} h</span>
        </div>
      </div>

      {/* Main Compartments Flow Layout */}
      <div className="z-10 py-2">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* 1. ADMINISTRATION SOURCE BOX */}
          <div className="md:col-span-3 bg-slate-800/80 border border-amber-500/30 rounded-lg p-3 relative shadow-xs">
            <div className="flex items-center justify-between text-xs text-amber-300 mb-1.5 font-semibold">
              <span className="flex items-center">
                {isInhalation ? (
                  <Wind className="w-3.5 h-3.5 mr-1 text-amber-400" />
                ) : (
                  <Syringe className="w-3.5 h-3.5 mr-1 text-amber-400" />
                )}
                {isInhalation ? "Inhalación" : admin.type === "INFUSION" ? "Infusión IV" : "Bolo IV"}
              </span>
              <span className="text-[10px] text-amber-400/80">Dosis: {effectiveDose} mg</span>
            </div>

            {/* If Inhalation: Pulmonary Depot Box */}
            {isInhalation ? (
              <div className="bg-amber-950/30 border border-amber-500/40 rounded p-2 relative h-24 overflow-hidden">
                <div className="text-[10px] font-medium text-amber-200 flex justify-between">
                  <span>Depósito Pulmonar (A_L)</span>
                  <span className="font-mono font-bold text-amber-300">
                    {formatNumber(currentPoint.AL, 1)} mg
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Tasa Abs: {formatNumber(currentDataset.effectiveParams.effectiveKa * currentPoint.AL, 2)} mg/h
                </div>

                {/* Lung Particles */}
                {lungDots.map((dot) => (
                  <div
                    key={dot.id}
                    className="absolute rounded-full bg-amber-400/80 transition-all duration-300 pointer-events-none"
                    style={{
                      left: `${dot.left}%`,
                      top: `${dot.top}%`,
                      width: `${dot.size}px`,
                      height: `${dot.size}px`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/60 rounded p-2 border border-slate-700/60 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Vía:</span>
                  <span className="font-medium text-slate-200">
                    {admin.type === "INFUSION" ? "Infusión continua" : "Bolo Intravenoso"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tasa Entrada:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {formatNumber(currentPoint.inputRate, 1)} mg/h
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ingresado acumulado:</span>
                  <span className="font-mono text-slate-300">
                    {formatNumber(currentPoint.cumulativeInput, 1)} mg
                  </span>
                </div>
              </div>
            )}

            <div className="mt-2 text-[10px] text-center text-amber-400/70 font-mono flex items-center justify-center">
              <span>Transferencia Sistémica</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </div>

          {/* ARROW CONNECTOR */}
          <div className="hidden md:flex md:col-span-1 justify-center items-center text-teal-400">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-mono text-slate-400">
                {isInhalation ? `Ka=${formatNumber(currentDataset.effectiveParams.effectiveKa, 2)}` : "Input"}
              </span>
              <ArrowRight className="w-5 h-5 text-teal-400 animate-pulse" />
            </div>
          </div>

          {/* 2. CENTRAL COMPARTMENT BOX */}
          <div className={`${isTwoComp ? "md:col-span-4" : "md:col-span-7"} bg-teal-950/40 border-2 border-teal-500/60 rounded-xl p-3 relative shadow-md`}>
            <div className="flex items-center justify-between text-xs text-teal-300 mb-1 font-semibold">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span>Compartimento Central (V₁)</span>
              </div>
              <span className="text-[10px] text-teal-400 font-mono">
                V₁ = {currentDataset.effectiveParams.V1} L
              </span>
            </div>

            <p className="text-[10px] text-slate-400 mb-2">
              Plasma sanguíneo y órganos altamente perfundidos (corazón, pulmones, riñones, hígado).
            </p>

            {/* Particle Chamber */}
            <div className="h-28 bg-slate-950/70 border border-teal-800/60 rounded-lg relative overflow-hidden p-2 flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs z-10">
                <div>
                  <span className="text-[10px] text-slate-400 block">Cantidad (A₁)</span>
                  <span className="font-mono font-bold text-teal-200 text-sm">
                    {formatNumber(currentPoint.A1, 1)} mg
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">({formatNumber(pctCentral, 0)}%)</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Concentración (C₁)</span>
                  <span className="font-mono font-bold text-teal-300 text-base">
                    {formatNumber(currentPoint.C1, 2)} mg/L
                  </span>
                </div>
              </div>

              {/* Central Particles */}
              {centralDots.map((dot) => (
                <div
                  key={dot.id}
                  className="absolute rounded-full bg-teal-400 transition-all duration-300 shadow-xs pointer-events-none"
                  style={{
                    left: `${dot.left}%`,
                    top: `${dot.top}%`,
                    width: `${dot.size}px`,
                    height: `${dot.size}px`,
                  }}
                />
              ))}

              {/* Bottom Concentration Bar */}
              <div className="z-10 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                <div
                  className="bg-teal-400 h-full transition-all duration-150"
                  style={{ width: `${Math.min(100, (currentPoint.C1 / (currentDataset.summary.Cmax || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* TWO-COMPARTMENT: BIDIRECTIONAL CONNECTOR & PERIPHERAL BOX */}
          {isTwoComp && (
            <>
              <div className="hidden md:flex md:col-span-1 justify-center items-center text-indigo-400">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-mono text-indigo-300">
                    K₁₂={currentDataset.effectiveParams.K12}
                  </span>
                  <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
                  <span className="text-[8px] font-mono text-indigo-300">
                    K₂₁={currentDataset.effectiveParams.K21}
                  </span>
                </div>
              </div>

              {/* 3. PERIPHERAL COMPARTMENT BOX */}
              <div className="md:col-span-3 bg-indigo-950/40 border border-indigo-500/50 rounded-xl p-3 relative shadow-md">
                <div className="flex items-center justify-between text-xs text-indigo-300 mb-1 font-semibold">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>Periférico (V₂)</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    V₂ = {currentDataset.effectiveParams.V2} L
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 mb-2">
                  Tejidos profundos, músculo, masa grasa y órganos poco irrigados.
                </p>

                {/* Particle Chamber */}
                <div className="h-28 bg-slate-950/70 border border-indigo-800/60 rounded-lg relative overflow-hidden p-2 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-xs z-10">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Cantidad (A₂)</span>
                      <span className="font-mono font-bold text-indigo-200 text-sm">
                        {formatNumber(currentPoint.A2, 1)} mg
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">({formatNumber(pctPeripheral, 0)}%)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Concentración (C₂)</span>
                      <span className="font-mono font-bold text-indigo-300 text-base">
                        {formatNumber(currentPoint.C2, 2)} mg/L
                      </span>
                    </div>
                  </div>

                  {/* Peripheral Particles */}
                  {peripheralDots.map((dot) => (
                    <div
                      key={dot.id}
                      className="absolute rounded-full bg-indigo-400 transition-all duration-300 shadow-xs pointer-events-none"
                      style={{
                        left: `${dot.left}%`,
                        top: `${dot.top}%`,
                        width: `${dot.size}px`,
                        height: `${dot.size}px`,
                      }}
                    />
                  ))}

                  {/* Bottom Concentration Bar */}
                  <div className="z-10 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                    <div
                      className="bg-indigo-400 h-full transition-all duration-150"
                      style={{ width: `${Math.min(100, (currentPoint.C2 / (currentDataset.summary.Cmax || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ELIMINATION SINK BOX (BOTTOM FLOW) */}
        <div className="mt-3 bg-slate-800/60 border border-slate-700/80 rounded-lg p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-rose-950/60 border border-rose-500/40 text-rose-400">
              <ArrowDown className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-rose-300">Eliminación Sistémica (Kel · A₁)</span>
              <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                Aclaramiento: {formatNumber(currentDataset.effectiveParams.CL_total, 2)} L/h | Kel = {formatNumber(currentDataset.effectiveParams.Kel, 3)} h⁻¹
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 mr-1">Tasa instantánea:</span>
              <span className="text-rose-400 font-bold">{formatNumber(currentPoint.eliminationRate, 2)} mg/h</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 mr-1">Eliminado acumulado:</span>
              <span className="text-emerald-400 font-bold">
                {formatNumber(currentPoint.cumulativeElimination, 1)} mg ({formatNumber(pctEliminated, 0)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
