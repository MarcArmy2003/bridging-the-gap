import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { fakeApi } from "../../data/fakeApi";
import { demoData } from "../../data/demoData";
import { Case, CaseStatus, SupportPlanType } from "../../models/types";
import { StaffStackParamList } from "../../navigation/types";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useAppContext } from "../../store/AppContext";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { requireRole } from "../../utils/requireRole";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useFocusEffect, useNavigation } from "../../navigation/compatTypes";

export const CaseInboxScreen = () => {
  const { currentUser, setCurrentUser, isDemoMode } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTeacherHelp, setShowTeacherHelp] = useState(false);
  const [observationType, setObservationType] = useState<
    "distressed" | "bullying" | "changes" | "safety" | "unsure" | null
  >(null);
  const [urgency, setUrgency] = useState<
    "immediate" | "soon" | "document" | null
  >(null);
  const [observationNotes, setObservationNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const supportPlanLabels: Record<SupportPlanType, string> = {
    check_in: "Student check-in",
    parent: "Parent communication",
    monitor: "Monitor / observe",
    counselor: "Counselor support",
    safety: "Safety escalation",
  };
  const supportPlanBadgeStyles: Record<SupportPlanType, object> = {
    check_in: styles.planBadgeCheckIn,
    parent: styles.planBadgeParent,
    monitor: styles.planBadgeMonitor,
    counselor: styles.planBadgeCounselor,
    safety: styles.planBadgeSafety,
  };

  const visibleCases = cases.filter((item) => !item.directToSro);

  if (!requireRole(["educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const loadCases = useCallback(async () => {
    setLoading(true);
    let data: Case[];
    if (isDemoMode) {
      data = demoData.cases as Case[];
    } else {
      data = await fakeApi.getCases();
    }
    setCases(data);
    setLoading(false);
  }, [isDemoMode]);

  useFocusEffect(
    useCallback(() => {
      loadCases();
    }, [loadCases])
  );

  useEffect(() => {
    setSubmitted(false);
  }, [observationType, urgency, observationNotes]);

  const counselorNeedsReview = useMemo(
    () => visibleCases.filter((item) => item.status === CaseStatus.New),
    [visibleCases]
  );
  const counselorInProgress = useMemo(
    () =>
      visibleCases.filter(
        (item) =>
          item.status === CaseStatus.InReview ||
          item.status === CaseStatus.ActionRequired
      ),
    [visibleCases]
  );
  const counselorMonitoring = useMemo(
    () =>
      visibleCases.filter(
        (item) =>
          item.status === CaseStatus.Resolved ||
          item.status === CaseStatus.Archived
      ),
    [visibleCases]
  );

  const isToday = (value: string) => {
    const date = new Date(value);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  const formatTime = (value?: string) => {
    if (!value) return "Unknown";
    return new Date(value).toLocaleString();
  };

  const mapObservationToIncident = () => {
    if (observationType === "safety") {
      return "safety";
    }
    if (observationType === "bullying") {
      return "bullying";
    }
    return "bullying";
  };

  const mapUrgencyToSeverity = () => {
    if (urgency === "immediate") return "high";
    if (urgency === "soon") return "medium";
    return "low";
  };

  const handleSubmitObservation = async () => {
    if (!observationType || !urgency) {
      return;
    }
    setLoading(true);
    await fakeApi.createCaseAsStaff(
      {
        incidentType: mapObservationToIncident(),
        narrative: observationNotes.trim() || "Observation shared by teacher.",
        severity: mapUrgencyToSeverity(),
        studentName: "Student (observed)",
        guardianId: "GUARD-UNKNOWN",
      },
      currentUser?.role ?? "educator"
    );
    await loadCases();
    setSubmitted(true);
    setObservationNotes("");
    setObservationType(null);
    setUrgency(null);
    setLoading(false);
  };

  return (
    <View style={[styles.page, isDesktop && styles.pageDesktop]}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        <Pressable
          onPress={() => setCurrentUser(null)}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back to role selection"
        >
          <Text style={styles.backButtonText}>← Back to role selection</Text>
        </Pressable>
        {currentUser?.staffRole === "counselor" || currentUser?.role === "admin" ? (
          <>
            <Text style={styles.header}>Student Support Tasks</Text>
            <Text style={styles.subheader}>
              Focused actions that need your attention.
            </Text>

            <SectionCard>
              <Text style={styles.sectionTitle}>Needs review</Text>
              {counselorNeedsReview.length === 0 ? (
                <Text style={styles.mutedText}>No new items right now.</Text>
              ) : (
                counselorNeedsReview.map((item) => (
                  <View key={item.id} style={styles.taskCard}>
                    <Text style={styles.cardTitle}>{item.incidentType}</Text>
                    {item.supportPlanType ? (
                      <View
                        style={[
                          styles.planBadge,
                          supportPlanBadgeStyles[item.supportPlanType],
                        ]}
                      >
                        <Text style={styles.planBadgeText}>
                          {supportPlanLabels[item.supportPlanType]}
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.planBadge, styles.planBadgeUnset]}>
                        <Text style={styles.planBadgeText}>Plan not set</Text>
                      </View>
                    )}
                    <Text style={styles.meta}>
                      Submitted by {item.reportSource ?? "Student"} ·{" "}
                      {formatTime(item.createdAt)}
                    </Text>
                    <Text style={styles.meta}>
                      {item.status === CaseStatus.New ? "Needs review" : "In review"} ·{" "}
                      {item.createdAt && isToday(item.createdAt) ? "Today" : "This week"}
                    </Text>
                    <PrimaryButton
                      label="Review"
                      onPress={() =>
                        navigation.navigate("CaseDetail", {
                          caseId: item.id,
                        })
                      }
                      style={styles.actionButton}
                    />
                  </View>
                ))
              )}
            </SectionCard>

            <SectionCard>
              <Text style={styles.sectionTitle}>In progress</Text>
              {counselorInProgress.length === 0 ? (
                <Text style={styles.mutedText}>No active support right now.</Text>
              ) : (
                counselorInProgress.map((item) => (
                  <View key={item.id} style={styles.taskCard}>
                    <Text style={styles.cardTitle}>{item.incidentType}</Text>
                    {item.supportPlanType ? (
                      <View
                        style={[
                          styles.planBadge,
                          supportPlanBadgeStyles[item.supportPlanType],
                        ]}
                      >
                        <Text style={styles.planBadgeText}>
                          {supportPlanLabels[item.supportPlanType]}
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.planBadge, styles.planBadgeUnset]}>
                        <Text style={styles.planBadgeText}>Plan not set</Text>
                      </View>
                    )}
                    <Text style={styles.meta}>
                      Next step: {item.status === CaseStatus.InReview ? "Check-in" : "Action"}
                      {" · "}
                      {item.lastUpdatedAt && isToday(item.lastUpdatedAt) ? "Today" : "This week"}
                    </Text>
                    <PrimaryButton
                      label="Continue"
                      onPress={() =>
                        navigation.navigate("CaseDetail", {
                          caseId: item.id,
                        })
                      }
                      style={styles.actionButton}
                    />
                  </View>
                ))
              )}
            </SectionCard>

            <SectionCard>
              <Text style={styles.sectionTitle}>Monitoring</Text>
              {counselorMonitoring.length === 0 ? (
                <Text style={styles.mutedText}>Nothing to monitor right now.</Text>
              ) : (
                counselorMonitoring.map((item) => (
                  <View key={item.id} style={styles.taskCard}>
                    <Text style={styles.cardTitle}>{item.incidentType}</Text>
                    {item.supportPlanType ? (
                      <View
                        style={[
                          styles.planBadge,
                          supportPlanBadgeStyles[item.supportPlanType],
                        ]}
                      >
                        <Text style={styles.planBadgeText}>
                          {supportPlanLabels[item.supportPlanType]}
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.planBadge, styles.planBadgeUnset]}>
                        <Text style={styles.planBadgeText}>Plan not set</Text>
                      </View>
                    )}
                    <Text style={styles.meta}>
                      Last update · {item.lastUpdatedAt && isToday(item.lastUpdatedAt) ? "Today" : "This week"}
                    </Text>
                    <PrimaryButton
                      label="View"
                      onPress={() =>
                        navigation.navigate("CaseDetail", {
                          caseId: item.id,
                        })
                      }
                      variant="secondary"
                      style={styles.actionButton}
                    />
                  </View>
                ))
              )}
            </SectionCard>
          </>
        ) : (
          <>
            <Text style={styles.header}>Something you’re noticing</Text>
            <Text style={styles.subheader}>
              Share concerns early — you’re not making a diagnosis.
            </Text>

            <SectionCard>
              <Text style={styles.sectionTitle}>Step 1 · What are you noticing?</Text>
              {[
                { key: "distressed", label: "Student seems withdrawn or distressed" },
                { key: "bullying", label: "Possible bullying or peer conflict" },
                { key: "changes", label: "Sudden behavior or academic changes" },
                { key: "safety", label: "Safety concern" },
                { key: "unsure", label: "Not sure / something else" },
              ].map((option) => {
                const isSelected = observationType === option.key;
                return (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => setObservationType(option.key as "distressed" | "bullying" | "changes" | "safety" | "unsure")}
                  >
                    <Text style={styles.optionTitle}>{option.label}</Text>
                    {isSelected ? (
                      <Text style={styles.optionHelper}>Selected</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </SectionCard>

            <SectionCard>
              <View style={styles.stepHeader}>
                <Text style={styles.sectionTitle}>Step 2 · How urgent does this feel?</Text>
                <Text style={styles.helpLink} onPress={() => setShowTeacherHelp(true)}>
                  Need help?
                </Text>
              </View>
              {[
                { key: "immediate", label: "Needs immediate attention" },
                { key: "soon", label: "Needs follow-up soon" },
                { key: "document", label: "Just want to document" },
              ].map((option) => {
                const isSelected = urgency === option.key;
                return (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => setUrgency(option.key as typeof urgency)}
                  >
                    <Text style={styles.optionTitle}>{option.label}</Text>
                    {isSelected ? (
                      <Text style={styles.optionHelper}>
                        {option.key === "soon"
                          ? "If unsure, choose follow-up soon."
                          : "Selected"}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </SectionCard>

            <SectionCard>
              <Text style={styles.sectionTitle}>Step 3 · Add context (optional)</Text>
              <TextInput
                value={observationNotes}
                onChangeText={setObservationNotes}
                placeholder="What are you seeing or hearing?"
                multiline
                style={styles.noteInput}
              />
              <PrimaryButton
                label={submitted ? "Shared with counselor" : "Send to counselor"}
                onPress={handleSubmitObservation}
                disabled={!observationType || !urgency || loading}
                style={styles.actionButton}
              />
              {submitted ? (
                <Text style={styles.helperText}>
                  Thanks for sharing. A counselor will review this soon.
                </Text>
              ) : null}
            </SectionCard>

            <SectionCard>
              <Text style={styles.sectionTitle}>Messages from counselor</Text>
              <Text style={styles.mutedText}>
                You’ll see guidance here after a counselor reviews your
                observations.
              </Text>
              <PrimaryButton
                label="Open messages"
                onPress={() => navigation.navigate("TeacherMessages")}
                variant="secondary"
                style={styles.actionButton}
              />
            </SectionCard>
          </>
        )}
      </View>

      <Modal
        visible={showTeacherHelp}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTeacherHelp(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Need help?</Text>
            <Text style={styles.modalText}>
              If you’re concerned about bullying, avoid promises, document
              patterns, and share early. If something feels urgent, choose
              “Needs immediate attention.”
            </Text>
            <PrimaryButton
              label="Close"
              onPress={() => setShowTeacherHelp(false)}
              variant="secondary"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  pageDesktop: {
    alignItems: "center",
  },
  container: {
    flex: 1,
    width: "100%",
  },
  containerDesktop: {
    width: 900,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  subheader: {
    fontSize: 14,
    color: theme.colors.mutedText,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 12,
  },
  mutedText: {
    fontSize: 13,
    color: theme.colors.mutedText,
  },
  taskCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.surface,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  planBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.subtleBackground,
  },
  planBadgeCheckIn: {
    backgroundColor: "#E3F2FD",
  },
  planBadgeParent: {
    backgroundColor: "#E8F5E9",
  },
  planBadgeMonitor: {
    backgroundColor: "#F3E5F5",
  },
  planBadgeCounselor: {
    backgroundColor: "#FFF3E0",
  },
  planBadgeSafety: {
    backgroundColor: "#FFE0B2",
  },
  planBadgeUnset: {
    backgroundColor: "#ECEFF1",
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.text,
  },
  meta: {
    fontSize: 13,
    color: theme.colors.mutedText,
    marginTop: 6,
    marginBottom: 10,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.subtleBackground,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  optionHelper: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginTop: 6,
  },
  noteInput: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.surface,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginTop: 8,
  },
  helpLink: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 15, 15, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  modalButton: {
    marginTop: 16,
    alignSelf: "flex-start",
  },
  actionButton: {
    alignSelf: "flex-start",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "500",
  },
});
