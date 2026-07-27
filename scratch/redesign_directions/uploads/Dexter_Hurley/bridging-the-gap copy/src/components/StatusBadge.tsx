import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CaseStatus } from "../models/types";
import { theme } from "./theme";

const statusStyles: Record<
  CaseStatus,
  { label: string; backgroundColor: string; textColor: string }
> = {
  [CaseStatus.New]: {
    label: "New",
    backgroundColor: theme.colors.subtleBackground,
    textColor: theme.colors.primary,
  },
  [CaseStatus.InReview]: {
    label: "In review",
    backgroundColor: "#FFEAA7",
    textColor: "#8B5E00",
  },
  [CaseStatus.ActionRequired]: {
    label: "Action required",
    backgroundColor: "#FDC7BA",
    textColor: "#A2412C",
  },
  [CaseStatus.Resolved]: {
    label: "Resolved",
    backgroundColor: "#ECFDF5",
    textColor: "#047857",
  },
  [CaseStatus.Archived]: {
    label: "Archived",
    backgroundColor: "#E2E8F0",
    textColor: "#475569",
  },
};

export const StatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
  const config = statusStyles[status];
  return (
    <View
      style={[styles.badge, { backgroundColor: config.backgroundColor }]}
    >
      <Text style={[styles.label, { color: config.textColor }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
