import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { theme } from "./theme";

export const SectionCard: React.FC<ViewProps> = ({ style, ...rest }) => {
  return <View style={[styles.card, style]} {...rest} />;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
