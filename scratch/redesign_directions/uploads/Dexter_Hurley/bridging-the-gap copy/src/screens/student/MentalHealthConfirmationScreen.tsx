import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { StudentStackParamList } from "../../navigation/types";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation } from "../../navigation/compatTypes";

export const MentalHealthConfirmationScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  return (
    <View style={styles.page}>
      <SectionCard style={styles.card}>
        <Text style={styles.title}>Thank you for reaching out</Text>
        <Text style={styles.subtitle}>
          A teacher or counselor will review this and follow up if you asked
          for support.
        </Text>
        <PrimaryButton
          label="Back to Well-Being & Support"
          onPress={() => navigation.navigate("WellBeingSupport")}
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
  card: {
    marginTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    alignSelf: "flex-start",
  },
});
