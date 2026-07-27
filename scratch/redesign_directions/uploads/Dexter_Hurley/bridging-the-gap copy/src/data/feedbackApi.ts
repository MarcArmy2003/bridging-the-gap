import { FeedbackEntry, FeedbackRating } from "../models/types";

interface FeedbackInput {
  guardianId: string;
  context: FeedbackEntry["context"];
  referenceId: string;
  rating: FeedbackRating;
  comment?: string;
}

const feedbackEntries: FeedbackEntry[] = [];

const delay = async <T>(value: T, ms = 300): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
};

export const feedbackApi = {
  async createFeedback(input: FeedbackInput): Promise<FeedbackEntry> {
    const entry: FeedbackEntry = {
      id: `FDBK-${Date.now()}`,
      guardianId: input.guardianId,
      context: input.context,
      referenceId: input.referenceId,
      rating: input.rating,
      comment: input.comment?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    feedbackEntries.unshift(entry);
    return delay(entry);
  },

  async getFeedbackForGuardian(
    guardianId: string
  ): Promise<FeedbackEntry[]> {
    return delay(
      feedbackEntries.filter((entry) => entry.guardianId === guardianId)
    );
  },

  async getAllFeedback(): Promise<FeedbackEntry[]> {
    return delay([...feedbackEntries]);
  },
};
