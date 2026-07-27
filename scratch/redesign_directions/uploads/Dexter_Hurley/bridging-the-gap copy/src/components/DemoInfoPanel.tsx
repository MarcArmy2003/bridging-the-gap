import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../components/theme";

type DemoInfoPanelProps = {
  guidance?: string[];
  suggestedActions?: string[];
};

export const DemoInfoPanel = ({
  guidance,
  suggestedActions,
}: DemoInfoPanelProps) => {
  return (
    <View style={styles.container}>
      {guidance && guidance.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📘 Guidance for This Scenario</Text>
          {guidance.map((item, idx) => (
            <Text key={idx} style={styles.listItem}>
              {item}
            </Text>
          ))}
        </View>
      ) : null}

      {suggestedActions && suggestedActions.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Suggested Actions</Text>
          {suggestedActions.map((item, idx) => (
            <Text key={idx} style={styles.listItem}>
              {item}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    padding: 12,
    marginVertical: 12,
    borderRadius: 6,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 8,
  },
  listItem: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 18,
    marginBottom: 4,
    marginLeft: 8,
  },
});
