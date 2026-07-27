import React from "react";
import { StyleSheet, Text, View } from "react-native";

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

export const GuardianOnboardingScreen = () => {
  const {
    currentUser,
    setCurrentUser,
    setHasSeenGuardianOnboarding,
    isDemoMode,
    districtProfile,
  } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<GuardianStackParamList>>();

  if (!requireRole(["guardian"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const handleContinue = () => {
    setHasSeenGuardianOnboarding(true);
    navigation.navigate("GuardianCaseList");
  };

  const handleLanguageSelect = (language: "en" | "es") => {
    if (!currentUser) {
      return;
    }
    setCurrentUser({ ...currentUser, preferredLanguage: language });
  };

  return (
    <View style={styles.page}>
      <SectionCard>
        {isDemoMode ? (
          <Text style={styles.demoBadge}>Demo Mode Active</Text>
        ) : null}
        <Text style={styles.title}>Welcome, Parents & Guardians</Text>
        <Text style={styles.body}>
          This space is designed to help you stay informed, access guidance, and
          partner with your child's school in a supportive way.
        </Text>
        <Text style={styles.body}>
          {APP_NAME} focuses on early support, communication, and resources,
          not discipline or punishment.
        </Text>
        <Text style={styles.sectionTitle}>What you can do here</Text>
        <Text style={styles.listItem}>
          • View limited updates related to your child
        </Text>
        <Text style={styles.listItem}>
          • Ask questions and communicate with teachers or counselors
        </Text>
        <Text style={styles.listItem}>
          • Access parenting guidance and community resources
        </Text>
        <Text style={styles.listItem}>
          • Suggest supportive questions for school conversations
        </Text>
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Information shown here is intentionally limited to protect student
            privacy.
          </Text>
        </View>
        <Text style={styles.sectionTitle}>Preferred language</Text>
        <View style={styles.languageRow}>
          {districtProfile.supportedLanguages.includes("en") ? (
            <PrimaryButton
              label="English"
              onPress={() => handleLanguageSelect("en")}
              variant={
                currentUser?.preferredLanguage === "en" ? "secondary" : "ghost"
              }
              style={styles.languageButton}
            />
          ) : null}
          {districtProfile.supportedLanguages.includes("es") ? (
            <PrimaryButton
              label="Espanol"
              onPress={() => handleLanguageSelect("es")}
              variant={
                currentUser?.preferredLanguage === "es" ? "secondary" : "ghost"
              }
              style={styles.languageButton}
            />
          ) : null}
        </View>
        <PrimaryButton
          label="Continue to Parent / Guardian Home"
          onPress={handleContinue}
          variant="primary"
          style={styles.button}
        />
      </SectionCard>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 18,
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
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  notice: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  button: {
    alignSelf: "flex-start",
  },
  languageRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  languageButton: {
    alignSelf: "flex-start",
  },
});
