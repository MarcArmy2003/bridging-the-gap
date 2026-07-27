import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";

import { SectionCard } from "../../components/SectionCard";
import { SeverityBadge } from "../../components/SeverityBadge";
import { PrimaryButton } from "../../components/PrimaryButton";
import { theme } from "../../components/theme";
import { DemoInfoPanel } from "../../components/DemoInfoPanel";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { fakeApi } from "../../data/fakeApi";
import { getDemoCaseById } from "../../data/demoData";
import MessagesTab from "../../components/CaseDetail/MessagesTab";
import {
  Case,
  CaseEvent,
  CaseNote,
  CaseStatus,
  SupportPlanType,
} from "../../models/types";
import { StaffStackParamList } from "../../navigation/types";
import { guardianMessagingApi } from "../../data/guardianMessagingApi";
import { teacherMessagingApi } from "../../data/teacherMessagingApi";
import { supabase } from "../../lib/supabase";
import {
  addCaseNote,
  getCaseActivity,
  getCaseById,
  updateCaseStatus,
  updateSupportPlan,
} from "../../services/cases";
import { optimisticUpdate } from "../../utils/optimisticUpdate";
import {
  enqueueAction,
  flushOfflineQueue,
  getOfflineQueueCount,
  OfflineAction,
} from "../../utils/offlineQueue";
import type { RouteProp, NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation, useRoute } from "../../navigation/compatTypes";

type CaseDetailRoute = RouteProp<StaffStackParamList, "CaseDetail">;

const CASE_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  [CaseStatus.New]: [CaseStatus.InReview],
  [CaseStatus.InReview]: [CaseStatus.ActionRequired, CaseStatus.Resolved],
  [CaseStatus.ActionRequired]: [CaseStatus.InReview],
  [CaseStatus.Resolved]: [CaseStatus.Archived],
  [CaseStatus.Archived]: [],
};

const STATUS_LABELS: Record<CaseStatus, string> = {
  [CaseStatus.New]: "New",
  [CaseStatus.InReview]: "In Review",
  [CaseStatus.ActionRequired]: "Action Required",
  [CaseStatus.Resolved]: "Resolved",
  [CaseStatus.Archived]: "Archived",
};

const SUPPORT_PLAN_LABELS: Record<SupportPlanType, string> = {
  check_in: "Student check-in",
  parent: "Parent communication",
  monitor: "Monitor / observe",
  counselor: "Request counselor support",
  safety: "Safety escalation",
};

const TRACKING_LABELS: Record<CaseStatus, string> = {
  [CaseStatus.New]: "Continue support",
  [CaseStatus.InReview]: "Continue support",
  [CaseStatus.ActionRequired]: "Request action",
  [CaseStatus.Resolved]: "Mark resolved",
  [CaseStatus.Archived]: "Archive case",
};

const STATUS_BADGE_STYLES: Record<CaseStatus, ViewStyle> = {
  [CaseStatus.New]: { backgroundColor: "#DFE6E9" },
  [CaseStatus.InReview]: { backgroundColor: "#FFEAA7" },
  [CaseStatus.ActionRequired]: { backgroundColor: "#FAB1A0" },
  [CaseStatus.Resolved]: { backgroundColor: "#55EFC4" },
  [CaseStatus.Archived]: { backgroundColor: "#B2BEC3" },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatDateTime = (value: string) => new Date(value).toLocaleString();

export const CaseDetailScreen = () => {
  const { currentUser, setCurrentUser, isDemoMode } = useAppContext();
  const route = useRoute<CaseDetailRoute>();
  const navigation =
    useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [caseRecord, setCaseRecord] = useState<Case | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineCount, setOfflineCount] = useState(0);
  const [reviewed, setReviewed] = useState(false);
  const [supportType, setSupportType] = useState<SupportPlanType | null>(null);
  const [selectedNextStatus, setSelectedNextStatus] =
    useState<CaseStatus | null>(null);
  const [shareOnReassign, setShareOnReassign] = useState(false);
  const [parentMessage, setParentMessage] = useState("");
  const [teacherMessage, setTeacherMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<"plan" | "messages">("messages");

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("CaseInbox");
  };

  const loadCase = useCallback(async (caseId: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const [match, activity] = await Promise.all([
        getCaseById(caseId),
        getCaseActivity(caseId),
      ]);
      setCaseRecord(match ?? null);
      setNotes(activity.notes);
      setEvents(activity.events);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load case details.";
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCase(route.params.caseId);
  }, [loadCase, route.params.caseId, currentUser]);

  const formattedDate = useMemo(() => {
    if (!caseRecord?.createdAt) {
      return "Not available";
    }
    return `Opened ${formatDate(caseRecord.createdAt)}`;
  }, [caseRecord?.createdAt]);

  useEffect(() => {
    if (caseRecord?.supportPlanType) {
      setSupportType(caseRecord.supportPlanType);
    }
  }, [caseRecord?.supportPlanType]);

  const allowedTransitions = useMemo(() => {
    if (!caseRecord || !currentUser) {
      return [];
    }
    if (currentUser.staffRole !== "counselor") {
      return [];
    }
    return CASE_TRANSITIONS[caseRecord.status];
  }, [caseRecord, currentUser]);

  useEffect(() => {
    if (allowedTransitions.length === 0) {
      setSelectedNextStatus(null);
      return;
    }
    setSelectedNextStatus((current) => current ?? allowedTransitions[0]);
  }, [allowedTransitions]);

  useEffect(() => {
    getOfflineQueueCount().then(setOfflineCount);
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOnline) {
      flushOfflineQueue(currentUser).then(setOfflineCount);
    }
  }, [isOnline, currentUser]);

  useEffect(() => {
    if (!caseRecord) {
      return;
    }
    const caseId = caseRecord.id;
    const channel = supabase
      .channel(`case-${caseId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cases", filter: `id=eq.${caseId}` },
        async () => {
          await loadCase(caseId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "case_notes",
          filter: `case_id=eq.${caseId}`,
        },
        async () => {
          await loadCase(caseId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "case_events",
          filter: `case_id=eq.${caseId}`,
        },
        async () => {
          await loadCase(caseId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseRecord, loadCase]);

  const proceedStatusChange = async (nextStatus: CaseStatus) => {
    if (!caseRecord || !currentUser) {
      return;
    }
    const previousStatus = caseRecord.status;
    const createdAt = new Date().toISOString();

    const apply = () => {
      setCaseRecord({ ...caseRecord, status: nextStatus });
      setEvents((prev) => [
        {
          id: `EVENT-${Date.now()}`,
          type: "status_change",
          actorName: currentUser.name,
          fromStatus: previousStatus,
          toStatus: nextStatus,
          createdAt,
        },
        ...prev,
      ]);
    };

    const rollback = () => {
      setCaseRecord({ ...caseRecord, status: previousStatus });
    };

    if (!isOnline) {
      apply();
      await enqueueAction({
        id: `OFFLINE-${Date.now()}`,
        type: "status_change",
        caseId: caseRecord.id,
        from: previousStatus,
        to: nextStatus,
      } as OfflineAction);
      setOfflineCount((count) => count + 1);
      return;
    }

    try {
      setUpdating(true);
      await optimisticUpdate(
        apply,
        rollback,
        async () => {
          await updateCaseStatus(
            caseRecord.id,
            nextStatus,
            currentUser.name,
            previousStatus
          );
        }
      );
    } catch (error) {
      if ((error as { code?: string; status?: number })?.code === "CONFLICT" ||
          (error as { status?: number })?.status === 409) {
        await loadCase(caseRecord.id);
        Alert.alert(
          "Case Updated",
          "The case was modified by another user. Please review the latest state."
        );
        return;
      }
      Alert.alert("Update failed", "Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = (nextStatus: CaseStatus) => {
    if (nextStatus === CaseStatus.Archived) {
      Alert.alert(
        "Archive Case",
        "This will remove the case from active workflows.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Archive",
            style: "destructive",
            onPress: () => proceedStatusChange(nextStatus),
          },
        ]
      );
      return;
    }

    proceedStatusChange(nextStatus);
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !caseRecord || !currentUser) {
      return;
    }

    const createdAt = new Date().toISOString();
    const noteContent = noteText.trim();
    const tempNoteId = `NOTE-TEMP-${Date.now()}`;
    const tempEventId = `EVENT-TEMP-${Date.now()}`;

    const apply = () => {
      const tempNote: CaseNote = {
        id: tempNoteId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        role: "counselor",
        content: noteContent,
        createdAt,
      };
      setNotes((prev) => [tempNote, ...prev]);
      setEvents((prev) => [
        {
          id: tempEventId,
          type: "note_added",
          actorName: currentUser.name,
          notePreview: noteContent.slice(0, 80),
          createdAt,
        },
        ...prev,
      ]);
      setNoteText("");
    };

    const rollback = () => {
      setNotes((prev) => prev.filter((note) => note.id !== tempNoteId));
      setEvents((prev) => prev.filter((event) => event.id !== tempEventId));
      setNoteText(noteContent);
    };

    if (!isOnline) {
      apply();
      await enqueueAction({
        id: `OFFLINE-${Date.now()}`,
        type: "note_added",
        caseId: caseRecord.id,
        content: noteContent,
      } as OfflineAction);
      setOfflineCount((count) => count + 1);
      return;
    }

    try {
      setSubmitting(true);
      await optimisticUpdate(apply, rollback, async () => {
        const note = await addCaseNote(
          caseRecord.id,
          noteContent,
          currentUser.name,
          currentUser.id
        );
        setNotes((prev) =>
          prev.map((item) => (item.id === tempNoteId ? note : item))
        );
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderEventText = (event: CaseEvent) => {
    switch (event.type) {
      case "status_change":
        return `${event.actorName} changed status from ${
          STATUS_LABELS[event.fromStatus ?? CaseStatus.New]
        } to ${STATUS_LABELS[event.toStatus ?? CaseStatus.New]}`;
      case "note_added":
        return `${event.actorName} added a note`;
      default:
        return "Activity update";
    }
  };

  const submittedByLabel = caseRecord?.reportSource
    ? caseRecord.reportSource === "teacher"
      ? "Staff"
      : "Student"
    : "Student";

  const isSafetyEligible =
    caseRecord?.severity === "high" ||
    caseRecord?.incidentType === "safety" ||
    !!caseRecord?.safetyConcernType;

  const supportOptions: {
    key: SupportPlanType;
    label: string;
    helper: string;
  }[] = [
    {
      key: "check_in",
      label: "Student check-in",
      helper: "Start with a private check-in and clarify what support is needed.",
    },
    {
      key: "parent",
      label: "Parent communication",
      helper: "Send a short, supportive update or request a conversation.",
    },
    {
      key: "monitor",
      label: "Monitor / observe",
      helper: "Document what you see and reassess after new information.",
    },
    {
      key: "counselor",
      label: "Request counselor support",
      helper: "Loop in counseling for coordinated support.",
    },
  ];

  if (isSafetyEligible) {
    supportOptions.push({
      key: "safety",
      label: "Safety escalation",
      helper: "Escalation routes directly to the SRO per district protocol.",
    });
  }

  if (!currentUser || currentUser.staffRole !== "counselor") {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  if (loading) {
    return (
      <View style={styles.page}>
        <SectionCard>
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.bodyText}>Loading case details...</Text>
          </View>
        </SectionCard>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.page}>
        <SectionCard>
          <Text style={styles.bodyText}>Unable to load case details.</Text>
          <Text style={styles.errorText}>{loadError}</Text>
          <PrimaryButton
            label="Retry"
            onPress={() => loadCase(route.params.caseId)}
            variant="secondary"
            style={styles.actionButton}
          />
          <PrimaryButton
            label="Back to inbox"
            onPress={handleBack}
            variant="ghost"
            style={styles.actionButton}
          />
        </SectionCard>
      </View>
    );
  }

  if (!caseRecord) {
    return (
      <View style={styles.page}>
        <SectionCard>
          <Text style={styles.bodyText}>Case not found.</Text>
          <PrimaryButton
            label="Back to inbox"
            onPress={() => navigation.navigate("CaseInbox")}
            variant="secondary"
            style={styles.actionButton}
          />
        </SectionCard>
      </View>
    );
  }

  const actionDetails: Record<
    SupportPlanType,
    { prompt: string; buttonLabel: string; noteTemplate: string }
  > = {
    check_in: {
      prompt: "Start with a brief check-in to understand what support is needed.",
      buttonLabel: "Draft check-in note",
      noteTemplate: "Planned student check-in. Waiting for availability.",
    },
    parent: {
      prompt: "Choose a calm, short update and share next steps when ready.",
      buttonLabel: "Draft parent outreach note",
      noteTemplate: "Prepare parent communication. Use supportive tone.",
    },
    monitor: {
      prompt: "Document observations and set a follow-up reminder.",
      buttonLabel: "Draft monitoring note",
      noteTemplate: "Monitoring plan created. Reassess after new information.",
    },
    counselor: {
      prompt: "Coordinate with a counselor for continuity of support.",
      buttonLabel: "Draft counselor handoff note",
      noteTemplate: "Requesting counselor support for ongoing follow-up.",
    },
    safety: {
      prompt: "Escalate through safety protocol if this meets criteria.",
      buttonLabel: "Draft safety escalation note",
      noteTemplate: "Safety escalation considered based on reported concerns.",
    },
  };

  const selectedAction = supportType ? actionDetails[supportType] : null;
  const canMessage = currentUser.staffRole === "counselor";
  const supportPlanStatusLabel = useMemo(() => {
    if (!supportType) {
      return "Not set";
    }
    if (supportType === "monitor") {
      return "Monitoring";
    }
    if (supportType === "safety") {
      return "Escalated";
    }
    return "Active";
  }, [supportType]);
  const supportPlanUpdatedLabel = caseRecord.supportPlanUpdatedAt
    ? formatDate(caseRecord.supportPlanUpdatedAt)
    : "Not set";
  const supportPlanOwner =
    caseRecord.supportPlanOwnerName ?? currentUser.name ?? "Counseling team";

  const handleSupportPlanSelect = async (nextType: SupportPlanType) => {
    if (!caseRecord || !currentUser) {
      return;
    }
    const previousType = caseRecord.supportPlanType;
    const previousUpdatedAt = caseRecord.supportPlanUpdatedAt;
    const previousOwner = caseRecord.supportPlanOwnerName;
    const nextUpdatedAt = new Date().toISOString();

    const apply = () => {
      setSupportType(nextType);
      setCaseRecord((current) =>
        current
          ? {
              ...current,
              supportPlanType: nextType,
              supportPlanUpdatedAt: nextUpdatedAt,
              supportPlanOwnerName: currentUser.name,
            }
          : current
      );
    };

    const rollback = () => {
      setSupportType(previousType ?? null);
      setCaseRecord((current) =>
        current
          ? {
              ...current,
              supportPlanType: previousType ?? undefined,
              supportPlanUpdatedAt: previousUpdatedAt,
              supportPlanOwnerName: previousOwner,
            }
          : current
      );
    };

    if (isDemoMode) {
      // Use in-memory fakeApi for demo mode so inbox reflects changes
      const previousType = caseRecord.supportPlanType;
      const previousUpdatedAt = caseRecord.supportPlanUpdatedAt;
      const previousOwner = caseRecord.supportPlanOwnerName;
      const nextUpdatedAt = new Date().toISOString();

      const applyDemo = () => {
        setSupportType(nextType);
        setCaseRecord((current) =>
          current
            ? {
                ...current,
                supportPlanType: nextType,
                supportPlanUpdatedAt: nextUpdatedAt,
                supportPlanOwnerName: currentUser.name,
              }
            : current
        );
      };

      const rollbackDemo = () => {
        setSupportType(previousType ?? null);
        setCaseRecord((current) =>
          current
            ? {
                ...current,
                supportPlanType: previousType ?? undefined,
                supportPlanUpdatedAt: previousUpdatedAt,
                supportPlanOwnerName: previousOwner,
              }
            : current
        );
      };

      try {
        applyDemo();
        await fakeApi.updateSupportPlan(caseRecord.id, nextType, currentUser.name);
      } catch (err) {
        rollbackDemo();
        Alert.alert("Update failed", "Please try again.");
      }
      return;
    }

    if (!isOnline) {
      apply();
      await enqueueAction({
        id: `SUPPORT-${Date.now()}`,
        type: "support_plan",
        caseId: caseRecord.id,
        supportPlanType: nextType,
        ownerName: currentUser.name,
      });
      setOfflineCount(await getOfflineQueueCount());
      return;
    }

    try {
      await optimisticUpdate(apply, rollback, () =>
        updateSupportPlan(caseRecord.id, nextType, currentUser.name)
      );
    } catch {
      Alert.alert("Update failed", "Please try again.");
    }
  };
  const guidancePrompts = useMemo(() => {
    if (!caseRecord) {
      return [];
    }
    const prompts: { title: string; body: string }[] = [
      {
        title: "Start with a private check-in",
        body: "Begin with a calm check-in before drawing conclusions or taking action.",
      },
      {
        title: "Document observations neutrally",
        body: "Capture what was seen or heard without assumptions or labels.",
      },
    ];
    const incident = caseRecord.incidentType.toLowerCase();
    if (incident.includes("bully") || incident.includes("peer")) {
      prompts.unshift({
        title: "Bullying concerns",
        body: "Look for patterns, avoid promises, and loop in caregivers when appropriate.",
      });
    }
    if (supportType === "safety" || caseRecord.safetyConcernType) {
      prompts.unshift({
        title: "Safety escalation",
        body: "If immediate risk is present, follow district protocol and notify the SRO.",
      });
    }
    return prompts.slice(0, 3);
  }, [caseRecord, supportType]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <SectionCard>
        <View style={styles.header}>
          <Text style={styles.title}>
            {caseRecord.title ||
              `${caseRecord.incidentType.replace(/^\w/, (char) => char.toUpperCase())} Case`}
          </Text>

          <View style={styles.metaRow}>
            <View style={[styles.badge, STATUS_BADGE_STYLES[caseRecord.status]]}>
              <Text style={styles.badgeText}>
                {STATUS_LABELS[caseRecord.status]}
              </Text>
            </View>

            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.badgeRow}>
          <SeverityBadge severity={caseRecord.severity} />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.stepTitle}>What was shared</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Concern type</Text>
          <Text style={styles.infoValue}>{caseRecord.incidentType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Submitted by</Text>
          <Text style={styles.infoValue}>{submittedByLabel}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Time received</Text>
          <Text style={styles.infoValue}>{formattedDate}</Text>
        </View>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.bodyText}>{caseRecord.narrative}</Text>
        {caseRecord.safetyConcernType ? (
          <>
            <Text style={styles.sectionTitle}>Safety concern</Text>
            <Text style={styles.bodyText}>{caseRecord.safetyConcernType}</Text>
          </>
        ) : null}
        <View style={styles.reviewRow}>
          <PrimaryButton
            label={reviewed ? "Reviewed" : "I’ve reviewed this"}
            onPress={() => setReviewed(true)}
            variant={reviewed ? "secondary" : "primary"}
            style={styles.actionButton}
          />
          <Text style={styles.helperText}>
            Reviewing confirms awareness — it doesn’t commit you to a decision.
          </Text>
        </View>
      </SectionCard>

      {caseRecord.id.startsWith("demo-") ? (
        <DemoInfoPanel
          guidance={getDemoCaseById(caseRecord.id)?.guidance}
          suggestedActions={getDemoCaseById(caseRecord.id)?.suggestedActions}
        />
      ) : null}

      <View style={{ flexDirection: "row", gap: 8, marginVertical: 8 }}>
        <Button title="Plan" onPress={() => setActiveTab("plan")} />
        {canMessage ? <Button title="Messages" onPress={() => setActiveTab("messages")} /> : null}
      </View>

      {activeTab === "plan" ? (
        <>
          <SectionCard>
            <Text style={styles.stepTitle}>Current support plan</Text>
            {supportType ? (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Primary approach</Text>
                  <Text style={styles.infoValue}>
                    {SUPPORT_PLAN_LABELS[supportType]}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text style={styles.infoValue}>{supportPlanStatusLabel}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Owner</Text>
                  <Text style={styles.infoValue}>{supportPlanOwner}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last updated</Text>
                  <Text style={styles.infoValue}>{supportPlanUpdatedLabel}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.bodyText}>
                No support plan selected yet. Choose a plan below to document the
                approach.
              </Text>
            )}
          </SectionCard>

          <SectionCard>
            <Text style={styles.stepTitle}>Support plan</Text>
            {supportOptions.map((option) => {
              const isSelected = supportType === option.key;
              return (
                <View key={option.key} style={styles.optionRow}>
                  <View
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                  >
                    <Text style={styles.optionTitle}>{option.label}</Text>
                    {isSelected ? (
                      <Text style={styles.optionHelper}>{option.helper}</Text>
                    ) : null}
                    <PrimaryButton
                      label={isSelected ? "Selected" : "Choose"}
                      onPress={() => handleSupportPlanSelect(option.key)}
                      variant={isSelected ? "secondary" : "ghost"}
                      style={styles.optionButton}
                    />
                  </View>
                </View>
              );
            })}
          </SectionCard>

          <SectionCard>
            <Text style={styles.stepTitle}>Recommended next action</Text>
            {selectedAction ? (
              <>
                <Text style={styles.bodyText}>{selectedAction.prompt}</Text>
                <View style={styles.actionRow}>
                  <PrimaryButton
                    label={selectedAction.buttonLabel}
                    onPress={() => setNoteText(selectedAction.noteTemplate)}
                    variant="secondary"
                    style={styles.actionButton}
                  />
                  <PrimaryButton
                    label="Add brief note"
                    onPress={() => setNoteText("Brief support note: ")}
                    variant="ghost"
                    style={styles.actionButton}
                  />
                </View>
                {supportType === "safety" ? (
                  <View style={styles.safetyBanner}>
                    <Text style={styles.safetyTitle}>
                      This concern meets safety escalation criteria.
                    </Text>
                    <Text style={styles.safetyText}>
                      Escalation follows district protocol and routes directly to
                      the SRO.
                    </Text>
                  </View>
                ) : null}
              </>
            ) : (
              <Text style={styles.bodyText}>
                Choose a support type above to see the next recommended action.
              </Text>
            )}
          </SectionCard>

          <SectionCard>
            <Text style={styles.stepTitle}>Guidance & resources</Text>
            <Text style={styles.bodyText}>
              Counselor prompts to support next steps and documentation.
            </Text>
            {guidancePrompts.map((prompt) => (
              <View key={prompt.title} style={styles.guidanceCard}>
                <Text style={styles.guidanceTitle}>{prompt.title}</Text>
                <Text style={styles.guidanceText}>{prompt.body}</Text>
              </View>
            ))}
          </SectionCard>

          <SectionCard>
            <View style={styles.notesSection}>
              <Text style={styles.stepTitle}>Notes for continuity</Text>
              <TextInput
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Add a note…"
                multiline
                style={styles.noteInput}
              />
              <Text style={styles.helperText}>
                Brief notes help the next staff member understand what happened and
                what’s next.
              </Text>
              <View style={styles.checkboxRow}>
                <Button
                  title={shareOnReassign ? "✓ Share if reassigned" : "Share if reassigned"}
                  onPress={() => setShareOnReassign((prev) => !prev)}
                />
              </View>
              <View style={styles.noteButton}>
                <Button
                  title="Add Note"
                  disabled={!noteText.trim() || submitting}
                  onPress={handleAddNote}
                />
              </View>
              {notes.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  <Text style={styles.noteAuthor}>
                    {note.authorName} • {note.role}
                  </Text>
                  <Text style={styles.noteContent}>{note.content}</Text>
                  <Text style={styles.noteDate}>
                    {formatDateTime(note.createdAt)}
                  </Text>
                </View>
              ))}
            </View>
          </SectionCard>

          {canMessage ? (
            <SectionCard>
              <Text style={styles.stepTitle}>Communication</Text>
              <Text style={styles.bodyText}>
                Messages related to this support plan.
              </Text>
              <View style={styles.communicationBlock}>
                <Text style={styles.sectionTitle}>Message parent</Text>
                <TextInput
                  value={parentMessage}
                  onChangeText={setParentMessage}
                  placeholder="Draft a short, supportive update…"
                  multiline
                  style={styles.noteInput}
                />
                <PrimaryButton
                  label="Send parent message"
                  onPress={async () => {
                    if (!caseRecord.guardianId || !parentMessage.trim()) {
                      return;
                    }
                    setSendingMessage(true);
                    await guardianMessagingApi.createMessage({
                      guardianId: caseRecord.guardianId,
                      guardianName: "Guardian",
                      subject: "Update from counseling team",
                      body: parentMessage,
                      wantsCallback: false,
                    });
                    setParentMessage("");
                    setSendingMessage(false);
                  }}
                  disabled={
                    !caseRecord.guardianId ||
                    !parentMessage.trim() ||
                    sendingMessage
                  }
                  style={styles.actionButton}
                />
                {!caseRecord.guardianId ? (
                  <Text style={styles.helperText}>
                    Parent messaging becomes available once a guardian is linked.
                  </Text>
                ) : null}
              </View>
              <View style={styles.communicationBlock}>
                <Text style={styles.sectionTitle}>Message teacher</Text>
                <TextInput
                  value={teacherMessage}
                  onChangeText={setTeacherMessage}
                  placeholder="Share guidance or next steps for the teacher…"
                  multiline
                  style={styles.noteInput}
                />
                <PrimaryButton
                  label="Send teacher message"
                  onPress={async () => {
                    if (!teacherMessage.trim()) {
                      return;
                    }
                    setSendingMessage(true);
                    await teacherMessagingApi.sendMessage({
                      teacherId: "TEACHER-1",
                      counselorName: currentUser.name,
                      contextLabel: "Regarding a student concern",
                      body: teacherMessage,
                    });
                    setTeacherMessage("");
                    setSendingMessage(false);
                  }}
                  disabled={!teacherMessage.trim() || sendingMessage}
                  style={styles.actionButton}
                />
              </View>
            </SectionCard>
          ) : null}
        </>
      ) : (
        canMessage ? (
          <SectionCard>
            <Text style={styles.stepTitle}>Messages</Text>
            <Text style={styles.bodyText}>Case-scoped conversation with parents and teachers.</Text>
            {caseRecord ? <MessagesTab caseId={caseRecord.id} /> : null}
          </SectionCard>
        ) : null
      )}

      

      <SectionCard>
        <Text style={styles.stepTitle}>Tracking & status</Text>
        <Text style={styles.bodyText}>
          Choose how this should be tracked moving forward.
        </Text>
        <View style={styles.actions}>
          {allowedTransitions.map((status) => {
            const isSelected = selectedNextStatus === status;
            return (
              <View key={status} style={styles.optionRow}>
                <View
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionTitle}>
                      {TRACKING_LABELS[status]}
                    </Text>
                    {isSelected ? (
                      <View style={styles.selectedPill}>
                        <Text style={styles.selectedPillText}>Selected</Text>
                      </View>
                    ) : null}
                  </View>
                  <PrimaryButton
                    label={isSelected ? "Keep selected" : "Choose"}
                    onPress={() => setSelectedNextStatus(status)}
                    variant={isSelected ? "secondary" : "ghost"}
                    style={styles.optionButton}
                  />
                </View>
              </View>
            );
          })}
          <PrimaryButton
            label="Finish"
            onPress={() =>
              selectedNextStatus ? handleStatusChange(selectedNextStatus) : null
            }
            disabled={!selectedNextStatus || updating}
            style={styles.actionButton}
          />
          {!isOnline ? (
            <View style={styles.syncBanner}>
              <Text style={styles.syncText}>Offline — changes will sync</Text>
            </View>
          ) : null}
          {offlineCount > 0 ? (
            <Text style={styles.pendingText}>
              {offlineCount} change{offlineCount === 1 ? "" : "s"} pending sync
            </Text>
          ) : null}
        </View>
      </SectionCard>

      <SectionCard>
        <View style={styles.timeline}>
          <Text style={styles.sectionTitle}>Activity</Text>
          {events.map((event) => (
            <View key={event.id} style={styles.timelineItem}>
              <Text style={styles.timelineText}>
                {renderEventText(event)}
              </Text>
              <Text style={styles.timelineDate}>
                {formatDateTime(event.createdAt)}
              </Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <View style={styles.actionRow}>
          <PrimaryButton
            label="Back to inbox"
            onPress={handleBack}
            variant="ghost"
            style={styles.actionButton}
          />
        </View>
      </SectionCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 18,
  },
  notesSection: {
    gap: 12,
  },
  communicationBlock: {
    marginTop: 12,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
  },
  guidanceCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.subtleBackground,
    marginTop: 10,
  },
  guidanceTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  guidanceText: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.mutedText,
  },
  infoValue: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: "600",
  },
  reviewRow: {
    marginTop: 12,
    gap: 8,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  timeline: {
    gap: 12,
  },
  optionRow: {
    marginBottom: 10,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.surface,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.subtleBackground,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  selectedPill: {
    backgroundColor: theme.colors.subtleBackground,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.text,
  },
  optionHelper: {
    fontSize: 13,
    color: theme.colors.mutedText,
    marginTop: 6,
  },
  optionButton: {
    alignSelf: "flex-start",
    marginTop: 10,
  },
  noteInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.surface,
    textAlignVertical: "top",
  },
  noteButton: {
    alignSelf: "flex-start",
  },
  checkboxRow: {
    alignSelf: "flex-start",
  },
  noteCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.surface,
  },
  noteAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6,
  },
  noteContent: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginTop: 8,
  },
  timelineItem: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.surface,
  },
  timelineText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  timelineDate: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginTop: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.mutedText,
    marginBottom: 10,
  },
  header: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  date: {
    fontSize: 13,
    color: theme.colors.mutedText,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.danger,
    marginTop: 6,
    marginBottom: 12,
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
  syncBanner: {
    backgroundColor: "#FFF3CD",
    padding: 8,
    borderRadius: 6,
  },
  syncText: {
    fontSize: 12,
    color: "#856404",
  },
  pendingText: {
    fontSize: 12,
    color: theme.colors.mutedText,
  },
  safetyBanner: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginTop: 12,
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#991B1B",
    marginBottom: 4,
  },
  safetyText: {
    fontSize: 13,
    color: "#7F1D1D",
    lineHeight: 18,
  },
  actionButton: {
    alignSelf: "flex-start",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
