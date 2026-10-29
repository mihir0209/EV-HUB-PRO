import { describe, it, expect } from "vitest";
import {
  operateSolidStateCircuitBreaker,
  dispatchOpportunityChargingSchedule,
  modelLiquidSubmersionCellCooling,
  monitorMcsGroundIntegrityGuard,
  governOcppSmartChargingProfile,
} from "../lib/ev_charging_engines_part12";

describe("EV-HUB-PRO Batch 31 - 5 Production Achievements", () => {
  it("Achievement 1: Solid-State Circuit Breaker (SSCB) Ultra-Fast Microsecond Fault Interrupter", () => {
    // Normal load (400A, low di/dt) -> Closed
    const normal = operateSolidStateCircuitBreaker(400.0, 5.0, 600.0);
    expect(normal.breakerState).toBe("CLOSED");
    expect(normal.isFaultIsolated).toBe(false);

    // Hard short circuit (di/dt = 80 A/us >= 50 A/us) -> trips in 4.5 microseconds!
    const fault = operateSolidStateCircuitBreaker(800.0, 80.0, 600.0);
    expect(fault.breakerState).toBe("TRIPPED_SHORT_CIRCUIT");
    expect(fault.tripDurationMicroseconds).toBeLessThanOrEqual(5.0);
    expect(fault.isFaultIsolated).toBe(true);
  });

  it("Achievement 2: Dynamic Fleet Depot Opportunity Charging Schedule Dispatcher", () => {
    const fleet = [
      { id: "bus_1", currentSocPct: 20.0, dwellTimeMinutes: 30 },
      { id: "bus_2", currentSocPct: 80.0, dwellTimeMinutes: 45 },
    ];
    // 300 kW depot power distributed across fleet
    const allocation = dispatchOpportunityChargingSchedule(fleet, 300.0);
    expect(allocation.length).toBe(2);
    // bus_1 (20% SoC) must be prioritized and gain substantial SoC
    const bus1 = allocation.find(b => b.vehicleId === "bus_1");
    expect(bus1?.expectedDepartureSocPct).toBeGreaterThan(25.0);
  });

  it("Achievement 3: Liquid Submersion Direct-Contact Battery Cell Cooling Model", () => {
    // 50W dissipation under 0.5 m/s dielectric flow
    const immersion = modelLiquidSubmersionCellCooling(50.0, 25.0, 0.50);
    expect(immersion.heatTransferCoefficientWPerM2K).toBeGreaterThan(1000);
    expect(immersion.steadyStateCellTempC).toBeLessThan(30.0);
    expect(immersion.isThermalRunawayMitigated).toBe(true);
  });

  it("Achievement 4: Megawatt Charging System (MCS) Active Ground Integrity Monitoring Guard", () => {
    // Healthy ground (0.35 Ohm <= 1.0 Ohm limit, 1000 Hz pilot)
    const healthy = monitorMcsGroundIntegrityGuard(0.35, 1000.0);
    expect(healthy.isGroundContinuityValid).toBe(true);
    expect(healthy.interlockAction).toBe("GROUND_HEALTHY_ENABLE_POWER");

    // Broken/compromised ground (2.5 Ohm > 1.0 Ohm limit)
    const broken = monitorMcsGroundIntegrityGuard(2.5, 1000.0);
    expect(broken.isGroundContinuityValid).toBe(false);
    expect(broken.interlockAction).toBe("TRIP_GROUND_RESISTANCE_FAULT_DISCONNECT");
  });

  it("Achievement 5: Open Charge Point Protocol (OCPP 2.0.1) Real-Time Smart Charging Profile Governor", () => {
    // 50% grid curtailment signal
    const curtailed = governOcppSmartChargingProfile(350.0, 50.0);
    expect(curtailed.allowedMaxPowerKw).toBe(175.0);
    expect(curtailed.curtailmentActive).toBe(true);
    expect(curtailed.activeProfilePurpose).toBe("GRID_RESTRAINT");

    // Full uncurtailed power (100%)
    const full = governOcppSmartChargingProfile(350.0, 100.0);
    expect(full.allowedMaxPowerKw).toBe(350.0);
    expect(full.curtailmentActive).toBe(false);
  });
});
