import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { fakeApi } from "../../data/fakeApi";
import { guardianMessagingApi } from "../../data/guardianMessagingApi";
import { guardianSupportApi } from "../../data/guardianSupportApi";
import { mentalHealthApi } from "../../data/mentalHealthApi";
import { demoData } from "../../data/demoData";
import { Case, CaseStatus, GuardianMessage, GuardianMessageStatus, GuardianCheckIn, MentalHealthCheckIn } from "../../models/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";

type BucketCounts = {
  newCount: number;
  inProgressCount: number;
  awaitingFollowUp: number;
  closedCount: number;
};

const emptyBuckets = (): BucketCounts => ({
  newCount: 0,
  inProgressCount: 0,
  awaitingFollowUp: 0,
  closedCount: 0,
});

const classifyCases = (cases: Case[]): BucketCounts => {
  const buckets = emptyBuckets();
  cases.forEach((item) => {
    if (item.status === CaseStatus.New) {
      buckets.newCount += 1;
    } else if (item.status === CaseStatus.Resolved) {
      buckets.closedCount += 1;
    } else {
      buckets.inProgressCount += 1;
    }
  });
  return buckets;
};

const classifyMessages = (messages: GuardianMessage[]): BucketCounts => {
  const buckets = emptyBuckets();
  messages.forEach((item) => {
    if (item.status === GuardianMessageStatus.Sent) {
      buckets.newCount += 1;
    } else if (item.status === GuardianMessageStatus.Seen) {
      buckets.awaitingFollowUp += 1;
    } else {
      buckets.closedCount += 1;
    }
  });
  return buckets;
};

const classifyGuardianCheckIns = (checkIns: GuardianCheckIn[]): BucketCounts => {
  const buckets = emptyBuckets();
  checkIns.forEach((item) => {
    if (item.status === "new") {
      buckets.newCount += 1;
    } else if (item.status === "closed") {
      buckets.closedCount += 1;
    } else if (item.status === "contacted") {
      buckets.awaitingFollowUp += 1;
    } else {
      buckets.inProgressCount += 1;
    }
  });
  return buckets;
};

const classifyMentalHealth = (checkIns: MentalHealthCheckIn[]): BucketCounts => {
  const buckets = emptyBuckets();
  checkIns.forEach((item) => {
    if (item.status === "new") {
      buckets.newCount += 1;
    } else if (item.status === "closed") {
      buckets.closedCount += 1;
    } else if (item.status === "contacted") {
      buckets.awaitingFollowUp += 1;
    } else {
      buckets.inProgressCount += 1;
    }
  });
  return buckets;
};

const loadIndicator = (activeCount: number) => {
  if (activeCount < 8) {
    return { label: "Balanced", color: "#16A34A" };
  }
  if (activeCount < 16) {
    return { label: "Busy", color: "#F59E0B" };
  }
  return { label: "High Load", color: "#DC2626" };
};

export const CounselorWorkloadScreen = () => {
  const { currentUser, setCurrentUser, isDemoMode } = useAppContext();
  const [caseBuckets, setCaseBuckets] = useState<BucketCounts>(emptyBuckets());
  const [messageBuckets, setMessageBuckets] = useState<BucketCounts>(emptyBuckets());
  const [guardianBuckets, setGuardianBuckets] = useState<BucketCounts>(emptyBuckets());
  const [mentalHealthBuckets, setMentalHealthBuckets] = useState<BucketCounts>(emptyBuckets());
  const [loading, setLoading] = useState(false);

  if (!requireRole(["educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const loadWorkload = useCallback(async () => {
    setLoading(true);
    
    let cases: Case[];
    let messages: GuardianMessage[];
    let guardianCheckIns: GuardianCheckIn[];
    let mentalHealthCheckIns: MentalHealthCheckIn[];
    
    if (isDemoMode) {
      // Load demo data only
      cases = demoData.cases as Case[];
      messages = [];
      guardianCheckIns = [];
      mentalHealthCheckIns = [];
    } else {
      // Load real data
      [cases, messages, guardianCheckIns, mentalHealthCheckIns] = await Promise.all([
        fakeApi.getCases(),
        guardianMessagingApi.getAllMessages(),
        guardianSupportApi.getAllCheckIns(),
        mentalHealthApi.getAllCheckIns(),
      ]);
    }
    
    setCaseBuckets(classifyCases(cases));
    setMessageBuckets(classifyMessages(messages));
    setGuardianBuckets(classifyGuardianCheckIns(guardianCheckIns));
    setMentalHealthBuckets(classifyMentalHealth(mentalHealthCheckIns));
    setLoading(false);
  }, [isDemoMode]);

  useEffect(() => {
    loadWorkload();
  }, [loadWorkload]);

  const activeItems =
    caseBuckets.newCount +
    caseBuckets.inProgressCount +
    caseBuckets.awaitingFollowUp +
    messageBuckets.newCount +
    messageBuckets.inProgressCount +
    messageBuckets.awaitingFollowUp +
    guardianBuckets.newCount +
    guardianBuckets.inProgressCount +
    guardianBuckets.awaitingFollowUp +
    mentalHealthBuckets.newCount +
    mentalHealthBuckets.inProgressCount +
    mentalHealthBuckets.awaitingFollowUp;

  const indicator = loadIndicator(activeItems);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Teacher / Counselor workload</Text>
        <Text style={styles.subtitle}>
          Load indicators help with planning and support. This view is not used
          for performance evaluation.
        </Text>
        <Text style={styles.metricLabel}>Active items</Text>
        <Text style={styles.metricValue}>{loading ? "--" : activeItems}</Text>
        <View style={styles.indicatorRow}>
          <View
            style={[styles.indicatorDot, { backgroundColor: indicator.color }]}
          />
          <Text style={styles.indicatorText}>{indicator.label}</Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Student reports</Text>
        <Text style={styles.bucketText}>New: {caseBuckets.newCount}</Text>
        <Text style={styles.bucketText}>
          In progress: {caseBuckets.inProgressCount}
        </Text>
        <Text style={styles.bucketText}>
          Awaiting follow-up: {caseBuckets.awaitingFollowUp}
        </Text>
        <Text style={styles.bucketText}>Closed: {caseBuckets.closedCount}</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Parent / Guardian messages</Text>
        <Text style={styles.bucketText}>New: {messageBuckets.newCount}</Text>
        <Text style={styles.bucketText}>
          Awaiting follow-up: {messageBuckets.awaitingFollowUp}
        </Text>
        <Text style={styles.bucketText}>Closed: {messageBuckets.closedCount}</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Mental health check-ins</Text>
        <Text style={styles.bucketText}>New: {mentalHealthBuckets.newCount}</Text>
        <Text style={styles.bucketText}>
          In progress: {mentalHealthBuckets.inProgressCount}
        </Text>
        <Text style={styles.bucketText}>
          Awaiting follow-up: {mentalHealthBuckets.awaitingFollowUp}
        </Text>
        <Text style={styles.bucketText}>
          Closed: {mentalHealthBuckets.closedCount}
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Parent / Guardian check-ins</Text>
        <Text style={styles.bucketText}>New: {guardianBuckets.newCount}</Text>
        <Text style={styles.bucketText}>
          In progress: {guardianBuckets.inProgressCount}
        </Text>
        <Text style={styles.bucketText}>
          Awaiting follow-up: {guardianBuckets.awaitingFollowUp}
        </Text>
        <Text style={styles.bucketText}>
          Closed: {guardianBuckets.closedCount}
        </Text>
      </SectionCard>

      {currentUser?.role === "admin" ? (
        <SectionCard>
          <Text style={styles.sectionTitle}>Admin aggregate view</Text>
          <Text style={styles.subtitle}>
            Aggregated counts by role support staffing decisions.
          </Text>
          <Text style={styles.bucketText}>
            Student reports: {caseBuckets.newCount + caseBuckets.inProgressCount + caseBuckets.awaitingFollowUp + caseBuckets.closedCount}
          </Text>
          <Text style={styles.bucketText}>
            Parent / Guardian messages: {messageBuckets.newCount + messageBuckets.awaitingFollowUp + messageBuckets.closedCount}
          </Text>
          <Text style={styles.bucketText}>
            Mental health check-ins: {mentalHealthBuckets.newCount + mentalHealthBuckets.inProgressCount + mentalHealthBuckets.awaitingFollowUp + mentalHealthBuckets.closedCount}
          </Text>
          <Text style={styles.bucketText}>
            Parent / Guardian check-ins: {guardianBuckets.newCount + guardianBuckets.inProgressCount + guardianBuckets.awaitingFollowUp + guardianBuckets.closedCount}
          </Text>
        </SectionCard>
      ) : null}
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
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 13,
    color: theme.colors.mutedText,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
  },
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  indicatorText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  bucketText: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
});
