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
import { guardianSupportApi } from "../../data/guardianSupportApi";
import { GuardianCheckIn } from "../../models/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";

const responseLabels: Record<string, string> = {
  withdrawn: "Withdrawn",
  school_stress: "School stress",
  peer_conflicts: "Peer conflicts",
  anxious: "Anxious about school",
  sleep_change: "Sleep or eating changes",
};

const supportLabels: Record<string, string> = {
  resources: "Requested parenting resources",
  counselor_outreach: "Requested teacher / counselor outreach",
  conversation_help: "Requested conversation help",
  not_now: "No support requested",
};

export const GuardianSupportInboxScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [checkIns, setCheckIns] = useState<GuardianCheckIn[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCheckIns = useCallback(async () => {
    setLoading(true);
    const data = await guardianSupportApi.getAllCheckIns();
    setCheckIns(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCheckIns();
  }, [loadCheckIns]);

  if (!requireRole(["educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const formatResponses = (item: GuardianCheckIn) => {
    const answered = Object.entries(item.responses)
      .filter(([, value]) => value)
      .map(([key, value]) => `${responseLabels[key] || key}: ${value}`)
      .join(" · ");
    return answered || "No responses recorded.";
  };

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
          <Text style={styles.title}>Parent / Guardian check-ins</Text>
          <Text style={styles.subtitle}>
            These entries are shared only with authorized support staff.
          </Text>
        </SectionCard>
      }
      renderItem={({ item }) => (
        <SectionCard>
          <View style={styles.cardHeader}>
            <Text style={styles.guardianName}>{item.guardianName}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
          <Text style={styles.meta}>{formatResponses(item)}</Text>
          <Text style={styles.meta}>
            {item.supportRequests
              .map((request) => supportLabels[request] || request)
              .join(" · ")}
          </Text>
          {item.promptSuggestions && item.promptSuggestions.length ? (
            <View style={styles.promptSection}>
              <Text style={styles.promptTitle}>Parent-provided context</Text>
              {item.promptSuggestions.map((prompt) => (
                <Text key={prompt.id} style={styles.promptItem}>
                  {prompt.category}: {prompt.promptText}
                </Text>
              ))}
            </View>
          ) : null}
          {item.promptNotes ? (
            <View style={styles.promptSection}>
              <Text style={styles.promptTitle}>Parent / Guardian note</Text>
              <Text style={styles.message}>{item.promptNotes}</Text>
            </View>
          ) : null}
          {item.observations ? (
            <Text style={styles.message}>{item.observations}</Text>
          ) : null}
        </SectionCard>
      )}
      ListEmptyComponent={
        <SectionCard>
          <Text style={styles.emptyText}>
            No Parent / Guardian check-ins have been submitted yet.
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
  guardianName: {
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
  promptSection: {
    marginTop: 10,
  },
  promptTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6,
  },
  promptItem: {
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
  emptyText: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
});
