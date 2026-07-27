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

export const WhenToUseEmergencyScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  if (!requireRole(["student"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>When to Use Emergency</Text>
        <Text style={styles.subtitle}>
          Use emergency reporting only when someone could be seriously hurt
          right now.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Use Emergency if:</Text>
        <Text style={styles.bodyText}>• Someone has a weapon</Text>
        <Text style={styles.bodyText}>• There is an immediate threat or fight</Text>
        <Text style={styles.bodyText}>• Someone might harm themselves or others</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Do NOT use Emergency for:</Text>
        <Text style={styles.bodyText}>• Ongoing bullying without immediate danger</Text>
        <Text style={styles.bodyText}>• General conflict or rumors</Text>
        <Text style={styles.bodyText}>• Situations that can wait for staff review</Text>
      </SectionCard>

      <SectionCard>
        <PrimaryButton
          label="Report an emergency"
          onPress={() => navigation.navigate("StudentEmergencyReport")}
          style={styles.button}
        />
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
