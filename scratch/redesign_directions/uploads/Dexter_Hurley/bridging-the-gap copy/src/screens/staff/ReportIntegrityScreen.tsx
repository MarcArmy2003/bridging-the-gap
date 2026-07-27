import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { integrityApi } from "../../data/integrityApi";
import { IntegrityFlag } from "../../models/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";

export const ReportIntegrityScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [flags, setFlags] = useState<IntegrityFlag[]>([]);
  const [loading, setLoading] = useState(false);

  if (!requireRole(["educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const loadFlags = useCallback(async () => {
    setLoading(true);
    const data = await integrityApi.getFlags();
    setFlags(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  const handleResolve = async (flagId: string) => {
    await integrityApi.resolveFlag(flagId);
    await loadFlags();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Anonymous Tip Integrity</Text>
        <Text style={styles.subtitle}>
          Internal safeguards flag unusual activity for staff review. Students do not see these flags.
        </Text>
        <Text style={styles.helperText}>
          {loading ? "Loading flags..." : `${flags.length} open flag(s)`}
        </Text>
      </SectionCard>

      <SectionCard>
        {flags.length === 0 ? (
          <Text style={styles.helperText}>No integrity flags right now.</Text>
        ) : (
          flags.map((flag) => (
            <View key={flag.id} style={styles.flagCard}>
              <Text style={styles.flagTitle}>Case {flag.caseId}</Text>
              <Text style={styles.flagMeta}>Reason: {flag.reason}</Text>
              <Text style={styles.flagMeta}>
                Severity: {flag.severity} · {new Date(flag.createdAt).toLocaleString()}
              </Text>
              <PrimaryButton
                label={flag.resolved ? "Resolved" : "Mark resolved"}
                onPress={() => handleResolve(flag.id)}
                variant={flag.resolved ? "ghost" : "secondary"}
                style={styles.actionButton}
                disabled={flag.resolved}
              />
            </View>
          ))
        )}
      </SectionCard>
    </ScrollView>
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
  helperText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginTop: 6,
  },
  flagCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  flagTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  flagMeta: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginBottom: 4,
  },
  actionButton: {
    alignSelf: "flex-start",
    marginTop: 6,
  },
});
