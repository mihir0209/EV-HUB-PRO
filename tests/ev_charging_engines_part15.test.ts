import { describe, it, expect } from "vitest";
import {
  governSicActiveGateDrive,
  dampenPantographAeroAcoustics,
  modelSolidStateThermalGradientStress,
  balanceDualInverterWirelessNeutral,
  emulateFastFrequencyDroop,
} from "../lib/ev_charging_engines_part15";

describe("EV-HUB-PRO Batch 34 - 5 Production Achievements", () => {
  it("Achievement 1: Silicon Carbide (SiC) Inverter Active Gate Drive dV/dt EMI Mitigation Governor", () => {
    // Compliant slew rate (4.2 kV/us <= 5.0 kV/us)
    const normal = governSicActiveGateDrive(4.2, 10.0, 5.0);
    expect(normal.isGateSlewRateOptimal).toBe(true);
    expect(normal.emiSuppressionTier).toBe("COMPLIANT_CISPR25");
    expect(normal.activeGateVoltageVolts).toBe(10.0);

    // Severe ringing / EMI overshoot (8.0 kV/us > 7.5 kV/us)
    const overshoot = governSicActiveGateDrive(8.0, 10.0, 5.0);
    expect(overshoot.isGateSlewRateOptimal).toBe(false);
    expect(overshoot.emiSuppressionTier).toBe("CRITICAL_OVERSHOOT_THROTTLED");
    expect(overshoot.activeGateVoltageVolts).toBe(8.0);
  });

  it("Achievement 2: Dynamic Pantograph Aero-Acoustic Contact Wire Oscillation Dampener", () => {
    // 250 km/h cruising: aero uplift dampened to maintain stable contact
    const aero = dampenPantographAeroAcoustics(250.0, 90.0, 0.85);
    expect(aero.aerodynamicLiftForceNewtons).toBeGreaterThan(10.0);
    expect(aero.dampenedContactForceNewtons).toBeGreaterThan(95.0);
    expect(aero.dampenedContactForceNewtons).toBeLessThan(135.0);
    expect(aero.isOscillationStable).toBe(true);
    expect(aero.aerodynamicNoiseSplDb).toBeGreaterThan(65.0);
  });

  it("Achievement 3: Solid-State Lithium Battery Thermal Gradient Internal Stress Model", () => {
    // Mild gradient (5C Delta T): stress ~ 20 MPa < 80 MPa cracking limit
    const mild = modelSolidStateThermalGradientStress(35.0, 30.0);
    expect(mild.thermoMechanicalStressMpa).toBeLessThan(30.0);
    expect(mild.ceramicElectrolyteCrackingRisk).toBe(false);
    expect(mild.maxPermissibleChargeCurrentAmps).toBe(350.0);

    // Severe thermal shock (30C Delta T): stress ~ 120 MPa >= 80 MPa limit -> cracking risk!
    const shock = modelSolidStateThermalGradientStress(55.0, 25.0);
    expect(shock.thermoMechanicalStressMpa).toBeGreaterThan(80.0);
    expect(shock.ceramicElectrolyteCrackingRisk).toBe(true);
    expect(shock.maxPermissibleChargeCurrentAmps).toBeLessThan(200.0);
  });

  it("Achievement 4: ISO 15118-20 Wireless Power Dual-Inverter Active Neutral Balancing Controller", () => {
    // Perfectly matched inverters 180 deg out of phase (0A neutral current)
    const balanced = balanceDualInverterWirelessNeutral(50.0, 50.0, 180.0);
    expect(balanced.zeroSequenceCurrentAmps).toBe(0.0);
    expect(balanced.isNeutralBalanced).toBe(true);
    expect(balanced.inverterAPhaseDutyPct).toBe(50.0);

    // Phase mismatch causing 10A neutral current -> trims duty
    const unbalanced = balanceDualInverterWirelessNeutral(55.0, 45.0, 160.0);
    expect(unbalanced.zeroSequenceCurrentAmps).toBeGreaterThan(2.0);
    expect(unbalanced.isNeutralBalanced).toBe(false);
  });

  it("Achievement 5: Grid Ancillary Frequency Regulation Droop Curve Fast Response Emulator", () => {
    // Severe under-frequency (49.80 Hz < 49.97 Hz deadband) -> Injects active power
    const under = emulateFastFrequencyDroop(49.80, 50.0, 350.0, 4.0);
    expect(under.gridSupportEngagement).toBe("ACTIVE_INJECTION");
    expect(under.powerAdjustmentKw).toBeGreaterThan(25.0);
    expect(under.responseDurationMs).toBeLessThan(100);

    // Within deadband (50.01 Hz) -> Normal
    const deadband = emulateFastFrequencyDroop(50.01, 50.0, 350.0, 4.0);
    expect(deadband.gridSupportEngagement).toBe("DEADBAND_NORMAL");
    expect(deadband.powerAdjustmentKw).toBe(0.0);
  });
});
