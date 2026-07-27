import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { supportApi } from "../../data/supportApi";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";

const incidentOptions = [
  "Name-calling / threats",
  "Physical harm",
  "Online bullying",
  "Being excluded",
  "Hazing",
  "Other",
];

const locationOptions = [
  "In class / hallway",
  "Bus",
  "Online",
  "Sports / club",
  "Other",
];

const supportOptions = [
  "I want to talk to a teacher or counselor",
  "I just want coping steps",
  "I want a parent / guardian to follow up",
];

const suggestionCards = [
  "Stay near friends or staff in shared spaces.",
  "Save screenshots or details if it is online.",
  "You do not have to handle this alone.",
];

export const BullyingHelpScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [safety, setSafety] = useState<"yes" | "no" | null>(null);
  const [incidentType, setIncidentType] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [supportChoice, setSupportChoice] = useState<string | null>(null);
  const [safetyPlanNote, setSafetyPlanNote] = useState("");

  if (!requireRole(["student"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const handleCounselorRequest = async () => {
    if (!currentUser) {
      return;
    }
    await supportApi.createSupportRequest({
      studentId: currentUser.id,
      type: "bullying_support",
      note: `Incident: ${incidentType || "unspecified"}, location: ${
        location || "unspecified"
      }`,
    });
  };

  const handleSaveSafetyPlan = async () => {
    if (!currentUser) {
      return;
    }
    if (!safetyPlanNote.trim()) {
      return;
    }
    await supportApi.saveSafetyPlanNote({
      studentId: currentUser.id,
      note: safetyPlanNote.trim(),
    });
    setSafetyPlanNote("");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Bullying support</Text>
        <Text style={styles.subtitle}>
          You can ask for help without making a report. Choose what feels right
          for you today.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>
          Step 1: Are you in immediate danger right now?
        </Text>
        <View style={styles.optionGroup}>
          {["Yes", "No"].map((option) => (
            <PrimaryButton
              key={option}
              label={option}
              onPress={() => setSafety(option === "Yes" ? "yes" : "no")}
              variant={safety === option.toLowerCase() ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
        {safety === "yes" ? (
          <Text style={styles.helperText}>
            Go to a trusted adult or call emergency services. You deserve
            support right away.
          </Text>
        ) : null}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Step 2: What happened?</Text>
        <View style={styles.optionGroup}>
          {incidentOptions.map((option) => (
            <PrimaryButton
              key={option}
              label={option}
              onPress={() => setIncidentType(option)}
              variant={incidentType === option ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Step 3: Where is it happening?</Text>
        <View style={styles.optionGroup}>
          {locationOptions.map((option) => (
            <PrimaryButton
              key={option}
              label={option}
              onPress={() => setLocation(option)}
              variant={location === option ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Step 4: What do you want?</Text>
        <View style={styles.optionGroup}>
          {supportOptions.map((option) => (
            <PrimaryButton
              key={option}
              label={option}
              onPress={() => setSupportChoice(option)}
              variant={supportChoice === option ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Supportive suggestions</Text>
        {suggestionCards.map((tip) => (
          <Text key={tip} style={styles.bodyText}>
            - {tip}
          </Text>
        ))}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>One-tap actions</Text>
        <PrimaryButton
          label="Request teacher or counselor outreach"
          onPress={handleCounselorRequest}
          variant="secondary"
          style={styles.optionButton}
        />
        <Text style={styles.helperText}>
          For formal concern reports, ask your parent / guardian to use the
          Parent / Guardian reporting section.
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="Save a safety plan note (private to you)"
          placeholderTextColor={theme.colors.mutedText}
          value={safetyPlanNote}
          onChangeText={setSafetyPlanNote}
          multiline
        />
        <PrimaryButton
          label="Save safety plan note"
          onPress={handleSaveSafetyPlan}
          variant="ghost"
          style={styles.optionButton}
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
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  optionGroup: {
    gap: 8,
  },
  optionButton: {
    alignSelf: "stretch",
  },
  helperText: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginTop: 8,
  },
  bodyText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    marginTop: 10,
    marginBottom: 8,
  },
});
