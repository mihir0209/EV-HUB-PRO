/**
 * EV-HUB-PRO Batch 21 Charging & Grid Dispatch Engines (5 Achievements).
 * 1. DynamicGridDemandResponseRouter (Utility curtailment signal parser & power throttling)
 * 2. ConnectorHealthDiagnosticModel (Thermal degradation & pin resistance monitor)
 * 3. FleetRouteWaypointPlanner (Range-constrained waypoint charging stop scheduler)
 * 4. SolarCanopyDirectDispatchModel (Photovoltaic direct-to-EV solar dispatch allocator)
 * 5. DynamicPricingSurgeEngine (Occupancy-driven dynamic surge pricing multiplier)
 */

// 1. Dynamic Grid Demand Response Router
export interface CurtailmentResult {
  throttledPowerKw: number;
  curtailmentAppliedPct: number;
  gridReliefKw: number;
}

export function applyGridDemandResponse(
  nominalChargerPowerKw: number,
  gridEmergencyLevel: 0 | 1 | 2 | 3 // 0 = normal, 1 = advisory, 2 = warning, 3 = critical brownout
): CurtailmentResult {
  // Reduction percentages: Level 0: 0%, Level 1: 20%, Level 2: 50%, Level 3: 80%
  const reductionMap = { 0: 0.0, 1: 0.20, 2: 0.50, 3: 0.80 };
  const reductionFraction = reductionMap[gridEmergencyLevel];
  const reliefKw = Number((nominalChargerPowerKw * reductionFraction).toFixed(1));
  const throttledPowerKw = Number((nominalChargerPowerKw - reliefKw).toFixed(1));

  return {
    throttledPowerKw,
    curtailmentAppliedPct: reductionFraction * 100,
    gridReliefKw: reliefKw,
  };
}


// 2. Connector Health Diagnostic Model
export interface ConnectorDiagnostic {
  isSafeToCharge: boolean;
  contactResistanceMilliohms: number;
  tempRiseCelsius: number;
  thermalRiskTier: "NORMAL" | "ELEVATED" | "CRITICAL_RUNAWAY";
}

export function evaluateConnectorThermalHealth(
  pinVoltageDropMv: number,
  chargingCurrentAmps: number,
  ambientTempC: number,
  measuredConnectorTempC: number
): ConnectorDiagnostic {
  if (chargingCurrentAmps <= 0) {
    return {
      isSafeToCharge: true,
      contactResistanceMilliohms: 0,
      tempRiseCelsius: 0,
      thermalRiskTier: "NORMAL",
    };
  }

  // R = V / I (in milliohms: mV / A)
  const contactResistanceMilliohms = Number((pinVoltageDropMv / chargingCurrentAmps).toFixed(2));
  const tempRiseCelsius = Math.max(0, measuredConnectorTempC - ambientTempC);

  // Safety limits per IEC 62196: max temp rise 50C, max connector temp 90C
  let riskTier: "NORMAL" | "ELEVATED" | "CRITICAL_RUNAWAY" = "NORMAL";
  if (measuredConnectorTempC >= 85 || tempRiseCelsius >= 50 || contactResistanceMilliohms >= 1.5) {
    riskTier = "CRITICAL_RUNAWAY";
  } else if (measuredConnectorTempC >= 65 || tempRiseCelsius >= 35 || contactResistanceMilliohms >= 0.8) {
    riskTier = "ELEVATED";
  }

  return {
    isSafeToCharge: riskTier !== "CRITICAL_RUNAWAY",
    contactResistanceMilliohms,
    tempRiseCelsius,
    thermalRiskTier: riskTier,
  };
}


// 3. Fleet Route Waypoint Planner
export interface WaypointRoutePlan {
  totalDistanceKm: number;
  stopsCount: number;
  chargingWaypointsKm: number[];
  canReachDestination: boolean;
}

export function planFleetChargingStops(
  totalTripDistanceKm: number,
  vehicleUsableRangeKm: number,
  safetyBufferSocPct: number = 15 // Reserve 15% minimum range
): WaypointRoutePlan {
  const effectiveRangeKm = vehicleUsableRangeKm * (1 - safetyBufferSocPct / 100);
  if (effectiveRangeKm <= 0) {
    return { totalDistanceKm: totalTripDistanceKm, stopsCount: 0, chargingWaypointsKm: [], canReachDestination: false };
  }

  const stops: number[] = [];
  let currentPos = 0;

  while (currentPos + effectiveRangeKm < totalTripDistanceKm) {
    currentPos += effectiveRangeKm;
    stops.push(Number(currentPos.toFixed(1)));
  }

  return {
    totalDistanceKm: totalTripDistanceKm,
    stopsCount: stops.length,
    chargingWaypointsKm: stops,
    canReachDestination: true,
  };
}


// 4. Solar Canopy Direct Dispatch Model
export interface SolarDispatchAllocation {
  directSolarToEvKw: number;
  gridSupplementKw: number;
  excessSolarToBatteryKw: number;
  solarCoveragePct: number;
}

export function allocateSolarCanopyPower(
  instantSolarGenKw: number,
  totalStationDemandKw: number,
  batteryMaxChargeKw: number = 50
): SolarDispatchAllocation {
  const directSolar = Math.min(instantSolarGenKw, totalStationDemandKw);
  const gridSupplement = Math.max(0, totalStationDemandKw - directSolar);
  const surplusSolar = Math.max(0, instantSolarGenKw - totalStationDemandKw);
  const excessToBattery = Math.min(surplusSolar, batteryMaxChargeKw);
  const solarCoveragePct = totalStationDemandKw > 0 ? Number(((directSolar / totalStationDemandKw) * 100).toFixed(1)) : 100;

  return {
    directSolarToEvKw: Number(directSolar.toFixed(1)),
    gridSupplementKw: Number(gridSupplement.toFixed(1)),
    excessSolarToBatteryKw: Number(excessToBattery.toFixed(1)),
    solarCoveragePct,
  };
}


// 5. Dynamic Pricing Surge Engine
export function calculateSurgeMultiplier(
  occupiedChargers: number,
  totalChargers: number,
  queueLength: number,
  baseRatePerKwh: number = 0.25
): { surgeMultiplier: number; effectiveRatePerKwh: number; isSurgeActive: boolean } {
  if (totalChargers <= 0) return { surgeMultiplier: 1.0, effectiveRatePerKwh: baseRatePerKwh, isSurgeActive: false };

  const occupancyRatio = occupiedChargers / totalChargers;
  let multiplier = 1.0;

  if (occupancyRatio >= 0.90 || queueLength > 0) {
    // 100% full or queue waiting -> surge up to 1.75x
    const queueBoost = Math.min(0.5, queueLength * 0.1);
    multiplier = 1.25 + queueBoost;
  } else if (occupancyRatio >= 0.70) {
    multiplier = 1.10;
  }

  multiplier = Number(multiplier.toFixed(2));
  const effectiveRate = Number((baseRatePerKwh * multiplier).toFixed(3));

  return {
    surgeMultiplier: multiplier,
    effectiveRatePerKwh: effectiveRate,
    isSurgeActive: multiplier > 1.0,
  };
}
