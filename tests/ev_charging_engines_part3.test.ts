import { describe, it, expect } from "vitest";
import {
  validateSmartMeterTelemetry,
  calculateSessionKwhLedger,
  evaluateBatteryWarrantyLimits,
  calculateOverstayTariff,
  calculateChargingCarbonOffset,
} from "../lib/ev_charging_engines_part3";

describe("EV-HUB-PRO Batch 22 - 5 Production Achievements", () => {
  it("Achievement 1: SmartMeterTelemetryValidator detects power discrepancy", () => {
    // 400V, 100A, PF 0.98 -> Expected 39.2 kW
    // Reported 39.5 kW -> discrepancy ~0.76% (Valid)
    const valid = validateSmartMeterTelemetry(400, 100, 39.5, 0.98);
    expect(valid.isValid).toBe(true);
    expect(valid.discrepancyPct).toBeLessThan(2.0);

    // Reported 50.0 kW -> discrepancy > 25% (Tampered / Faulty meter)
    const tampered = validateSmartMeterTelemetry(400, 100, 50.0, 0.98);
    expect(tampered.isValid).toBe(false);
    expect(tampered.discrepancyPct).toBeGreaterThan(20.0);
  });

  it("Achievement 2: SessionKwhLedgerIntegrator performs trapezoidal energy integration", () => {
    // Constant 60 kW for 1 hour (61 samples at 60s interval)
    const constantSamples = Array(61).fill(60.0);
    const energy = calculateSessionKwhLedger(constantSamples, 60);
    expect(energy).toBeCloseTo(60.0, 1);

    // Empty samples -> 0
    expect(calculateSessionKwhLedger([], 60)).toBe(0);
  });

  it("Achievement 3: BatteryWarrantyDegradationProtector checks thermal stress limits", () => {
    // 8 consecutive DC fast charges at 48C -> High risk
    const highRisk = evaluateBatteryWarrantyLimits(8, 5, 48);
    expect(highRisk.warrantySafe).toBe(false);
    expect(highRisk.riskTier).toBe("HIGH_WARRANTY_VOID_RISK");

    // Normal usage (2 charges at 25C) -> Low risk
    const normal = evaluateBatteryWarrantyLimits(2, 5, 25);
    expect(normal.warrantySafe).toBe(true);
    expect(normal.riskTier).toBe("LOW");
  });

  it("Achievement 4: OverstayParkingTariffCalculator enforces grace period and billing", () => {
    // Scheduled end: 1000, Disconnect: 1000 + 30 min (1800 sec). 10 min grace -> 20 billable min * $0.50 = $10.00
    const overstay = calculateOverstayTariff(1000, 1000 + 1800, 10, 0.50);
    expect(overstay.overstayMinutes).toBe(30);
    expect(overstay.billableMinutes).toBe(20);
    expect(overstay.overstayFeeUsd).toBe(10.00);

    // Within grace period (5 min after end) -> $0 fee
    const onTime = calculateOverstayTariff(1000, 1000 + 300, 10, 0.50);
    expect(onTime.billableMinutes).toBe(0);
    expect(onTime.overstayFeeUsd).toBe(0.00);
  });

  it("Achievement 5: ChargingSessionCarbonOffsetModel computes avoided emissions", () => {
    // 50 kWh delivered, 80% clean solar/wind mix, 0.42 kg CO2/kWh grid factor
    // 40 kWh clean * 0.42 = 16.8 kg avoided
    const offset = calculateChargingCarbonOffset(50, 80, 0.42);
    expect(offset.cleanEnergyKwh).toBe(40.0);
    expect(offset.avoidedCo2Kg).toBe(16.8);

    expect(calculateChargingCarbonOffset(0, 80).avoidedCo2Kg).toBe(0);
  });
});
