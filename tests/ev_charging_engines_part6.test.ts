import { describe, it, expect } from "vitest";
import {
  planV2GPeakShavingDispatch,
  validatePlugAndChargeCertificate,
  evaluateGroundFaultLeakage,
  calculateLiquidCoolingFlowRate,
  maximizeSolarStorageSelfConsumption,
} from "../lib/ev_charging_engines_part6";

describe("EV-HUB-PRO Batch 25 - 5 Production Achievements", () => {
  it("Achievement 1: Vehicle-to-Grid (V2G) Peak Shaving Dispatcher calculates relief", () => {
    // 350 kW demand vs 250 kW threshold (100 kW excess). Connected EVs have 600 kWh total storage
    // Max 20% discharge = 120 kW -> fulfills 100 kW excess at $0.45/kWh
    const plan = planV2GPeakShavingDispatch(350, 250, [200, 200, 200], 0.45);
    expect(plan.shouldDischarge).toBe(true);
    expect(plan.dischargeKw).toBe(100.0);
    expect(plan.revenueGeneratedUsd).toBe(45.0);

    // Below threshold -> no discharge needed
    const below = planV2GPeakShavingDispatch(200, 250, [100, 100]);
    expect(below.shouldDischarge).toBe(false);
  });

  it("Achievement 2: ISO 15118 Plug & Charge PKI Certificate Validator", () => {
    const cert = "-----BEGIN CERTIFICATE-----\nCN=CONTRACT-TESLA-999\n-----END CERTIFICATE-----";
    const ca = "-----BEGIN CERTIFICATE-----\nCN=ROOT-CA-HUB\n-----END CERTIFICATE-----";
    const res = validatePlugAndChargeCertificate(cert, ca, 2000, 1500);
    expect(res.isValid).toBe(true);
    expect(res.contractId).toBe("CONTRACT-TESLA-999");

    // Expired cert
    const exp = validatePlugAndChargeCertificate(cert, ca, 1000, 1500);
    expect(exp.isValid).toBe(false);
    expect(exp.errorMessage).toBe("CERTIFICATE_EXPIRED");
  });

  it("Achievement 3: GFCI Ground Fault Diagnostic trips on DC residual current", () => {
    // Normal leakage (2mA DC, 5mA AC) -> Continue
    const normal = evaluateGroundFaultLeakage(2.0, 5.0, 6.0, 30.0);
    expect(normal.isTripped).toBe(false);
    expect(normal.safetyAction).toBe("CONTINUE");

    // Dangerous DC ground fault leakage (8mA >= 6mA threshold) -> Immediate HV Trip
    const fault = evaluateGroundFaultLeakage(8.0, 10.0, 6.0, 30.0);
    expect(fault.isTripped).toBe(true);
    expect(fault.safetyAction).toBe("IMMEDIATE_HV_TRIP_GROUND_FAULT");
  });

  it("Achievement 4: Liquid-Cooled Cable Thermal Flow Rate Model", () => {
    // 500A ultra-fast DC charge through 1.2 mOhm cable
    // P = 500^2 * 0.0012 = 300W = 0.3 kW heat loss
    const cooling = calculateLiquidCoolingFlowRate(500, 1.2, 25, 60);
    expect(cooling.requiredFlowRateLpm).toBeGreaterThan(0.1);
    expect(cooling.coolingCapacityKw).toBe(0.3);
    expect(cooling.steadyStateTempC).toBeLessThan(60);
  });

  it("Achievement 5: Solar + Battery Self-Consumption Maximizer prioritizes renewables", () => {
    // 100 kW EV demand: 40 kW solar, 35 kW battery, 25 kW grid
    const sched = maximizeSolarStorageSelfConsumption(100, 40, 35);
    expect(sched.solarSuppliedKw).toBe(40.0);
    expect(sched.batterySuppliedKw).toBe(35.0);
    expect(sched.gridImportedKw).toBe(25.0);
    expect(sched.renewableCoveragePct).toBe(75.0);
  });
});
