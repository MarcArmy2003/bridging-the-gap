import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { mentalHealthApi } from "../../data/mentalHealthApi";
import { supportApi } from "../../data/supportApi";
import { MentalHealthCheckIn } from "../../models/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";

type StaffCheckInItem = {
  id: string;
  studentName: string;
  createdAt: string;
  selectedFeelings: string[];
  wantsFollowUp: MentalHealthCheckIn["wantsFollowUp"];
  message?: string;
  skipped?: boolean;
  skipReason?: string;
};

const followUpLabels: Record<
  MentalHealthCheckIn["wantsFollowUp"],
  string
> = {
  yes: "Requested follow-up",
  no: "No follow-up requested",
  just_checking_in: "Just checking in",
};

const feelingLabels: Record<string, string> = {
  stressed: "Stressed",
  anxious: "Anxious or overwhelmed",
  sad: "Sad or down",
  need_to_talk: "Needs to talk to someone",
  worried_about_friend: "Worried about a friend",
};

export const MentalHealthInboxScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [checkIns, setCheckIns] = useState<StaffCheckInItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCheckIns = useCallback(async () => {
    setLoading(true);
    const [mentalHealthCheckIns, supportCheckIns] = await Promise.all([
      mentalHealthApi.getAllCheckIns(),
      supportApi.getAllCheckIns(),
    ]);

    const skippedItems: StaffCheckInItem[] = supportCheckIns
      .filter((entry) => entry.skipped)
      .map((entry) => ({
        id: `SKIP-${entry.id}`,
        studentName: entry.studentName || "Student",
        createdAt: entry.createdAt,
        selectedFeelings: [],
        wantsFollowUp: "just_checking_in",
        message: undefined,
        skipped: true,
        skipReason: entry.skipReason,
      }));

    const mentalHealthItems: StaffCheckInItem[] = mentalHealthCheckIns.map((entry) => ({
      id: entry.id,
      studentName: entry.studentName,
      createdAt: entry.createdAt,
      selectedFeelings: entry.selectedFeelings,
      wantsFollowUp: entry.wantsFollowUp,
      message: entry.message,
      skipped: false,
      skipReason: undefined,
    }));

    const merged = [...mentalHealthItems, ...skippedItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setCheckIns(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCheckIns();
  }, [loadCheckIns]);

  if (!requireRole(["educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={checkIns}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadCheckIns} />
      }
      ListHeaderComponent={
        <SectionCard>
          <Text style={styles.title}>Well-Being check-ins</Text>
          <Text style={styles.subtitle}>
            These check-ins are shared only with authorized support staff.
          </Text>
        </SectionCard>
      }
      renderItem={({ item }) => (
        <SectionCard>
          <View style={styles.cardHeader}>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
          {item.skipped ? (
            <>
              <Text style={styles.skippedLabel}>Student skipped check-in</Text>
              <Text style={styles.meta}>Status: Skipped</Text>
              {item.skipReason ? (
                <Text style={styles.meta}>Reason: {item.skipReason}</Text>
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.meta}>
                Feelings:{" "}
                {item.selectedFeelings
                  .map((feeling) => feelingLabels[feeling])
                  .join(", ")}
              </Text>
              <Text style={styles.meta}>{followUpLabels[item.wantsFollowUp]}</Text>
              {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
            </>
          )}
        </SectionCard>
      )}
      ListEmptyComponent={
        <SectionCard>
          <Text style={styles.emptyText}>
            No student check-ins have been submitted yet.
          </Text>
        </SectionCard>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.mutedText,
  },
  meta: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  message: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 8,
    lineHeight: 20,
  },
  skippedLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
});
