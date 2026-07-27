import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { mentalHealthApi } from "../../data/mentalHealthApi";
import {
  MentalHealthCheckIn,
  MentalHealthCheckInStatus,
} from "../../models/types";
import { StudentStackParamList } from "../../navigation/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useFocusEffect, useNavigation } from "../../navigation/compatTypes";

const statusLabels: Record<MentalHealthCheckInStatus, string> = {
  [MentalHealthCheckInStatus.New]: "New",
  [MentalHealthCheckInStatus.Reviewed]: "Reviewed",
  [MentalHealthCheckInStatus.Contacted]: "Contacted",
  [MentalHealthCheckInStatus.Closed]: "Closed",
};

const formatFeelings = (checkIn: MentalHealthCheckIn) => {
  const labelMap: Record<string, string> = {
    stressed: "Stressed",
    anxious: "Anxious or overwhelmed",
    sad: "Sad or down",
    need_to_talk: "Need to talk to someone",
    worried_about_friend: "Worried about a friend",
  };
  return checkIn.selectedFeelings.map((item) => labelMap[item]).join(", ");
};

const followUpLabels: Record<
  MentalHealthCheckIn["wantsFollowUp"],
  string
> = {
  yes: "Yes, please reach out",
  no: "Not right now",
  just_checking_in: "Just checking in",
};

export const WellBeingSupportScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const [checkIns, setCheckIns] = useState<MentalHealthCheckIn[]>([]);
  const [loading, setLoading] = useState(false);

  if (!requireRole(["student"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const loadCheckIns = useCallback(async () => {
    if (!currentUser) {
      return;
    }
    setLoading(true);
    const data = await mentalHealthApi.getCheckInsForStudent(currentUser.id);
    setCheckIns(data);
    setLoading(false);
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      loadCheckIns();
    }, [loadCheckIns])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Well-Being & Support</Text>
        <Text style={styles.subtitle}>
          This space is for students who want support or guidance. A school
          teacher, counselor, or trusted professional can follow up if you ask.
        </Text>
        <PrimaryButton
          label="Start a check-in"
          onPress={() => navigation.navigate("MentalHealthCheckIn")}
          style={styles.primaryButton}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Your recent check-ins</Text>
        {loading ? (
          <Text style={styles.mutedText}>Loading your check-ins...</Text>
        ) : checkIns.length === 0 ? (
          <Text style={styles.mutedText}>
            You have not submitted any check-ins yet.
          </Text>
        ) : (
          checkIns.map((entry) => (
            <View key={entry.id} style={styles.checkInRow}>
              <Text style={styles.checkInTitle}>
                {new Date(entry.createdAt).toLocaleString()}
              </Text>
              <Text style={styles.checkInMeta}>
                Feelings: {formatFeelings(entry)}
              </Text>
              <Text style={styles.checkInMeta}>
                Follow-up: {followUpLabels[entry.wantsFollowUp]}
              </Text>
              <Text style={styles.checkInMeta}>
                Status: {statusLabels[entry.status]}
              </Text>
            </View>
          ))
        )}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
    marginBottom: 12,
  },
  primaryButton: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  mutedText: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
  checkInRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  checkInTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  checkInMeta: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
});
