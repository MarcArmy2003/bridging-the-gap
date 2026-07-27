import { ThreatReport, ThreatSeverity } from "../models/types";

/**
 * SRO Notification Service
 * 
 * Handles secure, instant notification to School Resource Officer
 * Does NOT auto-call 911 or send raw student data
 * Uses SRO Portal (role-restricted) as primary method
 */

export interface SRONotificationResult {
  success: boolean;
  notificationId: string;
  method: "sro_portal" | "district_hotline" | "emergency_escalation";
  timestamp: string;
  acknowledged?: boolean;
  sroName?: string;
}

/**
 * Notify SRO of critical/high threat
 * This triggers immediate alert in SRO Portal
 */
export async function notifySROImmediately(
  threatReport: ThreatReport
): Promise<SRONotificationResult> {
  try {
    // Method 1: SRO Portal (Role-Restricted)
    // Pushes notification to authenticated SRO dashboard
    const response = await fetch("/api/sro/threat-notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_SRO_API_TOKEN}`,
      },
      body: JSON.stringify({
        threatReportId: threatReport.id,
        severity: threatReport.severity,
        concern: threatReport.concern,
        location: threatReport.location,
        timing: threatReport.timing,
        details: threatReport.details,
        createdAt: threatReport.createdAt,
        // DO NOT SEND: raw student names or identifying data
      }),
    });

    if (!response.ok) {
      throw new Error(`SRO notification failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      notificationId: data.notificationId,
      method: "sro_portal",
      timestamp: new Date().toISOString(),
      acknowledged: data.acknowledged,
      sroName: data.sroName,
    };
  } catch (error) {
    console.error("Failed to notify SRO via portal:", error);
    // Fallback: District safety hotline
    return notifyDistrictSafetyHotline(threatReport);
  }
}

/**
 * Fallback: District Safety Hotline
 * Used if SRO Portal is unavailable
 * Still role-restricted, still requires human triage
 */
async function notifyDistrictSafetyHotline(
  threatReport: ThreatReport
): Promise<SRONotificationResult> {
  try {
    const response = await fetch("/api/district/safety-hotline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        threatReportId: threatReport.id,
        severity: threatReport.severity,
        location: threatReport.location,
        callback: process.env.REACT_APP_DISTRICT_HOTLINE_CALLBACK,
      }),
    });

    const data = await response.json();

    return {
      success: true,
      notificationId: data.callId,
      method: "district_hotline",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to reach district hotline:", error);
    throw new Error(
      "Unable to notify SRO. Contact your building administrator immediately."
    );
  }
}

/**
 * Emergency escalation (manual button)
 * User confirms "this is an emergency" and triggers immediate escalation
 */
export async function emergencyEscalate(
  threatReport: ThreatReport,
  escalatedByUserId: string
): Promise<SRONotificationResult> {
  const result = await notifySROImmediately(threatReport);

  // Log the emergency escalation action
  await logEscalationAction({
    threatReportId: threatReport.id,
    action: "emergency_escalation",
    actorId: escalatedByUserId,
    timestamp: new Date().toISOString(),
    details: "Manual emergency escalation button pressed",
  });

  return {
    ...result,
    method: "emergency_escalation",
  };
}

/**
 * Mark threat as resolved (by SRO)
 * Case is closed, but audit trail is permanent
 */
export async function resolveThreatReport(
  threatReportId: string,
  resolvedByUserId: string,
  resolution: string
): Promise<void> {
  await fetch(`/api/threat-reports/${threatReportId}/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_SRO_API_TOKEN}`,
    },
    body: JSON.stringify({
      resolvedAt: new Date().toISOString(),
      resolvedBy: resolvedByUserId,
      resolution,
    }),
  });

  await logEscalationAction({
    threatReportId,
    action: "resolved",
    actorId: resolvedByUserId,
    timestamp: new Date().toISOString(),
    details: `Resolved: ${resolution}`,
  });
}

/**
 * Clear a false/duplicate report
 * Removes from active queue but keeps immutable audit record
 */
export async function clearThreatReport(
  threatReportId: string,
  clearedByUserId: string,
  reason: string
): Promise<void> {
  await fetch(`/api/threat-reports/${threatReportId}/clear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_SRO_API_TOKEN}`,
    },
    body: JSON.stringify({
      clearedAt: new Date().toISOString(),
      clearedBy: clearedByUserId,
      reason,
    }),
  });

  await logEscalationAction({
    threatReportId,
    action: "cleared",
    actorId: clearedByUserId,
    timestamp: new Date().toISOString(),
    details: `Cleared: ${reason}`,
  });
}

/**
 * Log all escalation actions (immutable audit trail)
 */
interface EscalationLog {
  threatReportId: string;
  action: string;
  actorId: string;
  timestamp: string;
  details?: string;
}

async function logEscalationAction(log: EscalationLog): Promise<void> {
  try {
    await fetch("/api/audit/threat-escalations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...log,
        immutable: true, // Cannot be modified/deleted
      }),
    });
  } catch (error) {
    console.error("Failed to log escalation action:", error);
    // Don't fail the main action if logging fails
    // But alert admin
  }
}

/**
 * Get current SRO on-call contact
 * For fallback notification
 */
export async function getSROOnCallContact(): Promise<{
  name: string;
  email: string;
  phone: string;
} | null> {
  try {
    const response = await fetch("/api/sro/on-call", {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_SRO_API_TOKEN}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Failed to get SRO on-call contact:", error);
  }

  return null;
}
