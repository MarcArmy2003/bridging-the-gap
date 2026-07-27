import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { supportApi } from "../../data/supportApi";
import { supportResources } from "../../data/supportResources";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";

const foodCheckOptions = ["Yes", "Not sure", "No"];

const helpOptions = [
  "I want to talk to a teacher or counselor privately",
  "I want resources for food near me",
  "I want help with meals at school",
  "I am asking for a friend",
];

export const FoodHelpScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [foodCheck, setFoodCheck] = useState<string | null>(null);
  const [helpChoice, setHelpChoice] = useState<string | null>(null);
  const [savedResources, setSavedResources] = useState<string[]>([]);

  if (!requireRole(["student"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const handleCounselorRequest = async () => {
    if (!currentUser) {
      return;
    }
    await supportApi.createSupportRequest({
      studentId: currentUser.id,
      type: "food_help",
      note: helpChoice || undefined,
    });
  };

  const handleSaveResource = async (resourceId: string) => {
    if (!currentUser) {
      return;
    }
    if (savedResources.includes(resourceId)) {
      return;
    }
    await supportApi.saveResource({
      studentId: currentUser.id,
      resourceId,
    });
    setSavedResources((prev) => [...prev, resourceId]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Food and needs support</Text>
        <Text style={styles.subtitle}>
          You deserve help. These steps are private and focused on support.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>
          Step 1: Do you have enough food at home this week?
        </Text>
        <View style={styles.optionGroup}>
          {foodCheckOptions.map((option) => (
            <PrimaryButton
              key={option}
              label={option}
              onPress={() => setFoodCheck(option)}
              variant={foodCheck === option ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Step 2: What kind of help do you want?</Text>
        <View style={styles.optionGroup}>
          {helpOptions.map((option) => (
            <PrimaryButton
              key={option}
              label={option}
              onPress={() => setHelpChoice(option)}
              variant={helpChoice === option ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Resources you can use now</Text>
        {supportResources.map((resource) => (
          <View key={resource.id} style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>{resource.title}</Text>
            <Text style={styles.resourceText}>{resource.description}</Text>
            <PrimaryButton
              label={
                savedResources.includes(resource.id)
                  ? "Saved to My Help List"
                  : "Save to My Help List"
              }
              onPress={() => handleSaveResource(resource.id)}
              variant="ghost"
              style={styles.resourceButton}
            />
          </View>
        ))}
      </SectionCard>

      <SectionCard>
        <PrimaryButton
          label="Request teacher, counselor, or social worker outreach"
          onPress={handleCounselorRequest}
          variant="secondary"
          style={styles.optionButton}
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
  optionGroup: {
    gap: 8,
  },
  optionButton: {
    alignSelf: "stretch",
  },
  resourceCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  resourceText: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginBottom: 8,
  },
  resourceButton: {
    alignSelf: "flex-start",
  },
});
