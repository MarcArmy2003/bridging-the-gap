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
import { fakeApi } from "../../data/fakeApi";
import { StaffStackParamList } from "../../navigation/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation } from "../../navigation/compatTypes";

const threatOptions = [
  "Weapon-related concern",
  "Explicit threat of violence",
  "Fight or escalation risk",
  "Student behavior causing immediate safety concern",
];

const scopeOptions = [
  "A specific student",
  "Multiple students",
  "General campus concern",
];

export const EmergencySafetyReportScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const [threatType, setThreatType] = useState<string | null>(null);
  const [scope, setScope] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [identifiers, setIdentifiers] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!requireRole(["educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const handleSubmit = async () => {
    if (!currentUser) {
      return;
    }
    if (!threatType || !scope) {
      Alert.alert(
        "Missing details",
        "Select the concern type and who is affected."
      );
      return;
    }
    setSubmitting(true);
    const detailParts = [];
    if (identifiers.trim()) {
      detailParts.push(`Identifiers: ${identifiers.trim()}`);
    }
    if (details.trim()) {
      detailParts.push(details.trim());
    }
    await fakeApi.createEmergencyReport(
      {
        source: "teacher",
        threatType,
        scope,
        location: location.trim() || undefined,
        details: detailParts.length ? detailParts.join(" | ") : undefined,
        studentName: "Student (reported by staff)",
        guardianId: "GUARD-UNKNOWN",
      },
      currentUser.role
    );
    setSubmitting(false);
    setSubmitted(true);
    setThreatType(null);
    setScope(null);
    setLocation("");
    setIdentifiers("");
    setDetails("");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {submitted ? (
        <SectionCard>
          <Text style={styles.title}>Emergency report submitted</Text>
          <Text style={styles.subtitle}>
            The concern was routed directly to the School Resource Officer.
          </Text>
          <Text style={styles.helperText}>
            Follow school emergency procedures as required.
          </Text>
          <PrimaryButton
            label="Back to dashboard"
            onPress={() => navigation.navigate("CaseInbox")}
            variant="secondary"
            style={styles.confirmButton}
          />
        </SectionCard>
      ) : null}

      {!submitted ? (
        <>
          <SectionCard>
            <Text style={styles.title}>Report immediate safety concern</Text>
            <Text style={styles.subtitle}>
              Share urgent threats involving student or campus safety.
            </Text>
            <Text style={styles.helperText}>
              This report shares safety concerns only. Follow school emergency
              procedures as required.
            </Text>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>Step 1: What is the concern?</Text>
            <View style={styles.optionGroup}>
              {threatOptions.map((option) => (
                <PrimaryButton
                  key={option}
                  label={option}
                  onPress={() => setThreatType(option)}
                  variant={threatType === option ? "secondary" : "ghost"}
                  style={styles.optionButton}
                />
              ))}
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>Step 2: Who is affected?</Text>
            <View style={styles.optionGroup}>
              {scopeOptions.map((option) => (
                <PrimaryButton
                  key={option}
                  label={option}
                  onPress={() => setScope(option)}
                  variant={scope === option ? "secondary" : "ghost"}
                  style={styles.optionButton}
                />
              ))}
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>Optional details</Text>
            <TextInput
              style={styles.input}
              placeholder="Location (optional)"
              placeholderTextColor={theme.colors.mutedText}
              value={location}
              onChangeText={setLocation}
            />
            <TextInput
              style={styles.input}
              placeholder="Student identifiers (optional)"
              placeholderTextColor={theme.colors.mutedText}
              value={identifiers}
              onChangeText={setIdentifiers}
            />
            <TextInput
              style={styles.textArea}
              placeholder="Short context (optional)"
              placeholderTextColor={theme.colors.mutedText}
              value={details}
              onChangeText={setDetails}
              multiline
            />
            <PrimaryButton
              label={submitting ? "Sending..." : "Send safety report"}
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
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
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
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
  },
  textArea: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
  },
  emergencyButton: {
    marginTop: 4,
    backgroundColor: theme.colors.danger,
  },
  confirmButton: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
});
