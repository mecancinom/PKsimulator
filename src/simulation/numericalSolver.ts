/**
 * 4th Order Runge-Kutta (RK4) numerical ODE solver.
 * Deterministic and highly accurate for stiff or multi-exponential linear PK ODE systems.
 */

export type ODEFunction = (t: number, y: number[]) => number[];

export function rk4Step(
  t: number,
  y: number[],
  dt: number,
  f: ODEFunction
): number[] {
  const numVars = y.length;

  // k1 = f(t, y)
  const k1 = f(t, y);

  // k2 = f(t + dt/2, y + (dt/2)*k1)
  const yMid1 = new Array(numVars);
  for (let i = 0; i < numVars; i++) {
    yMid1[i] = y[i] + 0.5 * dt * k1[i];
  }
  const k2 = f(t + 0.5 * dt, yMid1);

  // k3 = f(t + dt/2, y + (dt/2)*k2)
  const yMid2 = new Array(numVars);
  for (let i = 0; i < numVars; i++) {
    yMid2[i] = y[i] + 0.5 * dt * k2[i];
  }
  const k3 = f(t + 0.5 * dt, yMid2);

  // k4 = f(t + dt, y + dt*k3)
  const yEnd = new Array(numVars);
  for (let i = 0; i < numVars; i++) {
    yEnd[i] = y[i] + dt * k3[i];
  }
  const k4 = f(t + dt, yEnd);

  // y_next = y + (dt / 6) * (k1 + 2*k2 + 2*k3 + k4)
  const yNext = new Array(numVars);
  for (let i = 0; i < numVars; i++) {
    yNext[i] = y[i] + (dt / 6.0) * (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]);
    // Prevent numerical float undershoot below 0
    if (yNext[i] < 0 && Math.abs(yNext[i]) < 1e-12) {
      yNext[i] = 0;
    }
  }

  return yNext;
}
