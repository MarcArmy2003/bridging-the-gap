import AsyncStorage from "@react-native-async-storage/async-storage";
import { CaseStatus, SupportPlanType, User } from "../models/types";
import { addCaseNote, updateCaseStatus, updateSupportPlan } from "../services/cases";

export type OfflineAction =
  | {
      id: string;
      type: "status_change";
      caseId: string;
      from: CaseStatus;
      to: CaseStatus;
    }
  | {
      id: string;
      type: "note_added";
      caseId: string;
      content: string;
    }
  | {
      id: string;
      type: "support_plan";
      caseId: string;
      supportPlanType: SupportPlanType;
      ownerName: string;
    };

const OFFLINE_QUEUE_KEY = "offlineQueue";

export const enqueueAction = async (action: OfflineAction) => {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  const queue: OfflineAction[] = raw ? JSON.parse(raw) : [];
  queue.push(action);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

export const getOfflineQueueCount = async () => {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  const queue: OfflineAction[] = raw ? JSON.parse(raw) : [];
  return queue.length;
};

export const flushOfflineQueue = async (currentUser: User | null) => {
  if (!currentUser) {
    return 0;
  }
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!raw) {
    return 0;
  }
  const queue: OfflineAction[] = JSON.parse(raw);
  const remaining: OfflineAction[] = [];

  for (const action of queue) {
    try {
      if (action.type === "status_change") {
        await updateCaseStatus(
          action.caseId,
          action.to,
          currentUser.name,
          action.from
        );
      }

      if (action.type === "note_added") {
        await addCaseNote(
          action.caseId,
          action.content,
          currentUser.name,
          currentUser.id
        );
      }
      if (action.type === "support_plan") {
        await updateSupportPlan(
          action.caseId,
          action.supportPlanType,
          action.ownerName
        );
      }
    } catch {
      remaining.push(action);
    }
  }

  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  return remaining.length;
};
