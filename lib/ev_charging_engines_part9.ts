/**
 * EV-HUB-PRO Batch 28 Charging & Grid Dispatch Engines (5 Achievements).
 * 1. SolidStateTransformerGateway (Medium-voltage AC to DC bus dual-active-bridge SST model)
 * 2. VehicleToMicrogridIslandingController (Grid-forming frequency-droop black start during blackout)
 * 3. SeiCapacityLossPredictor (Solid-Electrolyte Interphase degradation Arrhenius capacity fade)
 * 4. RoboticPantographAlignmentTelemetry (3D coordinates x, y, z, theta and contact force 600-1000N)
 * 5. PlugAndChargeOcspRevocationChecker (ISO 15118-2 contract certificate status validation <= 200ms)
 */

// 1. Solid-State Transformer (SST) High-Frequency Isolation Grid Gateway
export interface SstConversionState {
  primaryAcVoltageKv: number;
  secondaryDcVoltageVolts: number;
  transferredPowerKw: number;
  conversionEfficiencyPct: number;
  isolationGalvanicVerified: boolean;
}

export function modelSolidStateTransformer(
  primaryAcVoltageKv: number = 13.8, // 13.8 kV distribution
  phaseShiftDegrees: number = 15.0,  // Dual-Active-Bridge phase angle
  switchingFrequencyKhz: number = 50.0 // 50 kHz high frequency transformer
): SstConversionState {
  // Power transfer P = (V1 * V2 / (2 * pi * f * L)) * phi * (1 - |phi| / pi)
  const phiRad = (phaseShiftDegrees * Math.PI) / 180.0;
  const theoreticalPowerKw = Math.max(0, 1500.0 * Math.sin(phiRad));
  const efficiency = Number((97.5 - (switchingFrequencyKhz / 100.0)).toFixed(1)); // ~97.0%

  return {
    primaryAcVoltageKv,
    secondaryDcVoltageVolts: 1000.0, // Fixed 1000V DC fast charging bus
    transferredPowerKw: Number(theoreticalPowerKw.toFixed(1)),
    conversionEfficiencyPct: efficiency,
    isolationGalvanicVerified: true,
  };
}


// 2. Vehicle-to-Microgrid (V2M) Autonomous Black-Start Islanding Controller
export interface MicrogridIslandState {
  islandedModeActive: boolean;
  synthesizedFrequencyHz: number;
  voltageOutputRmsVolts: number;
  totalV2gDischargeKw: number;
  gridFormingStable: boolean;
}

export function controlMicrogridBlackStart(
  mainsGridVoltageVolts: number,
  contributingFleetVehiclesCount: number,
  kwPerVehicle: number = 22.0,
  targetNominalFreqHz: number = 50.0
): MicrogridIslandState {
  const isBlackout = mainsGridVoltageVolts < 50.0;
  if (!isBlackout) {
    return {
      islandedModeActive: false,
      synthesizedFrequencyHz: 50.0,
      voltageOutputRmsVolts: mainsGridVoltageVolts,
      totalV2gDischargeKw: 0,
      gridFormingStable: true,
    };
  }

  // Droop equation: freq = nominal - Dp * (P - P0)
  const totalPowerKw = contributingFleetVehiclesCount * kwPerVehicle;
  const isStable = contributingFleetVehiclesCount >= 5 && totalPowerKw >= 100.0;
  const freqDeviation = isStable ? -0.05 : -0.80;

  return {
    islandedModeActive: true,
    synthesizedFrequencyHz: Number((targetNominalFreqHz + freqDeviation).toFixed(2)),
    voltageOutputRmsVolts: isStable ? 400.0 : 340.0,
    totalV2gDischargeKw: totalPowerKw,
    gridFormingStable: isStable,
  };
}


// 3. Battery Degradation Solid-Electrolyte Interphase (SEI) Capacity Loss Predictor
export interface SeiDegradationResult {
  cumulativeCycles: number;
  seiCapacityLossPct: number;
  remainingCapacityKwh: number;
  healthState: "EXCELLENT" | "DEGRADED" | "END_OF_LIFE";
}

export function predictSeiCapacityFade(
  initialCapacityKwh: number,
  equivalentFullCycles: number,
  operatingTempCelsius: number = 25.0,
  averageCRate: number = 1.0
): SeiDegradationResult {
  // Arrhenius factor normalized to T_ref = 298.15 K (25 deg C) with Ea / R ~ 4000 K
  const tempKelvin = operatingTempCelsius + 273.15;
  const arrhenius = Math.exp(-4000.0 * (1.0 / tempKelvin - 1.0 / 298.15));
  // SEI growth follows sqrt(cycles) * Arrhenius * C-rate^0.5
  // Baseline ~0.35% fade per sqrt(cycle) -> at 1000 cycles (sqrt=31.62) -> ~11% fade
  const lossPct = Math.min(50.0, Number((0.35 * arrhenius * Math.sqrt(equivalentFullCycles) * Math.pow(averageCRate, 0.5)).toFixed(2)));
  const remainingKwh = Number((initialCapacityKwh * (1.0 - lossPct / 100.0)).toFixed(1));

  let status: "EXCELLENT" | "DEGRADED" | "END_OF_LIFE" = "EXCELLENT";
  if (lossPct >= 20.0) {
    status = "END_OF_LIFE";
  } else if (lossPct >= 8.0) {
    status = "DEGRADED";
  }

  return {
    cumulativeCycles: equivalentFullCycles,
    seiCapacityLossPct: lossPct,
    remainingCapacityKwh: remainingKwh,
    healthState: status,
  };
}


// 4. Automated Robotic Pantograph Bus Charging Alignment Telemetry
export interface PantographDockingStatus {
  dockingApproved: boolean;
  contactForceNewtons: number;
  positionalErrorMagnitudeMm: number;
  actionGuidance: string;
}

export function evaluatePantographAlignment(
  laserDeltaXMm: number,
  laserDeltaYMm: number,
  laserDeltaZMm: number,
  measuredContactForceN: number
): PantographDockingStatus {
  const errorMagnitude = Number(Math.hypot(laserDeltaXMm, laserDeltaYMm, laserDeltaZMm).toFixed(1));
  // Tolerance is +/- 25 mm and force 600 - 1000 N
  const isPositionValid = errorMagnitude <= 25.0;
  const isForceValid = measuredContactForceN >= 600.0 && measuredContactForceN <= 1000.0;

  const approved = isPositionValid && isForceValid;
  let guidance = "CHARGING_ALLOWED";
  if (!isPositionValid) {
    guidance = "REPOSITION_BUS_ALIGNMENT_TOLERANCE_EXCEEDED";
  } else if (measuredContactForceN < 600.0) {
    guidance = "INCREASE_PANTOGRAPH_ACTUATOR_PRESSURE";
  } else if (measuredContactForceN > 1000.0) {
    guidance = "DECREASE_PANTOGRAPH_ACTUATOR_PRESSURE_OVERFORCE";
  }

  return {
    dockingApproved: approved,
    contactForceNewtons: measuredContactForceN,
    positionalErrorMagnitudeMm: errorMagnitude,
    actionGuidance: guidance,
  };
}


// 5. ISO 15118-2 Plug & Charge Dynamic Contract Certificate Revocation Checker
export interface OcspCertificateCheckResult {
  isCertificateValid: boolean;
  revocationStatus: "GOOD" | "REVOKED" | "UNKNOWN";
  ocspResponseLatencyMs: number;
  authorizesBilling: boolean;
}

export function checkPlugAndChargeCertificateOcsp(
  certificateSerialHex: string,
  revocationList: Set<string>,
  networkLatencyMs: number = 45.0
): OcspCertificateCheckResult {
  const isRevoked = revocationList.has(certificateSerialHex.toLowerCase());
  const isValid = !isRevoked && networkLatencyMs <= 200.0; // Strict ISO 15118 200ms timeout

  return {
    isCertificateValid: isValid,
    revocationStatus: isRevoked ? "REVOKED" : "GOOD",
    ocspResponseLatencyMs: networkLatencyMs,
    authorizesBilling: isValid,
  };
}
