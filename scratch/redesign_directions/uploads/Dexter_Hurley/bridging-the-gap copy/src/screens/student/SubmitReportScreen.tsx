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
import { CaseSeverity, IncidentType } from "../../models/types";
import { getSeverityLabel } from "../../components/SeverityBadge";
import { useAppContext } from "../../store/AppContext";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { requireRole } from "../../utils/requireRole";
import { SubmitReportParams } from "../../navigation/types";
import { APP_NAME } from "../../config/branding";
import type { RouteProp, NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation, useRoute } from "../../navigation/compatTypes";

const incidentOptions: IncidentType[] = ["bullying", "hazing"];
const severityOptions: CaseSeverity[] = ["low", "medium", "high"];

type ReportScreenParamList = {
  SubmitReport: SubmitReportParams | undefined;
  StudentEmergencyReport: undefined;
  SupportResourcesHome: undefined;
  GuardianCaseList: undefined;
};

export const SubmitReportScreen = () => {
  const {
    currentUser,
    setCurrentUser,
  } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReportScreenParamList>>();
  const route = useRoute<RouteProp<ReportScreenParamList, "SubmitReport">>();
  const prefillIncidentType = route.params?.incidentType;
  const prefillNote = route.params?.prefillNote;
  const [incidentType, setIncidentType] = useState<IncidentType>("bullying");
  const [severity, setSeverity] = useState<CaseSeverity>("medium");
  const [hasManualSeverity, setHasManualSeverity] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [narrative, setNarrative] = useState("");
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (prefillIncidentType) {
      setIncidentType(prefillIncidentType);
    }
    if (prefillNote && !narrative) {
      setNarrative(prefillNote);
    }
  }, [prefillIncidentType, prefillNote, narrative]);

  React.useEffect(() => {
    if (hasManualSeverity) {
      return;
    }
    if (!narrative.trim()) {
      return;
    }
    const text = narrative.toLowerCase();
    const highSignals = [
      "unsafe",
      "threat",
      "weapon",
      "hurt",
      "abuse",
      "suicidal",
      "self-harm",
    ];
    const mediumSignals = [
      "repeated",
      "ongoing",
      "harassed",
      "bullying",
      "anxious",
      "scared",
    ];
    let suggested: CaseSeverity = "low";
    if (highSignals.some((signal) => text.includes(signal))) {
      suggested = "high";
    } else if (
      mediumSignals.some((signal) => text.includes(signal)) ||
      incidentType === "bullying"
    ) {
      suggested = "medium";
    }
    setSeverity(suggested);
  }, [narrative, incidentType, hasManualSeverity]);

  if (!requireRole(["guardian"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const handleSubmit = async () => {
    if (!currentUser) {
      return;
    }
    if (!narrative.trim()) {
      Alert.alert("Add details", "Please include a short description.");
      return;
    }
    setSubmitting(true);
    await fakeApi.createCase({
      incidentType,
      narrative: narrative.trim(),
      severity,
      studentName: studentName.trim() || "Student (parent-reported)",
      guardianId: currentUser.id,
    });
    setSubmitting(false);
    setStudentName("");
    setNarrative("");
    Alert.alert(
      "Report submitted",
      `Thank you for submitting a report through ${APP_NAME}. Your concern has been sent to school staff for confidential review.`
    );
    navigation.navigate("GuardianCaseList");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
    >
      <SectionCard>
        <Text style={styles.title}>Report a concern</Text>
        <Text style={styles.subtitle}>
          Share concerns on behalf of your child. School staff will review this
          confidentially and follow up through the parent / guardian workflow.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Student details (optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Student name or initials"
          placeholderTextColor={theme.colors.mutedText}
          value={studentName}
          onChangeText={setStudentName}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Support & Community Resources</Text>
        <Text style={styles.helperText}>
          Information and guidance to help you find support. This section does
          not provide medical, mental health, or legal advice.
        </Text>
        <PrimaryButton
          label="Open Support & Community Resources"
          onPress={() => navigation.navigate("SupportResourcesHome")}
          variant="secondary"
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

        <Text style={styles.sectionTitle}>How urgent does this feel?</Text>
        <View style={styles.optionRow}>
          {severityOptions.map((option) => (
            <PrimaryButton
              key={option}
              label={getSeverityLabel(option)}
              onPress={() => {
                setSeverity(option);
                setHasManualSeverity(true);
              }}
              variant={severity === option ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
        {!hasManualSeverity ? (
          <Text style={styles.helperText}>
            Suggested urgency: {getSeverityLabel(severity)}.
          </Text>
        ) : null}

        <Text style={styles.sectionTitle}>What happened?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Share what you feel comfortable sharing."
          placeholderTextColor={theme.colors.mutedText}
          value={narrative}
          onChangeText={setNarrative}
          multiline
        />
        <Text style={styles.helperText}>
          You can leave out names or details. We only need enough to help.
        </Text>
        <PrimaryButton
          label={submitting ? "Submitting..." : "Submit Confidential Report"}
          onPress={handleSubmit}
          disabled={submitting}
          style={styles.submitButton}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Need to switch roles?</Text>
        <PrimaryButton
          label="Back to role selection"
          onPress={() => setCurrentUser(null)}
          variant="ghost"
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
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  optionButton: {
    flexGrow: 1,
    minWidth: 120,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  helperText: {
    fontSize: 13,
    color: theme.colors.mutedText,
    marginBottom: 12,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 8,
  },
});
