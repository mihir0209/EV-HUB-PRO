import { describe, it, expect } from "vitest";
import {
  applyGridDemandResponse,
  evaluateConnectorThermalHealth,
  planFleetChargingStops,
  allocateSolarCanopyPower,
  calculateSurgeMultiplier,
} from "../lib/ev_charging_engines_part2";

describe("EV-HUB-PRO Batch 21 - 5 Production Achievements", () => {
  it("Achievement 1: Dynamic Grid Demand Response throttles power during emergencies", () => {
    // 350 kW Ultra-Fast DC charger under Level 2 warning (50% curtailment)
    const res = applyGridDemandResponse(350, 2);
    expect(res.throttledPowerKw).toBe(175);
    expect(res.gridReliefKw).toBe(175);
    expect(res.curtailmentAppliedPct).toBe(50);

    // Normal level 0 -> 0% curtailment
    const normal = applyGridDemandResponse(350, 0);
    expect(normal.throttledPowerKw).toBe(350);
    expect(normal.gridReliefKw).toBe(0);
  });

  it("Achievement 2: Connector Health Diagnostic detects pin wear and thermal runaway risk", () => {
    // Normal healthy connector (200A, 80mV drop -> 0.4 mOhm, 15C rise, 40C temp)
    const healthy = evaluateConnectorThermalHealth(80, 200, 25, 40);
    expect(healthy.isSafeToCharge).toBe(true);
    expect(healthy.thermalRiskTier).toBe("NORMAL");

    // Critical runaway (200A, 320mV drop -> 1.6 mOhm, 90C temp)
    const dangerous = evaluateConnectorThermalHealth(320, 200, 25, 90);
    expect(dangerous.isSafeToCharge).toBe(false);
    expect(dangerous.thermalRiskTier).toBe("CRITICAL_RUNAWAY");
  });

  it("Achievement 3: Fleet Route Waypoint Planner schedules stops with reserve buffer", () => {
    // 1000 km trip, vehicle range 400 km with 15% buffer (effective 340 km)
    // Stops at 340 km and 680 km
    const plan = planFleetChargingStops(1000, 400, 15);
    expect(plan.canReachDestination).toBe(true);
    expect(plan.stopsCount).toBe(2);
    expect(plan.chargingWaypointsKm).toEqual([340, 680]);
  });

  it("Achievement 4: Solar Canopy Direct Dispatch allocates solar and battery storage", () => {
    // 80 kW solar generation, 50 kW vehicle demand -> 50 kW direct solar, 0 kW grid, 30 kW to battery
    const sunny = allocateSolarCanopyPower(80, 50, 50);
    expect(sunny.directSolarToEvKw).toBe(50);
    expect(sunny.gridSupplementKw).toBe(0);
    expect(sunny.excessSolarToBatteryKw).toBe(30);
    expect(sunny.solarCoveragePct).toBe(100);

    // 20 kW solar, 100 kW demand -> 20 kW solar, 80 kW grid
    const cloudy = allocateSolarCanopyPower(20, 100, 50);
    expect(cloudy.directSolarToEvKw).toBe(20);
    expect(cloudy.gridSupplementKw).toBe(80);
    expect(cloudy.solarCoveragePct).toBe(20);
  });

  it("Achievement 5: Dynamic Pricing Surge Engine adjusts rate based on station queue", () => {
    // 10 chargers, 10 occupied, 3 cars in queue -> surge multiplier 1.25 + 0.3 = 1.55x
    const surge = calculateSurgeMultiplier(10, 10, 3, 0.30);
    expect(surge.isSurgeActive).toBe(true);
    expect(surge.surgeMultiplier).toBe(1.55);
    expect(surge.effectiveRatePerKwh).toBeCloseTo(0.465, 3);

    // 2 chargers occupied out of 10 -> base rate 1.0x
    const offPeak = calculateSurgeMultiplier(2, 10, 0, 0.30);
    expect(offPeak.isSurgeActive).toBe(false);
    expect(offPeak.surgeMultiplier).toBe(1.0);
  });
});
