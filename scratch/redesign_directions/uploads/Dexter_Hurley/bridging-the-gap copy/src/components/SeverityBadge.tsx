import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { CaseSeverity } from "../models/types";
import { theme } from "./theme";

const severityConfig: Record<
  CaseSeverity,
  { label: string; color: string; background: string }
> = {
  low: {
    label: "Monitor",
    color: theme.colors.success,
    background: "#E7F6EC",
  },
  medium: {
    label: "Needs Attention",
    color: theme.colors.warning,
    background: "#FEF3C7",
  },
  high: {
    label: "Urgent Review",
    color: theme.colors.danger,
    background: "#FEE2E2",
  },
};

export const SeverityBadge: React.FC<{ severity: CaseSeverity }> = ({
  severity,
}) => {
  const config = severityConfig[severity];
  return (
    <View style={[styles.badge, { backgroundColor: config.background }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

export const getSeverityLabel = (severity: CaseSeverity) =>
  severityConfig[severity].label;

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
  },
});
