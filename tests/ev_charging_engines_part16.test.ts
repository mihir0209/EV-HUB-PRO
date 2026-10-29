import { describe, it, expect } from "vitest";
import {
  modelGanResonantLlcConverter,
  monitorPantographInfraredTelemetry,
  governXfcLithiumPlatingClosedLoop,
  routeMvdcMicrogridEnergy,
  optimizeOcppDayAheadChargingTariff,
} from "../lib/ev_charging_engines_part16";

describe("EV-HUB-PRO Batch 35 - 5 Production Achievements", () => {
  it("Achievement 1: High-Voltage Gallium Nitride (GaN) Fast Charger Resonant LLC Tank Converter", () => {
    // Lr = 25 uH, Cr = 40 nF -> fr ~ 159.2 kHz
    const llc = modelGanResonantLlcConverter(25.0, 40.0, 160.0, 800.0);
    expect(llc.resonantFrequencyKhz).toBeGreaterThan(150.0);
    expect(llc.isZeroVoltageSwitchingAchieved).toBe(true);
    expect(llc.conversionEfficiencyPct).toBeGreaterThan(98.0);
  });

  it("Achievement 2: Pantograph Active Contact Strip Temperature Infrared Telemetry Sentinel", () => {
    // Normal strip temperature 85C
    const normal = monitorPantographInfraredTelemetry(85.0);
    expect(normal.isHotSpotWarning).toBe(false);
    expect(normal.interlockAction).toBe("NORMAL_CURRENT_COLLECTION");

    // Hotspot arcing 195C >= 180C limit -> emergency lower pantograph
    const hot = monitorPantographInfraredTelemetry(195.0);
    expect(hot.isHotSpotWarning).toBe(true);
    expect(hot.interlockAction).toContain("LOWER_PANTOGRAPH");
  });

  it("Achievement 3: Extreme Fast Charging (XFC) Lithium Plating Overpotential Closed-Loop Governor", () => {
    // Safe anode potential (30 mV >= 15 mV target) -> full 350A current
    const unconstrained = governXfcLithiumPlatingClosedLoop(350.0, 30.0, 15.0);
    expect(unconstrained.governorState).toBe("UNCONSTRAINED_FAST_CHARGE");
    expect(unconstrained.governedCurrentAmps).toBe(350.0);
    expect(unconstrained.curtailmentAppliedPct).toBe(0.0);

    // Anode potential drops to 5 mV (< 15 mV) -> closed-loop curtailment applied
    const curtailed = governXfcLithiumPlatingClosedLoop(350.0, 5.0, 15.0);
    expect(curtailed.governorState).toBe("CLOSED_LOOP_CURTAILMENT");
    expect(curtailed.governedCurrentAmps).toBeLessThan(350.0);

    // Negative potential (-5 mV <= 0) -> plating lockout
    const lockout = governXfcLithiumPlatingClosedLoop(350.0, -5.0, 15.0);
    expect(lockout.governorState).toBe("PLATING_LOCKOUT");
    expect(lockout.curtailmentAppliedPct).toBe(50.0);
  });

  it("Achievement 4: Medium-Voltage DC Microgrid Solid-State Bidirectional Energy Router", () => {
    // Forward flow with +18 deg phase shift -> forward power > 0
    const forward = routeMvdcMicrogridEnergy(1500.0, 750.0, 18.0);
    expect(forward.powerFlowDirection).toBe("FORWARD_TO_STORAGE");
    expect(forward.routedPowerKw).toBeGreaterThan(50.0);
    expect(forward.systemEfficiencyPct).toBeGreaterThan(97.0);

    // Reverse flow with -18 deg phase shift -> reverse power < 0
    const reverse = routeMvdcMicrogridEnergy(1500.0, 750.0, -18.0);
    expect(reverse.powerFlowDirection).toBe("REVERSE_TO_GRID");
    expect(reverse.routedPowerKw).toBeLessThan(-50.0);
  });

  it("Achievement 5: Open Charge Point Protocol (OCPP 2.0.1) Real-Time Smart Charging Tariff Optimizer", () => {
    // 24-hour pricing profile with night valley ($0.10) and evening peak ($0.60)
    const prices = [
      0.10, 0.10, 0.12, 0.15, 0.20, 0.25, 0.30, 0.35,
      0.40, 0.42, 0.45, 0.40, 0.35, 0.30, 0.28, 0.32,
      0.55, 0.60, 0.58, 0.50, 0.40, 0.30, 0.20, 0.12
    ];
    // Need 150 kWh at 50 kW charger = 3 hours needed
    const schedule = optimizeOcppDayAheadChargingTariff(prices, 150.0, 50.0);
    expect(schedule.recommendedHourlyChargingScheduleKw.length).toBe(24);
    // Cheapest hours (0, 1, 2) must be scheduled
    expect(schedule.recommendedHourlyChargingScheduleKw[0]).toBe(50.0);
    expect(schedule.recommendedHourlyChargingScheduleKw[1]).toBe(50.0);
    // Peak hour 17 ($0.60) must be 0 kW
    expect(schedule.recommendedHourlyChargingScheduleKw[17]).toBe(0.0);
    expect(schedule.projectedCostSavingsPct).toBeGreaterThan(70.0);
  });
});
