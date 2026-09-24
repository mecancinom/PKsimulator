export interface PatientParameters {
  respiratoryRate: number; // breaths/min (6 - 40, default 12)
  heartRate: number; // beats/min (40 - 180, default 70)
  gfr: number; // mL/min/1.73 m² (15 - 150, default 100)
  bodyWeight: number; // kg (30 - 150, default 70)
  tidalVolume: number; // mL, default 500
  deadSpace: number; // mL, default 150
  strokeVolume: number; // mL, default 70
  enableHemodynamicEffect: boolean; // toggle for educational hemodynamic distribution effect
}

export const DEFAULT_PATIENT: PatientParameters = {
  respiratoryRate: 12,
  heartRate: 70,
  gfr: 100,
  bodyWeight: 70,
  tidalVolume: 500,
  deadSpace: 150,
  strokeVolume: 70,
  enableHemodynamicEffect: false,
};
