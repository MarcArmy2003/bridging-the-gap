import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { fakeApi } from "../../data/fakeApi";
import { Case, CaseStatus, StaffCapacitySetting } from "../../models/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";

const getActiveCaseCount = (cases: Case[]) =>
  cases.filter(
    (item) =>
      item.status !== CaseStatus.Resolved &&
      item.status !== CaseStatus.Archived
  ).length;

export const StaffResilienceScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [cases, setCases] = useState<Case[]>([]);
  const [stalledCases, setStalledCases] = useState<Case[]>([]);
  const [capacitySettings, setCapacitySettings] = useState<StaffCapacitySetting[]>([]);
  const [loading, setLoading] = useState(false);

  if (!requireRole(["educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    const [allCases, stalled, capacity] = await Promise.all([
      fakeApi.getCases(),
      fakeApi.getStalledCases(),
      fakeApi.getCapacitySettings(),
    ]);
    setCases(allCases);
    setStalledCases(stalled);
    setCapacitySettings(capacity);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCount = useMemo(() => getActiveCaseCount(cases), [cases]);
  const teacherCap = capacitySettings.find((item) => item.role === "teacher");
  const counselorCap = capacitySettings.find((item) => item.role === "counselor");
  const recommendedMax = (teacherCap?.softCaseCap || 8) + (counselorCap?.softCaseCap || 6);
  const overCapacity = activeCount > recommendedMax;

  const handleReassign = async (caseId: string, role: "teacher" | "counselor") => {
    await fakeApi.reassignCase(caseId, role);
    await loadData();
  };

  const handleResolve = async (caseId: string) => {
    await fakeApi.updateCaseStatus(caseId, CaseStatus.Resolved, "educator");
    await loadData();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Staff Sustainability</Text>
        <Text style={styles.subtitle}>
          Soft capacity indicators help prevent overload. This is not a performance tool.
        </Text>
        <Text style={styles.metricLabel}>Active cases</Text>
        <Text style={styles.metricValue}>{loading ? "--" : activeCount}</Text>
        <Text style={styles.helperText}>
          Recommended max: {recommendedMax} (Teacher {teacherCap?.softCaseCap || 8} + Counselor{" "}
          {counselorCap?.softCaseCap || 6})
        </Text>
        {overCapacity ? (
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>Capacity exceeded</Text>
            <Text style={styles.alertText}>
              Consider redistributing cases or requesting handoff to reduce workload.
            </Text>
          </View>
        ) : (
          <Text style={styles.okText}>Capacity within recommended range.</Text>
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Stalled cases (72+ hours)</Text>
        {stalledCases.length === 0 ? (
          <Text style={styles.helperText}>No stalled cases right now.</Text>
        ) : (
          stalledCases.map((item) => (
            <View key={item.id} style={styles.caseRow}>
              <View style={styles.caseMeta}>
                <Text style={styles.caseTitle}>{item.id}</Text>
                <Text style={styles.caseSubtitle}>
                  Status: {item.status.replace(/_/g, " ")}
                </Text>
                <Text style={styles.caseSubtitle}>
                  Last touched:{" "}
                  {item.lastTouchedAt
                    ? new Date(item.lastTouchedAt).toLocaleString()
                    : "Unknown"}
                </Text>
              </View>
              <View style={styles.actionRow}>
                <PrimaryButton
                  label="Handoff to counselor"
                  onPress={() => handleReassign(item.id, "counselor")}
                  variant="secondary"
                  style={styles.actionButton}
                />
                <PrimaryButton
                  label="Resolve"
                  onPress={() => handleResolve(item.id)}
                  variant="ghost"
                  style={styles.actionButton}
                />
              </View>
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
  metricLabel: {
    marginTop: 12,
    fontSize: 13,
    color: theme.colors.mutedText,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6,
  },
  helperText: {
    fontSize: 13,
    color: theme.colors.mutedText,
  },
  okText: {
    marginTop: 8,
    fontSize: 13,
    color: theme.colors.success,
  },
  alertCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    color: "#92400E",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 10,
  },
  caseRow: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  caseMeta: {
    marginBottom: 10,
  },
  caseTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  caseSubtitle: {
    fontSize: 13,
    color: theme.colors.mutedText,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    alignSelf: "flex-start",
  },
});
