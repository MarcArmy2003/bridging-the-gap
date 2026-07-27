import { IntegrityFlag } from "../models/types";

type SubmissionRecord = {
  userId: string;
  narrative: string;
  createdAt: string;
};

export type IntegrityEvaluation = {
  allowed: boolean;
  warnings: string[];
  flagged: boolean;
  flagReason?: string;
  severity?: IntegrityFlag["severity"];
};

const submissions: SubmissionRecord[] = [];
const flags: IntegrityFlag[] = [];

const delay = async <T>(value: T, ms = 180): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const withinWindow = (timestamp: string, windowMs: number) => {
  return Date.now() - new Date(timestamp).getTime() <= windowMs;
};

export const integrityApi = {
  async evaluateSubmission(userId: string, narrative: string): Promise<IntegrityEvaluation> {
    const warnings: string[] = [];
    const recentSubmissions = submissions.filter(
      (item) => item.userId === userId && withinWindow(item.createdAt, 60 * 60 * 1000)
    );

    if (recentSubmissions.length >= 4) {
      return delay({
        allowed: false,
        warnings: [
          "Reports are limited to prevent misuse. Please wait before submitting again.",
        ],
        flagged: true,
        flagReason: "High submission volume in a short period",
        severity: "high",
      });
    }

    if (recentSubmissions.length >= 2) {
      warnings.push(
        "You've submitted multiple reports recently. Please make sure each report is accurate."
      );
    }

    const recentNarrativeMatch = submissions.find(
      (item) =>
        item.userId === userId &&
        withinWindow(item.createdAt, 10 * 60 * 1000) &&
        item.narrative.trim().toLowerCase() === narrative.trim().toLowerCase()
    );

    if (recentNarrativeMatch) {
      return delay({
        allowed: true,
        warnings,
        flagged: true,
        flagReason: "Repeated narrative submitted within 10 minutes",
        severity: "medium",
      });
    }

    return delay({
      allowed: true,
      warnings,
      flagged: false,
    });
  },

  async recordSubmission(userId: string, narrative: string) {
    submissions.unshift({
      userId,
      narrative,
      createdAt: new Date().toISOString(),
    });
    return delay(undefined);
  },

  async logIntegrityFlag(caseId: string, reason: string, severity: IntegrityFlag["severity"]) {
    flags.unshift({
      id: `FLAG-${Date.now()}`,
      caseId,
      createdAt: new Date().toISOString(),
      reason,
      severity,
      resolved: false,
    });
    return delay(undefined);
  },

  async getFlags(): Promise<IntegrityFlag[]> {
    return delay([...flags]);
  },

  async resolveFlag(flagId: string) {
    const target = flags.find((item) => item.id === flagId);
    if (target) {
      target.resolved = true;
    }
    return delay(target ?? null);
  },
};
