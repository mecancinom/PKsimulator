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

export const AmountChart: React.FC = () => {
  const { currentDataset, currentTime, setCurrentTime, sim, admin } = useSimulation();

  const isTwoComp = sim.model === "TWO_COMPARTMENT";
  const isInhalation = admin.route === "INHALATION";

  const chartData = useMemo(() => {
    const pts = currentDataset.points;
    if (!pts || pts.length === 0) return [];

    const stride = Math.max(1, Math.floor(pts.length / 300));
    const result = [];

    for (let i = 0; i < pts.length; i += stride) {
      const p = pts[i];
      const entry: any = {
        time: p.time,
        A1: Number(p.A1.toFixed(2)),
        eliminated: Number(p.cumulativeElimination.toFixed(2)),
      };
      if (isTwoComp) {
        entry.A2 = Number(p.A2.toFixed(2));
      }
      if (isInhalation) {
        entry.AL = Number(p.AL.toFixed(2));
      }
      result.push(entry);
    }
    return result;
  }, [currentDataset, isTwoComp, isInhalation]);

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
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-700">
            Gráfica 2: Cantidad de Fármaco (mg) y Balance de Masa vs Tiempo
          </h3>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Eje Y: Cantidad (mg) | Eje X: Tiempo (h)
          </span>
          <span className="text-indigo-700 font-mono font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
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
                      <div className="font-mono text-indigo-300 font-bold border-b border-slate-700 pb-1">
                        Tiempo: {formatNumber(Number(label), 2)} h
                      </div>
                      {payload.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between space-x-4 text-[11px]">
                          <span style={{ color: item.color }}>{item.name}:</span>
                          <span className="font-mono font-semibold">{item.value} mg</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} iconType="line" />

            {/* Vertical cursor */}
            <ReferenceLine
              x={currentTime}
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: `t=${formatNumber(currentTime, 1)}h`,
                fill: "#6366f1",
                fontSize: 10,
                position: "top",
              }}
            />

            {/* Central amount A1 */}
            <Line
              type="monotone"
              dataKey="A1"
              name="A₁ Central (mg)"
              stroke="#0d9488"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />

            {/* Peripheral amount A2 */}
            {isTwoComp && (
              <Line
                type="monotone"
                dataKey="A2"
                name="A₂ Periférico (mg)"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Lung depot AL */}
            {isInhalation && (
              <Line
                type="monotone"
                dataKey="AL"
                name="A_L Pulmonar (mg)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Cumulative Elimination */}
            <Line
              type="monotone"
              dataKey="eliminated"
              name="Eliminación Acumulada (mg)"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] bg-slate-50 border border-slate-200 rounded p-2 text-slate-600 flex justify-between">
        <span>Ley de conservación de masa:</span>
        <span className="font-mono font-semibold text-slate-800">
          A₁ + A₂ {isInhalation ? "+ A_L " : ""}+ Eliminación = Dosis Total
        </span>
      </div>
    </div>
  );
};
