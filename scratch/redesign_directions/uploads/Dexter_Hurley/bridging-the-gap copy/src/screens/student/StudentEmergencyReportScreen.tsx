import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { fakeApi } from "../../data/fakeApi";
import { StudentStackParamList } from "../../navigation/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";
import { shouldBlockStudentSelfService } from "../../utils/gradeAccess";
import { ElementarySupportNotice } from "../../components/ElementarySupportNotice";
import { APP_NAME } from "../../config/branding";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation } from "../../navigation/compatTypes";

const emergencyOptions = [
  "A weapon on campus",
  "A serious threat to hurt someone",
  "A fight that could turn violent",
  "I'm not sure but it feels dangerous",
];

const locationOptions = [
  "Classroom",
  "Hallway",
  "Cafeteria",
  "Restroom",
  "Gym or field",
  "Outside campus",
  "I'm not sure",
];

export const StudentEmergencyReportScreen = () => {
  const { currentUser, setCurrentUser, districtProfile } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [emergencyType, setEmergencyType] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!requireRole(["student"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  if (shouldBlockStudentSelfService(currentUser, districtProfile)) {
    return <ElementarySupportNotice onBack={() => navigation.goBack()} />;
  }

  const handleSubmit = async () => {
    if (!currentUser || !emergencyType) {
      return;
    }
    setSubmitting(true);
    await fakeApi.createEmergencyReport(
      {
        source: "student",
        threatType: emergencyType,
        location: location || undefined,
        details: details.trim() || undefined,
        studentName: currentUser.name,
        guardianId: "GUARD-UNKNOWN",
      },
      "student"
    );
    setSubmitting(false);
    setDetails("");
    setLocation(null);
    setEmergencyType(null);
    setSubmitted(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {submitted ? (
        <SectionCard>
          <Text style={styles.title}>Thank you for telling us</Text>
          <Text style={styles.subtitle}>
            Your report was sent through {APP_NAME} to the school safety team.
          </Text>
          <Text style={styles.helperText}>
            If someone is in immediate danger, tell a trusted adult nearby or
            call emergency services right now.
          </Text>
          <PrimaryButton
            label="Back to check-in"
            onPress={() => navigation.navigate("CheckInHome")}
            variant="secondary"
            style={styles.confirmButton}
          />
        </SectionCard>
      ) : null}

      {!submitted && step === 0 ? (
        <SectionCard>
          <Text style={styles.title}>Immediate safety emergency</Text>
          <Text style={styles.subtitle}>
            Use this only if someone could be seriously hurt right now.
          </Text>
          <Text style={styles.bodyText}>Examples include:</Text>
          <Text style={styles.bodyText}>- A weapon</Text>
          <Text style={styles.bodyText}>- A serious threat of violence</Text>
          <Text style={styles.bodyText}>- Someone may be hurt right now</Text>
          <Text style={styles.helperText}>
            If this is not an emergency, use the regular check-in instead.
          </Text>
          <View style={styles.buttonRow}>
            <PrimaryButton
              label="Cancel"
              onPress={() => navigation.goBack()}
              variant="ghost"
              style={styles.button}
            />
            <PrimaryButton
              label="Continue"
              onPress={() => setStep(1)}
              variant="secondary"
              style={styles.button}
            />
          </View>
        </SectionCard>
      ) : null}

      {!submitted && step === 1 ? (
        <SectionCard>
          <Text style={styles.sectionTitle}>What is happening right now?</Text>
          <View style={styles.optionGroup}>
            {emergencyOptions.map((option) => (
              <PrimaryButton
                key={option}
                label={option}
                onPress={() => {
                  setEmergencyType(option);
                  setStep(2);
                }}
                variant="ghost"
                style={styles.optionButton}
              />
            ))}
          </View>
        </SectionCard>
      ) : null}

      {!submitted && step === 2 ? (
        <>
          <SectionCard>
            <Text style={styles.sectionTitle}>
              If you can, tell us where this is happening
            </Text>
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
            <Text style={styles.sectionTitle}>Optional details</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Short details (optional)"
              placeholderTextColor={theme.colors.mutedText}
              value={details}
              onChangeText={setDetails}
              maxLength={240}
              multiline
            />
            <Text style={styles.helperText}>
              If someone is in immediate danger, tell a trusted adult nearby or
              call emergency services right now.
            </Text>
            <PrimaryButton
              label={submitting ? "Sending..." : "Send emergency report"}
              onPress={handleSubmit}
              disabled={submitting}
              style={styles.emergencyButton}
            />
          </SectionCard>
        </>
      ) : null}
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginTop: 8,
  },
  optionGroup: {
    gap: 8,
  },
  optionButton: {
    alignSelf: "stretch",
  },
  textArea: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  emergencyButton: {
    marginTop: 8,
    backgroundColor: theme.colors.danger,
  },
  confirmButton: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
});
