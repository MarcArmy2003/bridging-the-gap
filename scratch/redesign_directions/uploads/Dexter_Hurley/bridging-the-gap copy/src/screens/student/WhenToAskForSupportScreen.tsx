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

export const WhenToAskForSupportScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  if (!requireRole(["student"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>When to Ask for Support</Text>
        <Text style={styles.subtitle}>
          You can ask for support for anything that is affecting your well-being,
          even if it is not an emergency.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Good reasons to ask for support:</Text>
        <Text style={styles.bodyText}>• You feel anxious, stressed, or overwhelmed</Text>
        <Text style={styles.bodyText}>• You need help with peer conflict</Text>
        <Text style={styles.bodyText}>• Something at home or school is hard right now</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>What happens next:</Text>
        <Text style={styles.bodyText}>
          A trusted staff member will review your check-in and follow up with care.
        </Text>
      </SectionCard>

      <SectionCard>
        <PrimaryButton
          label="Start a check-in"
          onPress={() => navigation.navigate("CheckInHome")}
          variant="secondary"
          style={styles.button}
        />
        <PrimaryButton
          label="Back to education"
          onPress={() => navigation.navigate("StudentEducationHub")}
          variant="ghost"
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
