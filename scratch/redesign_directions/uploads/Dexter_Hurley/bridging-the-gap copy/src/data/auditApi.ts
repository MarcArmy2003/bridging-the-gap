import { AuditEventInput, AuditEventRecord } from "./apiTypes";

const auditEvents: AuditEventRecord[] = [];

const delay = async <T>(value: T, ms = 200): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
};

export const auditApi = {
  async logAuditEvent(event: AuditEventInput): Promise<AuditEventRecord> {
    // TODO: Replace with Supabase insert into audit_logs.
    const record: AuditEventRecord = {
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    auditEvents.unshift(record);
    return delay(record);
  },

  async getAuditEventsForCase(caseId: string): Promise<AuditEventRecord[]> {
    // TODO: Replace with Supabase select filtered by caseId.
    return delay(auditEvents.filter((item) => item.caseId === caseId));
  },
};
