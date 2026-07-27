import { TeacherMessage, TeacherMessageStatus } from "../models/types";

interface TeacherMessageInput {
  teacherId: string;
  counselorName: string;
  contextLabel: string;
  body: string;
}

const messages: TeacherMessage[] = [];

const delay = async <T>(value: T, ms = 300): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
};

export const teacherMessagingApi = {
  async sendMessage(input: TeacherMessageInput): Promise<TeacherMessage> {
    const entry: TeacherMessage = {
      id: `TEACH-MSG-${Date.now()}`,
      teacherId: input.teacherId,
      counselorName: input.counselorName,
      contextLabel: input.contextLabel,
      body: input.body.trim(),
      status: TeacherMessageStatus.Sent,
      createdAt: new Date().toISOString(),
    };
    messages.unshift(entry);
    return delay(entry);
  },

  async getMessagesForTeacher(teacherId: string): Promise<TeacherMessage[]> {
    return delay(messages.filter((entry) => entry.teacherId === teacherId));
  },

  async markRead(messageId: string): Promise<void> {
    const target = messages.find((entry) => entry.id === messageId);
    if (target) {
      target.status = TeacherMessageStatus.Read;
    }
    return delay(undefined);
  },
};
