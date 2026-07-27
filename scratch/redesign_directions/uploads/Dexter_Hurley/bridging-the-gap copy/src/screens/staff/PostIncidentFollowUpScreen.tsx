import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { postIncidentApi } from "../../data/postIncidentApi";
import { PostIncidentPlan } from "../../models/types";
import { StaffStackParamList } from "../../navigation/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";
import type { RouteProp } from "../../navigation/compatTypes";
import { useRoute } from "../../navigation/compatTypes";

type PostIncidentRoute = RouteProp<StaffStackParamList, "PostIncidentFollowUp">;

export const PostIncidentFollowUpScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const route = useRoute<PostIncidentRoute>();
  const [plan, setPlan] = useState<PostIncidentPlan | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!requireRole(["educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const loadPlan = useCallback(async () => {
    setLoading(true);
    const data = await postIncidentApi.getPlan(route.params.caseId);
    setPlan(data);
    setNotes(data.notes || "");
    setLoading(false);
  }, [route.params.caseId]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const handleSaveNotes = async () => {
    if (!plan) {
      return;
    }
    const updated = await postIncidentApi.updateNotes(plan.caseId, notes);
    setPlan(updated);
  };

  const handleToggleChecklist = async (itemId: string) => {
    if (!plan) {
      return;
    }
    const updated = await postIncidentApi.toggleDebriefItem(plan.caseId, itemId);
    setPlan(updated);
  };

  const handleActivate = async () => {
    if (!plan) {
      return;
    }
    const updated = await postIncidentApi.activatePlan(plan.caseId);
    setPlan(updated);
  };

  const handleComplete = async () => {
    if (!plan) {
      return;
    }
    const updated = await postIncidentApi.completePlan(plan.caseId);
    setPlan(updated);
  };

  const handleMarkCheckIn = async (checkInId: string) => {
    if (!plan) {
      return;
    }
    const updated = await postIncidentApi.markCheckInComplete(plan.caseId, checkInId);
    setPlan(updated);
  };

  if (!plan) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <SectionCard>
          <Text style={styles.bodyText}>{loading ? "Loading..." : "No plan found."}</Text>
        </SectionCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Recovery & Follow-Up</Text>
        <Text style={styles.subtitle}>
          Post-incident support for students, families, and staff.
        </Text>
        <Text style={styles.metaText}>Status: {plan.status}</Text>
        <View style={styles.actionRow}>
          <PrimaryButton
            label="Activate plan"
            onPress={handleActivate}
            variant="secondary"
            style={styles.actionButton}
          />
          <PrimaryButton
            label="Mark complete"
            onPress={handleComplete}
            variant="ghost"
            style={styles.actionButton}
          />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Debrief checklist</Text>
        {plan.debriefChecklist.map((item) => (
          <PrimaryButton
            key={item.id}
            label={`${item.completed ? "✓ " : ""}${item.label}`}
            onPress={() => handleToggleChecklist(item.id)}
            variant={item.completed ? "secondary" : "ghost"}
            style={styles.checklistButton}
          />
        ))}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Follow-up check-ins</Text>
        {plan.followUps.map((item) => (
          <View key={item.id} style={styles.followCard}>
            <Text style={styles.followTitle}>
              {item.recipientType === "student" ? "Student" : "Guardian"} check-in
            </Text>
            <Text style={styles.bodyText}>{item.message}</Text>
            <Text style={styles.metaText}>
              Scheduled: {new Date(item.scheduledFor).toLocaleString()}
            </Text>
            <Text style={styles.metaText}>Status: {item.status}</Text>
            {item.status !== "completed" ? (
              <PrimaryButton
                label="Mark completed"
                onPress={() => handleMarkCheckIn(item.id)}
                variant="secondary"
                style={styles.actionButton}
              />
            ) : null}
          </View>
        ))}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Internal notes</Text>
        <TextInput
          style={styles.input}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add debrief notes or next steps..."
          placeholderTextColor={theme.colors.mutedText}
          multiline={true}
        />
        <PrimaryButton
          label="Save notes"
          onPress={handleSaveNotes}
          variant="secondary"
          style={styles.actionButton}
        />
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    alignSelf: "flex-start",
    marginTop: 10,
  },
  checklistButton: {
    alignSelf: "stretch",
    marginTop: 8,
  },
  followCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  followTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
});
