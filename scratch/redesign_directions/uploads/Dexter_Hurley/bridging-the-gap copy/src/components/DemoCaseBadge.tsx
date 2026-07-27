import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "./theme";

type DemoCaseBadgeProps = {
  style?: any;
};

export const DemoCaseBadge = ({ style }: DemoCaseBadgeProps) => {
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>DEMO CASE — Training Scenario</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
    textAlign: "center",
  },
});
