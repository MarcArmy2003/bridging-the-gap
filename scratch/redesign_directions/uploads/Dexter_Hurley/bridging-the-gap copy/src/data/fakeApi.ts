import {
  AuditLogEntry,
  Case,
  CaseEvent,
  CaseNote,
  CaseSeverity,
  CaseStatus,
  GuardianCaseView,
  StaffCapacitySetting,
  UserRole,
} from "../models/types";
import { auditApi } from "./auditApi";
import { CaseCreateInput } from "./apiTypes";

// Replace this module with a Supabase client later without touching UI code.
interface CaseRecord extends Case {
  studentName: string;
  guardianId: string;
  childName: string;
}

interface EmergencyReportInput {
  source: "student" | "teacher";
  threatType: string;
  location?: string;
  details?: string;
  scope?: string;
  studentName?: string;
  guardianId?: string;
}

const cases: CaseRecord[] = [
  {
    id: "CASE-1001",
    incidentType: "bullying",
    narrative:
      "Repeated name-calling in the hallway after lunch. Occurs near the science wing.",
    severity: "medium",
    status: CaseStatus.InReview,
    ownerType: "teacher",
    assignedToRole: "teacher",
    lastTouchedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    safetyConcernType: "Ongoing peer conflict",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    studentName: "Jordan Lee",
    guardianId: "GUARD-1",
    childName: "Jordan Lee",
  },
  {
    id: "CASE-1002",
    incidentType: "hazing",
    narrative:
      "New team members asked to perform embarrassing tasks during practice.",
    severity: "high",
    status: CaseStatus.ActionRequired,
    ownerType: "teacher",
    assignedToRole: "teacher",
    lastTouchedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    safetyConcernType: "Threat mentioned by student",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    studentName: "Avery Patel",
    guardianId: "GUARD-2",
    childName: "Avery Patel",
  },
];

const auditLog: AuditLogEntry[] = [];
interface CaseNoteRecord extends CaseNote {
  caseId: string;
}

const caseNotes: CaseNoteRecord[] = [];
interface CaseEventRecord extends CaseEvent {
  caseId: string;
}

const caseEvents: CaseEventRecord[] = [];
interface CaseMessageRecord {
  id: string;
  caseId: string;
  senderId: string;
  senderRole: "counselor" | "parent" | "teacher";
  recipientRole: "counselor" | "parent" | "teacher";
  body: string;
  createdAt: string;
}

const caseMessages: CaseMessageRecord[] = [];
const staffCapacitySettings: StaffCapacitySetting[] = [
  {
    id: "CAP-TEACHER",
    role: "teacher",
    softCaseCap: 8,
    softCheckInCap: 6,
    softMessageCap: 10,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "CAP-COUNSELOR",
    role: "counselor",
    softCaseCap: 6,
    softCheckInCap: 8,
    softMessageCap: 12,
    updatedAt: new Date().toISOString(),
  },
];

const delay = async <T>(value: T, ms = 300): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
};

const redactNarrative = (narrative: string): string => {
  const words = narrative.split(" ");
  if (words.length <= 6) {
    return "Details withheld for confidentiality.";
  }
  return `${words.slice(0, 6).join(" ")}... [redacted]`;
};

const logAction = (caseId: string, action: string, actorRole: UserRole) => {
  auditLog.unshift({
    id: `LOG-${Date.now()}`,
    caseId,
    action,
    actorRole,
    timestamp: new Date().toISOString(),
  });
};

const logSeverityChange = async (
  caseId: string,
  previous: CaseSeverity,
  next: CaseSeverity,
  actorRole: UserRole,
  note?: string
) => {
  logAction(
    caseId,
    `Severity changed from ${previous} to ${next}${note ? `: ${note}` : ""}`,
    actorRole
  );
  await auditApi.logAuditEvent({
    caseId,
    actorRole,
    action: `severity_changed:${previous}->${next}`,
  });
  if (next === "high") {
    await auditApi.logAuditEvent({
      caseId,
      actorRole,
      action: "severity_escalated:high",
    });
  }
};

const buildEmergencyNote = (input: EmergencyReportInput) => {
  const parts = [];
  if (input.location) {
    parts.push(`Location: ${input.location}`);
  }
  if (input.details) {
    parts.push(input.details.trim());
  }
  return parts.length ? parts.join(" | ") : undefined;
};

export const fakeApi = {
  async createCase(input: CaseCreateInput): Promise<Case> {
    // TODO: Replace with Supabase insert into cases table.
    const newCase: CaseRecord = {
      id: `CASE-${1000 + cases.length + 1}`,
      incidentType: input.incidentType,
      narrative: input.narrative,
      severity: input.severity,
      status: CaseStatus.New,
      ownerType: "teacher",
      assignedToRole: "teacher",
      safetyConcernType: input.severity === "high" ? "Urgent review needed" : undefined,
      lastTouchedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      studentName: input.studentName,
      guardianId: input.guardianId,
      childName: input.studentName,
    };

    cases.unshift(newCase);
    logAction(newCase.id, "Case submitted confidentially", "student");
    await auditApi.logAuditEvent({
      caseId: newCase.id,
      actorRole: "student",
      action: "case_created",
    });
    logAction(
      newCase.id,
      `Severity assigned: ${input.severity}`,
      "student"
    );
    await auditApi.logAuditEvent({
      caseId: newCase.id,
      actorRole: "student",
      action: `severity_assigned:${input.severity}`,
    });

    return delay(newCase);
  },

  async createCaseAsStaff(
    input: CaseCreateInput,
    actorRole: UserRole
  ): Promise<Case> {
    const newCase: CaseRecord = {
      id: `CASE-${1000 + cases.length + 1}`,
      incidentType: input.incidentType,
      narrative: input.narrative,
      severity: input.severity,
      status: CaseStatus.New,
      ownerType: "teacher",
      assignedToRole: "teacher",
      safetyConcernType: input.severity === "high" ? "Urgent review needed" : undefined,
      lastTouchedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      studentName: input.studentName,
      guardianId: input.guardianId,
      childName: input.studentName,
    };

    cases.unshift(newCase);
    logAction(newCase.id, "Staff-assisted case submitted", actorRole);
    await auditApi.logAuditEvent({
      caseId: newCase.id,
      actorRole,
      action: "staff_assisted_entry",
    });
    await auditApi.logAuditEvent({
      caseId: newCase.id,
      actorRole,
      action: `severity_assigned:${input.severity}`,
    });

    return delay(newCase);
  },

  async createEmergencyReport(
    input: EmergencyReportInput,
    actorRole: UserRole
  ): Promise<Case> {
    const studentName = input.studentName || "Student (emergency)";
    const guardianId = input.guardianId || "GUARD-UNKNOWN";
    const emergencyNote = buildEmergencyNote(input);
    const newCase: CaseRecord = {
      id: `CASE-${1000 + cases.length + 1}`,
      incidentType: "safety",
      narrative: `Emergency report: ${input.threatType}`,
      severity: "high",
      status: CaseStatus.ActionRequired,
      reportSource: input.source,
      directToSro: true,
      emergencyType: input.threatType,
      emergencyLocation: input.location,
      emergencyScope: input.scope,
      safetyConcernType: input.scope || "Immediate safety concern",
      sharedWithSro: true,
      sroShareReason: input.threatType,
      sroShareNote: emergencyNote,
      sroSharedAt: new Date().toISOString(),
      autoRoutedToSro: true,
      autoRoutedReason: input.threatType,
      assignedToRole: "teacher",
      lastTouchedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      studentName,
      guardianId,
      childName: studentName,
    };

    cases.unshift(newCase);
    logAction(
      newCase.id,
      "Emergency report routed directly to SRO",
      actorRole
    );
    await auditApi.logAuditEvent({
      caseId: newCase.id,
      actorRole,
      action:
        input.source === "student"
          ? "student_emergency_reported"
          : "teacher_emergency_reported",
    });
    await auditApi.logAuditEvent({
      caseId: newCase.id,
      actorRole,
      action: "routed_to_sro_direct",
    });
    await auditApi.logAuditEvent({
      caseId: newCase.id,
      actorRole,
      action: "bypass:teacher,counselor",
    });

    return delay(newCase);
  },

  async getCases(): Promise<CaseRecord[]> {
    // TODO: Replace with Supabase select from cases table.
    return delay([...cases]);
  },

  async getCaseById(caseId: string): Promise<CaseRecord | null> {
    const target = cases.find((item) => item.id === caseId);
    return delay(target ? { ...target } : null);
  },

  async touchCase(caseId: string, actorRole: UserRole, action = "viewed") {
    const target = cases.find((item) => item.id === caseId);
    if (!target) {
      return delay(null);
    }
    target.lastTouchedAt = new Date().toISOString();
    await auditApi.logAuditEvent({
      caseId,
      actorRole,
      action: `case_${action}`,
    });
    return delay({ ...target });
  },

  async getCapacitySettings(): Promise<StaffCapacitySetting[]> {
    return delay([...staffCapacitySettings]);
  },

  async updateCapacitySetting(role: StaffCapacitySetting["role"], updates: Partial<StaffCapacitySetting>) {
    const target = staffCapacitySettings.find((item) => item.role === role);
    if (!target) {
      return delay(null);
    }
    Object.assign(target, updates, { updatedAt: new Date().toISOString() });
    return delay({ ...target });
  },

  async reassignCase(caseId: string, role: "teacher" | "counselor", name?: string) {
    const target = cases.find((item) => item.id === caseId);
    if (!target) {
      return delay(null);
    }
    target.assignedToRole = role;
    target.assignedToName = name;
    target.ownerType = role;
    target.lastUpdatedAt = new Date().toISOString();
    target.lastTouchedAt = new Date().toISOString();
    logAction(caseId, `Case reassigned to ${role}`, "admin");
    return delay({ ...target });
  },

  async getStalledCases(hours = 72): Promise<CaseRecord[]> {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return delay(
      cases.filter((item) => {
        if (
          item.status === CaseStatus.Resolved ||
          item.status === CaseStatus.Archived
        ) {
          return false;
        }
        const touched = item.lastTouchedAt || item.createdAt;
        return new Date(touched).getTime() < cutoff;
      })
    );
  },

  async updateCaseStatus(
    caseId: string,
    status: CaseStatus,
    actorRole: UserRole,
    actorName?: string
  ) {
    // TODO: Replace with Supabase update on cases table.
    const target = cases.find((item) => item.id === caseId);
    if (!target) {
      return delay(null);
    }
    const previousStatus = target.status;
    target.status = status;
    target.lastUpdatedAt = new Date().toISOString();
    target.lastTouchedAt = new Date().toISOString();
    logAction(caseId, `Status changed to ${status}`, actorRole);
    caseEvents.unshift({
      id: `EVENT-${Date.now()}`,
      caseId,
      type: "status_change",
      actorName: actorName || actorRole,
      fromStatus: previousStatus,
      toStatus: status,
      createdAt: new Date().toISOString(),
    });
    await auditApi.logAuditEvent({
      caseId,
      actorRole,
      action: "status_changed",
    });
    return delay({ ...target });
  },

  async updateSupportPlan(caseId: string, supportPlanType: string, ownerName?: string) {
    const target = cases.find((item) => item.id === caseId);
    if (!target) {
      return delay(null);
    }
    target.supportPlanType = supportPlanType as any;
    target.supportPlanUpdatedAt = new Date().toISOString();
    target.supportPlanOwnerName = ownerName ?? "Demo";
    target.lastUpdatedAt = new Date().toISOString();
    target.lastTouchedAt = new Date().toISOString();
    caseEvents.unshift({
      id: `EVENT-${Date.now()}`,
      caseId,
      type: "status_change",
      actorName: ownerName ?? "Demo",
      fromStatus: target.status,
      toStatus: target.status,
      createdAt: new Date().toISOString(),
    });
    await auditApi.logAuditEvent({
      caseId,
      actorRole: "educator",
      action: `support_plan_set:${supportPlanType}`,
    });
    return delay({ ...target });
  },

  // viewerRole: 'counselor' | 'parent' | 'teacher' determines which messages are visible
  async getCaseMessages(caseId: string, viewerRole?: "counselor" | "parent" | "teacher") {
    const all = caseMessages.filter((m) => m.caseId === caseId);
    if (!viewerRole || viewerRole === "counselor") {
      return delay(all.map((m) => ({ ...m })));
    }
    // Parent/Teacher visibility rules:
    // Parent sees messages where sender_role = 'parent' OR recipient_role = 'parent'
    // Teacher sees messages where sender_role = 'teacher' OR recipient_role = 'teacher'
    const filtered = all.filter((m) => m.senderRole === viewerRole || m.recipientRole === viewerRole);
    return delay(filtered.map((m) => ({ ...m })));
  },

  // recipientRole must be provided to indicate whether the message targets 'parent' or 'teacher' (or 'counselor')
  async sendMessage(
    caseId: string,
    senderId: string,
    senderRole: CaseMessageRecord["senderRole"],
    body: string,
    recipientRole: CaseMessageRecord["recipientRole"]
  ) {
    const msg: CaseMessageRecord = {
      id: `MSG-${Date.now()}`,
      caseId,
      senderId,
      senderRole,
      recipientRole,
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    caseMessages.push(msg);
    await auditApi.logAuditEvent({
      caseId,
      actorRole: senderRole === "counselor" ? "educator" : "guardian",
      action: `message_sent:to_${recipientRole}`,
    });
    return delay({ ...msg });
  },

  // Backwards-compatible wrapper matching the requested API surface
  async sendCaseMessage(
    caseId: string,
    senderRole: CaseMessageRecord["senderRole"],
    recipientRole: Exclude<CaseMessageRecord["recipientRole"], undefined>,
    body: string
  ) {
    // For demo purposes, senderId is synthetic when called this way
    const senderId = senderRole === "counselor" ? "DEMO-COUNSELOR" : `DEMO-${senderRole.toUpperCase()}`;
    return this.sendMessage(caseId, senderId, senderRole, body, recipientRole as any);
  },

  async getCaseNotes(caseId: string): Promise<CaseNote[]> {
    return delay(
      caseNotes
        .filter((note) => note.caseId === caseId)
        .map((note) => ({ ...note }))
    );
  },

  async addCaseNote(
    caseId: string,
    authorId: string,
    authorName: string,
    role: "educator" | "admin",
    content: string
  ): Promise<CaseNote> {
    const note: CaseNoteRecord = {
      id: `NOTE-${Date.now()}`,
      caseId,
      authorId,
      authorName,
      role,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    caseNotes.unshift(note);
    caseEvents.unshift({
      id: `EVENT-${Date.now()}`,
      caseId,
      type: "note_added",
      actorName: authorName,
      notePreview: content.trim().slice(0, 80),
      createdAt: new Date().toISOString(),
    });
    await auditApi.logAuditEvent({
      caseId,
      actorRole: role,
      action: "note_added",
    });
    return delay({ ...note });
  },

  async getCaseEvents(caseId: string): Promise<CaseEvent[]> {
    return delay(
      caseEvents
        .filter((event) => event.caseId === caseId)
        .map((event) => ({ ...event }))
    );
  },

  async updateCaseSeverity(
    caseId: string,
    severity: CaseSeverity,
    actorRole: UserRole,
    note?: string
  ) {
    const target = cases.find((item) => item.id === caseId);
    if (!target) {
      return delay(null);
    }
    const previous = target.severity;
    target.severity = severity;
    target.lastUpdatedAt = new Date().toISOString();
    target.lastTouchedAt = new Date().toISOString();
    await logSeverityChange(caseId, previous, severity, actorRole, note);
    return delay({ ...target });
  },

  async requestCounselorHandoff(
    caseId: string,
    actorRole: UserRole,
    note?: string
  ) {
    const target = cases.find((item) => item.id === caseId);
    if (!target) {
      return delay(null);
    }
    target.ownerType = "counselor";
    target.assignedToRole = "counselor";
    target.handoffNote = note?.trim() || undefined;
    target.handoffRequestedAt = new Date().toISOString();
    target.lastUpdatedAt = new Date().toISOString();
    target.lastTouchedAt = new Date().toISOString();
    logAction(caseId, "Handoff requested to counselor", actorRole);
    await auditApi.logAuditEvent({
      caseId,
      actorRole,
      action: "handoff_requested",
    });
    return delay({ ...target });
  },

  async shareCaseWithSro(
    caseId: string,
    actorRole: UserRole,
    reason: string,
    note?: string,
    autoRouted = false
  ) {
    const target = cases.find((item) => item.id === caseId);
    if (!target) {
      return delay(null);
    }
    target.sharedWithSro = true;
    target.sroShareReason = reason;
    target.sroShareNote = note?.trim() || undefined;
    target.sroSharedAt = new Date().toISOString();
    target.lastUpdatedAt = new Date().toISOString();
    target.lastTouchedAt = new Date().toISOString();
    if (autoRouted) {
      target.autoRoutedToSro = true;
      target.autoRoutedReason = reason;
    }
    logAction(caseId, "Shared with SRO", actorRole);
    await auditApi.logAuditEvent({
      caseId,
      actorRole,
      action: `sro_shared:${reason}`,
    });
    if (autoRouted) {
      await auditApi.logAuditEvent({
        caseId,
        actorRole,
        action: "auto_routed_to_sro",
      });
    }
    return delay({ ...target });
  },

  async getGuardianCases(guardianId: string): Promise<GuardianCaseView[]> {
    // TODO: Replace with Supabase select + redaction policy for guardians.
    const filtered = cases.filter((item) => item.guardianId === guardianId);
    // Redaction policy keeps guardians away from full narratives and identities.
    const redacted = filtered.map((item) => ({
      id: item.id,
      incidentType: item.incidentType,
      status: item.status,
      createdAt: item.createdAt,
      childName: item.childName,
      redactedNarrative: redactNarrative(item.narrative),
    }));
    return delay(redacted);
  },

  async getEscalatedCases(): Promise<CaseRecord[]> {
    // TODO: Replace with Supabase select filtered by escalated status.
    return delay(cases.filter((item) => item.sharedWithSro));
  },

  async getAuditLog(): Promise<AuditLogEntry[]> {
    // TODO: Replace with Supabase select from audit_logs table.
    return delay([...auditLog]);
  },
};
