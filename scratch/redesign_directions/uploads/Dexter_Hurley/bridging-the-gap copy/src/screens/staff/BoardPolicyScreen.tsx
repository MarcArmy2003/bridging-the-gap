import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";

export const BoardPolicyScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();

  if (!requireRole(["admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Student Safety & Well-Being Platform Use</Text>
        <Text style={styles.bodyText}>
          The district utilizes a secure digital platform to support student
          safety, bullying prevention, and well-being.
        </Text>
        <Text style={styles.sectionTitle}>Purpose</Text>
        <Text style={styles.bodyText}>
          The platform is designed to:
        </Text>
        <Text style={styles.bodyText}>
          - Encourage early reporting of concerns
        </Text>
        <Text style={styles.bodyText}>
          - Support trauma-informed responses
        </Text>
        <Text style={styles.bodyText}>
          - Facilitate communication between families and schools
        </Text>
        <Text style={styles.bodyText}>
          - Maintain student privacy and confidentiality
        </Text>
        <Text style={styles.sectionTitle}>Scope and limitations</Text>
        <Text style={styles.bodyText}>
          The platform does not provide medical, mental health, or legal advice
          and does not replace existing district policies or professional
          judgment.
        </Text>
        <Text style={styles.bodyText}>
          Access to information is role-based and limited to authorized
          personnel.
        </Text>
        <Text style={styles.sectionTitle}>Data use</Text>
        <Text style={styles.bodyText}>
          Data collected is used solely for student support, safety planning,
          and system improvement.
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 6,
  },
});
