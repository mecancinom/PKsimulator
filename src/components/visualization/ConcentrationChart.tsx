import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { useSimulation } from "../../context/SimulationContext";
import { formatNumber } from "../../utils/units";

export const ConcentrationChart: React.FC = () => {
  const {
    currentDataset,
    scenarioA,
    scenarioB,
    currentTime,
    setCurrentTime,
    sim,
  } = useSimulation();

  const isTwoComp = sim.model === "TWO_COMPARTMENT";

  // Downsample or adapt points to keep rendering smooth at 60fps
  const chartData = useMemo(() => {
    const pts = currentDataset.points;
    if (!pts || pts.length === 0) return [];

    // Step sampling if duration is large
    const stride = Math.max(1, Math.floor(pts.length / 300));
    const result = [];

    for (let i = 0; i < pts.length; i += stride) {
      const p = pts[i];
      const entry: any = {
        time: p.time,
        C1: Number(p.C1.toFixed(3)),
      };
      if (isTwoComp) {
        entry.C2 = Number(p.C2.toFixed(3));
      }

      // Add Scenario A comparison point if available
      if (scenarioA && scenarioA.points[i]) {
        entry.C1_A = Number(scenarioA.points[i].C1.toFixed(3));
        if (scenarioA.model === "TWO_COMPARTMENT") {
          entry.C2_A = Number(scenarioA.points[i].C2.toFixed(3));
        }
      }

      // Add Scenario B comparison point if available
      if (scenarioB && scenarioB.points[i]) {
        entry.C1_B = Number(scenarioB.points[i].C1.toFixed(3));
        if (scenarioB.model === "TWO_COMPARTMENT") {
          entry.C2_B = Number(scenarioB.points[i].C2.toFixed(3));
        }
      }

      result.push(entry);
    }

    return result;
  }, [currentDataset, scenarioA, scenarioB, isTwoComp]);

  // Click on chart to jump time
  const handleChartClick = (e: any) => {
    if (e && e.activeLabel !== undefined) {
      const clickedTime = Number(e.activeLabel);
      if (!isNaN(clickedTime)) {
        setCurrentTime(Math.max(0, Math.min(sim.duration, clickedTime)));
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-700">
            Gráfica 1: Concentración Plasmática vs Tiempo
          </h3>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Eje Y: Concentración (mg/L) | Eje X: Tiempo (h)
          </span>
          <span className="text-teal-700 font-mono font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            Cursor: {formatNumber(currentTime, 2)} h
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            onClick={handleChartClick}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(v) => `${v}h`}
              domain={[0, sim.duration]}
              type="number"
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(v) => `${v}`}
              domain={[0, "auto"]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-700 space-y-1">
                      <div className="font-mono text-teal-300 font-bold border-b border-slate-700 pb-1">
                        Tiempo: {formatNumber(Number(label), 2)} h
                      </div>
                      {payload.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between space-x-4 text-[11px]">
                          <span style={{ color: item.color }}>{item.name}:</span>
                          <span className="font-mono font-semibold">{item.value} mg/L</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              iconType="line"
            />

            {/* Current playback time vertical cursor */}
            <ReferenceLine
              x={currentTime}
              stroke="#0d9488"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: `t=${formatNumber(currentTime, 1)}h`,
                fill: "#0d9488",
                fontSize: 10,
                position: "top",
              }}
            />

            {/* Main simulation series */}
            <Line
              type="monotone"
              dataKey="C1"
              name={isTwoComp ? "C₁ Central (Actual)" : "C Plasmática (Actual)"}
              stroke="#0d9488"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />

            {isTwoComp && (
              <Line
                type="monotone"
                dataKey="C2"
                name="C₂ Periférica (Actual)"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Scenario A comparison */}
            {scenarioA && (
              <Line
                type="monotone"
                dataKey="C1_A"
                name="C₁ (Escenario A)"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Scenario B comparison */}
            {scenarioB && (
              <Line
                type="monotone"
                dataKey="C1_B"
                name="C₁ (Escenario B)"
                stroke="#ec4899"
                strokeWidth={2}
                strokeDasharray="2 2"
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-slate-400 italic text-center">
        * Haz clic en cualquier punto de la gráfica para desplazar el cursor temporal a ese instante exacto.
      </p>
    </div>
  );
};
