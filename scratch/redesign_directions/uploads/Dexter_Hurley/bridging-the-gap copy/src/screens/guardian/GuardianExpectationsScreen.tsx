import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { GuardianStackParamList } from "../../navigation/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation } from "../../navigation/compatTypes";
import { APP_NAME } from "../../config/branding";

export const GuardianExpectationsScreen = () => {
  const { currentUser, setCurrentUser, isDemoMode } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<GuardianStackParamList>>();

  if (!requireRole(["guardian"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        {isDemoMode ? (
          <Text style={styles.demoBadge}>Demo Mode Active</Text>
        ) : null}
        <Text style={styles.title}>What Parents Can Expect</Text>
        <Text style={styles.subtitle}>
          Clear, supportive guidance on how this space works.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>What {APP_NAME} is</Text>
        <Text style={styles.bodyText}>
          A support and communication tool
        </Text>
        <Text style={styles.bodyText}>
          A way to partner with the school
        </Text>
        <Text style={styles.bodyText}>
          A place to find guidance and resources
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>What {APP_NAME} is not</Text>
        <Text style={styles.bodyText}>Not a disciplinary system</Text>
        <Text style={styles.bodyText}>Not constant monitoring</Text>
        <Text style={styles.bodyText}>
          Not a replacement for emergency services
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>How communication works</Text>
        <Text style={styles.bodyText}>
          Messages go to authorized school staff
        </Text>
        <Text style={styles.bodyText}>Response times may vary</Text>
        <Text style={styles.bodyText}>
          Schools follow district policy
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Privacy and limits</Text>
        <Text style={styles.bodyText}>
          Parents and guardians see redacted information only
        </Text>
        <Text style={styles.bodyText}>
          Student narratives may not be visible
        </Text>
        <Text style={styles.bodyText}>
          School Resource Officer access is limited and role-based
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.note}>
          If you believe your child is in immediate danger, contact emergency
          services or a trusted adult right away.
        </Text>
        <PrimaryButton
          label="Back to Parent / Guardian Home"
          onPress={() => navigation.navigate("GuardianCaseList")}
          variant="secondary"
          style={styles.button}
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
    paddingBottom: 32,
  },
  demoBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F4D06F",
    color: "#5A3E00",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
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
  note: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginBottom: 12,
  },
  button: {
    alignSelf: "flex-start",
  },
});
