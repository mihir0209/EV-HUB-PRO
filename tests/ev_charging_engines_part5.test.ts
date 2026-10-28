import { describe, it, expect } from "vitest";
import {
  generateOcppChargingProfile,
  findOptimalWholesaleWindows,
  estimateBatteryStateOfHealth,
  identifyChargingDeserts,
  scheduleDepotCharging,
} from "../lib/ev_charging_engines_part5";

describe("EV-HUB-PRO Batch 24 - 5 Production Achievements", () => {
  it("Achievement 1: OCPP 2.0.1 Charging Profile allocator generates compliant periods", () => {
    // 60 minute session with 3 staggered power levels [150, 100, 50] kW
    const profile = generateOcppChargingProfile(101, 60, [150, 100, 50]);
    expect(profile.id).toBe(101);
    expect(profile.chargingSchedule.durationSec).toBe(3600);
    expect(profile.chargingSchedule.chargingSchedulePeriod).toHaveLength(3);
    expect(profile.chargingSchedule.chargingSchedulePeriod[0].limitPowerKw).toBe(150);
    expect(profile.chargingSchedule.chargingSchedulePeriod[1].startPeriodSec).toBe(1200); // 20 min in
  });

  it("Achievement 2: Wholesale Arbitrage Engine finds lowest day-ahead electricity prices", () => {
    const prices = [
      { hour: 0, pricePerMwhUsd: 35.0 },
      { hour: 1, pricePerMwhUsd: 25.0 },
      { hour: 2, pricePerMwhUsd: 20.0 }, // cheap
      { hour: 3, pricePerMwhUsd: 22.0 }, // cheap
      { hour: 17, pricePerMwhUsd: 180.0 }, // expensive peak
      { hour: 18, pricePerMwhUsd: 220.0 }, // expensive peak
    ];
    const arbitrage = findOptimalWholesaleWindows(prices, 2);
    expect(arbitrage.bestHours).toEqual([2, 3]);
    expect(arbitrage.averagePricePerMwh).toBe(21.0);
    expect(arbitrage.potentialArbitrageSavingsUsd).toBeGreaterThan(150.0);
  });

  it("Achievement 3: Battery State of Health (SoH) and warranty replacement threshold", () => {
    // Aged battery: 2000 cycles, elevated resistance (0.07 vs 0.04 baseline)
    const aged = estimateBatteryStateOfHealth(100.0, 2000, 0.07, 0.04);
    expect(aged.stateOfHealthPct).toBeLessThan(85.0);
    expect(aged.nominalRemainingCapacityKwh).toBeLessThan(85.0);
    expect(aged.warrantyStatus).toBe("WARRANTY_VALID");

    // Severely degraded battery (4000 cycles, 0.12 ohms) -> Replacement eligible
    const degraded = estimateBatteryStateOfHealth(100.0, 4000, 0.12, 0.04);
    expect(degraded.stateOfHealthPct).toBeLessThan(70.0);
    expect(degraded.warrantyStatus).toBe("WARRANTY_REPLACEMENT_ELIGIBLE");
  });

  it("Achievement 4: Geospatial Voronoi Density Analyzer detects charging deserts", () => {
    // Dense urban stations (SF to Oakland ~15km apart)
    const denseStations = [
      { id: "s1", lat: 37.7749, lng: -122.4194 },
      { id: "s2", lat: 37.8044, lng: -122.2712 },
    ];
    const urban = identifyChargingDeserts(denseStations, 25.0);
    expect(urban.chargingDesertDetected).toBe(false);

    // Desert (100km gap)
    const sparse = [
      { id: "s1", lat: 37.7749, lng: -122.4194 },
      { id: "s3", lat: 38.5816, lng: -121.4944 }, // ~120km
    ];
    const desert = identifyChargingDeserts(sparse, 25.0);
    expect(desert.chargingDesertDetected).toBe(true);
    expect(desert.maxGapKm).toBeGreaterThan(50.0);
  });

  it("Achievement 5: Depot Fleet Overnight Charging Scheduler verifies capacity", () => {
    const vans = [
      { vanId: "van-1", requiredKwh: 40, departureTimeHour: 7 },
      { vanId: "van-2", requiredKwh: 50, departureTimeHour: 7 },
      { vanId: "van-3", requiredKwh: 45, departureTimeHour: 7 },
    ]; // Total 135 kWh

    // 2 chargers at 22kW with 7 hours window = 308 kWh capacity -> Can complete
    const schedule = scheduleDepotCharging(vans, 2, 22.0);
    expect(schedule.canCompleteFleetSchedule).toBe(true);
    expect(schedule.totalKwhScheduled).toBe(135.0);
  });
});
