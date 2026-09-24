import React, { useState } from "react";
import { useSimulation } from "../../context/SimulationContext";
import {
  Heart,
  Wind,
  Filter,
  Pill,
  Info,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
} from "lucide-react";
import {
  calculatePulmonaryVentilation,
  calculateCardiacOutput,
} from "../../models/physiology";
import { formatNumber } from "../../utils/units";

interface InfoModalData {
  title: string;
  unit: string;
  physioEffect: string;
  pkEffect: string;
}

export const PatientControls: React.FC = () => {
  const {
    patient,
    updatePatient,
    admin,
    updateAdmin,
    currentDataset,
    appMode,
    lockedParameters,
    toggleParamLock,
  } = useSimulation();

  const [activeInfo, setActiveInfo] = useState<InfoModalData | null>(null);
  const [showAdvancedPhysio, setShowAdvancedPhysio] = useState(false);

  // Computed physiological indicators
  const pulm = calculatePulmonaryVentilation(
    patient.respiratoryRate,
    patient.tidalVolume,
    patient.deadSpace,
    currentDataset.drug.Ka
  );
  const hemo = calculateCardiacOutput(patient.heartRate, patient.strokeVolume);

  const isLocked = (key: string) => appMode === "student" && lockedParameters[key];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
      {/* Title & Badge */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-800 tracking-tight">
              Parámetros del Paciente
            </h3>
            <p className="text-[11px] text-slate-500">Fisiología y dosificación clínica</p>
          </div>
        </div>

        {appMode === "teacher" && (
          <span className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-medium">
            Docente: Bloqueo activo
          </span>
        )}
      </div>

      {/* 1. Dose Control */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="input-dose" className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
            <Pill className="w-3.5 h-3.5 text-teal-600" />
            <span>Dosis Administrada</span>
            {appMode === "teacher" && (
              <button
                onClick={() => toggleParamLock("dose")}
                className="text-slate-400 hover:text-indigo-600 ml-1"
                title="Bloquear parámetro para estudiantes"
              >
                {lockedParameters["dose"] ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3" />}
              </button>
            )}
          </label>

          <div className="flex items-center space-x-1">
            {/* Unit selector: mg vs mg/kg */}
            <div className="flex rounded bg-slate-200 p-0.5 text-[10px] font-medium">
              <button
                type="button"
                onClick={() => updateAdmin({ doseUnit: "mg" }, "doseUnit")}
                disabled={isLocked("dose")}
                className={`px-1.5 py-0.5 rounded ${
                  admin.doseUnit === "mg" ? "bg-white text-slate-800 shadow-xs" : "text-slate-600"
                }`}
              >
                mg
              </button>
              <button
                type="button"
                onClick={() => updateAdmin({ doseUnit: "mg/kg" }, "doseUnit")}
                disabled={isLocked("dose")}
                className={`px-1.5 py-0.5 rounded ${
                  admin.doseUnit === "mg/kg" ? "bg-white text-slate-800 shadow-xs" : "text-slate-600"
                }`}
              >
                mg/kg
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setActiveInfo({
                  title: "Dosis del Fármaco",
                  unit: admin.doseUnit,
                  physioEffect: "Cantidad molecular inicial introducida al sistema biológico.",
                  pkEffect:
                    "En cinética lineal de primer orden, duplicar la dosis duplica exactamente Cmax y AUC, sin alterar la vida media de eliminación ni el aclaramiento.",
                })
              }
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Información farmacológica"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            id="input-dose"
            type="range"
            min="10"
            max="1000"
            step="10"
            disabled={isLocked("dose")}
            value={admin.dose}
            onChange={(e) => updateAdmin({ dose: Number(e.target.value) }, "dose")}
            className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <input
            type="number"
            min="1"
            max="2000"
            disabled={isLocked("dose")}
            value={admin.dose}
            onChange={(e) => updateAdmin({ dose: Math.max(1, Number(e.target.value)) }, "dose")}
            className="w-18 px-2 py-1 text-right text-xs font-semibold rounded border border-slate-300 bg-white"
          />
          <span className="text-xs text-slate-500 font-medium w-8">{admin.doseUnit}</span>
        </div>

        {admin.doseUnit === "mg/kg" && (
          <div className="text-[11px] text-teal-800 bg-teal-50 px-2 py-1 rounded border border-teal-200 flex justify-between">
            <span>Dosis total efectiva:</span>
            <span className="font-semibold">
              {formatNumber(admin.dose * patient.bodyWeight, 0)} mg (para {patient.bodyWeight} kg)
            </span>
          </div>
        )}
      </div>

      {/* 2. Glomerular Filtration Rate (GFR / TFG) Control */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="input-gfr" className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Tasa Filtración Glomerular (TFG)</span>
            {appMode === "teacher" && (
              <button
                onClick={() => toggleParamLock("gfr")}
                className="text-slate-400 hover:text-indigo-600 ml-1"
              >
                {lockedParameters["gfr"] ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3" />}
              </button>
            )}
          </label>

          <button
            type="button"
            onClick={() =>
              setActiveInfo({
                title: "Filtración Glomerular (TFG)",
                unit: "mL/min/1.73 m²",
                physioEffect:
                  "Determina el flujo plasmático filtrado a través de los capilares glomerulares hacia la cápsula de Bowman por minuto.",
                pkEffect:
                  "Modifica exclusivamente la fracción renal del clearance: CLrenal = CLrenal,baseline * (TFG / 100). Una TFG reducida reduce Kel, prolonga la vida media e incrementa el AUC.",
              })
            }
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <input
            id="input-gfr"
            type="range"
            min="15"
            max="150"
            step="5"
            disabled={isLocked("gfr")}
            value={patient.gfr}
            onChange={(e) => updatePatient({ gfr: Number(e.target.value) }, "gfr")}
            className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-800 w-12 text-right">
            {patient.gfr}
          </span>
          <span className="text-[10px] text-slate-500">mL/min</span>
        </div>

        {/* Renal clearance live physiological pathway */}
        <div className="text-[11px] bg-blue-50/70 border border-blue-200/80 rounded p-1.5 text-slate-600 space-y-1">
          <div className="flex justify-between items-center text-[10px] text-blue-900 font-medium">
            <span>CL Renal: {formatNumber(currentDataset.effectiveParams.CL_renal, 2)} L/h</span>
            <span>CL No-Renal: {formatNumber(currentDataset.effectiveParams.CL_nonrenal, 2)} L/h</span>
            <span className="font-bold text-blue-800">
              CL Total: {formatNumber(currentDataset.effectiveParams.CL_total, 2)} L/h
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            {patient.gfr >= 90 ? (
              <span className="text-emerald-700 font-medium">● Función renal normal</span>
            ) : patient.gfr >= 60 ? (
              <span className="text-amber-700 font-medium">● Insuficiencia renal leve</span>
            ) : patient.gfr >= 30 ? (
              <span className="text-amber-800 font-medium">● Insuficiencia renal moderada</span>
            ) : (
              <span className="text-rose-700 font-bold">● Insuficiencia renal severa</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Respiratory Rate Control (FR) */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="input-rr" className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
            <Wind className="w-3.5 h-3.5 text-sky-600" />
            <span>Frecuencia Respiratoria</span>
            {appMode === "teacher" && (
              <button
                onClick={() => toggleParamLock("respiratoryRate")}
                className="text-slate-400 hover:text-indigo-600 ml-1"
              >
                {lockedParameters["respiratoryRate"] ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3" />}
              </button>
            )}
          </label>

          <button
            type="button"
            onClick={() =>
              setActiveInfo({
                title: "Frecuencia Respiratoria (FR)",
                unit: "respiraciones/minuto (rpm)",
                physioEffect:
                  "Modula la ventilación alveolar VA = FR * (VT - Espacio Muerto).",
                pkEffect:
                  "En administración inhalatoria, mayor ventilación alveolar aumenta el factor de absorción y la constante Ka efectiva hacia el compartimento central.",
              })
            }
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <input
            id="input-rr"
            type="range"
            min="6"
            max="40"
            step="1"
            disabled={isLocked("respiratoryRate")}
            value={patient.respiratoryRate}
            onChange={(e) => updatePatient({ respiratoryRate: Number(e.target.value) }, "respiratoryRate")}
            className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-800 w-8 text-right">
            {patient.respiratoryRate}
          </span>
          <span className="text-[10px] text-slate-500">rpm</span>
        </div>

        {/* Pulmonary ventilation intermediate results */}
        <div className="text-[11px] bg-sky-50/70 border border-sky-200/80 rounded p-1.5 text-slate-600 flex justify-between text-[10px]">
          <span>Vent. Minuto: {formatNumber(pulm.VE / 1000, 1)} L/min</span>
          <span>Vent. Alveolar: {formatNumber(pulm.VA / 1000, 1)} L/min</span>
          <span className="font-semibold text-sky-800">
            Factor Abs: {formatNumber(pulm.ventilationFactor, 2)}x
          </span>
        </div>
      </div>

      {/* 4. Heart Rate Control (FC) */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="input-hr" className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Frecuencia Cardiaca</span>
            {appMode === "teacher" && (
              <button
                onClick={() => toggleParamLock("heartRate")}
                className="text-slate-400 hover:text-indigo-600 ml-1"
              >
                {lockedParameters["heartRate"] ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3" />}
              </button>
            )}
          </label>

          <button
            type="button"
            onClick={() =>
              setActiveInfo({
                title: "Frecuencia Cardiaca (FC)",
                unit: "latidos/minuto (lpm)",
                physioEffect:
                  "Modula el gasto cardiaco: GC = FC * Volumen Sistólico (SV).",
                pkEffect:
                  "Cuando el efecto hemodinámico educativo está activado, un mayor gasto cardiaco acelera la tasa de transferencia tisular K12.",
              })
            }
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <input
            id="input-hr"
            type="range"
            min="40"
            max="180"
            step="2"
            disabled={isLocked("heartRate")}
            value={patient.heartRate}
            onChange={(e) => updatePatient({ heartRate: Number(e.target.value) }, "heartRate")}
            className="w-full accent-rose-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-800 w-8 text-right">
            {patient.heartRate}
          </span>
          <span className="text-[10px] text-slate-500">lpm</span>
        </div>

        <div className="flex items-center justify-between text-[10px] pt-1">
          <span className="text-slate-500">Gasto Cardiaco: {formatNumber(hemo.cardiacOutput, 2)} L/min</span>
          <label className="flex items-center space-x-1 cursor-pointer text-slate-600">
            <input
              type="checkbox"
              checked={patient.enableHemodynamicEffect}
              onChange={(e) => updatePatient({ enableHemodynamicEffect: e.target.checked }, "enableHemodynamicEffect")}
              className="rounded text-rose-600 h-3 w-3 accent-rose-600"
            />
            <span>Efecto hemodinámico</span>
          </label>
        </div>
      </div>

      {/* Accordion for advanced patient physiology (weight, tidal volume, etc.) */}
      <div className="border-t border-slate-100 pt-2">
        <button
          type="button"
          onClick={() => setShowAdvancedPhysio(!showAdvancedPhysio)}
          className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 py-1"
        >
          <span>Fisiología avanzada (peso, volumen corriente)</span>
          {showAdvancedPhysio ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvancedPhysio && (
          <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="input-weight" className="text-slate-600">Peso Corporal (kg):</label>
              <input
                id="input-weight"
                type="number"
                min="30"
                max="200"
                value={patient.bodyWeight}
                onChange={(e) => updatePatient({ bodyWeight: Number(e.target.value) }, "bodyWeight")}
                className="w-16 px-1.5 py-0.5 border border-slate-300 rounded bg-white text-right"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="input-tidal-vol" className="text-slate-600">Volumen Corriente VT (mL):</label>
              <input
                id="input-tidal-vol"
                type="number"
                min="200"
                max="900"
                step="50"
                value={patient.tidalVolume}
                onChange={(e) => updatePatient({ tidalVolume: Number(e.target.value) }, "tidalVolume")}
                className="w-16 px-1.5 py-0.5 border border-slate-300 rounded bg-white text-right"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="input-stroke-vol" className="text-slate-600">Volumen Sistólico SV (mL):</label>
              <input
                id="input-stroke-vol"
                type="number"
                min="30"
                max="140"
                step="5"
                value={patient.strokeVolume}
                onChange={(e) => updatePatient({ strokeVolume: Number(e.target.value) }, "strokeVolume")}
                className="w-16 px-1.5 py-0.5 border border-slate-300 rounded bg-white text-right"
              />
            </div>
          </div>
        )}
      </div>

      {/* Popover / Info Modal */}
      {activeInfo && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-semibold text-slate-800 text-sm flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-teal-600" />
                <span>{activeInfo.title}</span>
              </h4>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {activeInfo.unit}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-700 block">Efecto Fisiológico:</span>
                <p className="mt-0.5">{activeInfo.physioEffect}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block">Efecto Farmacocinético:</span>
                <p className="mt-0.5">{activeInfo.pkEffect}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveInfo(null)}
              className="w-full mt-2 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
