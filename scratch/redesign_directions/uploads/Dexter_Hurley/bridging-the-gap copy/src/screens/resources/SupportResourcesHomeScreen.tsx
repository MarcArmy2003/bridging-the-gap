import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { ElementarySupportNotice } from "../../components/ElementarySupportNotice";
import { useAppContext } from "../../store/AppContext";
import {
  GuardianStackParamList,
  StaffStackParamList,
  StudentStackParamList,
} from "../../navigation/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { requireRole } from "../../utils/requireRole";
import { shouldBlockStudentSelfService } from "../../utils/gradeAccess";
import { APP_NAME } from "../../config/branding";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation } from "../../navigation/compatTypes";

type ResourceNav =
  | NativeStackNavigationProp<StudentStackParamList>
  | NativeStackNavigationProp<GuardianStackParamList>
  | NativeStackNavigationProp<StaffStackParamList>;

export const SupportResourcesHomeScreen = () => {
  const { currentUser, setCurrentUser, isDemoMode, districtProfile } =
    useAppContext();
  const navigation = useNavigation<ResourceNav>();

  if (!requireRole(["student", "guardian", "educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  if (shouldBlockStudentSelfService(currentUser, districtProfile)) {
    return (
      <ElementarySupportNotice onBack={() => navigation.goBack()} />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Support & Community Resources</Text>
        <Text style={styles.subtitle}>
          Information and guidance to help you find support. This section does
          not provide medical, mental health, or legal advice.
        </Text>
      </SectionCard>

      <SectionCard>
        <PrimaryButton
          label="Mental Health Support"
          onPress={() => navigation.navigate("MentalHealthSupport")}
          variant="secondary"
          style={styles.button}
        />
        <PrimaryButton
          label="Abuse & Safety Resources"
          onPress={() => navigation.navigate("AbuseSafetyResources")}
          variant="secondary"
          style={styles.button}
        />
        <PrimaryButton
          label="Find Help Near You"
          onPress={() => navigation.navigate("LocalHelpResources")}
          variant="secondary"
          style={styles.button}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.footerText}>
          If someone is in immediate danger, contact emergency services or a
          trusted adult right away.
        </Text>
        <Text style={styles.footerText}>
          {APP_NAME} provides informational tools only and does not provide
          medical, mental health, or legal advice. If someone is in immediate
          danger, contact emergency services or a trusted adult right away.
        </Text>
        <Text style={styles.footerText}>
          Access is role-based and limited to authorized users. Information
          displayed may be redacted to protect student privacy and comply with
          district policy.
        </Text>
        {isDemoMode ? (
          <Text style={styles.footerText}>
            Demo Mode uses sample data only. No real users are notified, and no
            real reports are submitted.
          </Text>
        ) : null}
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
  button: {
    alignSelf: "stretch",
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginBottom: 8,
  },
});
