/**
 * EV-HUB-PRO Core Charging & Grid Dispatch Engines (5 Achievements).
 * 1. BatteryStateEstimator (Non-linear CC/CV charging curve & temperature degradation)
 * 2. PeakTariffOptimizer (Time-of-Use dynamic charging schedule optimizer)
 * 3. GeoProximityClusterer (Haversine range-bounded station discovery)
 * 4. SlotContentionResolver (Anti-hoarding slot allocator & no-show penalty)
 * 5. V2GPowerDischargeRouter (Vehicle-to-Grid bi-directional discharge arbitrage)
 */

// 1. Battery State Estimator
export interface ChargingCurveResult {
  durationMinutes: number;
  energyDeliveredKwh: number;
  averagePowerKw: number;
  finalSocPct: number;
}

export function estimateChargingSession(
  batteryCapacityKwh: number,
  startSocPct: number,
  targetSocPct: number,
  chargerMaxPowerKw: number,
  ambientTempC: number = 25
): ChargingCurveResult {
  if (startSocPct >= targetSocPct || startSocPct < 0 || targetSocPct > 100) {
    throw new Error("Invalid SoC boundaries");
  }

  // Cold temperature battery derating
  let tempFactor = 1.0;
  if (ambientTempC < 0) tempFactor = 0.65;
  else if (ambientTempC < 15) tempFactor = 0.85;

  const effectiveMaxKw = chargerMaxPowerKw * tempFactor;
  const deltaSoc = targetSocPct - startSocPct;
  const energyNeeded = (deltaSoc / 100) * batteryCapacityKwh;

  // CC phase up to 80%, CV taper phase above 80%
  let totalHours = 0;
  if (startSocPct < 80) {
    const ccSocDelta = Math.min(80, targetSocPct) - startSocPct;
    const ccEnergy = (ccSocDelta / 100) * batteryCapacityKwh;
    totalHours += ccEnergy / effectiveMaxKw;
  }

  if (targetSocPct > 80) {
    const cvStart = Math.max(80, startSocPct);
    const cvSocDelta = targetSocPct - cvStart;
    const cvEnergy = (cvSocDelta / 100) * batteryCapacityKwh;
    // Average power drops to ~50% of max in CV phase
    const cvAvgKw = effectiveMaxKw * 0.5;
    totalHours += cvEnergy / cvAvgKw;
  }

  const durationMinutes = Math.round(totalHours * 60);
  const avgKw = totalHours > 0 ? Number((energyNeeded / totalHours).toFixed(1)) : 0;

  return {
    durationMinutes,
    energyDeliveredKwh: Number(energyNeeded.toFixed(2)),
    averagePowerKw: avgKw,
    finalSocPct: targetSocPct,
  };
}


// 2. Peak Tariff Optimizer
export interface TariffScheduleResult {
  shouldDelay: boolean;
  scheduledStartHour: number;
  estimatedCostUsd: number;
  savingsUsd: number;
}

export function optimizeChargingTariff(
  currentHour: number, // 0 - 23
  energyNeededKwh: number,
  chargingDurationHours: number,
  peakHours: [number, number] = [16, 21], // 4 PM to 9 PM
  peakRatePerKwh: number = 0.38,
  offPeakRatePerKwh: number = 0.14
): TariffScheduleResult {
  const isCurrentlyPeak = currentHour >= peakHours[0] && currentHour < peakHours[1];
  const peakCost = energyNeededKwh * peakRatePerKwh;
  const offPeakCost = energyNeededKwh * offPeakRatePerKwh;

  if (isCurrentlyPeak) {
    return {
      shouldDelay: true,
      scheduledStartHour: peakHours[1],
      estimatedCostUsd: Number(offPeakCost.toFixed(2)),
      savingsUsd: Number((peakCost - offPeakCost).toFixed(2)),
    };
  }

  return {
    shouldDelay: false,
    scheduledStartHour: currentHour,
    estimatedCostUsd: Number(offPeakCost.toFixed(2)),
    savingsUsd: 0,
  };
}


// 3. Geo Proximity Clusterer
export interface StationLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  powerKw: number;
}

export function findStationsWithinRange(
  userLat: number,
  userLng: number,
  maxDistanceKm: number,
  stations: StationLocation[]
): (StationLocation & { distanceKm: number })[] {
  const R = 6371; // Earth radius in km

  return stations
    .map((s) => {
      const dLat = ((s.latitude - userLat) * Math.PI) / 180;
      const dLng = ((s.longitude - userLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLat * Math.PI) / 180) *
          Math.cos((s.latitude * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = Number((R * c).toFixed(2));
      return { ...s, distanceKm };
    })
    .filter((s) => s.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}


// 4. Slot Contention Resolver
export interface ReservationSlot {
  slotId: string;
  userId: string;
  stationId: string;
  startTimeEpoch: number;
  status: "CONFIRMED" | "CANCELLED_NO_SHOW" | "COMPLETED";
  depositUsd: number;
  refundedDepositUsd: number;
}

export function handleNoShowResolution(
  slot: ReservationSlot,
  arrivalEpoch: number,
  gracePeriodMinutes: number = 15,
  noShowPenaltyPct: number = 50
): ReservationSlot {
  const graceSec = gracePeriodMinutes * 60;
  const isNoShow = arrivalEpoch > slot.startTimeEpoch + graceSec;

  if (isNoShow) {
    const penalty = (slot.depositUsd * noShowPenaltyPct) / 100;
    return {
      ...slot,
      status: "CANCELLED_NO_SHOW",
      refundedDepositUsd: Number((slot.depositUsd - penalty).toFixed(2)),
    };
  }

  return {
    ...slot,
    status: "CONFIRMED",
    refundedDepositUsd: slot.depositUsd,
  };
}


// 5. Vehicle-to-Grid (V2G) Power Discharge Router
export interface V2GArbitrageResult {
  isProfitable: boolean;
  dischargedKwh: number;
  grossRevenueUsd: number;
  batteryDegradationCostUsd: number;
  netProfitUsd: number;
  endingSocPct: number;
}

export function evaluateV2GDischarge(
  batteryCapacityKwh: number,
  currentSocPct: number,
  minReservedSocPct: number,
  gridSellPricePerKwh: number,
  batteryReplacementCostPerKwh: number = 130
): V2GArbitrageResult {
  if (currentSocPct <= minReservedSocPct) {
    return {
      isProfitable: false,
      dischargedKwh: 0,
      grossRevenueUsd: 0,
      batteryDegradationCostUsd: 0,
      netProfitUsd: 0,
      endingSocPct: currentSocPct,
    };
  }

  const usableSoc = currentSocPct - minReservedSocPct;
  const dischargedKwh = Number(((usableSoc / 100) * batteryCapacityKwh).toFixed(2));
  const grossRevenue = Number((dischargedKwh * gridSellPricePerKwh).toFixed(2));

  // Battery cycle wear: ~1500 full cycles lifetime -> $130 / 1500 = ~$0.086/kWh degraded
  const degradationRatePerKwh = (batteryReplacementCostPerKwh / 1500) * 1.1;
  const degradationCost = Number((dischargedKwh * degradationRatePerKwh).toFixed(2));
  const netProfit = Number((grossRevenue - degradationCost).toFixed(2));

  return {
    isProfitable: netProfit > 0,
    dischargedKwh,
    grossRevenueUsd: grossRevenue,
    batteryDegradationCostUsd: degradationCost,
    netProfitUsd: netProfit,
    endingSocPct: minReservedSocPct,
  };
}
