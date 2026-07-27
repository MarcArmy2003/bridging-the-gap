import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { supportApi } from "../../data/supportApi";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";

const intensityOptions = [
  "Mild stress",
  "Hard day",
  "Really overwhelmed",
  "I need to talk to someone",
];

const helpOptions = [
  "Breathing/grounding exercise",
  "Write what is on your mind",
  "Ask a teacher or counselor to reach out",
  "Ask for a quiet space / break",
];

export const WellBeingHelpScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [intensity, setIntensity] = useState<string | null>(null);
  const [helpChoice, setHelpChoice] = useState<string | null>(null);
  const [bestTime, setBestTime] = useState("");
  const [note, setNote] = useState("");

  if (!requireRole(["student"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const handleSupportRequest = async () => {
    if (!currentUser) {
      return;
    }
    await supportApi.createSupportRequest({
      studentId: currentUser.id,
      type: "wellbeing",
      bestTime: bestTime.trim() || undefined,
      note: note.trim() || undefined,
    });
    setBestTime("");
    setNote("");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Well-being support</Text>
        <Text style={styles.subtitle}>
          This is a supportive check-in and does not provide medical advice.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Step 1: How intense is it today?</Text>
        <View style={styles.optionGroup}>
          {intensityOptions.map((option) => (
            <PrimaryButton
              key={option}
              label={option}
              onPress={() => setIntensity(option)}
              variant={intensity === option ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
        {intensity === "Really overwhelmed" ? (
          <Text style={styles.helperText}>
            If you are thinking about harming yourself or are in immediate
            danger, contact emergency services or a trusted adult right away.
          </Text>
        ) : null}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Step 2: What would help right now?</Text>
        <View style={styles.optionGroup}>
          {helpOptions.map((option) => (
            <PrimaryButton
              key={option}
              label={option}
              onPress={() => setHelpChoice(option)}
              variant={helpChoice === option ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
        {helpChoice === "Breathing/grounding exercise" ? (
          <Text style={styles.helperText}>
            Try this: breathe in for 4 counts, hold for 4, breathe out for 6.
            Repeat three times.
          </Text>
        ) : null}
        {helpChoice === "Write what is on your mind" ? (
          <Text style={styles.helperText}>
            You can write a few sentences about what is bothering you. You do
            not have to share it unless you want to.
          </Text>
        ) : null}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Step 3: Request support (optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Best time to talk (optional)"
          placeholderTextColor={theme.colors.mutedText}
          value={bestTime}
          onChangeText={setBestTime}
        />
        <TextInput
          style={styles.textArea}
          placeholder="Optional note"
          placeholderTextColor={theme.colors.mutedText}
          value={note}
          onChangeText={setNote}
          multiline
        />
        <PrimaryButton
          label="Request teacher or counselor outreach"
          onPress={handleSupportRequest}
          variant="secondary"
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
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
  },
});
