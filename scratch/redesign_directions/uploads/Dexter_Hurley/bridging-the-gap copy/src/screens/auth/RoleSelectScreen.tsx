import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { useAppContext } from "../../store/AppContext";
import { UserRole } from "../../models/types";
import { APP_NAME, APP_TAGLINE } from "../../config/branding";

const roleOptions: { label: string; role: UserRole; hint: string }[] = [
  {
    label: "Student",
    role: "student",
    hint: "Submit a confidential concern. Your report is handled discreetly.",
  },
  {
    label: "Educator/Admin",
    role: "educator",
    hint: "Support students, review concerns, and collaborate on next steps.",
  },
  {
    label: "Parent / Guardian",
    role: "guardian",
    hint: "View updates, get guidance, and communicate with the school.",
  },
  {
    label: "School Resource Officer (SRO)",
    role: "law",
    hint: "Support school safety and review escalated concerns.",
  },
];

export const RoleSelectScreen = () => {
  const {
    setCurrentUser,
    setIsKioskMode,
    districtProfile,
    demoStudentGradeBand,
  } = useAppContext();
  const [name, setName] = useState("");
  const [staffRole, setStaffRole] = useState<"teacher" | "counselor">("teacher");
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const handleSelectRole = (role: UserRole) => {
    setIsKioskMode(false);
    setCurrentUser({
      id: `USER-${Date.now()}`,
      name: name.trim() || "Guest User",
      role,
      staffRole: role === "educator" ? staffRole : undefined,
      gradeBand: role === "student" ? demoStudentGradeBand : undefined,
      preferredLanguage: role === "guardian" ? "en" : undefined,
    });
  };

  const handleKioskStart = () => {
    setIsKioskMode(true);
    setCurrentUser({
      id: `KIOSK-${Date.now()}`,
      name: "Student (Kiosk)",
      role: "student",
      gradeBand: demoStudentGradeBand,
    });
  };

  return (
    <View style={[styles.page, isDesktop && styles.pageDesktop]}>
      <KeyboardAvoidingView
        style={[styles.container, isDesktop && styles.containerDesktop]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={{
              fontSize: 24,
              marginTop: 24,
              marginBottom: 12,
              color: theme.colors.primary,
              textAlign: "center",
            }}
          >
            ROLE SELECT LOADED
          </Text>
          <SectionCard>
            <Text style={styles.title}>{APP_NAME}</Text>
            <Text style={styles.subtitle}>
              {APP_TAGLINE}
            </Text>
            <Text style={styles.subtitleSecondary}>
              Choose a role to preview the experience. This demo uses role
              selection instead of sign-in.
            </Text>
            <View style={styles.divider} />
            <Text style={styles.label}>Display name (optional)</Text>
            <Text style={styles.helperText}>
              Used only for this demo. You may continue without entering a name.
            </Text>
            <TextInput
              placeholder="Alex Morgan"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor={theme.colors.mutedText}
            />
          </SectionCard>
          {roleOptions.map((option) => (
            <SectionCard key={option.role} style={styles.roleCard}>
              <Text style={styles.roleTitle}>{option.label}</Text>
              <Text style={styles.roleHint}>{option.hint}</Text>
              {option.role === "educator" ? (
                <View style={styles.staffToggle}>
                  {(["teacher", "counselor"] as const).map((roleOption) => {
                    const isSelected = staffRole === roleOption;
                    return (
                      <Pressable
                        key={roleOption}
                        onPress={() => setStaffRole(roleOption)}
                        style={[
                          styles.staffPill,
                          isSelected && styles.staffPillSelected,
                        ]}
                      >
                        <Text style={styles.staffPillText}>
                          {roleOption === "teacher" ? "Teacher" : "Counselor"}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
              <PrimaryButton
                label={`Continue as ${option.label}`}
                onPress={() => handleSelectRole(option.role)}
                style={styles.roleButton}
              />
            </SectionCard>
          ))}
          {districtProfile.kioskEnabled ? (
            <SectionCard style={styles.roleCard}>
              <Text style={styles.roleTitle}>Student Kiosk Report</Text>
              <Text style={styles.roleHint}>
                Use a school device for a quick report without a personal phone.
              </Text>
              <PrimaryButton
                label="Start kiosk reporting"
                onPress={handleKioskStart}
                variant="secondary"
                style={styles.roleButton}
              />
            </SectionCard>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  pageDesktop: {
    alignItems: "center",
  },
  container: {
    flex: 1,
    width: "100%",
  },
  containerDesktop: {
    width: 720,
  },
  content: {
    padding: 18,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.mutedText,
    marginBottom: 10,
    lineHeight: 20,
  },
  subtitleSecondary: {
    fontSize: 15,
    color: theme.colors.mutedText,
    marginBottom: 18,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6,
  },
  helperText: {
    fontSize: 13,
    color: theme.colors.mutedText,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  roleCard: {
    marginBottom: 14,
  },
  staffToggle: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    marginBottom: 6,
  },
  staffPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  staffPillSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.subtleBackground,
  },
  staffPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.text,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  },
  roleHint: {
    fontSize: 14,
    color: theme.colors.mutedText,
    marginVertical: 8,
  },
  roleButton: {
    marginTop: 8,
  },
});
