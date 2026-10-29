/**
 * EV-HUB-PRO Batch 30 Charging & Grid Dispatch Engines (5 Achievements).
 * 1. BipolarDcMicrogridBalancer (Three-level DAB neutral-point balancing Vdc+ = Vdc- = 500V)
 * 2. ThermalRunawayVentGasSentinel (Electrolyte vent gas detection: CO, H2, C2H4 thresholds)
 * 3. LithiumPlatingOverpotentialEstimator (XFC anode potential safety margin vs Li/Li+)
 * 4. DualCableCurrentSharingGovernor (Active feedback balancing dual 500A heavy-duty cables)
 * 5. Iso15118BidirectionalPowerTransferEmulator (V2G frequency-droop power injection/absorption)
 */

// 1. Bipolar DC Microgrid Voltage Balancing Dual-Active-Bridge Controller
export interface BipolarBalancingResult {
  positiveRailVoltageVolts: number;
  negativeRailVoltageVolts: number;
  neutralPointOffsetVolts: number;
  balancingDutyAdjustmentPct: number;
  isBalancedWithinTolerance: boolean;
}

export function balanceBipolarDcMicrogridVoltage(
  measuredPositiveRailVolts: number, // Target +500V
  measuredNegativeRailVolts: number, // Target -500V (magnitude 500V)
  maxAllowedImbalanceVolts: number = 10.0
): BipolarBalancingResult {
  const vPos = measuredPositiveRailVolts;
  const vNeg = Math.abs(measuredNegativeRailVolts);
  const neutralOffset = Number((vPos - vNeg).toFixed(1));

  // Control duty adjustment proportional to offset
  const dutyAdj = Number((-neutralOffset * 0.40).toFixed(2));
  const isBalanced = Math.abs(neutralOffset) <= maxAllowedImbalanceVolts;

  return {
    positiveRailVoltageVolts: vPos,
    negativeRailVoltageVolts: vNeg,
    neutralPointOffsetVolts: neutralOffset,
    balancingDutyAdjustmentPct: dutyAdj,
    isBalancedWithinTolerance: isBalanced,
  };
}


// 2. Battery Pack Thermal Runaway Vent Gas Gas-Chromatography Early Warning Sentinel
export interface VentGasDiagnostic {
  isThermalRunawayImminent: boolean;
  dominantGasIndicator: string;
  hazardLevel: "NORMAL" | "WARNING_OFFGAS" | "CRITICAL_EJECT";
}

export function detectBatteryThermalRunawayVentGas(
  coPpm: number,       // Carbon monoxide (normal < 10 ppm, offgas > 50 ppm)
  h2Ppm: number,       // Hydrogen (normal < 5 ppm, offgas > 20 ppm)
  c2h4Ppm: number      // Ethylene (normal < 1 ppm, offgas > 5 ppm)
): VentGasDiagnostic {
  let hazard: "NORMAL" | "WARNING_OFFGAS" | "CRITICAL_EJECT" = "NORMAL";
  let dominant = "AMBIENT";

  if (coPpm >= 100.0 || h2Ppm >= 50.0 || c2h4Ppm >= 15.0) {
    hazard = "CRITICAL_EJECT";
    dominant = coPpm >= 100.0 ? "CARBON_MONOXIDE_THERMAL_RUNAWAY" : "HYDROGEN_EXPLOSIVE_OFFGAS";
  } else if (coPpm >= 30.0 || h2Ppm >= 15.0 || c2h4Ppm >= 5.0) {
    hazard = "WARNING_OFFGAS";
    dominant = "EARLY_SEI_DECOMPOSITION_GAS";
  }

  return {
    isThermalRunawayImminent: hazard === "CRITICAL_EJECT",
    dominantGasIndicator: dominant,
    hazardLevel: hazard,
  };
}


// 3. Extreme Fast Charging (XFC) Lithium Plating In-Situ Overpotential Estimator
export interface LithiumPlatingMarginResult {
  estimatedAnodePotentialVsLiMv: number;
  platingRiskActive: boolean;
  maxRecommendedChargeAmps: number;
}

export function estimateXfcLithiumPlatingOverpotential(
  cellTemperatureCelsius: number,
  stateOfChargePct: number,
  chargeCurrentAmps: number, // e.g. 300 - 500A
  internalOhmicResistanceMilliohms: number = 0.50
): LithiumPlatingMarginResult {
  // Cold temperatures and high SoC increase charge-transfer resistance -> anode potential drops
  const tempPenaltyMv = Math.max(0, 25.0 - cellTemperatureCelsius) * 4.0;
  const socPenaltyMv = Math.max(0, stateOfChargePct - 60.0) * 2.5;
  const irDropMv = chargeCurrentAmps * internalOhmicResistanceMilliohms;

  // Baseline resting anode potential ~120 mV vs Li/Li+ at mid-SoC
  const baselineAnodeMv = 120.0;
  const totalPolarizationMv = irDropMv + tempPenaltyMv + socPenaltyMv;
  const netAnodePotentialMv = Number((baselineAnodeMv - totalPolarizationMv).toFixed(1));

  // Lithium plating occurs if anode potential drops below 0 mV vs Li/Li+
  const isPlating = netAnodePotentialMv <= 0.0;
  const maxSafeAmps = isPlating ? Math.max(100.0, chargeCurrentAmps * 0.60) : chargeCurrentAmps;

  return {
    estimatedAnodePotentialVsLiMv: netAnodePotentialMv,
    platingRiskActive: isPlating,
    maxRecommendedChargeAmps: Math.round(maxSafeAmps),
  };
}


// 4. Heavy-Duty Dual-Cable Automated Current Sharing Balance Governor
export interface CurrentSharingStatus {
  cable1Amps: number;
  cable2Amps: number;
  currentMismatchAmps: number;
  isSharingCompliant: boolean;
  correctionAction: string;
}

export function governDualCableCurrentSharing(
  totalTargetAmps: number = 800.0,
  cable1ResistanceMicroOhms: number = 150.0,
  cable2ResistanceMicroOhms: number = 160.0
): CurrentSharingStatus {
  // Current splits inversely with resistance
  const totalConductance = (1.0 / cable1ResistanceMicroOhms) + (1.0 / cable2ResistanceMicroOhms);
  const i1 = Number(((totalTargetAmps * (1.0 / cable1ResistanceMicroOhms)) / totalConductance).toFixed(1));
  const i2 = Number((totalTargetAmps - i1).toFixed(1));

  const mismatch = Number(Math.abs(i1 - i2).toFixed(1));
  const isCompliant = mismatch <= 30.0; // Max allowed mismatch is 30A

  return {
    cable1Amps: i1,
    cable2Amps: i2,
    currentMismatchAmps: mismatch,
    isSharingCompliant: isCompliant,
    correctionAction: isCompliant ? "BALANCED_NORMAL" : "ADJUST_CABLE_CONTACT_RESISTANCE",
  };
}


// 5. ISO 15118-20 Bidirectional Power Transfer (BPT) Grid Frequency Response Emulator
export interface V2gBptResponse {
  gridFrequencyHz: number;
  v2gPowerKw: number; // positive = injecting into grid, negative = absorbing
  operatingMode: "DISCHARGING_TO_GRID" | "CHARGING_FROM_GRID" | "STANDBY";
}

export function emulateIso15118BidirectionalPowerTransfer(
  gridFrequencyHz: number,
  ratedMaxV2gPowerKw: number = 50.0,
  frequencyDroopPct: number = 4.0
): V2gBptResponse {
  // Nominal grid frequency is 50.0 Hz.
  // Under-frequency (< 49.8 Hz): inject power to support grid.
  // Over-frequency (> 50.2 Hz): absorb power from grid.
  const deltaF = gridFrequencyHz - 50.0;

  if (deltaF < -0.20) {
    // Under-frequency support
    const droopFactor = Math.min(1.0, Math.abs(deltaF) / 1.0);
    const power = Number((ratedMaxV2gPowerKw * droopFactor).toFixed(1));
    return {
      gridFrequencyHz,
      v2gPowerKw: power,
      operatingMode: "DISCHARGING_TO_GRID",
    };
  } else if (deltaF > 0.20) {
    // Over-frequency curtailment / load absorption
    const droopFactor = Math.min(1.0, deltaF / 1.0);
    const power = Number((-ratedMaxV2gPowerKw * droopFactor).toFixed(1));
    return {
      gridFrequencyHz,
      v2gPowerKw: power,
      operatingMode: "CHARGING_FROM_GRID",
    };
  }

  return {
    gridFrequencyHz,
    v2gPowerKw: 0.0,
    operatingMode: "STANDBY",
  };
}
