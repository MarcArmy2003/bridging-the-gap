interface SupportCheckIn {
  id: string;
  studentId: string;
  mood: string;
  studentName?: string;
  topics: string[];
  desiredAction: string;
  skipped?: boolean;
  skipReason?: string;
  suggestedSeverity?: "low" | "medium" | "high";
  safetyConcernType?: string;
  unsafeIndicator?: string;
  details?: string;
  reportSource?: "self" | "peer";
  friendConcern?: string;
  friendConcernDetail?: string;
  contactOk?: boolean;
  createdAt: string;
}

interface SupportRequest {
  id: string;
  studentId: string;
  type: "bullying_support" | "wellbeing" | "food_help";
  bestTime?: string;
  note?: string;
  createdAt: string;
}

interface SafetyPlanNote {
  id: string;
  studentId: string;
  note: string;
  createdAt: string;
}

interface SavedResource {
  id: string;
  studentId: string;
  resourceId: string;
  createdAt: string;
}

interface ResourceClick {
  id: string;
  resourceId: string;
  createdAt: string;
}

const checkIns: SupportCheckIn[] = [];
const supportRequests: SupportRequest[] = [];
const safetyPlanNotes: SafetyPlanNote[] = [];
const savedResources: SavedResource[] = [];
const resourceClicks: ResourceClick[] = [];

const delay = async <T>(value: T, ms = 300): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
};

export const supportApi = {
  async createCheckIn(input: Omit<SupportCheckIn, "id" | "createdAt">) {
    const entry: SupportCheckIn = {
      id: `SUP-CK-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    checkIns.unshift(entry);
    return delay(entry);
  },

  async getCheckInsForStudent(studentId: string) {
    return delay(checkIns.filter((entry) => entry.studentId === studentId));
  },

  async getAllCheckIns() {
    return delay([...checkIns]);
  },

  async createSupportRequest(input: Omit<SupportRequest, "id" | "createdAt">) {
    const entry: SupportRequest = {
      id: `SUP-REQ-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    supportRequests.unshift(entry);
    return delay(entry);
  },

  async saveSafetyPlanNote(input: Omit<SafetyPlanNote, "id" | "createdAt">) {
    const entry: SafetyPlanNote = {
      id: `SUP-SAFE-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    safetyPlanNotes.unshift(entry);
    return delay(entry);
  },

  async saveResource(input: Omit<SavedResource, "id" | "createdAt">) {
    const entry: SavedResource = {
      id: `SUP-RES-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    savedResources.unshift(entry);
    return delay(entry);
  },

  async logResourceClick(resourceId: string) {
    const entry: ResourceClick = {
      id: `SUP-CLICK-${Date.now()}`,
      resourceId,
      createdAt: new Date().toISOString(),
    };
    resourceClicks.unshift(entry);
    return delay(entry);
  },
};
