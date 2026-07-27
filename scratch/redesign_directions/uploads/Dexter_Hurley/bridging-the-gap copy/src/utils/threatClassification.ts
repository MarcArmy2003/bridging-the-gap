import {
  ThreatConcern,
  ThreatTiming,
  ThreatSeverity,
  ThreatReport,
} from "../models/types";

/**
 * Rules-Based Threat Severity Classification
 * 
 * This is NOT AI-powered detection. It's transparent, auditable logic.
 * Rules can be explained to boards, parents, and legal teams.
 * 
 * PRINCIPLE: Weapon mention + immediate timing = highest priority
 */

export interface ClassificationResult {
  severity: ThreatSeverity;
  reason: string;
  requiresImmediateSRO: boolean;
  requiresLawEnforcement: boolean;
}

const THREAT_CLASSIFICATION_RULES = {
  // Rule 1: Weapon + Happening NOW = CRITICAL
  // Examples: "There's a gun in the parking lot right now"
  // Action: SRO + Law Enforcement instant alert
  [ThreatSeverity.Critical]: {
    conditions: [
      {
        concern: ThreatConcern.PossibleWeapon,
        timing: ThreatTiming.Happening,
      },
    ],
    requiresImmediateSRO: true,
    requiresLawEnforcement: true,
    reason:
      "Possible weapon + happening now = Critical. Immediate SRO and law enforcement notification required.",
  },

  // Rule 2: Weapon + Timing Unclear = HIGH
  // Examples: "Someone told me there's a gun at school" (but when?)
  // Action: SRO alert + escalation
  [ThreatSeverity.High]: {
    conditions: [
      {
        concern: ThreatConcern.PossibleWeapon,
        timing: ThreatTiming.Unclear,
      },
      {
        concern: ThreatConcern.ThreatMade,
        timing: ThreatTiming.Happening,
      },
      {
        concern: ThreatConcern.ThreatMade,
        timing: ThreatTiming.Unclear,
      },
    ],
    requiresImmediateSRO: true,
    requiresLawEnforcement: false,
    reason: "Threat or weapon concern with timing unclear. SRO notification required.",
  },

  // Rule 3: Concerning behavior or statement (no weapon mention) = MODERATE
  // Examples: "Someone said something weird", "Saw suspicious behavior"
  // Action: Counselor + monitoring workflow
  [ThreatSeverity.Moderate]: {
    conditions: [
      {
        concern: ThreatConcern.SuspiciousBehavior,
      },
      {
        concern: ThreatConcern.ConcerningStatement,
      },
    ],
    requiresImmediateSRO: false,
    requiresLawEnforcement: false,
    reason:
      "Concerning behavior or statement reported. Counselor assessment workflow initiated.",
  },
};

/**
 * Classify a threat intake based on structured answers
 * Returns clear, auditable reasoning
 */
export function classifyThreatSeverity(
  concern: ThreatConcern,
  timing: ThreatTiming
): ClassificationResult {
  // Check CRITICAL first (highest priority)
  const critical = THREAT_CLASSIFICATION_RULES[ThreatSeverity.Critical];
  if (
    critical.conditions.some(
      (c) => c.concern === concern && c.timing === timing
    )
  ) {
    return {
      severity: ThreatSeverity.Critical,
      reason: critical.reason,
      requiresImmediateSRO: true,
      requiresLawEnforcement: true,
    };
  }

  // Check HIGH severity
  const high = THREAT_CLASSIFICATION_RULES[ThreatSeverity.High];
  if (
    high.conditions.some(
      (c) =>
        c.concern === concern &&
        (!c.timing || c.timing === timing)
    )
  ) {
    return {
      severity: ThreatSeverity.High,
      reason: high.reason,
      requiresImmediateSRO: true,
      requiresLawEnforcement: false,
    };
  }

  // Default to MODERATE
  const moderate = THREAT_CLASSIFICATION_RULES[ThreatSeverity.Moderate];
  return {
    severity: ThreatSeverity.Moderate,
    reason: moderate.reason,
    requiresImmediateSRO: false,
    requiresLawEnforcement: false,
  };
}

/**
 * Get human-readable severity label
 */
export function getSeverityLabel(severity: ThreatSeverity): string {
  const labels: Record<ThreatSeverity, string> = {
    [ThreatSeverity.Critical]: "🔴 Critical — Immediate Action",
    [ThreatSeverity.High]: "🟠 High Priority",
    [ThreatSeverity.Moderate]: "🟡 Moderate — Counselor Review",
  };
  return labels[severity];
}

/**
 * Get action instructions based on severity
 */
export function getActionInstructions(severity: ThreatSeverity): string[] {
  const instructions: Record<ThreatSeverity, string[]> = {
    [ThreatSeverity.Critical]: [
      "🚨 This is a critical threat requiring immediate action.",
      "The School Resource Officer (SRO) has been notified automatically.",
      "Law enforcement may be contacted per protocol.",
      "Do not approach or confront anyone involved.",
      "Follow your building's emergency procedures.",
      "Stay available for follow-up questions.",
    ],
    [ThreatSeverity.High]: [
      "This is a high-priority threat requiring immediate SRO review.",
      "The School Resource Officer (SRO) has been notified automatically.",
      "The SRO will assess and take appropriate action.",
      "A counselor will also be notified for coordination.",
      "You may be asked follow-up questions.",
      "Do not share details with other students.",
    ],
    [ThreatSeverity.Moderate]: [
      "This concern will be reviewed by a school counselor.",
      "A trained professional will assess and follow up appropriately.",
      "You will be contacted with next steps if needed.",
      "Confidentiality will be maintained throughout the process.",
      "All reports are taken seriously, even if not immediately critical.",
    ],
  };
  return instructions[severity];
}

/**
 * Generate audit log entry for classification decision
 */
export function generateClassificationAuditLog(
  threatReportId: string,
  classification: ClassificationResult,
  actorId: string
): object {
  return {
    action: "classified",
    threatReportId,
    severity: classification.severity,
    reason: classification.reason,
    requiresImmediateSRO: classification.requiresImmediateSRO,
    requiresLawEnforcement: classification.requiresLawEnforcement,
    actorId,
    timestamp: new Date().toISOString(),
  };
}
