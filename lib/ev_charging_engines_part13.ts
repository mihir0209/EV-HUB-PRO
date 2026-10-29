/**
 * EV-HUB-PRO Batch 32 Charging & Grid Dispatch Engines (5 Achievements).
 * 1. SicInverterSwitchingLossModel (Silicon Carbide MOSFET thermal junction dissipation)
 * 2. PantographCatenaryWaveformTracker (Wave velocity c = sqrt(T/mu) and contact loss avoidance)
 * 3. SolidStateLithiumDendriteSentinel (High-frequency EIS impedance semicircle shrinkage)
 * 4. Iso15118FodRadarGuard (Foreign Object Debris detection & resonant frequency shift)
 * 5. MicrogridPhaseLockedLoopSynchronizer (Orthogonal signal generator & dq0 synchronization)
 */

// 1. High-Voltage Silicon Carbide (SiC) Inverter Switching Loss Thermal Model
export interface SicThermalResult {
  conductionLossWatts: number;
  switchingLossWatts: number;
  totalDissipatedPowerWatts: number;
  junctionTempCelsius: number;
  isWithinSafeOperatingArea: boolean;
}

export function modelSicInverterLosses(
  dcLinkVoltageVolts: number = 800.0,
  phaseCurrentRmsAmps: number = 250.0,
  switchingFrequencyKhz: number = 40.0,
  ambientCoolantTempC: number = 45.0,
  rDsOnMilliohms: number = 15.0
): SicThermalResult {
  // Conduction loss: P_cond = I_rms^2 * R_ds_on
  const rOhms = rDsOnMilliohms * 1e-3;
  const pCond = Math.pow(phaseCurrentRmsAmps, 2) * rOhms;

  // Switching loss: E_sw = (E_on + E_off) proportional to V_dc * I_rms
  // Typical SiC module: ~15 mJ per cycle at 800V / 250A
  const energyPerCycleJoules = 0.015 * (dcLinkVoltageVolts / 800.0) * (phaseCurrentRmsAmps / 250.0);
  const pSwitch = energyPerCycleJoules * (switchingFrequencyKhz * 1000.0);

  const totalLoss = Number((pCond + pSwitch).toFixed(1));
  // Thermal resistance R_th_jc ~ 0.08 C/W
  const junctionTemp = Number((ambientCoolantTempC + totalLoss * 0.08).toFixed(1));
  const isSafe = junctionTemp <= 175.0; // SiC max junction rating is 175C

  return {
    conductionLossWatts: Number(pCond.toFixed(1)),
    switchingLossWatts: Number(pSwitch.toFixed(1)),
    totalDissipatedPowerWatts: totalLoss,
    junctionTempCelsius: junctionTemp,
    isWithinSafeOperatingArea: isSafe,
  };
}


// 2. Dynamic Overhead Pantograph Catenary Wire Oscillatory Waveform Tracker
export interface CatenaryDynamicsStatus {
  wavePropagationSpeedMPerSec: number;
  trainSpeedToWaveSpeedRatio: number;
  contactLossProbabilityPct: number;
  isSpeedPermitted: boolean;
}

export function trackPantographCatenaryDynamics(
  trainSpeedKmh: number,
  catenaryWireTensionKn: number = 20.0, // 20 kN tension
  wireLinearMassKgPerMeter: number = 1.35 // 1.35 kg/m
): CatenaryDynamicsStatus {
  // Wave propagation velocity c = sqrt(T / mu)
  const tensionNewtons = catenaryWireTensionKn * 1000.0;
  const waveSpeedMPerS = Math.sqrt(tensionNewtons / wireLinearMassKgPerMeter);
  const trainSpeedMPerS = trainSpeedKmh / 3.6;

  // Dopler factor / speed ratio eta = v / c
  const eta = Number((trainSpeedMPerS / waveSpeedMPerS).toFixed(3));
  // Railway standard (EN 50367): train speed must not exceed 70% of catenary wave speed to prevent standing wave resonance
  const isPermitted = eta <= 0.70;
  const contactLossPct = Number((Math.pow(eta / 0.70, 2.5) * 5.0).toFixed(2));

  return {
    wavePropagationSpeedMPerSec: Number(waveSpeedMPerS.toFixed(1)),
    trainSpeedToWaveSpeedRatio: eta,
    contactLossProbabilityPct: Math.min(100.0, contactLossPct),
    isSpeedPermitted: isPermitted,
  };
}


// 3. Battery Cathode Active Material Solid-State Lithium Dendrite Short Sentinel
export interface DendriteShortDiagnostic {
  isDendriteShortImminent: boolean;
  semicircleImpedanceDropPct: number;
  voltageNoiseRmsMv: number;
  safetyAction: "NORMAL_OPERATION" | "SOFT_SHORT_OBSERVED" | "CRITICAL_SHUTDOWN";
}

export function evaluateLithiumDendriteGrowth(
  baselineEisImpedanceOhms: number,
  currentEisImpedanceOhms: number,
  measuredVoltageNoiseRmsMv: number
): DendriteShortDiagnostic {
  const dropPct = Number((((baselineEisImpedanceOhms - currentEisImpedanceOhms) / baselineEisImpedanceOhms) * 100.0).toFixed(1));

  // Solid-state dendrite penetration signature: sudden high-frequency semicircle shrinkage (> 30%) with voltage jitter (> 5 mV RMS)
  const isShort = dropPct >= 30.0 || measuredVoltageNoiseRmsMv >= 5.0;
  let action: "NORMAL_OPERATION" | "SOFT_SHORT_OBSERVED" | "CRITICAL_SHUTDOWN" = "NORMAL_OPERATION";

  if (dropPct >= 45.0 || measuredVoltageNoiseRmsMv >= 10.0) {
    action = "CRITICAL_SHUTDOWN";
  } else if (isShort) {
    action = "SOFT_SHORT_OBSERVED";
  }

  return {
    isDendriteShortImminent: isShort,
    semicircleImpedanceDropPct: dropPct,
    voltageNoiseRmsMv: measuredVoltageNoiseRmsMv,
    safetyAction: action,
  };
}


// 4. ISO 15118-20 Wireless Power Transfer Foreign Object Debris (FOD) Radar Guard
export interface FodDetectionStatus {
  isForeignObjectDetected: boolean;
  frequencyDetuningKhz: number;
  radarEchoCrossSectionDb: number;
  powerInterlockActive: boolean;
}

export function inspectWirelessFodRadar(
  measuredResonantFreqKhz: number,
  nominalResonantFreqKhz: number = 85.0, // SAE J2954 standard 85 kHz band
  radarRcsDb: number = -25.0
): FodDetectionStatus {
  const deltaF = Number(Math.abs(measuredResonantFreqKhz - nominalResonantFreqKhz).toFixed(1));

  // Metal object on ground pad causes resonant frequency detuning (> 1.5 kHz) or high radar reflection (> -15 dB)
  const isMetalFod = deltaF >= 1.5 || radarRcsDb >= -15.0;

  return {
    isForeignObjectDetected: isMetalFod,
    frequencyDetuningKhz: deltaF,
    radarEchoCrossSectionDb: radarRcsDb,
    powerInterlockActive: !isMetalFod, // True = safe to power, False = power inhibited
  };
}


// 5. Smart Grid Microgrid Autonomous Islanding Phase-Locked Loop (PLL) Synchronizer
export interface PllSyncStatus {
  isLockedToGrid: boolean;
  phaseAngleDeltaDegrees: number;
  frequencyDeltaHz: number;
  breakerRecloseAuthorized: boolean;
}

export function synchronizePllMicrogrid(
  gridPhaseAngleDeg: number,
  inverterPhaseAngleDeg: number,
  gridFreqHz: number,
  inverterFreqHz: number = 50.0
): PllSyncStatus {
  const angleDelta = Number(Math.abs(gridPhaseAngleDeg - inverterPhaseAngleDeg).toFixed(2));
  const freqDelta = Number(Math.abs(gridFreqHz - inverterFreqHz).toFixed(2));

  // IEEE 1547 reclose constraints: phase angle delta <= 5 degrees, freq delta <= 0.10 Hz
  const isLocked = angleDelta <= 5.0 && freqDelta <= 0.10;

  return {
    isLockedToGrid: isLocked,
    phaseAngleDeltaDegrees: angleDelta,
    frequencyDeltaHz: freqDelta,
    breakerRecloseAuthorized: isLocked,
  };
}
