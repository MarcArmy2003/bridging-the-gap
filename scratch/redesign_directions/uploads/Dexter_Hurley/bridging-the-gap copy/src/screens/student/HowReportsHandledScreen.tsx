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

export const HowReportsHandledScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  if (!requireRole(["student"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>How Your Report Is Handled</Text>
        <Text style={styles.subtitle}>
          Your report goes to trained staff who focus on support and safety.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>What happens after you submit</Text>
        <Text style={styles.bodyText}>1) A staff member reviews your report.</Text>
        <Text style={styles.bodyText}>2) They decide on next steps and resources.</Text>
        <Text style={styles.bodyText}>3) You may be contacted if follow-up is needed.</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Your privacy</Text>
        <Text style={styles.bodyText}>
          Information is shared only with authorized staff. Details are redacted
          when updates go to parents or guardians.
        </Text>
      </SectionCard>

      <SectionCard>
        <PrimaryButton
          label="Go to support check-in"
          onPress={() => navigation.navigate("CheckInHome")}
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
