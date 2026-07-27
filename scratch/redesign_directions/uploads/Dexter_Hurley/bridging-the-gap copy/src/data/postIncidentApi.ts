import {
  PostIncidentCheckIn,
  PostIncidentPlan,
  StaffDebriefItem,
} from "../models/types";

const plans: Record<string, PostIncidentPlan> = {};

const delay = async <T>(value: T, ms = 220): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const buildDefaultChecklist = (): StaffDebriefItem[] => [
  { id: `DEBRIEF-${Date.now()}-1`, label: "Confirm student safety plan", completed: false },
  { id: `DEBRIEF-${Date.now()}-2`, label: "Notify guardian of next steps", completed: false },
  { id: `DEBRIEF-${Date.now()}-3`, label: "Document support resources shared", completed: false },
  { id: `DEBRIEF-${Date.now()}-4`, label: "Schedule follow-up check-in", completed: false },
];

const buildDefaultFollowUps = (caseId: string): PostIncidentCheckIn[] => {
  const now = Date.now();
  return [
    {
      id: `FOLLOW-${caseId}-S`,
      caseId,
      recipientType: "student",
      message: "Checking in to see how you're doing after the report.",
      scheduledFor: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
    },
    {
      id: `FOLLOW-${caseId}-G`,
      caseId,
      recipientType: "guardian",
      message: "Your school team will follow up within the next few days.",
      scheduledFor: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
    },
  ];
};

const ensurePlan = (caseId: string): PostIncidentPlan => {
  if (!plans[caseId]) {
    plans[caseId] = {
      caseId,
      status: "draft",
      followUps: buildDefaultFollowUps(caseId),
      debriefChecklist: buildDefaultChecklist(),
      updatedAt: new Date().toISOString(),
    };
  }
  return plans[caseId];
};

export const postIncidentApi = {
  async getPlan(caseId: string): Promise<PostIncidentPlan> {
    return delay(ensurePlan(caseId));
  },

  async updateNotes(caseId: string, notes: string) {
    const plan = ensurePlan(caseId);
    plan.notes = notes.trim() || undefined;
    plan.updatedAt = new Date().toISOString();
    return delay(plan);
  },

  async activatePlan(caseId: string) {
    const plan = ensurePlan(caseId);
    plan.status = "active";
    plan.updatedAt = new Date().toISOString();
    return delay(plan);
  },

  async completePlan(caseId: string) {
    const plan = ensurePlan(caseId);
    plan.status = "completed";
    plan.updatedAt = new Date().toISOString();
    return delay(plan);
  },

  async toggleDebriefItem(caseId: string, itemId: string) {
    const plan = ensurePlan(caseId);
    plan.debriefChecklist = plan.debriefChecklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    plan.updatedAt = new Date().toISOString();
    return delay(plan);
  },

  async scheduleCheckIn(
    caseId: string,
    checkIn: Omit<PostIncidentCheckIn, "id" | "status" | "caseId">
  ) {
    const plan = ensurePlan(caseId);
    const next: PostIncidentCheckIn = {
      id: `FOLLOW-${Date.now()}`,
      caseId,
      status: "scheduled",
      ...checkIn,
    };
    plan.followUps.push(next);
    plan.updatedAt = new Date().toISOString();
    return delay(plan);
  },

  async markCheckInComplete(caseId: string, checkInId: string) {
    const plan = ensurePlan(caseId);
    plan.followUps = plan.followUps.map((item) =>
      item.id === checkInId
        ? { ...item, status: "completed", completedAt: new Date().toISOString() }
        : item
    );
    plan.updatedAt = new Date().toISOString();
    return delay(plan);
  },
};
