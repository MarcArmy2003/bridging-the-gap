import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { GuardianStackParamList } from "../../navigation/types";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation } from "../../navigation/compatTypes";

export const GuardianSupportConfirmationScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<GuardianStackParamList>>();

  return (
    <View style={styles.page}>
      <SectionCard>
        <Text style={styles.title}>Thank you for checking in</Text>
        <Text style={styles.subtitle}>
          A teacher or counselor will review your input and follow up if
          requested.
        </Text>
        <PrimaryButton
          label="Back to Parent / Guardian support"
          onPress={() => navigation.navigate("GuardianSupport")}
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
