import { describe, it, expect } from "vitest";
import {
  evaluatePhaseSwitching,
  dispatchSyntheticInertia,
  executeBatterySwapOperation,
  estimateThermalPreconditioning,
  calculateOcpi221TariffCost,
} from "../lib/ev_charging_engines_part7";

describe("EV-HUB-PRO Batch 26 - 5 Production Achievements", () => {
  it("Achievement 1: Dynamic Phase Switching transitions from single to 3-phase with relay pause", () => {
    // 7 kW demand fits within single phase 230V * 32A (~7.36 kW) -> 0ms delay
    const single = evaluatePhaseSwitching(7.0, 230, 32);
    expect(single.activePhaseMode).toBe("SINGLE_PHASE");
    expect(single.relayTransitionDelayMs).toBe(0);

    // 22 kW demand requires 3-phase -> activates 250ms relay pause interlock
    const three = evaluatePhaseSwitching(22.0, 230, 32);
    expect(three.activePhaseMode).toBe("THREE_PHASE");
    expect(three.relayTransitionDelayMs).toBe(250);
    expect(three.availablePowerKw).toBeGreaterThan(20.0);
  });

  it("Achievement 2: Grid Synthetic Inertia Dispatcher responds to RoCoF frequency transients", () => {
    // Normal frequency (50.0 Hz nominal, 50.02 Hz measured, low RoCoF)
    const normal = dispatchSyntheticInertia(50.0, 50.02, 5.0, -0.02);
    expect(normal.gridStabilizationActive).toBe(false);
    expect(normal.syntheticPowerAdjustmentKw).toBe(0);

    // Severe under-frequency transient (49.7 Hz, RoCoF = -0.20 Hz/s) -> Injects synthetic inertia
    const emergency = dispatchSyntheticInertia(50.0, 49.70, 5.0, -0.20);
    expect(emergency.gridStabilizationActive).toBe(true);
    expect(emergency.syntheticPowerAdjustmentKw).toBeGreaterThan(10.0);
  });

  it("Achievement 3: Battery Swap Station Depot Model executes pack exchange", () => {
    const inventory = [
      { packId: "pack-1", socPct: 95.0, capacityKwh: 80, isReadyForSwap: true },
      { packId: "pack-2", socPct: 60.0, capacityKwh: 80, isReadyForSwap: false },
      { packId: "pack-3", socPct: 92.0, capacityKwh: 80, isReadyForSwap: true },
    ];
    // Successfully assigns pack-1 (highest SoC 95%)
    const swap = executeBatterySwapOperation(inventory, 90.0);
    expect(swap.swapSuccessful).toBe(true);
    expect(swap.assignedPackId).toBe("pack-1");
    expect(swap.vehicleEndingSocPct).toBe(95.0);

    // Empty or depleted inventory
    const depleted = executeBatterySwapOperation([inventory[1]], 90.0);
    expect(depleted.swapSuccessful).toBe(false);
    expect(depleted.reason).toBe("NO_CHARGED_PACKS_AVAILABLE_IN_INVENTORY");
  });

  it("Achievement 4: Ambient Battery Thermal Preconditioning Estimator", () => {
    // Ambient -5C, target 22C, 450kg pack with 5kW heater
    const preheat = estimateThermalPreconditioning(-5, 450, 22.0, 5.0);
    expect(preheat.energyConsumedPreheatKwh).toBeGreaterThan(3.5);
    expect(preheat.preheatDurationMinutes).toBeGreaterThan(30);

    // Warm day (25C >= 22C target) -> 0 energy needed
    const warm = estimateThermalPreconditioning(25, 450, 22.0, 5.0);
    expect(warm.energyConsumedPreheatKwh).toBe(0);
  });

  it("Achievement 5: OCPI 2.2.1 Roaming Tariff Broker computes multi-dimensional costs", () => {
    // 50 kWh energy at $0.30/kWh (step size 1000 Wh), $2.00 flat fee, 1 hour charging at $1.50/hr
    const components = [
      { type: "FLAT" as const, price: 2.00, step_size: 1 },
      { type: "ENERGY" as const, price: 0.30, step_size: 1000 },
      { type: "TIME" as const, price: 1.50, step_size: 60 },
      { type: "PARKING_TIME" as const, price: 5.00, step_size: 60 },
    ];
    // 50 kWh, 3600s charge, 0s parking
    const cost = calculateOcpi221TariffCost(50.0, 3600, 0, components);
    expect(cost.breakdown["FLAT"]).toBe(2.00);
    expect(cost.breakdown["ENERGY"]).toBe(15.00);
    expect(cost.breakdown["TIME"]).toBe(1.50);
    expect(cost.breakdown["PARKING_TIME"]).toBe(0.00);
    expect(cost.totalCostExclVat).toBe(18.50);
  });
});
