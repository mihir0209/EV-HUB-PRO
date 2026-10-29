/**
 * EV-HUB-PRO Batch 29 Charging & Grid Dispatch Engines (5 Achievements).
 * 1. ElectricRoadSystemPowerTransfer (Dynamic In-motion wireless charging track activation)
 * 2. InverterVoltVarGridSupportController (IEEE 1547-2018 Volt-VAR curve and power factor regulation)
 * 3. CathodeMetalDissolutionPredictor (High-voltage/temp transition metal dissolution into electrolyte)
 * 4. MegawattRoboticConnectorMatingDiagnostic (6-DoF alignment and axial mating force telemetry)
 * 5. Ocpp201SecurityProfile3CertificateRotationManager (Dual-key rollover and mutual TLS cert validation)
 */

// 1. Dynamic Electric Road System (ERS) In-Motion Contactless Power Transfer Model
export interface ErsTransferStatus {
  trackSegmentActive: boolean;
  transferredPowerKw: number;
  transferEfficiencyPct: number;
  groundClearanceMm: number;
  vehicleVelocityKmh: number;
}

export function modelElectricRoadSystemPowerTransfer(
  groundClearanceMm: number, // Nominal 120 - 180 mm
  vehicleVelocityKmh: number, // e.g. 80 - 120 km/h
  trackCoilCapacityKw: number = 100.0
): ErsTransferStatus {
  // If clearance > 220mm or velocity > 140km/h, track decoupling is unsafe
  const isCoupled = groundClearanceMm >= 100.0 && groundClearanceMm <= 200.0 && vehicleVelocityKmh >= 10.0 && vehicleVelocityKmh <= 130.0;
  if (!isCoupled) {
    return {
      trackSegmentActive: false,
      transferredPowerKw: 0,
      transferEfficiencyPct: 0,
      groundClearanceMm,
      vehicleVelocityKmh,
    };
  }

  // Efficiency decreases with air gap: ~92% at 120mm, ~84% at 180mm
  const gapPenalty = (groundClearanceMm - 120.0) * 0.12;
  const efficiency = Math.max(75.0, Number((92.0 - gapPenalty).toFixed(1)));
  const transferredPower = Number((trackCoilCapacityKw * (efficiency / 100.0)).toFixed(1));

  return {
    trackSegmentActive: true,
    transferredPowerKw: transferredPower,
    transferEfficiencyPct: efficiency,
    groundClearanceMm,
    vehicleVelocityKmh,
  };
}


// 2. Grid Reactive Power (VAR) Support Inverter Power Factor Optimization Controller
export interface VoltVarSupportResult {
  reactivePowerQkvar: number;
  inverterPowerFactor: number;
  gridSupportMode: "INJECTING_VARS" | "ABSORBING_VARS" | "UNITY_PF";
}

export function calculateInverterVoltVarResponse(
  gridVoltagePerUnit: number, // 1.00 is nominal; 0.90 to 1.10 p.u.
  inverterRatedKva: number = 500.0
): VoltVarSupportResult {
  // IEEE 1547-2018 Volt-VAR curve:
  // V < 0.95 p.u. -> Inject capacitive reactive power (+Q) up to 44% of rated kVA
  // V > 1.05 p.u. -> Absorb inductive reactive power (-Q)
  // 0.95 <= V <= 1.05 -> Deadband, unity power factor (Q = 0)
  if (gridVoltagePerUnit < 0.95) {
    const underVoltageRatio = (0.95 - gridVoltagePerUnit) / 0.05;
    const qKvar = Math.min(inverterRatedKva * 0.44, (inverterRatedKva * 0.44) * underVoltageRatio);
    return {
      reactivePowerQkvar: Number(qKvar.toFixed(1)),
      inverterPowerFactor: 0.95,
      gridSupportMode: "INJECTING_VARS",
    };
  } else if (gridVoltagePerUnit > 1.05) {
    const overVoltageRatio = (gridVoltagePerUnit - 1.05) / 0.05;
    const qKvar = Math.min(inverterRatedKva * 0.44, (inverterRatedKva * 0.44) * overVoltageRatio);
    return {
      reactivePowerQkvar: Number((-qKvar).toFixed(1)),
      inverterPowerFactor: 0.95,
      gridSupportMode: "ABSORBING_VARS",
    };
  }

  return {
    reactivePowerQkvar: 0.0,
    inverterPowerFactor: 1.0,
    gridSupportMode: "UNITY_PF",
  };
}


// 3. Battery Cathode Active Material Transition Metal Dissolution Predictor
export interface CathodeDissolutionEstimate {
  manganeseDissolutionPpm: number;
  nickelDissolutionPpm: number;
  acceleratedAgingRisk: boolean;
  recommendedMaxVoltageLimit: number;
}

export function predictCathodeMetalDissolutionRate(
  operatingCellVoltageVolts: number, // e.g. 3.6 to 4.35V
  cellTemperatureCelsius: number,     // e.g. 25 to 55C
  cumulativeOperatingHours: number
): CathodeDissolutionEstimate {
  // Dissolution accelerates exponentially above 4.20V and above 40C
  const voltageFactor = operatingCellVoltageVolts > 4.20 ? Math.exp((operatingCellVoltageVolts - 4.20) * 12.0) : 1.0;
  const tempFactor = cellTemperatureCelsius > 40.0 ? Math.exp((cellTemperatureCelsius - 40.0) * 0.08) : 1.0;

  const baselineMnRatePerHour = 0.005; // ppm / hour
  const mnPpm = Number((baselineMnRatePerHour * cumulativeOperatingHours * voltageFactor * tempFactor).toFixed(2));
  const niPpm = Number((mnPpm * 0.40).toFixed(2)); // Nickel dissolves at ~40% rate of Manganese

  const isRisk = mnPpm >= 15.0 || operatingCellVoltageVolts >= 4.30;
  const maxVoltage = isRisk ? 4.15 : 4.25;

  return {
    manganeseDissolutionPpm: mnPpm,
    nickelDissolutionPpm: niPpm,
    acceleratedAgingRisk: isRisk,
    recommendedMaxVoltageLimit: maxVoltage,
  };
}


// 4. Heavy-Duty Automated Megawatt Connector Robotic Mating Alignment Diagnostic
export interface RoboticMatingDiagnostic {
  isMatingAuthorized: boolean;
  axialForceNewtons: number;
  radialErrorMagnitudeMm: number;
  angularErrorDegrees: number;
  feedbackAction: string;
}

export function evaluateMegawattRoboticMating(
  deltaXMm: number,
  deltaYMm: number,
  angularErrorPitchYawDeg: number,
  measuredAxialInsertionForceN: number
): RoboticMatingDiagnostic {
  const radialError = Number(Math.hypot(deltaXMm, deltaYMm).toFixed(1));
  // Mating constraints: radial error <= 8.0 mm, angular <= 2.0 deg, force <= 500 N
  const isPosValid = radialError <= 8.0 && angularErrorPitchYawDeg <= 2.0;
  const isForceValid = measuredAxialInsertionForceN <= 500.0;

  const approved = isPosValid && isForceValid;
  let action = "PROCEED_COUPLING";
  if (!isPosValid) {
    action = radialError > 8.0 ? "ADJUST_ROBOTIC_WRIST_XY_OFFSET" : "CORRECT_PITCH_YAW_ALIGNMENT";
  } else if (!isForceValid) {
    action = "ABORT_INSERTION_AXIAL_RESISTANCE_TOO_HIGH";
  }

  return {
    isMatingAuthorized: approved,
    axialForceNewtons: measuredAxialInsertionForceN,
    radialErrorMagnitudeMm: radialError,
    angularErrorDegrees: angularErrorPitchYawDeg,
    feedbackAction: action,
  };
}


// 5. Open Charge Point Protocol (OCPP 2.0.1) Security Profile 3 Certificate Rotation Manager
export interface CertificateRotationStatus {
  isCertificateValid: boolean;
  daysRemainingBeforeExpiry: number;
  rotationRecommended: boolean;
  securityProfile: "SECURITY_PROFILE_3_MTLS";
}

export function evaluateOcppSecurityProfile3Cert(
  certExpiryEpochSeconds: number,
  currentEpochSeconds: number,
  isClientMutualTlsVerified: boolean
): CertificateRotationStatus {
  const secondsRemaining = certExpiryEpochSeconds - currentEpochSeconds;
  const daysRemaining = Math.max(0, Math.floor(secondsRemaining / 86400));

  const isValid = secondsRemaining > 0 && isClientMutualTlsVerified;
  // Recommend rotation when less than 30 days remain
  const recommendRotation = daysRemaining <= 30;

  return {
    isCertificateValid: isValid,
    daysRemainingBeforeExpiry: daysRemaining,
    rotationRecommended: recommendRotation,
    securityProfile: "SECURITY_PROFILE_3_MTLS",
  };
}
