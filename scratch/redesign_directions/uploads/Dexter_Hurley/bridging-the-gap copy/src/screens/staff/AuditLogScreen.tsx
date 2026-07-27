import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { auditApi } from "../../data/auditApi";
import { AuditEventRecord } from "../../data/apiTypes";
import { StaffStackParamList } from "../../navigation/types";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";
import type { RouteProp } from "../../navigation/compatTypes";
import { useRoute } from "../../navigation/compatTypes";

export const AuditLogScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const route = useRoute<RouteProp<StaffStackParamList, "AuditLog">>();
  const [events, setEvents] = useState<AuditEventRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    // TODO: Replace with Supabase audit log query.
    const data = await auditApi.getAuditEventsForCase(route.params.caseId);
    const sorted = [...data].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    setEvents(sorted);
    setLoading(false);
  }, [route.params.caseId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  if (!requireRole(["educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={events}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadEvents} />
      }
      ListHeaderComponent={
        <SectionCard>
          <Text style={styles.title}>Audit history</Text>
          <Text style={styles.subtitle}>
            A read-only timeline of actions for this report.
          </Text>
        </SectionCard>
      }
      renderItem={({ item }) => (
        <SectionCard>
          <Text style={styles.action}>{item.action}</Text>
          <Text style={styles.meta}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
          <Text style={styles.meta}>Actor: {item.actorRole}</Text>
        </SectionCard>
      )}
      ListEmptyComponent={
        <SectionCard>
          <Text style={styles.emptyText}>
            This report has not had any actions recorded yet.
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
  action: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    color: theme.colors.mutedText,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
});
