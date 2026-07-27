import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { SectionCard } from "../components/SectionCard";
import { theme } from "../components/theme";

interface AccessRestrictedScreenProps {
  onReset?: () => void;
}

export const AccessRestrictedScreen: React.FC<AccessRestrictedScreenProps> = ({
  onReset,
}) => {
  return (
    <View style={styles.container}>
      <SectionCard>
        <Text style={styles.title}>Access Restricted</Text>
        <Text style={styles.subtitle}>
          This area is limited to authorized roles. Please switch roles to
          continue.
        </Text>
        {onReset ? (
          <PrimaryButton label="Back to role selection" onPress={onReset} />
        ) : null}
      </SectionCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.mutedText,
    marginBottom: 16,
  },
});
