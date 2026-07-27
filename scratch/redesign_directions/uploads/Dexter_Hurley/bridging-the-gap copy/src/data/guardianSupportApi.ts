import {
  GuardianCheckIn,
  GuardianCheckInResponse,
  GuardianCheckInStatus,
  GuardianSupportRequest,
  PromptSubmittedBy,
} from "../models/types";

interface PromptSuggestionInput {
  submittedBy: PromptSubmittedBy;
  category: string;
  promptText: string;
}

interface GuardianCheckInInput {
  guardianId: string;
  guardianName: string;
  responses: Record<string, GuardianCheckInResponse>;
  promptSuggestions?: PromptSuggestionInput[];
  promptNotes?: string;
  observations?: string;
  supportRequests: GuardianSupportRequest[];
}

// Stored separately from discipline cases and student check-ins.
const guardianCheckIns: GuardianCheckIn[] = [];

const delay = async <T>(value: T, ms = 300): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
};

export const guardianSupportApi = {
  async createCheckIn(
    input: GuardianCheckInInput
  ): Promise<GuardianCheckIn> {
    const createdAt = new Date().toISOString();
    const entryId = `GUARD-MH-${Date.now()}`;
    const promptSuggestions = (input.promptSuggestions || []).map(
      (prompt, index) => ({
        id: `PROMPT-${Date.now()}-${index}`,
        caseId: entryId,
        submittedBy: prompt.submittedBy,
        category: prompt.category,
        promptText: prompt.promptText,
        createdAt,
      })
    );
    const entry: GuardianCheckIn = {
      id: entryId,
      guardianId: input.guardianId,
      guardianName: input.guardianName,
      responses: input.responses,
      promptSuggestions: promptSuggestions.length ? promptSuggestions : undefined,
      promptNotes: input.promptNotes?.trim() || undefined,
      observations: input.observations?.trim() || undefined,
      supportRequests: input.supportRequests,
      status: GuardianCheckInStatus.New,
      createdAt,
    };
    guardianCheckIns.unshift(entry);
    return delay(entry);
  },

  async getCheckInsForGuardian(
    guardianId: string
  ): Promise<GuardianCheckIn[]> {
    return delay(
      guardianCheckIns.filter((entry) => entry.guardianId === guardianId)
    );
  },

  async getAllCheckIns(): Promise<GuardianCheckIn[]> {
    return delay([...guardianCheckIns]);
  },
};
