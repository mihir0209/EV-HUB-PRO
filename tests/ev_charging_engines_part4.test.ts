import { describe, it, expect } from "vitest";
import {
  evaluateConnectorLockFeedback,
  checkThreePhaseBalance,
  distributeDynamicLoadSharing,
  verifyRfidAuthorizationToken,
  auditEmergencyStopDisarm,
} from "../lib/ev_charging_engines_part4";

describe("EV-HUB-PRO Batch 23 - 5 Production Achievements", () => {
  it("Achievement 1: ConnectorLockFeedbackDiagnostic verifies motorized latch state", () => {
    // Successfully locked
    const locked = evaluateConnectorLockFeedback(true, 0);
    expect(locked.isLockedSecurely).toBe(true);
    expect(locked.canCommenceHighVoltage).toBe(true);
    expect(locked.status).toBe("LOCKED");

    // Motor retries exceeded
    const failed = evaluateConnectorLockFeedback(false, 3);
    expect(failed.isLockedSecurely).toBe(false);
    expect(failed.status).toBe("LOCK_FAILURE_RETRY_EXCEEDED");
  });

  it("Achievement 2: ThreePhaseCurrentUnbalanceMonitor flags neutral overheating risk", () => {
    // Balanced 3-phase load (32A, 32A, 30A) -> unbalance < 5%
    const balanced = checkThreePhaseBalance(32, 32, 30, 10.0);
    expect(balanced.isBalanced).toBe(true);
    expect(balanced.unbalancePct).toBeLessThan(5.0);

    // Severe unbalance (32A, 10A, 5A) -> unbalance > 40%
    const unbalanced = checkThreePhaseBalance(32, 10, 5, 10.0);
    expect(unbalanced.isBalanced).toBe(false);
    expect(unbalanced.neutralCurrentAmps).toBeGreaterThan(20);
  });

  it("Achievement 3: DynamicLoadSharingDistributor throttles proportionally", () => {
    // 150 kW capacity available, 3 cars demanding [100, 100, 100] = 300 kW
    // Throttled equally to 50 kW each
    const throttled = distributeDynamicLoadSharing(150, [100, 100, 100]);
    expect(throttled).toEqual([50, 50, 50]);

    // Available power exceeds demand -> full demand granted
    const full = distributeDynamicLoadSharing(250, [50, 60, 40]);
    expect(full).toEqual([50, 60, 40]);
  });

  it("Achievement 4: RfidOfflineAuthorizationValidator enforces token whitelist & expiry", () => {
    const whitelist = new Set(["04A1B2C3D4", "E5F6A7B8C9"]);
    // Authorized card within expiry
    const valid = verifyRfidAuthorizationToken("04A1B2C3D4", whitelist, 2000, 1500);
    expect(valid.isAuthorized).toBe(true);
    expect(valid.reason).toBe("AUTHORIZED_ACCESS_GRANTED");

    // Expired token
    const expired = verifyRfidAuthorizationToken("04A1B2C3D4", whitelist, 1000, 1500);
    expect(expired.isAuthorized).toBe(false);
    expect(expired.reason).toBe("RFID_TOKEN_EXPIRED");

    // Unknown card
    const unknown = verifyRfidAuthorizationToken("UNKNOWN_CARD", whitelist, 2000, 1500);
    expect(unknown.isAuthorized).toBe(false);
    expect(unknown.reason).toBe("UNKNOWN_UNAUTHORIZED_CARD");
  });

  it("Achievement 5: EmergencyStopInterlockAuditor ensures HV isolation within 50ms", () => {
    // Estop pressed, contactor open at 35ms -> Safe
    const safeEstop = auditEmergencyStopDisarm(true, "OPEN", 35);
    expect(safeEstop.isSafe).toBe(true);
    expect(safeEstop.contactorIsolated).toBe(true);

    // Welded contactor during Estop -> Critical hazard
    const welded = auditEmergencyStopDisarm(true, "CLOSED", 40);
    expect(welded.isSafe).toBe(false);
    expect(welded.hazardCode).toBe("CRITICAL_CONTACTOR_WELDED_UNDER_ESTOP");
  });
});
