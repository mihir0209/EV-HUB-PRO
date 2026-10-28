/**
 * EV-HUB-PRO Batch 22 Charging & Grid Dispatch Engines (5 Achievements).
 * 1. SmartMeterTelemetryValidator (Validates real vs apparent power P = V * I * PF)
 * 2. SessionKwhLedgerIntegrator (Numerical trapezoidal integration of discrete power samples)
 * 3. BatteryWarrantyDegradationProtector (DC fast charge C-rate abuse & thermal stress guard)
 * 4. OverstayParkingTariffCalculator (Post-charge idle bay overstay billing engine)
 * 5. ChargingSessionCarbonOffsetModel (Clean energy mix net Scope-2 displacement calculator)
 */

// 1. Smart Meter Telemetry Validator
export interface MeterTelemetryCheck {
  isValid: boolean;
  expectedPowerKw: number;
  reportedPowerKw: number;
  discrepancyPct: number;
}

export function validateSmartMeterTelemetry(
  volts: number,
  amps: number,
  reportedPowerKw: number,
  powerFactor: number = 0.98
): MeterTelemetryCheck {
  if (volts <= 0 || amps < 0 || reportedPowerKw < 0) {
    return { isValid: false, expectedPowerKw: 0, reportedPowerKw, discrepancyPct: 100.0 };
  }
  const expectedKw = Number(((volts * amps * powerFactor) / 1000.0).toFixed(2));
  const diff = Math.abs(expectedKw - reportedPowerKw);
  const discrepancyPct = expectedKw > 0 ? Number(((diff / expectedKw) * 100.0).toFixed(2)) : 0;

  // Meter drift tolerance <= 5%
  return {
    isValid: discrepancyPct <= 5.0,
    expectedPowerKw: expectedKw,
    reportedPowerKw,
    discrepancyPct,
  };
}


// 2. Session kWh Ledger Integrator
export function calculateSessionKwhLedger(
  powerSamplesKw: number[],
  sampleIntervalSeconds: number = 60
): number {
  if (powerSamplesKw.length === 0) return 0;
  if (powerSamplesKw.length === 1) {
    return Number(((powerSamplesKw[0] * sampleIntervalSeconds) / 3600.0).toFixed(3));
  }

  // Trapezoidal numerical integration
  let totalKwh = 0;
  for (let i = 0; i < powerSamplesKw.length - 1; i++) {
    const avgKw = (powerSamplesKw[i] + powerSamplesKw[i + 1]) / 2.0;
    const hours = sampleIntervalSeconds / 3600.0;
    totalKwh += avgKw * hours;
  }

  return Number(totalKwh.toFixed(3));
}


// 3. Battery Warranty Degradation Protector
export interface WarrantyHealthResult {
  warrantySafe: boolean;
  riskTier: "LOW" | "MODERATE" | "HIGH_WARRANTY_VOID_RISK";
  advisory: string;
}

export function evaluateBatteryWarrantyLimits(
  observedConsecutiveDcCharges: number,
  maxRecommendedConsecutive: number = 5,
  avgOperatingTempC: number = 25
): WarrantyHealthResult {
  const isHighTemp = avgOperatingTempC >= 45;
  const isOverChaging = observedConsecutiveDcCharges > maxRecommendedConsecutive;

  if (isOverChaging && isHighTemp) {
    return {
      warrantySafe: false,
      riskTier: "HIGH_WARRANTY_VOID_RISK",
      advisory: "Extreme thermal stress & repetitive DC fast-charging may void manufacturer warranty",
    };
  } else if (isOverChaging || isHighTemp) {
    return {
      warrantySafe: true,
      riskTier: "MODERATE",
      advisory: "Recommend AC Level 2 charging cycle to rebalance battery cell voltages",
    };
  }

  return {
    warrantySafe: true,
    riskTier: "LOW",
    advisory: "Battery operating parameters within optimal health envelope",
  };
}


// 4. Overstay Parking Tariff Calculator
export interface OverstayTariffResult {
  overstayMinutes: number;
  billableMinutes: number;
  overstayFeeUsd: number;
}

export function calculateOverstayTariff(
  scheduledEndEpochSec: number,
  disconnectEpochSec: number,
  graceMinutes: number = 10,
  overstayFeePerMinuteUsd: number = 0.50
): OverstayTariffResult {
  if (disconnectEpochSec <= scheduledEndEpochSec) {
    return { overstayMinutes: 0, billableMinutes: 0, overstayFeeUsd: 0 };
  }

  const rawMinutes = Math.floor((disconnectEpochSec - scheduledEndEpochSec) / 60.0);
  const billableMinutes = Math.max(0, rawMinutes - graceMinutes);
  const fee = Number((billableMinutes * overstayFeePerMinuteUsd).toFixed(2));

  return {
    overstayMinutes: rawMinutes,
    billableMinutes,
    overstayFeeUsd: fee,
  };
}


// 5. Charging Session Carbon Offset Model
export function calculateChargingCarbonOffset(
  energyDeliveredKwh: number,
  cleanEnergyMixPct: number,
  fossilGridFactorKgKwh: number = 0.42
): { cleanEnergyKwh: number; avoidedCo2Kg: number } {
  if (energyDeliveredKwh <= 0 || cleanEnergyMixPct <= 0) {
    return { cleanEnergyKwh: 0, avoidedCo2Kg: 0 };
  }
  const cleanKwh = Number(((energyDeliveredKwh * cleanEnergyMixPct) / 100.0).toFixed(2));
  const avoidedCo2Kg = Number((cleanKwh * fossilGridFactorKgKwh).toFixed(2));
  return { cleanEnergyKwh: cleanKwh, avoidedCo2Kg };
}
