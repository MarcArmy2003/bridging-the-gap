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
  "Concern about harm at home",
  "Concern about harm at school",
  "Concern about neglect or basic needs",
  "Concern about another student",
  "Not sure",
];

export const AbuseSafetyResourcesScreen = () => {
  const { currentUser, setCurrentUser, districtProfile, stateProfile } =
    useAppContext();
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Abuse & Safety Resources</Text>
        <Text style={styles.subtitle}>
          This section provides information on how to seek help if someone may
          be experiencing harm. You can choose what to share and where to start.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>What are you concerned about?</Text>
        {concernOptions.map((item) => (
          <Text key={item} style={styles.bodyText}>
            - {item}
          </Text>
        ))}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>You are not required to report here</Text>
        <Text style={styles.bodyText}>
          You can use this section to learn what help looks like and where to
          go next. If you want, you can also request support from school staff.
        </Text>
        <PrimaryButton
          label="Request School Support"
          onPress={() =>
            isStudent
              ? navigation.navigate("CheckInHome")
              : isGuardian
              ? navigation.navigate("GuardianMessageTemplates")
              : isStaff
              ? navigation.navigate("StaffAssistedReport")
              : navigation.navigate("SupportResourcesHome")
          }
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
        <Text style={styles.sectionTitle}>State reporting resources</Text>
        <Text style={styles.bodyText}>
          {stateProfile.abuseHotlineName}
        </Text>
        <Text style={styles.bodyText}>URL: {stateProfile.abuseHotlineUrl}</Text>
        {stateProfile.mandatoryReporterNoteEnabled ? (
          <Text style={styles.helperText}>
            Mandatory reporter guidance is enabled for this state profile.
          </Text>
        ) : null}
      </SectionCard>

      <SectionCard>
        <Text style={styles.footerText}>
          This information is educational only and does not replace
          professional services, reporting requirements, or emergency response.
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
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginTop: 8,
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
