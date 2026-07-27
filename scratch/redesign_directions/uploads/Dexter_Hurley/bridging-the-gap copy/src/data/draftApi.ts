import { Case, DocumentationDraft } from "../models/types";

const drafts: DocumentationDraft[] = [];

const delay = async <T>(value: T, ms = 180): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const buildSummary = (record: Case) =>
  `Case ${record.id} involves ${record.incidentType} with a ${record.severity} severity. Status is ${record.status}. Narrative summary: ${record.narrative}`;

const buildParentFollowUp = (record: Case) =>
  `Hello, we are reviewing a report submitted through Safe Voice related to your student. The case is currently ${record.status.replace(
    /_/g,
    " "
  )}. We will follow up with next steps and any resources available.`;

const buildAuditNote = (record: Case) =>
  `Draft prepared for case ${record.id}. Incident type: ${record.incidentType}. Severity: ${record.severity}. Current status: ${record.status}.`;

export const draftApi = {
  async generateDrafts(caseRecord: Case): Promise<DocumentationDraft[]> {
    const now = new Date().toISOString();
    const created: DocumentationDraft[] = [
      {
        id: `DRAFT-${Date.now()}-summary`,
        caseId: caseRecord.id,
        type: "summary",
        content: buildSummary(caseRecord),
        createdAt: now,
        approved: false,
      },
      {
        id: `DRAFT-${Date.now()}-parent`,
        caseId: caseRecord.id,
        type: "parent_follow_up",
        content: buildParentFollowUp(caseRecord),
        createdAt: now,
        approved: false,
      },
      {
        id: `DRAFT-${Date.now()}-audit`,
        caseId: caseRecord.id,
        type: "audit_note",
        content: buildAuditNote(caseRecord),
        createdAt: now,
        approved: false,
      },
    ];
    drafts.push(...created);
    return delay(created);
  },

  async getDraftsForCase(caseId: string): Promise<DocumentationDraft[]> {
    return delay(drafts.filter((item) => item.caseId === caseId));
  },

  async approveDraft(draftId: string) {
    const target = drafts.find((item) => item.id === draftId);
    if (target) {
      target.approved = true;
    }
    return delay(target ?? null);
  },
};
