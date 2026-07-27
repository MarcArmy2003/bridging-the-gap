import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { mentalHealthApi } from "../../data/mentalHealthApi";
import { MentalHealthFeeling } from "../../models/types";
import { StudentStackParamList } from "../../navigation/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation } from "../../navigation/compatTypes";

const feelingOptions: { label: string; value: MentalHealthFeeling }[] = [
  { label: "I'm doing okay, just stressed", value: "stressed" },
  { label: "I've been feeling anxious or overwhelmed", value: "anxious" },
  { label: "I'm feeling sad or down", value: "sad" },
  { label: "I need to talk to someone", value: "need_to_talk" },
  { label: "I'm worried about a friend", value: "worried_about_friend" },
];

const supportOptions: {
  label: string;
  value: "yes" | "no" | "just_checking_in";
}[] = [
  { label: "Yes, I'd like someone to reach out", value: "yes" },
  { label: "Not right now", value: "no" },
  { label: "I just wanted to check in", value: "just_checking_in" },
];

const distressSignals: MentalHealthFeeling[] = [
  "anxious",
  "sad",
  "need_to_talk",
  "worried_about_friend",
];

export const MentalHealthCheckInScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const [selectedFeelings, setSelectedFeelings] = useState<
    MentalHealthFeeling[]
  >([]);
  const [supportChoice, setSupportChoice] = useState<
    "yes" | "no" | "just_checking_in"
  >("just_checking_in");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showSafetyNotice = useMemo(() => {
    return selectedFeelings.some((feeling) =>
      distressSignals.includes(feeling)
    );
  }, [selectedFeelings]);

  if (!requireRole(["student"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const toggleFeeling = (value: MentalHealthFeeling) => {
    setSelectedFeelings((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      return;
    }
    if (selectedFeelings.length === 0) {
      Alert.alert("Select at least one option", "Choose what feels closest.");
      return;
    }
    setSubmitting(true);
    await mentalHealthApi.createCheckIn({
      studentId: currentUser.id,
      studentName: currentUser.name,
      selectedFeelings,
      wantsFollowUp: supportChoice,
      message,
    });
    setSubmitting(false);
    setSelectedFeelings([]);
    setSupportChoice("just_checking_in");
    setMessage("");
    navigation.navigate("MentalHealthConfirmation");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>How are you feeling today?</Text>
        <Text style={styles.subtitle}>
          Choose all that apply. You do not need to explain everything.
        </Text>
        <View style={styles.optionGroup}>
          {feelingOptions.map((option) => {
            const selected = selectedFeelings.includes(option.value);
            return (
              <PrimaryButton
                key={option.value}
                label={option.label}
                onPress={() => toggleFeeling(option.value)}
                variant={selected ? "secondary" : "ghost"}
                style={styles.optionButton}
              />
            );
          })}
        </View>
        {showSafetyNotice ? (
          <Text style={styles.safetyText}>
            If you are in immediate danger or thinking about harming yourself,
            please contact emergency services or a trusted adult right away.
          </Text>
        ) : null}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>
          Would you like a teacher or counselor to reach out?
        </Text>
        <Text style={styles.helperText}>
          This request is confidential and shared only with authorized school
          staff.
        </Text>
        <View style={styles.optionGroup}>
          {supportOptions.map((option) => (
            <PrimaryButton
              key={option.value}
              label={option.label}
              onPress={() => setSupportChoice(option.value)}
              variant={supportChoice === option.value ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Optional message</Text>
        <TextInput
          style={styles.textArea}
          placeholder="You don't have to explain everything."
          placeholderTextColor={theme.colors.mutedText}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <PrimaryButton
          label={submitting ? "Submitting..." : "Send check-in"}
          onPress={handleSubmit}
          disabled={submitting}
          style={styles.submitButton}
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
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6,
  },
  helperText: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginBottom: 10,
  },
  optionGroup: {
    gap: 8,
  },
  optionButton: {
    alignSelf: "stretch",
  },
  safetyText: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginTop: 12,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    marginTop: 8,
    marginBottom: 10,
  },
  submitButton: {
    marginTop: 6,
  },
});
