import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { StudentStackParamList } from "../../navigation/types";
import { useAppContext } from "../../store/AppContext";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { requireRole } from "../../utils/requireRole";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation } from "../../navigation/compatTypes";

export const StudentEducationHubScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  if (!requireRole(["student"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>How to Use This Safely</Text>
        <Text style={styles.subtitle}>
          Short guides to help you know when to report, how emergencies work,
          and what happens after you submit.
        </Text>
      </SectionCard>

      <SectionCard>
        <PrimaryButton
          label="When to use Emergency"
          onPress={() => navigation.navigate("WhenToUseEmergency")}
          variant="secondary"
          style={styles.button}
        />
        <PrimaryButton
          label="When to ask for support"
          onPress={() => navigation.navigate("WhenToAskForSupport")}
          variant="secondary"
          style={styles.button}
        />
        <PrimaryButton
          label="How your report is handled"
          onPress={() => navigation.navigate("HowReportsHandled")}
          variant="secondary"
          style={styles.button}
        />
        <PrimaryButton
          label="What this app does and doesn't do"
          onPress={() => navigation.navigate("StudentAppBoundaries")}
          variant="secondary"
          style={styles.button}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.footerText}>
          You are in control. Only share what feels safe. If you feel unsafe
          right now, contact emergency services or a trusted adult.
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
  button: {
    alignSelf: "stretch",
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
});
