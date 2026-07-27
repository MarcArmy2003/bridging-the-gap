import { AccessLogEntry, RetentionPolicy } from "../models/types";

const accessLogs: AccessLogEntry[] = [];
let retentionPolicy: RetentionPolicy = {
  caseRetentionDays: 365,
  auditRetentionDays: 365,
  accessLogRetentionDays: 180,
  updatedAt: new Date().toISOString(),
};

const delay = async <T>(value: T, ms = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const complianceApi = {
  async logAccess(entry: Omit<AccessLogEntry, "id" | "timestamp">) {
    accessLogs.unshift({
      id: `ACCESS-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry,
    });
    return delay(undefined);
  },

  async getAccessLogs(caseId?: string): Promise<AccessLogEntry[]> {
    if (!caseId) {
      return delay([...accessLogs]);
    }
    return delay(accessLogs.filter((item) => item.caseId === caseId));
  },

  async getRetentionPolicy(): Promise<RetentionPolicy> {
    return delay({ ...retentionPolicy });
  },

  async updateRetentionPolicy(next: Partial<RetentionPolicy>) {
    retentionPolicy = {
      ...retentionPolicy,
      ...next,
      updatedAt: new Date().toISOString(),
    };
    return delay({ ...retentionPolicy });
  },
};
