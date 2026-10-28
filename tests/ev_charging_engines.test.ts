import { describe, it, expect } from "vitest";
import {
  estimateChargingSession,
  optimizeChargingTariff,
  findStationsWithinRange,
  handleNoShowResolution,
  evaluateV2GDischarge,
} from "../lib/ev_charging_engines";

describe("EV-HUB-PRO 5 Production Achievements", () => {
  it("Achievement 1: BatteryStateEstimator calculates CC/CV duration and cold derating", () => {
    // 75 kWh battery, 20% to 80% (60% needed = 45 kWh), 150 kW charger, 25C
    const resWarm = estimateChargingSession(75, 20, 80, 150, 25);
    expect(resWarm.energyDeliveredKwh).toBe(45);
    expect(resWarm.durationMinutes).toBeLessThan(30);

    // Below freezing (0C) cold derating slows charging
    const resCold = estimateChargingSession(75, 20, 80, 150, -5);
    expect(resCold.durationMinutes).toBeGreaterThan(resWarm.durationMinutes);
  });

  it("Achievement 2: PeakTariffOptimizer shifts charging to avoid peak grid rates", () => {
    // Current hour 17 (5 PM peak). Peak hours [16, 21]. Should delay to 21.
    const res = optimizeChargingTariff(17, 40, 2, [16, 21], 0.40, 0.15);
    expect(res.shouldDelay).toBe(true);
    expect(res.scheduledStartHour).toBe(21);
    expect(res.savingsUsd).toBe(10); // 40 * (0.40 - 0.15) = $10 saved

    // Off-peak session starts immediately
    const resOffPeak = optimizeChargingTariff(22, 40, 2, [16, 21], 0.40, 0.15);
    expect(resOffPeak.shouldDelay).toBe(false);
  });

  it("Achievement 3: GeoProximityClusterer filters stations by driving distance", () => {
    const stations = [
      { id: "s1", name: "Nearby Fast Hub", latitude: 37.7749, longitude: -122.4194, powerKw: 150 },
      { id: "s2", name: "Distant Charger", latitude: 38.5816, longitude: -121.4944, powerKw: 50 }, // Sacramento (~120km)
    ];

    // Search from SF coordinates with 20km radius
    const nearby = findStationsWithinRange(37.7749, -122.4194, 20, stations);
    expect(nearby).toHaveLength(1);
    expect(nearby[0].id).toBe("s1");
    expect(nearby[0].distanceKm).toBe(0);
  });

  it("Achievement 4: SlotContentionResolver penalizes no-show slot hoarding", () => {
    const slot = {
      slotId: "slot-01",
      userId: "u1",
      stationId: "s1",
      startTimeEpoch: 10000,
      status: "CONFIRMED" as const,
      depositUsd: 20.0,
      refundedDepositUsd: 0,
    };

    // Arrives within 15 min grace (10000 + 10 * 60 = 10600)
    const onTime = handleNoShowResolution(slot, 10600, 15, 50);
    expect(onTime.status).toBe("CONFIRMED");
    expect(onTime.refundedDepositUsd).toBe(20.0);

    // No-show (arrives after 15 min grace -> 10000 + 20 * 60 = 11200) -> 50% penalty
    const noShow = handleNoShowResolution(slot, 11200, 15, 50);
    expect(noShow.status).toBe("CANCELLED_NO_SHOW");
    expect(noShow.refundedDepositUsd).toBe(10.0);
  });

  it("Achievement 5: V2GPowerDischargeRouter computes net discharge profitability", () => {
    // 60 kWh battery, currently at 90%, reserved 50% (usable 40% = 24 kWh).
    // Grid buyback price $0.35/kWh during peak demand
    const v2g = evaluateV2GDischarge(60, 90, 50, 0.35);
    expect(v2g.isProfitable).toBe(true);
    expect(v2g.dischargedKwh).toBe(24);
    expect(v2g.grossRevenueUsd).toBe(8.40);
    expect(v2g.netProfitUsd).toBeGreaterThan(0);
    expect(v2g.endingSocPct).toBe(50);
  });
});
