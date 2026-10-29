/**
 * EV-HUB-PRO Batch 31 Charging & Grid Dispatch Engines (5 Achievements).
 * 1. SolidStateCircuitBreaker (SSCB microsecond di/dt fault interruption <= 10us)
 * 2. FleetDepotOpportunityChargingDispatcher (Depot bus schedule & state-of-charge optimization)
 * 3. DirectSubmersionCoolingModel (Immersion dielectric fluid thermal transfer)
 * 4. McsGroundIntegrityGuard (Active ground resistance monitoring R <= 1.0 Ohm)
 * 5. Ocpp201SmartChargingProfileGovernor (Dynamic grid curtailment profile schedules)
 */

// 1. Solid-State Circuit Breaker (SSCB) Ultra-Fast Microsecond Fault Interrupter
export interface SscbTripState {
  breakerState: "CLOSED" | "TRIPPED_OVERCURRENT" | "TRIPPED_SHORT_CIRCUIT";
  tripDurationMicroseconds: number;
  measuredDiDtAmpsPerMicrosec: number;
  isFaultIsolated: boolean;
}

export function operateSolidStateCircuitBreaker(
  currentAmps: number,
  diDtAmpsPerMicrosecond: number,
  maxContinuousCurrentAmps: number = 600.0,
  diDtThreshold: number = 50.0 // 50 A / us threshold indicates short circuit
): SscbTripState {
  if (diDtAmpsPerMicrosecond >= diDtThreshold) {
    return {
      breakerState: "TRIPPED_SHORT_CIRCUIT",
      tripDurationMicroseconds: 4.5, // 4.5 microseconds ultrafast solid-state gate turn-off
      measuredDiDtAmpsPerMicrosec: diDtAmpsPerMicrosecond,
      isFaultIsolated: true,
    };
  } else if (currentAmps > maxContinuousCurrentAmps * 1.25) {
    return {
      breakerState: "TRIPPED_OVERCURRENT",
      tripDurationMicroseconds: 8.0,
      measuredDiDtAmpsPerMicrosec: diDtAmpsPerMicrosecond,
      isFaultIsolated: true,
    };
  }

  return {
    breakerState: "CLOSED",
    tripDurationMicroseconds: 0,
    measuredDiDtAmpsPerMicrosec: diDtAmpsPerMicrosecond,
    isFaultIsolated: false,
  };
}


// 2. Dynamic Fleet Depot Opportunity Charging Schedule Dispatcher
export interface FleetChargingAllocation {
  vehicleId: string;
  assignedPowerKw: number;
  chargingWindowMinutes: number;
  expectedDepartureSocPct: number;
}

export function dispatchOpportunityChargingSchedule(
  vehicles: Array<{ id: string; currentSocPct: number; dwellTimeMinutes: number }>,
  totalDepotPowerAvailableKw: number = 500.0
): FleetChargingAllocation[] {
  if (vehicles.length === 0 || totalDepotPowerAvailableKw <= 0) {
    return [];
  }

  // Prioritize vehicles with low SoC and short dwell time
  const scored = vehicles.map(v => ({
    ...v,
    urgency: (100.0 - v.currentSocPct) / Math.max(10, v.dwellTimeMinutes),
  })).sort((a, b) => b.urgency - a.urgency);

  const powerPerVehicle = Math.min(150.0, totalDepotPowerAvailableKw / scored.length);

  return scored.map(v => {
    // Energy delivered = power * (dwell / 60)
    // SoC gain on 300 kWh bus pack: (deliveredKwh / 300) * 100
    const deliveredKwh = powerPerVehicle * (v.dwellTimeMinutes / 60.0);
    const socGain = (deliveredKwh / 300.0) * 100.0;
    const endSoc = Math.min(100.0, Number((v.currentSocPct + socGain).toFixed(1)));

    return {
      vehicleId: v.id,
      assignedPowerKw: Number(powerPerVehicle.toFixed(1)),
      chargingWindowMinutes: v.dwellTimeMinutes,
      expectedDepartureSocPct: endSoc,
    };
  });
}


// 3. Liquid Submersion Direct-Contact Battery Cell Cooling Model
export interface ImmersionCoolingState {
  steadyStateCellTempC: number;
  heatTransferCoefficientWPerM2K: number;
  isThermalRunawayMitigated: boolean;
  dielectricFlowRateLpm: number;
}

export function modelLiquidSubmersionCellCooling(
  heatDissipationWattsPerCell: number, // e.g. 50W during 3C charging
  dielectricCoolantTempC: number = 25.0,
  coolantFlowVelocityMPerS: number = 0.50
): ImmersionCoolingState {
  // Direct immersion dielectric fluid offers 5x-10x higher heat transfer than cold plates
  // Nu ~ 0.023 * Re^0.8 * Pr^0.4 -> h ~ 800 - 1500 W / (m2 * K)
  const h = Math.round(800.0 + coolantFlowVelocityMPerS * 800.0);
  const cellSurfaceAreaM2 = 0.045; // ~450 cm2 pouch cell area

  // delta T = Q / (h * A)
  const tempRise = heatDissipationWattsPerCell / (h * cellSurfaceAreaM2);
  const cellTemp = Number((dielectricCoolantTempC + tempRise).toFixed(1));
  const isMitigated = cellTemp <= 45.0;

  return {
    steadyStateCellTempC: cellTemp,
    heatTransferCoefficientWPerM2K: h,
    isThermalRunawayMitigated: isMitigated,
    dielectricFlowRateLpm: Number((coolantFlowVelocityMPerS * 30.0).toFixed(1)),
  };
}


// 4. Megawatt Charging System (MCS) Active Ground Integrity Monitoring Guard
export interface GroundGuardStatus {
  groundResistanceOhms: number;
  pilotFrequencyHz: number;
  isGroundContinuityValid: boolean;
  interlockAction: string;
}

export function monitorMcsGroundIntegrityGuard(
  measuredGroundResistanceOhms: number,
  measuredPilotFrequencyHz: number = 1000.0 // 1 kHz PWM pilot
): GroundGuardStatus {
  // IEC 61851 / IEC 62196 MCS requirements:
  // Ground resistance must be <= 1.0 Ohm. Pilot frequency must be 1000 Hz +/- 20 Hz.
  const isResValid = measuredGroundResistanceOhms >= 0.01 && measuredGroundResistanceOhms <= 1.0;
  const isFreqValid = Math.abs(measuredPilotFrequencyHz - 1000.0) <= 20.0;
  const valid = isResValid && isFreqValid;

  let action = "GROUND_HEALTHY_ENABLE_POWER";
  if (!isResValid) {
    action = "TRIP_GROUND_RESISTANCE_FAULT_DISCONNECT";
  } else if (!isFreqValid) {
    action = "TRIP_PILOT_SIGNAL_CORRUPTED";
  }

  return {
    groundResistanceOhms: measuredGroundResistanceOhms,
    pilotFrequencyHz: measuredPilotFrequencyHz,
    isGroundContinuityValid: valid,
    interlockAction: action,
  };
}


// 5. Open Charge Point Protocol (OCPP 2.0.1) Real-Time Smart Charging Profile Governor
export interface ChargingProfileLimit {
  allowedMaxPowerKw: number;
  curtailmentActive: boolean;
  activeProfilePurpose: "CHARGING_STATION_MAX" | "TX_DEFAULT" | "GRID_RESTRAINT";
}

export function governOcppSmartChargingProfile(
  stationMaxCapacityKw: number = 350.0,
  gridCurtailmentSignalPct: number = 100.0 // 100% = no curtailment; 50% = half power
): ChargingProfileLimit {
  const cappedPower = Number((stationMaxCapacityKw * (gridCurtailmentSignalPct / 100.0)).toFixed(1));
  const isCurtail = gridCurtailmentSignalPct < 100.0;

  return {
    allowedMaxPowerKw: cappedPower,
    curtailmentActive: isCurtail,
    activeProfilePurpose: isCurtail ? "GRID_RESTRAINT" : "CHARGING_STATION_MAX",
  };
}
