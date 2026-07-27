import {
  MentalHealthCheckIn,
  MentalHealthCheckInStatus,
  MentalHealthFeeling,
} from "../models/types";

interface MentalHealthCheckInInput {
  studentId: string;
  studentName: string;
  selectedFeelings: MentalHealthFeeling[];
  wantsFollowUp: "yes" | "no" | "just_checking_in";
  message?: string;
}

// Stored separately from discipline cases for confidentiality.
const checkIns: MentalHealthCheckIn[] = [];

const delay = async <T>(value: T, ms = 300): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
};

export const mentalHealthApi = {
  async createCheckIn(
    input: MentalHealthCheckInInput
  ): Promise<MentalHealthCheckIn> {
    const entry: MentalHealthCheckIn = {
      id: `MH-${Date.now()}`,
      studentId: input.studentId,
      studentName: input.studentName,
      selectedFeelings: input.selectedFeelings,
      wantsFollowUp: input.wantsFollowUp,
      message: input.message?.trim() || undefined,
      status: MentalHealthCheckInStatus.New,
      createdAt: new Date().toISOString(),
    };
    checkIns.unshift(entry);
    return delay(entry);
  },

  async getCheckInsForStudent(studentId: string): Promise<MentalHealthCheckIn[]> {
    return delay(checkIns.filter((entry) => entry.studentId === studentId));
  },

  async getAllCheckIns(): Promise<MentalHealthCheckIn[]> {
    return delay([...checkIns]);
  },
};
