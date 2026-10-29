import { describe, it, expect } from "vitest";
import {
  balanceBipolarDcMicrogridVoltage,
  detectBatteryThermalRunawayVentGas,
  estimateXfcLithiumPlatingOverpotential,
  governDualCableCurrentSharing,
  emulateIso15118BidirectionalPowerTransfer,
} from "../lib/ev_charging_engines_part11";

describe("EV-HUB-PRO Batch 30 - 5 Production Achievements", () => {
  it("Achievement 1: Bipolar DC Microgrid Voltage Balancing Dual-Active-Bridge Controller", () => {
    // Balanced rails (+502V, -499V -> 3V offset <= 10V)
    const balanced = balanceBipolarDcMicrogridVoltage(502.0, -499.0, 10.0);
    expect(balanced.isBalancedWithinTolerance).toBe(true);
    expect(balanced.neutralPointOffsetVolts).toBe(3.0);

    // Severe unbalance (+525V, -480V -> 45V offset)
    const unbalanced = balanceBipolarDcMicrogridVoltage(525.0, -480.0, 10.0);
    expect(unbalanced.isBalancedWithinTolerance).toBe(false);
    expect(unbalanced.balancingDutyAdjustmentPct).toBeLessThan(-10.0);
  });

  it("Achievement 2: Battery Pack Thermal Runaway Vent Gas Gas-Chromatography Early Warning Sentinel", () => {
    // Normal ambient atmosphere
    const normal = detectBatteryThermalRunawayVentGas(5.0, 2.0, 0.2);
    expect(normal.hazardLevel).toBe("NORMAL");
    expect(normal.isThermalRunawayImminent).toBe(false);

    // Catastrophic off-gas (CO = 150 ppm, H2 = 80 ppm)
    const critical = detectBatteryThermalRunawayVentGas(150.0, 80.0, 20.0);
    expect(critical.hazardLevel).toBe("CRITICAL_EJECT");
    expect(critical.isThermalRunawayImminent).toBe(true);
    expect(critical.dominantGasIndicator).toBe("CARBON_MONOXIDE_THERMAL_RUNAWAY");
  });

  it("Achievement 3: Extreme Fast Charging (XFC) Lithium Plating In-Situ Overpotential Estimator", () => {
    // Warm battery (35C), low SoC (20%), 250A -> anode potential safely positive (> 0 mV)
    const safe = estimateXfcLithiumPlatingOverpotential(35.0, 20.0, 250.0, 0.40);
    expect(safe.platingRiskActive).toBe(false);
    expect(safe.estimatedAnodePotentialVsLiMv).toBeGreaterThan(0.0);
    expect(safe.maxRecommendedChargeAmps).toBe(250);

    // Cold battery (5C), high SoC (80%), high current (450A) -> anode drops below 0 mV (plating risk!)
    const plating = estimateXfcLithiumPlatingOverpotential(5.0, 80.0, 450.0, 0.50);
    expect(plating.platingRiskActive).toBe(true);
    expect(plating.estimatedAnodePotentialVsLiMv).toBeLessThan(0.0);
    expect(plating.maxRecommendedChargeAmps).toBeLessThan(450);
  });

  it("Achievement 4: Heavy-Duty Dual-Cable Automated Current Sharing Balance Governor", () => {
    // Balanced cables (150 uOhm vs 155 uOhm) -> mismatch < 30A
    const balanced = governDualCableCurrentSharing(800.0, 150.0, 155.0);
    expect(balanced.isSharingCompliant).toBe(true);
    expect(balanced.currentMismatchAmps).toBeLessThan(20.0);
    expect(balanced.correctionAction).toBe("BALANCED_NORMAL");

    // Highly unbalanced contact resistances (120 uOhm vs 220 uOhm)
    const unbalanced = governDualCableCurrentSharing(800.0, 120.0, 220.0);
    expect(unbalanced.isSharingCompliant).toBe(false);
    expect(unbalanced.currentMismatchAmps).toBeGreaterThan(100.0);
    expect(unbalanced.correctionAction).toBe("ADJUST_CABLE_CONTACT_RESISTANCE");
  });

  it("Achievement 5: ISO 15118-20 Bidirectional Power Transfer (BPT) Grid Frequency Response Emulator", () => {
    // Severe under-frequency (49.5 Hz) -> V2G Discharging to grid
    const under = emulateIso15118BidirectionalPowerTransfer(49.5, 50.0);
    expect(under.operatingMode).toBe("DISCHARGING_TO_GRID");
    expect(under.v2gPowerKw).toBeGreaterThan(20.0);

    // Over-frequency (50.6 Hz) -> V2G Absorbing / charging from grid
    const over = emulateIso15118BidirectionalPowerTransfer(50.6, 50.0);
    expect(over.operatingMode).toBe("CHARGING_FROM_GRID");
    expect(over.v2gPowerKw).toBeLessThan(-20.0);

    // Nominal grid frequency (50.05 Hz within deadband) -> Standby
    const nominal = emulateIso15118BidirectionalPowerTransfer(50.05, 50.0);
    expect(nominal.operatingMode).toBe("STANDBY");
    expect(nominal.v2gPowerKw).toBe(0.0);
  });
});
