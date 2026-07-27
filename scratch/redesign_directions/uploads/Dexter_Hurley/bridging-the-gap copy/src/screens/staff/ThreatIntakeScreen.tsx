import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Switch,
} from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import {
  ThreatConcern,
  ThreatLocation,
  ThreatAwareness,
  ThreatTiming,
} from "../../models/types";

type ThreatIntakeScreenProps = {
  onSubmit: (intake: ThreatIntakeData) => void;
  onCancel: () => void;
};

export type ThreatIntakeData = {
  concern: ThreatConcern;
  location: ThreatLocation;
  awareness: ThreatAwareness;
  timing: ThreatTiming;
  details?: string;
  anonymous: boolean;
};

const CONCERN_OPTIONS = [
  { value: ThreatConcern.PossibleWeapon, label: "Possible weapon on campus" },
  { value: ThreatConcern.ThreatMade, label: "Threat made toward others" },
  {
    value: ThreatConcern.ConcerningStatement,
    label: "Concerning statement or message",
  },
  { value: ThreatConcern.SuspiciousBehavior, label: "Suspicious behavior" },
];

const LOCATION_OPTIONS = [
  { value: ThreatLocation.OnCampus, label: "On school campus" },
  { value: ThreatLocation.OnBus, label: "School bus / event" },
  { value: ThreatLocation.NearbyLocation, label: "Nearby location" },
  { value: ThreatLocation.OnlineOnly, label: "Online only" },
];

const AWARENESS_OPTIONS = [
  { value: ThreatAwareness.SawSomething, label: "Saw something directly" },
  { value: ThreatAwareness.HeardStatement, label: "Heard a statement" },
  { value: ThreatAwareness.SocialMediaMessage, label: "Social media or message" },
  { value: ThreatAwareness.SecondHandInfo, label: "Someone told me" },
];

const TIMING_OPTIONS = [
  { value: ThreatTiming.Happening, label: "Yes" },
  { value: ThreatTiming.Unclear, label: "Not sure" },
  { value: ThreatTiming.NotHappening, label: "No" },
];

export const ThreatIntakeScreen = ({
  onSubmit,
  onCancel,
}: ThreatIntakeScreenProps) => {
  const [concern, setConcern] = useState<ThreatConcern | null>(null);
  const [location, setLocation] = useState<ThreatLocation | null>(null);
  const [awareness, setAwareness] = useState<ThreatAwareness | null>(null);
  const [timing, setTiming] = useState<ThreatTiming | null>(null);
  const [details, setDetails] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = concern && location && awareness && timing;

  const handleSubmit = () => {
    if (!canSubmit) return;

    onSubmit({
      concern,
      location,
      awareness,
      timing,
      details: details.trim() || undefined,
      anonymous,
    });
    
    setSubmitted(true);
  };

  return (
    <ScrollView style={styles.container}>
      {submitted ? (
        <SectionCard>
          <Text style={styles.confirmationEmoji}>✓</Text>
          <Text style={styles.confirmationTitle}>Thank You</Text>
          <Text style={styles.confirmationMessage}>
            Your concern has been sent to school safety professionals.
          </Text>
          <PrimaryButton
            label="Close"
            onPress={onCancel}
            style={{ marginTop: 16 }}
          />
        </SectionCard>
      ) : (
        <>
          {/* CRITICAL DISCLAIMER */}
      <View style={styles.disclaimerBanner}>
        <Text style={styles.disclaimerText}>
          This report shares safety concerns only. It does not determine guilt or confirm possession of a weapon.
        </Text>
      </View>

      <SectionCard>
        <Text style={styles.sectionHeader}>Safety Concern Report</Text>
        <Text style={styles.sectionSubtitle}>
          Use this if you are worried about a weapon, threat, or immediate danger.
        </Text>
      </SectionCard>

      {/* QUESTION 1: What is the concern? */}
      <SectionCard>
        <Text style={styles.questionTitle}>What is the concern?</Text>
        {CONCERN_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setConcern(option.value)}
            style={[
              styles.optionButton,
              concern === option.value && styles.optionButtonSelected,
            ]}
          >
            <View
              style={[
                styles.radioButton,
                concern === option.value && styles.radioButtonSelected,
              ]}
            />
            <Text
              style={[
                styles.optionLabel,
                concern === option.value && styles.optionLabelSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </SectionCard>

      {/* QUESTION 2: Where is the concern? */}
      <SectionCard>
        <Text style={styles.questionTitle}>Where is the concern located?</Text>
        {LOCATION_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setLocation(option.value)}
            style={[
              styles.optionButton,
              location === option.value && styles.optionButtonSelected,
            ]}
          >
            <View
              style={[
                styles.radioButton,
                location === option.value && styles.radioButtonSelected,
              ]}
            />
            <Text
              style={[
                styles.optionLabel,
                location === option.value && styles.optionLabelSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </SectionCard>

      {/* QUESTION 3: How did you become aware? */}
      <SectionCard>
        <Text style={styles.questionTitle}>How did you become aware?</Text>
        {AWARENESS_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setAwareness(option.value)}
            style={[
              styles.optionButton,
              awareness === option.value && styles.optionButtonSelected,
            ]}
          >
            <View
              style={[
                styles.radioButton,
                awareness === option.value && styles.radioButtonSelected,
              ]}
            />
            <Text
              style={[
                styles.optionLabel,
                awareness === option.value && styles.optionLabelSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </SectionCard>

      {/* QUESTION 4: Is this happening now? */}
      <SectionCard>
        <Text style={styles.questionTitle}>Is this happening now?</Text>
        {TIMING_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setTiming(option.value)}
            style={[
              styles.optionButton,
              timing === option.value && styles.optionButtonSelected,
            ]}
          >
            <View
              style={[
                styles.radioButton,
                timing === option.value && styles.radioButtonSelected,
              ]}
            />
            <Text
              style={[
                styles.optionLabel,
                timing === option.value && styles.optionLabelSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </SectionCard>

      {/* OPTIONAL: Additional details */}
      <SectionCard>
        <Text style={styles.questionTitle}>
          5. Additional details (optional)
        </Text>
        <Text style={styles.helperText}>
          Share any other information that might help. Do not provide names or
          diagnoses.
        </Text>
        <TextInput
          value={details}
          onChangeText={setDetails}
          placeholder="What happened? What did you see or hear?"
          multiline
          style={styles.detailsInput}
          maxLength={500}
        />
        <Text style={styles.characterCount}>
          {details.length}/500 characters
        </Text>
      </SectionCard>

      {/* ANONYMOUS OPTION */}
      <SectionCard>
        <View style={styles.anonymousRow}>
          <View style={styles.anonymousText}>
            <Text style={styles.anonymousLabel}>Report anonymously</Text>
            <Text style={styles.anonymousHelper}>
              Your identity will be protected
            </Text>
          </View>
          <Switch
            value={anonymous}
            onValueChange={setAnonymous}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={anonymous ? theme.colors.primaryText : "#f4f3f4"}
          />
        </View>
      </SectionCard>

      {/* SUBMIT/CANCEL */}
      <SectionCard>
        <View style={styles.buttonGroup}>
          <PrimaryButton
            label="Cancel"
            onPress={onCancel}
            variant="ghost"
            style={styles.button}
          />
          <PrimaryButton
            label={canSubmit ? "Submit Report" : "Complete all questions"}
            onPress={handleSubmit}
            disabled={!canSubmit}
            variant="primary"
            style={styles.button}
          />
        </View>
      </SectionCard>

      {/* FOOTER DISCLAIMER */}
      <View style={styles.footerDisclaimer}>
        <Text style={styles.disclaimerSmall}>
          Report concerns safely. Your information will be reviewed immediately.
        </Text>
      </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  disclaimerBanner: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger,
    padding: 16,
    marginBottom: 16,
    borderRadius: 6,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 13,
    color: "#7F1D1D",
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.mutedText,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionButtonSelected: {
    backgroundColor: "#FFF7ED",
    borderColor: theme.colors.primary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: 12,
  },
  radioButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionLabel: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  optionLabelSelected: {
    fontWeight: "600",
    color: theme.colors.primary,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginBottom: 8,
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    padding: 12,
    fontSize: 13,
    color: theme.colors.text,
    minHeight: 100,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 11,
    color: theme.colors.mutedText,
    marginTop: 4,
    textAlign: "right",
  },
  anonymousRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  anonymousText: {
    flex: 1,
  },
  anonymousLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 2,
  },
  anonymousHelper: {
    fontSize: 12,
    color: theme.colors.mutedText,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
  },
  footerDisclaimer: {
    marginVertical: 24,
    paddingHorizontal: 12,
  },
  disclaimerSmall: {
    fontSize: 11,
    color: theme.colors.mutedText,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 16,
  },
  confirmationEmoji: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: 16,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  confirmationMessage: {
    fontSize: 16,
    color: theme.colors.mutedText,
    textAlign: "center",
    lineHeight: 24,
  },
});
