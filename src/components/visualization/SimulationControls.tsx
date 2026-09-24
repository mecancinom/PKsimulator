import React from "react";
import { useSimulation } from "../../context/SimulationContext";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Bookmark,
  Trash2,
} from "lucide-react";
import { formatNumber } from "../../utils/units";

export const SimulationControls: React.FC = () => {
  const {
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    stepSimulation,
    resetPlayback,
    sim,
    saveAsScenarioA,
    saveAsScenarioB,
    clearComparison,
    scenarioA,
    scenarioB,
  } = useSimulation();

  const speeds = [0.25, 0.5, 1, 2, 4];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 shadow-md text-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* 1. Play / Pause / Step / Reset */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={resetPlayback}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          title="Reiniciar al inicio (t = 0)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => stepSimulation(-1)}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          title="Retroceder 15 minutos"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition shadow-sm ${
            isPlaying
              ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
              : "bg-teal-500 hover:bg-teal-600 text-slate-950"
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Simular</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => stepSimulation(1)}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          title="Avanzar 15 minutos"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Speed selectors */}
        <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs ml-2">
          {speeds.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPlaybackSpeed(s)}
              className={`px-2 py-1 rounded font-mono font-medium transition ${
                playbackSpeed === s
                  ? "bg-teal-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* 2. Time Scrubber Slider */}
      <div className="flex-1 max-w-md w-full flex items-center space-x-3 px-2">
        <span className="text-xs font-mono text-slate-400">0h</span>
        <input
          type="range"
          min="0"
          max={sim.duration}
          step="0.05"
          value={currentTime}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentTime(Number(e.target.value));
          }}
          className="w-full accent-teal-400 h-2 bg-slate-700 rounded-lg cursor-pointer"
        />
        <div className="font-mono text-xs font-bold text-teal-300 min-w-20 text-right bg-slate-800 px-2 py-1 rounded border border-slate-700">
          {formatNumber(currentTime, 2)} h
        </div>
      </div>

      {/* 3. Scenario Comparison Shortcuts */}
      <div className="flex items-center space-x-2 text-xs">
        <button
          type="button"
          onClick={saveAsScenarioA}
          className={`px-2.5 py-1.5 rounded-lg border flex items-center space-x-1 transition ${
            scenarioA
              ? "bg-amber-950/40 border-amber-600/60 text-amber-300"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
          title="Fijar la curva y parámetros actuales como Escenario A"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span>Fijar A</span>
        </button>

        <button
          type="button"
          onClick={saveAsScenarioB}
          className={`px-2.5 py-1.5 rounded-lg border flex items-center space-x-1 transition ${
            scenarioB
              ? "bg-pink-950/40 border-pink-600/60 text-pink-300"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
          title="Fijar la curva y parámetros actuales como Escenario B"
        >
          <Bookmark className="w-3.5 h-3.5 text-pink-400" />
          <span>Fijar B</span>
        </button>

        {(scenarioA || scenarioB) && (
          <button
            type="button"
            onClick={clearComparison}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
            title="Limpiar escenarios comparativos guardados"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
