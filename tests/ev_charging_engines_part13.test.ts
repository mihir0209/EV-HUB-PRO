import { describe, it, expect } from "vitest";
import {
  modelSicInverterLosses,
  trackPantographCatenaryDynamics,
  evaluateLithiumDendriteGrowth,
  inspectWirelessFodRadar,
  synchronizePllMicrogrid,
} from "../lib/ev_charging_engines_part13";

describe("EV-HUB-PRO Batch 32 - 5 Production Achievements", () => {
  it("Achievement 1: Silicon Carbide (SiC) Inverter Switching Loss Thermal Model", () => {
    // 800V, 250A, 40 kHz switching at 45C coolant
    const sic = modelSicInverterLosses(800.0, 250.0, 40.0, 45.0, 15.0);
    expect(sic.conductionLossWatts).toBeGreaterThan(500.0);
    expect(sic.switchingLossWatts).toBeGreaterThan(500.0);
    expect(sic.isWithinSafeOperatingArea).toBe(true);
    expect(sic.junctionTempCelsius).toBeLessThan(175.0);
  });

  it("Achievement 2: Pantograph Catenary Wire Oscillatory Waveform Tracker", () => {
    // High-speed rail: 200 km/h under 20 kN wire tension -> wave speed ~121.7 m/s (438 km/h)
    const normal = trackPantographCatenaryDynamics(200.0, 20.0, 1.35);
    expect(normal.wavePropagationSpeedMPerSec).toBeGreaterThan(120.0);
    expect(normal.trainSpeedToWaveSpeedRatio).toBeLessThanOrEqual(0.70);
    expect(normal.isSpeedPermitted).toBe(true);

    // Excessive speed: 350 km/h (97.2 m/s / 121.7 m/s = 0.80 > 0.70)
    const dangerous = trackPantographCatenaryDynamics(350.0, 20.0, 1.35);
    expect(dangerous.isSpeedPermitted).toBe(false);
    expect(dangerous.contactLossProbabilityPct).toBeGreaterThan(5.0);
  });

  it("Achievement 3: Solid-State Lithium Dendrite Short Sentinel", () => {
    // Healthy solid-state cell (0.50 Ohm baseline vs 0.48 Ohm current, 1.0 mV noise)
    const healthy = evaluateLithiumDendriteGrowth(0.50, 0.48, 1.0);
    expect(healthy.isDendriteShortImminent).toBe(false);
    expect(healthy.safetyAction).toBe("NORMAL_OPERATION");

    // Imminent dendrite short (40% impedance drop and 6.0 mV noise)
    const shorted = evaluateLithiumDendriteGrowth(0.50, 0.30, 6.0);
    expect(shorted.isDendriteShortImminent).toBe(true);
    expect(shorted.safetyAction).not.toBe("NORMAL_OPERATION");
  });

  it("Achievement 4: ISO 15118-20 Wireless Power Transfer Foreign Object Debris (FOD) Radar Guard", () => {
    // Clean charging pad (85.0 kHz nominal, -25 dB RCS)
    const clean = inspectWirelessFodRadar(85.0, 85.0, -25.0);
    expect(clean.isForeignObjectDetected).toBe(false);
    expect(clean.powerInterlockActive).toBe(true);

    // Metallic debris (coin/can): causes 2.5 kHz detuning
    const debris = inspectWirelessFodRadar(82.5, 85.0, -25.0);
    expect(debris.isForeignObjectDetected).toBe(true);
    expect(debris.powerInterlockActive).toBe(false);
  });

  it("Achievement 5: Microgrid Phase-Locked Loop (PLL) Islanding Synchronizer", () => {
    // Aligned angles (3.0 deg <= 5 deg) and freq (50.04 Hz vs 50.00 Hz) -> locked
    const locked = synchronizePllMicrogrid(120.0, 117.0, 50.04, 50.0);
    expect(locked.isLockedToGrid).toBe(true);
    expect(locked.breakerRecloseAuthorized).toBe(true);

    // Large phase displacement (15.0 deg > 5 deg)
    const unlocked = synchronizePllMicrogrid(120.0, 105.0, 50.04, 50.0);
    expect(unlocked.isLockedToGrid).toBe(false);
    expect(unlocked.breakerRecloseAuthorized).toBe(false);
  });
});
