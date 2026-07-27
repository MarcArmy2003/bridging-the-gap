import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { StatusBadge } from "../../components/StatusBadge";
import { theme } from "../../components/theme";
import { feedbackApi } from "../../data/feedbackApi";
import { fakeApi } from "../../data/fakeApi";
import {
  lockdownApi,
  LockdownNotification,
  LockdownStatus,
} from "../../data/lockdownApi";
import {
  districtProfiles,
  stateProfiles,
} from "../../data/policyConfig";
import {
  FeedbackRating,
  CaseStatus,
  GuardianCaseView,
  StudentGradeBand,
} from "../../models/types";
import { useAppContext } from "../../store/AppContext";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { requireRole } from "../../utils/requireRole";
import { GuardianStackParamList } from "../../navigation/types";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useFocusEffect, useNavigation } from "../../navigation/compatTypes";

export const GuardianCaseListScreen = () => {
  const {
    currentUser,
    setCurrentUser,
    isDemoMode,
    districtProfile,
    stateProfile,
    setStateProfile,
    setDistrictProfile,
    demoStudentGradeBand,
    setDemoStudentGradeBand,
  } = useAppContext();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const navigation =
    useNavigation<NativeStackNavigationProp<GuardianStackParamList>>();
  const [cases, setCases] = useState<GuardianCaseView[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackRatings, setFeedbackRatings] = useState<
    Record<string, FeedbackRating>
  >({});
  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>(
    {}
  );
  const [lockdownStatus, setLockdownStatus] = useState<LockdownStatus>({
    active: false,
  });
  const [lockdownNotifications, setLockdownNotifications] = useState<
    LockdownNotification[]
  >([]);

  const districtsForState = useMemo(() => {
    return districtProfiles.filter(
      (district) => district.stateId === stateProfile.id
    );
  }, [stateProfile.id]);

  if (!requireRole(["guardian"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const loadCases = useCallback(async () => {
    setLoading(true);
    if (isDemoMode) {
      setCases([
        {
          id: "DEMO-1",
          incidentType: "bullying",
          status: CaseStatus.InReview,
          createdAt: new Date().toISOString(),
          childName: "Student A",
          redactedNarrative: "Redacted for privacy.",
        },
        {
          id: "DEMO-2",
          incidentType: "hazing",
          status: CaseStatus.ActionRequired,
          createdAt: new Date().toISOString(),
          childName: "Student B",
          redactedNarrative: "Redacted for privacy.",
        },
      ]);
      setLoading(false);
      return;
    }
    const data = await fakeApi.getGuardianCases("GUARD-1");
    setCases(data);
    setLoading(false);
  }, [isDemoMode]);

  const loadFeedback = useCallback(async () => {
    if (!currentUser) {
      return;
    }
    if (isDemoMode) {
      setFeedbackRatings({});
      setFeedbackNotes({});
      return;
    }
    const data = await feedbackApi.getFeedbackForGuardian(currentUser.id);
    const ratings: Record<string, FeedbackRating> = {};
    const notes: Record<string, string> = {};
    data.forEach((entry) => {
      if (entry.context === "case_resolved") {
        ratings[entry.referenceId] = entry.rating;
        if (entry.comment) {
          notes[entry.referenceId] = entry.comment;
        }
      }
    });
    setFeedbackRatings(ratings);
    setFeedbackNotes(notes);
  }, [currentUser, isDemoMode]);

  useEffect(() => {
    loadCases();
    loadFeedback();
  }, [loadCases, loadFeedback]);

  const loadLockdown = useCallback(async () => {
    const [status, notifications] = await Promise.all([
      lockdownApi.getStatus(),
      lockdownApi.getNotifications(),
    ]);
    setLockdownStatus(status);
    setLockdownNotifications(notifications);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLockdown();
    }, [loadLockdown])
  );

  const latestLockdownUpdate = lockdownNotifications[0];

  const handleFeedbackSubmit = async (caseId: string) => {
    if (!currentUser) {
      return;
    }
    const rating = feedbackRatings[caseId];
    if (!rating) {
      return;
    }
    await feedbackApi.createFeedback({
      guardianId: currentUser.id,
      context: "case_resolved",
      referenceId: caseId,
      rating,
      comment: feedbackNotes[caseId],
    });
    await loadFeedback();
  };

  const feedbackOptions: { label: string; value: FeedbackRating }[] = [
    { label: "Very helpful", value: "very_helpful" },
    { label: "Somewhat helpful", value: "somewhat_helpful" },
    { label: "Not helpful", value: "not_helpful" },
    { label: "Prefer not to answer", value: "prefer_not_to_answer" },
  ];

  return (
    <View style={[styles.page, isDesktop && styles.pageDesktop]}>
      <FlatList
        style={[styles.container, isDesktop && styles.containerDesktop]}
        contentContainerStyle={styles.content}
        data={cases}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadCases} />
        }
        ListHeaderComponent={
          <SectionCard>
          {isDemoMode ? (
            <Text style={styles.demoBadge}>Demo Mode Active</Text>
          ) : null}
          <Text style={styles.title}>Parent Dashboard</Text>
          <Text style={styles.districtLine}>
            {districtProfile.name} · {districtProfile.schoolName}
          </Text>
          <Text style={styles.subtitle}>
            Clear actions for your child’s status, concerns, updates, and support.
          </Text>
          {lockdownStatus.active ? (
            <View style={styles.lockdownBanner}>
              <Text style={styles.lockdownTitle}>Lockdown in Progress</Text>
              <Text style={styles.lockdownBody}>
                The school is managing a safety situation. Updates will be
                provided when available.
              </Text>
              <PrimaryButton
                label="Details available after lockdown ends"
                onPress={() => {}}
                disabled={true}
                variant="ghost"
                style={styles.lockdownButton}
              />
            </View>
          ) : null}
          {lockdownStatus.active && latestLockdownUpdate ? (
            <View style={styles.lockdownUpdateCard}>
              <Text style={styles.lockdownTitle}>
                {latestLockdownUpdate.title}
              </Text>
              <Text style={styles.lockdownBody}>
                {latestLockdownUpdate.body}
              </Text>
            </View>
          ) : null}
          {!lockdownStatus.active && latestLockdownUpdate ? (
            <View style={styles.lockdownUpdateCard}>
              <Text style={styles.lockdownTitle}>
                {latestLockdownUpdate.title}
              </Text>
              <Text style={styles.lockdownBody}>
                {latestLockdownUpdate.body}
              </Text>
            </View>
          ) : null}
          <View style={styles.dashboardSection}>
            <View style={styles.dashboardSectionRow}>
              <View style={styles.dashboardSectionContent}>
                <Text style={styles.dashboardSectionTitle}>Child Status</Text>
                <Text style={styles.dashboardSectionBody}>
                  View your child’s latest check-in and activity updates.
                </Text>
              </View>
              <PrimaryButton
                label="View Latest Check-In"
                onPress={() => navigation.navigate("GuardianSupport")}
                variant="secondary"
                style={styles.dashboardActionButton}
              />
            </View>
          </View>

          <View style={styles.dashboardSection}>
            <View style={styles.dashboardSectionRow}>
              <View style={styles.dashboardSectionContent}>
                <Text style={styles.dashboardSectionTitle}>Submit a Concern</Text>
                <Text style={styles.dashboardSectionBody}>
                  Report bullying, hazing, or other safety concerns.
                </Text>
              </View>
              <PrimaryButton
                label="Submit Concern"
                onPress={() => navigation.navigate("SubmitReport")}
                variant="secondary"
                style={styles.dashboardActionButton}
              />
            </View>
          </View>

          <View style={styles.dashboardSection}>
            <View style={styles.dashboardSectionRow}>
              <View style={styles.dashboardSectionContent}>
                <Text style={styles.dashboardSectionTitle}>Messages & Updates</Text>
                <Text style={styles.dashboardSectionBody}>
                  View school notifications and contact support staff.
                </Text>
              </View>
              <PrimaryButton
                label="Messages and Alerts"
                onPress={() => navigation.navigate("GuardianMessageTemplates")}
                variant="secondary"
                style={styles.dashboardActionButton}
              />
            </View>
          </View>

          <View style={styles.dashboardSection}>
            <View style={styles.dashboardSectionRow}>
              <View style={styles.dashboardSectionContent}>
                <Text style={styles.dashboardSectionTitle}>Support & Resources</Text>
                <Text style={styles.dashboardSectionBody}>
                  Access community resources and additional guidance.
                </Text>
              </View>
              <PrimaryButton
                label="Open Resources"
                onPress={() => navigation.navigate("SupportResourcesHome")}
                variant="secondary"
                style={styles.dashboardActionButton}
              />
            </View>
          </View>

          <PrimaryButton
            label="What Parents Can Expect"
            onPress={() => navigation.navigate("GuardianExpectations")}
            variant="ghost"
            style={styles.switchButton}
          />
          <PrimaryButton
            label="Back to role selection"
            onPress={() => setCurrentUser(null)}
            variant="ghost"
            style={styles.switchButton}
          />
          </SectionCard>
        }
        ListFooterComponent={isDemoMode ? (
          <SectionCard style={styles.demoCard}>
            <Text style={styles.demoTitle}>Demo configuration</Text>
            <Text style={styles.demoSubtitle}>
              Adjust state policy, district settings, and grade band to preview
              different configurations.
            </Text>
            <View style={styles.demoSection}>
              <Text style={styles.demoLabel}>State policy profile</Text>
              <Text style={styles.demoHint}>
                Select the state policy configuration for this demo.
              </Text>
              <View style={styles.pillRow}>
                {stateProfiles.map((profile) => (
                  <PrimaryButton
                    key={profile.id}
                    label={profile.name}
                    onPress={() => {
                      setStateProfile(profile);
                      const fallbackDistrict = districtProfiles.find(
                        (district) => district.stateId === profile.id
                      );
                      if (fallbackDistrict) {
                        setDistrictProfile(fallbackDistrict);
                      }
                    }}
                    variant={
                      stateProfile.id === profile.id ? "secondary" : "ghost"
                    }
                    style={styles.pillButton}
                  />
                ))}
              </View>
            </View>
            <View style={styles.demoSection}>
              <Text style={styles.demoLabel}>District profile</Text>
              <Text style={styles.demoHint}>
                District settings control branding, languages, and K-5 access.
              </Text>
              <View style={styles.pillRow}>
                {districtsForState.map((district) => (
                  <PrimaryButton
                    key={district.id}
                    label={district.name}
                    onPress={() => {
                      setDistrictProfile(district);
                      if (district.stateId !== stateProfile.id) {
                        const matchingState = stateProfiles.find(
                          (profile) => profile.id === district.stateId
                        );
                        if (matchingState) {
                          setStateProfile(matchingState);
                        }
                      }
                    }}
                    variant={
                      districtProfile.id === district.id ? "secondary" : "ghost"
                    }
                    style={styles.pillButton}
                  />
                ))}
              </View>
            </View>
            <View style={styles.demoSection}>
              <Text style={styles.demoLabel}>Student grade band (demo)</Text>
              <Text style={styles.demoHint}>
                Used to preview K-5 versus 6-12 access rules.
              </Text>
              <View style={styles.pillRow}>
                {[
                  { label: "K-5", value: "k5" },
                  { label: "6-8", value: "6_8" },
                  { label: "9-12", value: "9_12" },
                ].map((option) => (
                  <PrimaryButton
                    key={option.value}
                    label={option.label}
                    onPress={() =>
                      setDemoStudentGradeBand(
                        option.value as StudentGradeBand
                      )
                    }
                    variant={
                      demoStudentGradeBand === option.value
                        ? "secondary"
                        : "ghost"
                    }
                    style={styles.pillButton}
                  />
                ))}
              </View>
            </View>
          </SectionCard>
        ) : null}
        renderItem={({ item }) => (
          <SectionCard>
            <View style={styles.cardHeader}>
            <Text style={styles.caseTitle}>
              {item.incidentType === "bullying" ? "Bullying" : "Hazing"}
            </Text>
            <View style={styles.headerMeta}>
              {isDemoMode ? (
                <Text style={styles.demoChip}>Demo Content</Text>
              ) : null}
              <StatusBadge status={item.status} />
            </View>
          </View>
          <Text style={styles.caseNarrative}>
            Guidance: Contact the school support team for confidential updates
            and next steps.
          </Text>
          {item.status === "resolved" && !feedbackRatings[item.id] ? (
            <View style={styles.feedbackBlock}>
              <Text style={styles.feedbackTitle}>
                Was this experience helpful?
              </Text>
              <View style={styles.feedbackOptions}>
                {feedbackOptions.map((option) => (
                  <PrimaryButton
                    key={option.value}
                    label={option.label}
                    onPress={() =>
                      setFeedbackRatings((prev) => ({
                        ...prev,
                        [item.id]: option.value,
                      }))
                    }
                    variant={
                      feedbackRatings[item.id] === option.value
                        ? "secondary"
                        : "ghost"
                    }
                    style={styles.feedbackButton}
                  />
                ))}
              </View>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Any feedback you'd like to share? (Optional)"
                placeholderTextColor={theme.colors.mutedText}
                value={feedbackNotes[item.id] || ""}
                onChangeText={(value) =>
                  setFeedbackNotes((prev) => ({
                    ...prev,
                    [item.id]: value,
                  }))
                }
                multiline
              />
              <Text style={styles.feedbackNote}>
                Feedback helps improve school support systems.
              </Text>
              <PrimaryButton
                label="Send feedback"
                onPress={() => handleFeedbackSubmit(item.id)}
                variant="secondary"
                style={styles.feedbackButton}
              />
            </View>
          ) : null}
        </SectionCard>
      )}
        ListEmptyComponent={
          <SectionCard>
            <Text style={styles.emptyText}>
              There are no updates to review right now.
            </Text>
          </SectionCard>
        }
      />
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
  content: {
    padding: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6,
  },
  districtLine: {
    fontSize: 13,
    color: theme.colors.mutedText,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.mutedText,
    marginBottom: 14,
    lineHeight: 20,
  },
  switchButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  dashboardSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dashboardSectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  dashboardSectionContent: {
    flex: 1,
    paddingRight: 8,
  },
  dashboardSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  dashboardSectionBody: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  dashboardActionButton: {
    alignSelf: "center",
  },
  demoBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F4D06F",
    color: "#5A3E00",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  demoChip: {
    backgroundColor: "#F4D06F",
    color: "#5A3E00",
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  caseNarrative: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  feedbackBlock: {
    marginTop: 12,
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  feedbackOptions: {
    gap: 8,
  },
  feedbackButton: {
    alignSelf: "flex-start",
  },
  feedbackInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 10,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    marginTop: 8,
    marginBottom: 8,
  },
  feedbackNote: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
  lockdownBanner: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  lockdownUpdateCard: {
    backgroundColor: theme.colors.subtleBackground,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lockdownTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6,
  },
  lockdownBody: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  lockdownButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  demoCard: {
    marginTop: 18,
    marginBottom: 32,
    backgroundColor: theme.colors.subtleBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  demoSubtitle: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginBottom: 12,
  },
  demoSection: {
    marginBottom: 14,
  },
  demoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  demoHint: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pillButton: {
    alignSelf: "flex-start",
  },
});
