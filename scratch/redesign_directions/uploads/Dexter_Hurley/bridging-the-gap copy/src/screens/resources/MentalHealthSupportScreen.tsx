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
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation } from "../../navigation/compatTypes";

type ResourceNav =
  | NativeStackNavigationProp<StudentStackParamList>
  | NativeStackNavigationProp<GuardianStackParamList>
  | NativeStackNavigationProp<StaffStackParamList>;

const concernOptions = [
  "Stress or feeling overwhelmed",
  "Worry or anxiety",
  "Feeling down",
  "Trouble sleeping or focusing",
  "Concern about a friend",
  "Not sure",
];

export const MentalHealthSupportScreen = () => {
  const { currentUser, setCurrentUser, districtProfile } = useAppContext();
  const navigation = useNavigation<ResourceNav>();

  if (!requireRole(["student", "guardian", "educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  if (shouldBlockStudentSelfService(currentUser, districtProfile)) {
    return <ElementarySupportNotice onBack={() => navigation.goBack()} />;
  }

  const isStudent = currentUser?.role === "student";
  const isGuardian = currentUser?.role === "guardian";
  const isStaff =
    currentUser?.role === "educator" || currentUser?.role === "admin";

  const handleSchoolSupport = () => {
    if (isStudent) {
      navigation.navigate("CheckInHome");
      return;
    }
    if (isGuardian) {
      navigation.navigate("GuardianMessageTemplates");
      return;
    }
    if (isStaff) {
      navigation.navigate("StaffAssistedReport");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Mental Health Support</Text>
        <Text style={styles.subtitle}>
          Looking for support is a strong step. This section shares options and
          guidance to help you find the right support.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Who can help at school</Text>
        <Text style={styles.bodyText}>
          A teacher, counselor, nurse, or administrator can help connect you to
          support options.
        </Text>
        <PrimaryButton
          label="Request School Support"
          onPress={handleSchoolSupport}
          variant="secondary"
          style={styles.button}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>
          What kind of support are you looking for?
        </Text>
        {concernOptions.map((item) => (
          <Text key={item} style={styles.bodyText}>
            - {item}
          </Text>
        ))}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>A good next step</Text>
        <Text style={styles.bodyText}>
          If you're not sure where to start, choose one small step - talk to a
          trusted adult, request school support, or browse local resources.
        </Text>
        <PrimaryButton
          label="Find Help Near You"
          onPress={() => navigation.navigate("LocalHelpResources")}
          variant="secondary"
          style={styles.button}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.footerText}>
          This information is educational only and is not medical or mental
          health advice.
        </Text>
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
  bodyText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  button: {
    alignSelf: "stretch",
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
});
