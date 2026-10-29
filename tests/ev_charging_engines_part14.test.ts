import { describe, it, expect } from "vitest";
import {
  modelCableCoolantHydrodynamics,
  optimizeXfcCccvProfile,
  isolateMvdcMicrogridPortFault,
  monitorCellIntercalationStrain,
  dispatchOcppSmartTariffBidding,
} from "../lib/ev_charging_engines_part14";

describe("EV-HUB-PRO Batch 33 - 5 Production Achievements", () => {
  it("Achievement 1: High-Power Liquid-Cooled Cable Hydrodynamic Flow Pressure Drop Model", () => {
    // 20 LPM flow in 5m cable with 10mm channel -> nominal pressure drop < 2.0 bar
    const nominal = modelCableCoolantHydrodynamics(20.0, 5.0, 10.0, 1060.0);
    expect(nominal.flowVelocityMPerSec).toBeGreaterThan(4.0);
    expect(nominal.darcyPressureDropBar).toBeLessThan(2.0);
    expect(nominal.heatRemovalCapacityKw).toBeGreaterThan(15.0);
    expect(nominal.pumpLoadStatus).not.toBe("OVERPRESSURE_CAVITATION");

    // Extreme 60 LPM flow rate -> high backpressure
    const high = modelCableCoolantHydrodynamics(60.0, 5.0, 10.0, 1060.0);
    expect(high.darcyPressureDropBar).toBeGreaterThan(2.0);
  });

  it("Achievement 2: Extreme Fast Charging (XFC) Dynamic Constant-Current Constant-Voltage Optimization", () => {
    // Cell voltage 4.10V, 25C, 300A -> virtual voltage < 4.25V limit -> no stepdown
    const normal = optimizeXfcCccvProfile(4.10, 25.0, 300.0, 4.25);
    expect(normal.isStepDownRequired).toBe(false);
    expect(normal.recommendedCurrentAmps).toBe(300.0);

    // Cell voltage 4.22V, high polarization -> virtual voltage >= 4.25V -> steps down current
    const stepped = optimizeXfcCccvProfile(4.22, 20.0, 400.0, 4.25);
    expect(stepped.isStepDownRequired).toBe(true);
    expect(stepped.recommendedCurrentAmps).toBeLessThan(400.0);
  });

  it("Achievement 3: Multi-Port Medium-Voltage DC Microgrid Solid-State Fault Isolator", () => {
    // 2000A short circuit on Port 3 (rated 800A) -> clears in 1.2 ms
    const fault = isolateMvdcMicrogridPortFault("PORT_DC_03", 2000.0, 800.0);
    expect(fault.isFaultCleared).toBe(true);
    expect(fault.isolationTimeMs).toBe(1.2);
    expect(fault.isolatedPortId).toBe("PORT_DC_03");

    // Normal 600A load -> no trip
    const clean = isolateMvdcMicrogridPortFault("PORT_DC_01", 600.0, 800.0);
    expect(clean.isFaultCleared).toBe(false);
  });

  it("Achievement 4: Battery Cell Intercalation Stress Mechanical Expansion Strain-Gauge Sentinel", () => {
    // Normal breathing (1200 micro-strain)
    const normal = monitorCellIntercalationStrain(1200);
    expect(normal.isExcessiveExpansionAlert).toBe(false);
    expect(normal.actionGuidance).toBe("NORMAL_BREATHING_DEFORMATION");

    // Dangerous swelling (4200 micro-strain >= 3500 limit)
    const critical = monitorCellIntercalationStrain(4200);
    expect(critical.isExcessiveExpansionAlert).toBe(true);
    expect(critical.swellingPressureMpa).toBeGreaterThanOrEqual(0.50);
    expect(critical.actionGuidance).toContain("CELL_VENT_RISK");
  });

  it("Achievement 5: Open Charge Point Protocol (OCPP 2.0.1) Real-Time Smart Tariff Bidding Engine", () => {
    // Low spot price ($0.15/kWh <= $0.35/kWh max willingness) -> full 350 kW charge
    const cheap = dispatchOcppSmartTariffBidding(0.15, 0.35, 350.0);
    expect(cheap.allocatedChargingPowerKw).toBe(350.0);
    expect(cheap.isEconomicallyOptimal).toBe(true);

    // Peak spot price ($0.58/kWh > $0.35 * 1.5) -> curtail to 0 kW
    const expensive = dispatchOcppSmartTariffBidding(0.58, 0.35, 350.0);
    expect(expensive.allocatedChargingPowerKw).toBe(0.0);
    expect(expensive.isEconomicallyOptimal).toBe(false);
  });
});
