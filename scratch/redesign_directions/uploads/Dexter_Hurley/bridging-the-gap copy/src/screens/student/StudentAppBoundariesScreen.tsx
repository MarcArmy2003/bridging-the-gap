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

export const StudentAppBoundariesScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  if (!requireRole(["student"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>What This App Does and Doesn't Do</Text>
        <Text style={styles.subtitle}>
          This tool is for support and safety reporting, not punishment or
          diagnosis.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>This app can:</Text>
        <Text style={styles.bodyText}>• Help you share a concern safely</Text>
        <Text style={styles.bodyText}>• Connect you with support resources</Text>
        <Text style={styles.bodyText}>
          • Route urgent safety concerns to staff quickly
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>This app does NOT:</Text>
        <Text style={styles.bodyText}>• Diagnose or label students</Text>
        <Text style={styles.bodyText}>• Replace emergency services</Text>
        <Text style={styles.bodyText}>• Share details outside authorized staff</Text>
      </SectionCard>

      <SectionCard>
        <PrimaryButton
          label="Back to education"
          onPress={() => navigation.navigate("StudentEducationHub")}
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
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
    marginBottom: 6,
  },
  button: {
    alignSelf: "stretch",
    marginTop: 10,
  },
});
