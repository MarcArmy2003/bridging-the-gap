import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { fakeApi } from "../../data/fakeApi";
import { guardianMessagingApi } from "../../data/guardianMessagingApi";
import { guardianSupportApi } from "../../data/guardianSupportApi";
import { mentalHealthApi } from "../../data/mentalHealthApi";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";

const dateRanges = ["Last 7 days", "Last 30 days", "Last 90 days"];
const gradeBands = ["K-5", "6-8", "9-12"];
const schools = ["All schools", "North Campus", "Central Campus", "South Campus"];

export const DistrictMetricsScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [selectedRange, setSelectedRange] = useState(dateRanges[1]);
  const [selectedGrade, setSelectedGrade] = useState(gradeBands[1]);
  const [selectedSchool, setSelectedSchool] = useState(schools[0]);
  const [totals, setTotals] = useState({
    reports: 0,
    guardianMessages: 0,
    mentalHealth: 0,
    guardianCheckIns: 0,
  });

  if (!requireRole(["admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const loadMetrics = useCallback(async () => {
    const [cases, messages, guardianCheckIns, mentalHealthCheckIns] =
      await Promise.all([
        fakeApi.getCases(),
        guardianMessagingApi.getAllMessages(),
        guardianSupportApi.getAllCheckIns(),
        mentalHealthApi.getAllCheckIns(),
      ]);
    setTotals({
      reports: cases.length,
      guardianMessages: messages.length,
      mentalHealth: mentalHealthCheckIns.length,
      guardianCheckIns: guardianCheckIns.length,
    });
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const engagementRate =
    totals.guardianCheckIns === 0
      ? "0%"
      : `${Math.min(
          100,
          Math.round((totals.guardianMessages / totals.guardianCheckIns) * 100)
        )}%`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>District metrics</Text>
        <Text style={styles.subtitle}>
          All data shown is aggregated and privacy-protected.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Filters</Text>
        <Text style={styles.filterLabel}>Date range</Text>
        <View style={styles.filterGroup}>
          {dateRanges.map((range) => (
            <PrimaryButton
              key={range}
              label={range}
              onPress={() => setSelectedRange(range)}
              variant={selectedRange === range ? "secondary" : "ghost"}
              style={styles.filterButton}
            />
          ))}
        </View>
        <Text style={styles.filterLabel}>School</Text>
        <View style={styles.filterGroup}>
          {schools.map((school) => (
            <PrimaryButton
              key={school}
              label={school}
              onPress={() => setSelectedSchool(school)}
              variant={selectedSchool === school ? "secondary" : "ghost"}
              style={styles.filterButton}
            />
          ))}
        </View>
        <Text style={styles.filterLabel}>Grade band</Text>
        <View style={styles.filterGroup}>
          {gradeBands.map((band) => (
            <PrimaryButton
              key={band}
              label={band}
              onPress={() => setSelectedGrade(band)}
              variant={selectedGrade === band ? "secondary" : "ghost"}
              style={styles.filterButton}
            />
          ))}
        </View>
        <Text style={styles.helperText}>
          Filters are illustrative in this demo and do not change counts.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Reports</Text>
          <Text style={styles.metricValue}>{totals.reports}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Parent / Guardian messages</Text>
          <Text style={styles.metricValue}>{totals.guardianMessages}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Mental health check-ins</Text>
          <Text style={styles.metricValue}>{totals.mentalHealth}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Parent / Guardian check-ins</Text>
          <Text style={styles.metricValue}>{totals.guardianCheckIns}</Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Engagement and response trends</Text>
        <Text style={styles.bodyText}>
          Parent / Guardian engagement rate: {engagementRate}
        </Text>
        <Text style={styles.bodyText}>
          Average response time: 1-3 school days (range)
        </Text>
        <Text style={styles.bodyText}>Resolution timeline: 1-3 weeks (range)</Text>
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
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 13,
    color: theme.colors.mutedText,
    marginTop: 8,
    marginBottom: 6,
  },
  filterGroup: {
    gap: 8,
  },
  filterButton: {
    alignSelf: "flex-start",
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginTop: 8,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 13,
    color: theme.colors.mutedText,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  bodyText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 6,
  },
});
