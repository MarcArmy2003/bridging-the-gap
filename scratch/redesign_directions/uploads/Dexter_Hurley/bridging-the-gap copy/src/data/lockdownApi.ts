import { UserRole } from "../models/types";

export type LockdownReasonCategory =
  | "Potential safety concern"
  | "Report of a threat (no weapon found)"
  | "Suspicious activity"
  | "Medical emergency"
  | "Law enforcement activity near campus"
  | "Precautionary lockdown";

export type LockdownPhase = "during" | "after";

export interface LockdownNotification {
  id: string;
  title: string;
  body: string;
  phase: LockdownPhase;
  createdAt: string;
  reasonCategory?: LockdownReasonCategory;
}

export interface LockdownStatus {
  active: boolean;
  startedAt?: string;
  endedAt?: string;
  reasonCategory?: LockdownReasonCategory;
  initiatedBy?: UserRole;
  endedBy?: UserRole;
}

const notifications: LockdownNotification[] = [];

let status: LockdownStatus = {
  active: false,
};

const delay = async <T>(value: T, ms = 200): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
};

const duringTitle = "🚨 School Safety Update";
const duringBody =
  "The school is currently in a lockdown as a precaution.\n" +
  "Students and staff are following safety procedures.\n" +
  "Please do not come to campus at this time.\n" +
  "We will share updates when it is safe to do so.";

const afterTitle = "✅ Lockdown Lifted — Update";
const buildAfterBody = (category: LockdownReasonCategory) =>
  "The lockdown has been lifted, and all students and staff are safe.\n" +
  "The lockdown was initiated due to:\n" +
  `${category}\n` +
  "School staff and the School Resource Officer responded according to " +
  "district safety procedures.\n" +
  "If additional follow-up is needed, families will be contacted directly.";

const ensureAuthorized = (actorRole: UserRole) => {
  if (actorRole !== "law" && actorRole !== "admin") {
    throw new Error("Unauthorized lockdown action");
  }
};

export const lockdownApi = {
  async getStatus(): Promise<LockdownStatus> {
    return delay({ ...status });
  },

  async getNotifications(): Promise<LockdownNotification[]> {
    return delay([...notifications]);
  },

  async startLockdown(actorRole: UserRole): Promise<LockdownStatus> {
    ensureAuthorized(actorRole);
    if (status.active) {
      return delay({ ...status });
    }
    status = {
      active: true,
      startedAt: new Date().toISOString(),
      initiatedBy: actorRole,
    };
    notifications.unshift({
      id: `LOCK-${Date.now()}`,
      title: duringTitle,
      body: duringBody,
      phase: "during",
      createdAt: new Date().toISOString(),
    });
    return delay({ ...status });
  },

  async endLockdown(
    actorRole: UserRole,
    reasonCategory: LockdownReasonCategory
  ): Promise<LockdownStatus> {
    ensureAuthorized(actorRole);
    if (!status.active) {
      return delay({ ...status });
    }
    status = {
      active: false,
      startedAt: status.startedAt,
      endedAt: new Date().toISOString(),
      reasonCategory,
      initiatedBy: status.initiatedBy,
      endedBy: actorRole,
    };
    notifications.unshift({
      id: `LOCK-${Date.now()}`,
      title: afterTitle,
      body: buildAfterBody(reasonCategory),
      phase: "after",
      reasonCategory,
      createdAt: new Date().toISOString(),
    });
    return delay({ ...status });
  },
};
