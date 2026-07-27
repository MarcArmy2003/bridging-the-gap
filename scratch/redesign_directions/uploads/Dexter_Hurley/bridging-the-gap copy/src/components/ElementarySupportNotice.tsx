import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "./PrimaryButton";
import { SectionCard } from "./SectionCard";
import { theme } from "./theme";

interface ElementarySupportNoticeProps {
  onBack?: () => void;
}

export const ElementarySupportNotice: React.FC<
  ElementarySupportNoticeProps
> = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <SectionCard>
        <Text style={styles.title}>Support for younger students</Text>
        <Text style={styles.subtitle}>
          For grades K-5, check-ins happen with a teacher, counselor, or
          parent/guardian.
        </Text>
        <Text style={styles.subtitle}>
          Ask a trusted adult to help you share what is going on.
        </Text>
        {onBack ? (
          <PrimaryButton label="Back" onPress={onBack} variant="secondary" />
        ) : null}
      </SectionCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 18,
    justifyContent: "center",
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
    marginBottom: 10,
  },
});
