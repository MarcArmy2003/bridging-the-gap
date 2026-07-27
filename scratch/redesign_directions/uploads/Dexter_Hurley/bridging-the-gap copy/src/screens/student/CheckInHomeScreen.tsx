import React, { useState } from "react";
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
import { supportApi } from "../../data/supportApi";
import { StudentStackParamList } from "../../navigation/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";
import { shouldBlockStudentSelfService } from "../../utils/gradeAccess";
import { ElementarySupportNotice } from "../../components/ElementarySupportNotice";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation } from "../../navigation/compatTypes";

const dayOptions = [
  "Things feel mostly okay",
  "Something has been bothering me",
  "School has been hard lately",
  "I'm worried about something",
  "I don't really know",
];

const unsafeOptions = [
  "Yes, right now",
  "Yes, sometimes",
  "I'm not sure",
  "No",
];

const unsafeReasonOptions = [
  "Someone said they might hurt someone",
  "Someone has a weapon",
  "There was a fight or threat",
  "Something else",
  "I don't want to say",
];

const supportChoiceOptions = [
  "Talk to a teacher or trusted adult",
  "Get tips I can try today",
  "Let the school know I need help",
  "Just checking in",
];

const skipReasonOptions = [
  "Not applicable today",
  "Already checked in earlier",
  "Technical issue",
  "Prefer not to answer",
  "Other",
];

export const CheckInHomeScreen = () => {
  const { currentUser, setCurrentUser, districtProfile } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const [daySummary, setDaySummary] = useState<string | null>(null);
  const [unsafeLevel, setUnsafeLevel] = useState<string | null>(null);
  const [unsafeReason, setUnsafeReason] = useState<string | null>(null);
  const [supportChoice, setSupportChoice] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [skipReason, setSkipReason] = useState<string | null>(null);
  const [skipOtherReason, setSkipOtherReason] = useState("");

  if (!requireRole(["student"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  if (shouldBlockStudentSelfService(currentUser, districtProfile)) {
    return <ElementarySupportNotice onBack={() => navigation.goBack()} />;
  }

  const handleContinue = async () => {
    if (!currentUser) {
      return;
    }
    if (unsafeLevel && unsafeLevel !== "No" && !unsafeReason) {
      Alert.alert(
        "One more step",
        "Choose what is making you feel unsafe."
      );
      return;
    }
    if (!daySummary || !unsafeLevel || !supportChoice) {
      Alert.alert(
        "One more step",
        "Choose an option for each step before continuing."
      );
      return;
    }
    const unsafeSignals = [
      "Someone said they might hurt someone",
      "Someone has a weapon",
      "There was a fight or threat",
    ];
    let suggestedSeverity: "low" | "medium" | "high" = "low";
    if (
      unsafeLevel === "Yes, right now" ||
      (unsafeReason && unsafeSignals.includes(unsafeReason))
    ) {
      suggestedSeverity = "high";
    } else if (unsafeLevel === "Yes, sometimes") {
      suggestedSeverity = "medium";
    } else if (
      daySummary !== "Things feel mostly okay"
    ) {
      suggestedSeverity = "medium";
    }
    await supportApi.createCheckIn({
      studentId: currentUser.id,
      mood: daySummary,
      topics: [daySummary],
      desiredAction: supportChoice,
      suggestedSeverity,
      safetyConcernType: unsafeReason || undefined,
      unsafeIndicator: unsafeLevel,
      details: details.trim() || undefined,
    });

    if (supportChoice.includes("Let the school know")) {
      Alert.alert(
        "Thanks for checking in",
        "Your check-in was sent to school staff. A parent or guardian can submit a formal concern from the Parent / Guardian section if needed."
      );
      return;
    }
    if (supportChoice.includes("Get tips")) {
      navigation.navigate("WellBeingHelp");
      return;
    }
    if (supportChoice.includes("Talk to")) {
      navigation.navigate("WellBeingHelp");
      return;
    }
    Alert.alert(
      "Thanks for checking in",
      "You can come back anytime if you want more support."
    );
  };

  const handleSkipCheckIn = async () => {
    if (!currentUser) {
      return;
    }

    const reasonText =
      skipReason === "Other"
        ? skipOtherReason.trim() || "Other"
        : skipReason || "Prefer not to answer";

    await supportApi.createCheckIn({
      studentId: currentUser.id,
      studentName: currentUser.name,
      mood: "skipped",
      topics: ["skipped_check_in"],
      desiredAction: "skip_check_in",
      skipped: true,
      skipReason: reasonText,
      details: reasonText,
      suggestedSeverity: "low",
      unsafeIndicator: "No",
    });

    setConfirmSkip(false);
    setSkipReason(null);
    setSkipOtherReason("");

    Alert.alert(
      "Check-in skipped",
      "We recorded that you chose to skip today's check-in. You can continue using the app normally."
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Let's Check In Together</Text>
        <Text style={styles.subtitle}>
          You don't have to know exactly how you feel. Just start where you are.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>
          Step 1: Which of these feels closest to your day so far?
        </Text>
        <View style={styles.optionGroup}>
          {dayOptions.map((option) => (
            <PrimaryButton
              key={option}
              label={option}
              onPress={() => setDaySummary(option)}
              variant={daySummary === option ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>
          Step 2: Is there something happening that makes you feel unsafe at
          school?
        </Text>
        <View style={styles.optionGroup}>
          {unsafeOptions.map((option) => (
            <PrimaryButton
              key={option}
              label={option}
              onPress={() => {
                setUnsafeLevel(option);
                if (option === "No") {
                  setUnsafeReason(null);
                }
              }}
              variant={unsafeLevel === option ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
        {unsafeLevel === "Yes, right now" ? (
          <Text style={styles.helperText}>
            If you are in immediate danger, contact emergency services or a
            trusted adult right away.
          </Text>
        ) : null}
      </SectionCard>

      {unsafeLevel && unsafeLevel !== "No" ? (
        <SectionCard>
          <Text style={styles.sectionTitle}>What is making you feel unsafe?</Text>
          <View style={styles.optionGroup}>
            {unsafeReasonOptions.map((option) => (
              <PrimaryButton
                key={option}
                label={option}
                onPress={() => setUnsafeReason(option)}
                variant={unsafeReason === option ? "secondary" : "ghost"}
                style={styles.optionButton}
              />
            ))}
          </View>
        </SectionCard>
      ) : null}

      <SectionCard>
        <Text style={styles.sectionTitle}>
          Step 3: What would help you most right now?
        </Text>
        <View style={styles.optionGroup}>
          {supportChoiceOptions.map((option) => (
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
        <Text style={styles.sectionTitle}>
          Optional: Tell us a little more
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="You can write as much or as little as you want."
          placeholderTextColor={theme.colors.mutedText}
          value={details}
          onChangeText={setDetails}
          multiline
        />
        <Text style={styles.helperText}>
          You can skip this if you prefer.
        </Text>
      </SectionCard>

      <SectionCard>
        <PrimaryButton
          label="Continue to support steps"
          onPress={handleContinue}
          variant="primary"
        />
        <PrimaryButton
          label="Skip Check-In"
          onPress={() => setConfirmSkip(true)}
          variant="ghost"
          style={styles.skipButton}
        />
      </SectionCard>

      {confirmSkip ? (
        <SectionCard>
          <Text style={styles.sectionTitle}>
            Are you sure you want to skip today's check-in?
          </Text>
          <Text style={styles.helperText}>Why are you skipping today? (optional)</Text>
          <View style={styles.optionGroup}>
            {skipReasonOptions.map((option) => (
              <PrimaryButton
                key={option}
                label={option}
                onPress={() => setSkipReason(option)}
                variant={skipReason === option ? "secondary" : "ghost"}
                style={styles.optionButton}
              />
            ))}
          </View>
          {skipReason === "Other" ? (
            <TextInput
              style={styles.textArea}
              placeholder="Optional: tell us why you are skipping"
              placeholderTextColor={theme.colors.mutedText}
              value={skipOtherReason}
              onChangeText={setSkipOtherReason}
              multiline
            />
          ) : null}
          <View style={styles.skipActionsRow}>
            <PrimaryButton
              label="Go Back"
              onPress={() => setConfirmSkip(false)}
              variant="ghost"
              style={styles.skipActionButton}
            />
            <PrimaryButton
              label="Skip Check-In"
              onPress={handleSkipCheckIn}
              variant="secondary"
              style={styles.skipActionButton}
            />
          </View>
        </SectionCard>
      ) : null}

      <SectionCard>
        <Text style={styles.sectionTitle}>Immediate safety emergency</Text>
        <Text style={styles.helperText}>
          Use this only if someone could be seriously hurt right now.
        </Text>
        <PrimaryButton
          label="Report immediate safety emergency"
          onPress={() => navigation.navigate("StudentEmergencyReport")}
          style={styles.emergencyButton}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Support & Resources</Text>
        <Text style={styles.helperText}>
          Explore support tools, community resources, and guidance whenever you
          need them.
        </Text>
        <PrimaryButton
          label="Open Support & Resources"
          onPress={() => navigation.navigate("SupportResourcesHome")}
          variant="secondary"
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
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
  },
  emergencyButton: {
    marginTop: 6,
    backgroundColor: theme.colors.danger,
  },
  skipButton: {
    marginTop: 8,
  },
  skipActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  skipActionButton: {
    flex: 1,
  },
});
