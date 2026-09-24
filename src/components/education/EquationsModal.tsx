import React from "react";
import { MathFormula } from "../common/MathFormula";
import { X, BookOpen } from "lucide-react";

export const EquationsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-700 max-h-[90vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Formulario Matemático y Ecuaciones Diferenciales
              </h3>
              <p className="text-xs text-slate-400">
                Modelos de compartimentos farmacocinéticos continuos resueltos por RK4
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs text-slate-300 flex-1">
          {/* 1-Comp */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-teal-400 text-xs">
              1. Modelo Monocompartimental Lineal de Primer Orden
            </h4>
            <p className="text-slate-400 text-[11px]">
              Ecuación diferencial de conservación de masa para la cantidad de fármaco A(t):
            </p>
            <div className="text-center py-1">
              <MathFormula formula="\\frac{dA}{dt} = \\text{Input}(t) - K_{el} \\cdot A(t)" displayMode />
            </div>
            <p className="text-slate-400 text-[11px]">
              Para bolo IV instantáneo en t = 0 con A(0) = Dosis:
            </p>
            <div className="text-center py-1">
              <MathFormula formula="A(t) = \\text{Dosis} \\cdot e^{-K_{el} t}, \\quad C(t) = \\frac{\\text{Dosis}}{V_d} \\cdot e^{-K_{el} t}" displayMode />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800 text-slate-400">
              <div>
                <MathFormula formula="K_{el} = \\frac{CL_{total}}{V_d}" />
              </div>
              <div>
                <MathFormula formula="t_{1/2} = \\frac{\\ln(2)}{K_{el}} = \\frac{0.693 \\cdot V_d}{CL}" />
              </div>
            </div>
          </div>

          {/* 2-Comp */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-indigo-400 text-xs">
              2. Modelo Bicompartimental (Central y Periférico)
            </h4>
            <p className="text-slate-400 text-[11px]">
              Sistema de dos ecuaciones diferenciales acopladas:
            </p>
            <div className="text-center py-1 space-y-1">
              <MathFormula formula="\\frac{dA_1}{dt} = \\text{Input}(t) - (K_{12} + K_{el})A_1 + K_{21}A_2" displayMode />
              <MathFormula formula="\\frac{dA_2}{dt} = K_{12}A_1 - K_{21}A_2" displayMode />
            </div>
            <p className="text-slate-400 text-[11px]">
              Polinomio característico cuadrático y raíces macro (α, β):
            </p>
            <div className="text-center py-1">
              <MathFormula formula="\\lambda^2 - (K_{12} + K_{21} + K_{el})\\lambda + K_{21}K_{el} = 0" displayMode />
            </div>
            <div className="text-center py-1">
              <MathFormula formula="\\alpha = \\frac{(K_{12}+K_{21}+K_{el}) + \\sqrt{(K_{12}+K_{21}+K_{el})^2 - 4K_{21}K_{el}}}{2}" displayMode />
            </div>
            <div className="text-center py-1">
              <MathFormula formula="\\beta = \\frac{(K_{12}+K_{21}+K_{el}) - \\sqrt{(K_{12}+K_{21}+K_{el})^2 - 4K_{21}K_{el}}}{2}" displayMode />
            </div>
            <p className="text-slate-400 text-[11px]">
              Curva biexponencial de concentración plasmática tras bolo IV:
            </p>
            <div className="text-center py-1">
              <MathFormula formula="C_1(t) = A \\cdot e^{-\\alpha t} + B \\cdot e^{-\\beta t}" displayMode />
            </div>
          </div>

          {/* Inhalation */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-sky-400 text-xs">
              3. Vía Inhalatoria y Depósito Pulmonar
            </h4>
            <div className="text-center py-1">
              <MathFormula formula="\\frac{dA_L}{dt} = -K_a \\cdot A_L \\quad \\implies \\quad \\text{Input}_{sistémico}(t) = K_a \\cdot A_L(t)" displayMode />
            </div>
            <div className="text-center py-1">
              <MathFormula formula="V_A = \\text{FR} \\cdot (V_T - V_{muerto}), \\quad K_{a,efectivo} = K_{a,base} \\cdot \\left(\\frac{V_A}{V_{A,basal}}\\right)" displayMode />
            </div>
          </div>

          {/* AUC Trapezoidal Integration */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-emerald-400 text-xs">
              4. Integración Numérica Trapezoidal de Exposición (AUC)
            </h4>
            <div className="text-center py-1">
              <MathFormula formula="\\text{AUC}_{0-t} = \\sum_{i=0}^{N-1} \\frac{C(t_i) + C(t_{i+1})}{2} \\cdot (t_{i+1} - t_i)" displayMode />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-slate-950 font-semibold rounded-lg text-xs transition"
          >
            Cerrar Formulario
          </button>
        </div>
      </div>
    </div>
  );
};
