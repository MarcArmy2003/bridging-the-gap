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
import { getSeverityLabel } from "../../components/SeverityBadge";
import { theme } from "../../components/theme";
import { fakeApi } from "../../data/fakeApi";
import { CaseSeverity, IncidentType } from "../../models/types";
import { StaffStackParamList } from "../../navigation/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";
import { APP_NAME } from "../../config/branding";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation } from "../../navigation/compatTypes";

const incidentOptions: IncidentType[] = ["bullying", "hazing"];
const severityOptions: CaseSeverity[] = ["low", "medium", "high"];

export const StaffAssistedReportScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const [studentName, setStudentName] = useState("");
  const [guardianId, setGuardianId] = useState("");
  const [incidentType, setIncidentType] = useState<IncidentType>("bullying");
  const [severity, setSeverity] = useState<CaseSeverity>("medium");
  const [narrative, setNarrative] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!requireRole(["educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const handleSubmit = async () => {
    if (!narrative.trim()) {
      Alert.alert("Add details", "Please include a short description.");
      return;
    }
    setSubmitting(true);
    await fakeApi.createCaseAsStaff(
      {
        incidentType,
        narrative: narrative.trim(),
        severity,
        studentName: studentName.trim() || "Student (staff-assisted)",
        guardianId: guardianId.trim() || "GUARD-UNKNOWN",
      },
      currentUser?.role ?? "educator"
    );
    setSubmitting(false);
    setStudentName("");
    setGuardianId("");
    setNarrative("");
    Alert.alert(
      "Report submitted",
      `The staff-assisted report has been logged in ${APP_NAME} for teacher or counselor review.`
    );
    navigation.navigate("CaseInbox");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Staff-assisted entry</Text>
        <Text style={styles.subtitle}>
          Use this flow to enter a report on behalf of a student who does not
          have access to a personal device.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Student details (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Student name or initials"
          placeholderTextColor={theme.colors.mutedText}
          value={studentName}
          onChangeText={setStudentName}
        />
        <TextInput
          style={styles.input}
          placeholder="Guardian ID (if known)"
          placeholderTextColor={theme.colors.mutedText}
          value={guardianId}
          onChangeText={setGuardianId}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>What kind of concern is this?</Text>
        <View style={styles.optionRow}>
          {incidentOptions.map((option) => (
            <PrimaryButton
              key={option}
              label={option === "bullying" ? "Bullying" : "Hazing"}
              onPress={() => setIncidentType(option)}
              variant={incidentType === option ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Priority level</Text>
        <View style={styles.optionRow}>
          {severityOptions.map((option) => (
            <PrimaryButton
              key={option}
              label={getSeverityLabel(option)}
              onPress={() => setSeverity(option)}
              variant={severity === option ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>What happened?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Share only what the student is comfortable sharing."
          placeholderTextColor={theme.colors.mutedText}
          value={narrative}
          onChangeText={setNarrative}
          multiline
        />
        <Text style={styles.helperText}>
          Note: This entry is labeled as staff-assisted in the audit log.
        </Text>
        <PrimaryButton
          label={submitting ? "Submitting..." : "Submit staff-assisted report"}
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
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    flexGrow: 1,
    minWidth: 140,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 10,
  },
});
