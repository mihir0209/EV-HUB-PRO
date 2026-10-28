import { describe, it, expect } from "vitest";
import {
  evaluateInductiveCoilAlignment,
  modelMcsBusbarThermalEquilibrium,
  calculateLmpPricing,
  evaluateInternalMicroShort,
  synchronizeMarineShorePower,
} from "../lib/ev_charging_engines_part8";

describe("EV-HUB-PRO Batch 27 - 5 Production Achievements", () => {
  it("Achievement 1: ISO 15118-20 Wireless Inductive Charging Alignment Diagnostic", () => {
    // Perfect alignment: 0cm lateral, 15cm vertical
    const optimal = evaluateInductiveCoilAlignment(0, 15);
    expect(optimal.isTransferPermitted).toBe(true);
    expect(optimal.couplingCoefficientK).toBeGreaterThan(0.30);
    expect(optimal.guidanceAction).toBe("ALIGNMENT_OPTIMAL_PROCEED");

    // Severe lateral misalignment (15cm > 10cm limit)
    const misaligned = evaluateInductiveCoilAlignment(15, 15);
    expect(misaligned.isTransferPermitted).toBe(false);
    expect(misaligned.guidanceAction).toBe("STEER_LEFT");
  });

  it("Achievement 2: Megawatt Charging System (MCS) 3.75MW Liquid Cooled Busbar Model", () => {
    // Full 3000A with 20 LPM liquid cooling -> temp rise under 50C (P = 1800W)
    const rated = modelMcsBusbarThermalEquilibrium(3000, 200.0, 20.0);
    expect(rated.jouleHeatingWatts).toBe(1800.0);
    expect(rated.steadyStateTempRiseC).toBeLessThanOrEqual(50.0);
    expect(rated.isWithinThermalLimit).toBe(true);

    // Pump failure / zero coolant flow (0 LPM) -> natural convection (15 W/C) causes severe overheating (>100C)
    const overheated = modelMcsBusbarThermalEquilibrium(3000, 200.0, 0.0);
    expect(overheated.isWithinThermalLimit).toBe(false);
    expect(overheated.steadyStateTempRiseC).toBeGreaterThan(50.0);
  });

  it("Achievement 3: Grid Congestion Dynamic Locational Marginal Pricing Engine", () => {
    // Normal uncongested state (60% substation loading)
    const normal = calculateLmpPricing(50.0, 60.0, 3.0);
    expect(normal.marginalCongestionPriceUsdPerMwh).toBe(0.0);
    expect(normal.curtailmentSignal).toBe(false);

    // Heavy congestion (96% loading) triggers congestion component and curtailment signal
    const congested = calculateLmpPricing(50.0, 96.0, 3.0);
    expect(congested.marginalCongestionPriceUsdPerMwh).toBeGreaterThan(200.0);
    expect(congested.curtailmentSignal).toBe(true);
    expect(congested.locationalMarginalPriceUsdPerKwh).toBeGreaterThan(0.25);
  });

  it("Achievement 4: Battery Internal Micro-Short Early Warning Sentinel", () => {
    // Normal resting degradation: 0.8 mV drop in 24 hours
    const normal = evaluateInternalMicroShort(4.150, 4.1492, 0.8);
    expect(normal.isMicroShortDetected).toBe(false);
    expect(normal.severityTier).toBe("NORMAL");

    // Accelerated self-discharge (10.0 mV drop) -> Micro-short anomaly
    const fault = evaluateInternalMicroShort(4.150, 4.140, 0.8);
    expect(fault.isMicroShortDetected).toBe(true);
    expect(fault.severityTier).toBe("CRITICAL_ISOLATE");
  });

  it("Achievement 5: Electric Vessel Marine Shore-Power Synchronizer", () => {
    // Ship 440V/60Hz to shore 400V/50Hz
    const sync = synchronizeMarineShorePower(440.0, 60.0, 400.0, 50.0);
    expect(sync.frequencyDeltaHz).toBe(10.0);
    expect(sync.voltageDeltaVolts).toBe(40.0);
    expect(sync.converterActive).toBe(true);
    expect(sync.breakerClosurePermitted).toBe(true);
  });
});
