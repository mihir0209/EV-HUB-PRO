/**
 * EV-HUB-PRO Batch 23 Charging & Grid Dispatch Engines (5 Achievements).
 * 1. ConnectorLockFeedbackDiagnostic (ISO 15118 motorized locking pin status)
 * 2. ThreePhaseCurrentUnbalanceMonitor (IEC 61000-2-2 neutral current & unbalance percentage)
 * 3. DynamicLoadSharingDistributor (Proportional fair-share power throttling across active stalls)
 * 4. RfidOfflineAuthorizationValidator (MIFARE/DESFire token whitelist & expiry cache)
 * 5. EmergencyStopInterlockAuditor (Safety interlocking ensuring high-voltage contactor opens <= 50ms)
 */

// 1. Connector Lock Feedback Diagnostic
export interface LockStatusResult {
  isLockedSecurely: boolean;
  canCommenceHighVoltage: boolean;
  status: "LOCKED" | "UNLOCKED" | "LOCK_FAILURE_RETRY_EXCEEDED";
}

export function evaluateConnectorLockFeedback(
  solenoidFeedbackSignal: boolean,
  lockMotorRetries: number,
  isVehicleInitiatedStop: boolean = false
): LockStatusResult {
  if (isVehicleInitiatedStop) {
    return {
      isLockedSecurely: false,
      canCommenceHighVoltage: false,
      status: "UNLOCKED",
    };
  }

  if (solenoidFeedbackSignal) {
    return {
      isLockedSecurely: true,
      canCommenceHighVoltage: true,
      status: "LOCKED",
    };
  }

  const status = lockMotorRetries >= 3 ? "LOCK_FAILURE_RETRY_EXCEEDED" : "UNLOCKED";
  return {
    isLockedSecurely: false,
    canCommenceHighVoltage: false,
    status,
  };
}


// 2. Three-Phase Current Unbalance Monitor
export interface PhaseBalanceCheck {
  isBalanced: boolean;
  unbalancePct: number;
  neutralCurrentAmps: number;
  maxPhaseAmps: number;
}

export function checkThreePhaseBalance(
  phaseA: number,
  phaseB: number,
  phaseC: number,
  maxAllowedUnbalancePct: number = 10.0
): PhaseBalanceCheck {
  const avg = (phaseA + phaseB + phaseC) / 3.0;
  if (avg <= 0) {
    return { isBalanced: true, unbalancePct: 0.0, neutralCurrentAmps: 0.0, maxPhaseAmps: 0.0 };
  }

  const maxDev = Math.max(Math.abs(phaseA - avg), Math.abs(phaseB - avg), Math.abs(phaseC - avg));
  const unbalancePct = Number(((maxDev / avg) * 100.0).toFixed(2));
  // Neutral current approximation for 3-phase unbalanced load
  const neutralAmps = Number(Math.sqrt(0.5 * ((phaseA - phaseB) ** 2 + (phaseB - phaseC) ** 2 + (phaseC - phaseA) ** 2)).toFixed(2));

  return {
    isBalanced: unbalancePct <= maxAllowedUnbalancePct,
    unbalancePct,
    neutralCurrentAmps: neutralAmps,
    maxPhaseAmps: Math.max(phaseA, phaseB, phaseC),
  };
}


// 3. Dynamic Load Sharing Distributor
export function distributeDynamicLoadSharing(
  totalAvailablePowerKw: number,
  vehicleDemandsKw: number[]
): number[] {
  if (totalAvailablePowerKw <= 0 || vehicleDemandsKw.length === 0) {
    return vehicleDemandsKw.map(() => 0);
  }

  const totalDemand = vehicleDemandsKw.reduce((a, b) => a + b, 0);
  if (totalDemand <= totalAvailablePowerKw) {
    // Grid can supply full demand
    return [...vehicleDemandsKw];
  }

  // Scale down proportionally
  const scalingFactor = totalAvailablePowerKw / totalDemand;
  return vehicleDemandsKw.map(demand => Number((demand * scalingFactor).toFixed(1)));
}


// 4. RFID Offline Authorization Validator
export interface RfidAuthResult {
  isAuthorized: boolean;
  cardUidHex: string;
  reason: string;
}

export function verifyRfidAuthorizationToken(
  cardUidHex: string,
  allowedUidWhitelist: Set<string>,
  epochExpiry: number,
  currentEpoch: number
): RfidAuthResult {
  const cleanUid = cardUidHex.trim().toLowerCase();
  const normalizedWhitelist = new Set(Array.from(allowedUidWhitelist).map(u => u.trim().toLowerCase()));

  if (currentEpoch >= epochExpiry) {
    return { isAuthorized: false, cardUidHex: cleanUid, reason: "RFID_TOKEN_EXPIRED" };
  }

  if (!normalizedWhitelist.has(cleanUid)) {
    return { isAuthorized: false, cardUidHex: cleanUid, reason: "UNKNOWN_UNAUTHORIZED_CARD" };
  }

  return { isAuthorized: true, cardUidHex: cleanUid, reason: "AUTHORIZED_ACCESS_GRANTED" };
}


// 5. Emergency Stop Interlock Auditor
export interface EstopInterlockResult {
  isSafe: boolean;
  contactorIsolated: boolean;
  responseTimeMs: number;
  hazardCode?: string;
}

export function auditEmergencyStopDisarm(
  estopDepressed: boolean,
  contactorState: "OPEN" | "CLOSED",
  timeSinceTriggerMs: number
): EstopInterlockResult {
  if (!estopDepressed) {
    return { isSafe: true, contactorIsolated: contactorState === "OPEN", responseTimeMs: 0 };
  }

  // When E-Stop is triggered, contactor MUST open within 50ms
  const contactorIsolated = contactorState === "OPEN";
  const withinSafetyTime = timeSinceTriggerMs <= 50;
  const isSafe = contactorIsolated && withinSafetyTime;

  let hazardCode: string | undefined = undefined;
  if (!contactorIsolated) {
    hazardCode = "CRITICAL_CONTACTOR_WELDED_UNDER_ESTOP";
  } else if (!withinSafetyTime) {
    hazardCode = "WARNING_SLUGGISH_CONTACTOR_OPEN_TIME";
  }

  return {
    isSafe,
    contactorIsolated,
    responseTimeMs: timeSinceTriggerMs,
    hazardCode,
  };
}
