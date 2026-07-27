import { GuardianMessage, GuardianMessageStatus } from "../models/types";

interface GuardianMessageInput {
  guardianId: string;
  guardianName: string;
  subject: string;
  body: string;
  wantsCallback: boolean;
}

const messages: GuardianMessage[] = [];

const delay = async <T>(value: T, ms = 300): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
};

export const guardianMessagingApi = {
  async createMessage(input: GuardianMessageInput): Promise<GuardianMessage> {
    const entry: GuardianMessage = {
      id: `GUARD-MSG-${Date.now()}`,
      guardianId: input.guardianId,
      guardianName: input.guardianName,
      subject: input.subject,
      body: input.body.trim(),
      wantsCallback: input.wantsCallback,
      status: GuardianMessageStatus.Sent,
      createdAt: new Date().toISOString(),
    };
    messages.unshift(entry);
    return delay(entry);
  },

  async getMessagesForGuardian(
    guardianId: string
  ): Promise<GuardianMessage[]> {
    return delay(messages.filter((entry) => entry.guardianId === guardianId));
  },

  async getAllMessages(): Promise<GuardianMessage[]> {
    return delay([...messages]);
  },

  async markAllSeen(): Promise<void> {
    messages.forEach((entry) => {
      if (entry.status === GuardianMessageStatus.Sent) {
        entry.status = GuardianMessageStatus.Seen;
      }
    });
    return delay(undefined);
  },

  async respondToMessage(id: string, replyBody: string): Promise<void> {
    const target = messages.find((entry) => entry.id === id);
    if (!target) {
      return delay(undefined);
    }
    target.replyBody = replyBody.trim();
    target.repliedAt = new Date().toISOString();
    target.status = GuardianMessageStatus.Responded;
    return delay(undefined);
  },
};
