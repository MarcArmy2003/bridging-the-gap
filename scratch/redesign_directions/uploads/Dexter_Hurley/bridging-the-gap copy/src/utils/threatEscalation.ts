import {
  ThreatReport,
  ThreatSeverity,
  EscalationEvent,
} from "../models/types";

/**
 * Threat Escalation Engine
 * 
 * PRINCIPLE: System-driven, transparent escalation rules
 * NOT: Manual discretion or subjective judgment
 * 
 * Critical + High threats bypass counselor workflow
 * SRO gets immediate alert with full case details
 */

export interface EscalationAction {
  escalateToSRO: boolean;
  escalateToLawEnforcement: boolean;
  escalateToAdmin: boolean;
  notifyCounselor: boolean;
  immediateNotification: boolean; // vs. next business day
  allowStudentAccessToReport: boolean;
  allowParentAccessToReport: boolean;
}

/**
 * Determine escalation routing based on severity
 */
export function getEscalationAction(
  severity: ThreatSeverity
): EscalationAction {
  const escalations: Record<ThreatSeverity, EscalationAction> = {
    // CRITICAL: SRO + Law Enforcement, bypass all others
    [ThreatSeverity.Critical]: {
      escalateToSRO: true,
      escalateToLawEnforcement: true,
      escalateToAdmin: true,
      notifyCounselor: false, // NOT first responder
      immediateNotification: true,
      allowStudentAccessToReport: false,
      allowParentAccessToReport: false,
    },

    // HIGH: SRO immediate, counselor aware, no LEO
    [ThreatSeverity.High]: {
      escalateToSRO: true,
      escalateToLawEnforcement: false,
      escalateToAdmin: true,
      notifyCounselor: true, // After SRO is notified
      immediateNotification: true,
      allowStudentAccessToReport: false,
      allowParentAccessToReport: false,
    },

    // MODERATE: Counselor workflow (NO SRO bypass)
    [ThreatSeverity.Moderate]: {
      escalateToSRO: false,
      escalateToLawEnforcement: false,
      escalateToAdmin: false,
      notifyCounselor: true,
      immediateNotification: false, // Can wait until next business day
      allowStudentAccessToReport: true,
      allowParentAccessToReport: false,
    },
  };

  return escalations[severity];
}

/**
 * Create escalation events for audit trail
 */
export function createEscalationEvents(
  threatReportId: string,
  severity: ThreatSeverity,
  actorId: string,
  actorRole: string
): EscalationEvent[] {
  const now = new Date().toISOString();
  const action = getEscalationAction(severity);
  const events: EscalationEvent[] = [
    {
      id: `escalation-${Date.now()}`,
      action: "escalated_to_sro",
      actorId,
      actorRole,
      timestamp: now,
      details: `Escalated based on ${severity} severity classification`,
    },
  ];

  if (action.escalateToLawEnforcement) {
    events.push({
      id: `escalation-leo-${Date.now()}`,
      action: "escalated_to_sro",
      actorId,
      actorRole,
      timestamp: now,
      details: "Law enforcement notification required (Critical threat)",
    });
  }

  return events;
}

/**
 * SRO Portal Access Rules
 * Only SROs can see threat reports; no other roles
 */
export function canAccessThreatReport(
  userRole: "student" | "teacher" | "counselor" | "admin" | "sro",
  severity: ThreatSeverity
): boolean {
  // Only SRO and admin can access threat reports
  if (userRole === "sro") return true;
  if (userRole === "admin") return true; // Admin oversight

  // No one else can access
  return false;
}

/**
 * Notification content builder (safe, no student names)
 */
export function buildSRONotification(threatReport: ThreatReport): string {
  const lines = [
    `URGENT: Threat Report [${threatReport.id.substring(0, 8)}]`,
    `Severity: ${threatReport.severity.toUpperCase()}`,
    `Reported: ${new Date(threatReport.createdAt).toLocaleString()}`,
    ``,
    `Concern Type: ${threatReport.concern}`,
    `Location: ${threatReport.location}`,
    `Timing: ${threatReport.timing}`,
    `Source: ${threatReport.reporterRole}`,
    `Anonymous: ${threatReport.anonymous ? "Yes" : "No"}`,
    ``,
    `ADDITIONAL DETAILS:`,
    threatReport.details || "(none provided)",
    ``,
    `ACTION REQUIRED:`,
    `Review immediately in SRO Portal`,
    `Do not delay pending counselor review`,
    `Follow critical threat protocol if applicable`,
  ];

  return lines.join("\n");
}

/**
 * Calculate notification urgency (for routing)
 */
export function getNotificationUrgency(
  severity: ThreatSeverity
): "immediate" | "urgent" | "standard" {
  if (severity === ThreatSeverity.Critical) return "immediate";
  if (severity === ThreatSeverity.High) return "urgent";
  return "standard";
}

/**
 * Validate escalation was completed
 */
export interface EscalationValidation {
  isValid: boolean;
  missingSteps: string[];
}

export function validateEscalationComplete(
  threatReport: ThreatReport
): EscalationValidation {
  const missingSteps: string[] = [];

  if (threatReport.severity === ThreatSeverity.Critical) {
    if (!threatReport.escalatedToSro) {
      missingSteps.push("Critical threat not escalated to SRO");
    }
    if (!threatReport.escalatedAt) {
      missingSteps.push("Escalation timestamp not recorded");
    }
  }

  if (threatReport.severity === ThreatSeverity.High) {
    if (!threatReport.escalatedToSro) {
      missingSteps.push("High-priority threat not escalated to SRO");
    }
  }

  return {
    isValid: missingSteps.length === 0,
    missingSteps,
  };
}
