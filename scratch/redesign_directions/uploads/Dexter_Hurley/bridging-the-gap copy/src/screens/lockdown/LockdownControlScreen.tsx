import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import {
  lockdownApi,
  LockdownReasonCategory,
  LockdownStatus,
} from "../../data/lockdownApi";
import {
  districtProfiles,
  stateProfiles,
} from "../../data/policyConfig";
import {
  LawStackParamList,
  StaffStackParamList,
} from "../../navigation/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useFocusEffect, useNavigation } from "../../navigation/compatTypes";

type LockdownNav =
  | NativeStackNavigationProp<StaffStackParamList>
  | NativeStackNavigationProp<LawStackParamList>;

const reasonCategories: LockdownReasonCategory[] = [
  "Potential safety concern",
  "Report of a threat (no weapon found)",
  "Suspicious activity",
  "Medical emergency",
  "Law enforcement activity near campus",
  "Precautionary lockdown",
];

export const LockdownControlScreen = () => {
  const {
    currentUser,
    setCurrentUser,
    stateProfile,
    setStateProfile,
    districtProfile,
    setDistrictProfile,
  } = useAppContext();
  const navigation = useNavigation<LockdownNav>();
  const [status, setStatus] = useState<LockdownStatus>({ active: false });
  const [selectedReason, setSelectedReason] =
    useState<LockdownReasonCategory | null>(null);
  const [loading, setLoading] = useState(false);

  const districtsForState = districtProfiles.filter(
    (district) => district.stateId === stateProfile.id
  );

  if (!requireRole(["law", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const loadStatus = useCallback(async () => {
    const data = await lockdownApi.getStatus();
    setStatus(data);
    if (!data.active) {
      setSelectedReason(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStatus();
    }, [loadStatus])
  );

  const handleStart = async () => {
    if (!currentUser) {
      return;
    }
    setLoading(true);
    await lockdownApi.startLockdown(currentUser.role);
    setLoading(false);
    loadStatus();
  };

  const handleEnd = async () => {
    if (!currentUser || !selectedReason) {
      Alert.alert("Select a reason", "Choose a reason category to continue.");
      return;
    }
    setLoading(true);
    await lockdownApi.endLockdown(currentUser.role, selectedReason);
    setLoading(false);
    loadStatus();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Parent lockdown notifications</Text>
        <Text style={styles.subtitle}>
          Use templates only. Do not share operational or investigative details
          in parent updates.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>State policy profile</Text>
        <View style={styles.optionGroup}>
          {stateProfiles.map((profile) => (
            <PrimaryButton
              key={profile.id}
              label={profile.name}
              onPress={() => {
                setStateProfile(profile);
                const fallbackDistrict = districtProfiles.find(
                  (district) => district.stateId === profile.id
                );
                if (fallbackDistrict) {
                  setDistrictProfile(fallbackDistrict);
                }
              }}
              variant={stateProfile.id === profile.id ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
        <Text style={styles.sectionTitle}>District profile</Text>
        <View style={styles.optionGroup}>
          {districtsForState.map((district) => (
            <PrimaryButton
              key={district.id}
              label={district.name}
              onPress={() => {
                setDistrictProfile(district);
                if (district.stateId !== stateProfile.id) {
                  const matchingState = stateProfiles.find(
                    (profile) => profile.id === district.stateId
                  );
                  if (matchingState) {
                    setStateProfile(matchingState);
                  }
                }
              }}
              variant={
                districtProfile.id === district.id ? "secondary" : "ghost"
              }
              style={styles.optionButton}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Current status</Text>
        <Text style={styles.bodyText}>
          {status.active ? "Lockdown in progress" : "No active lockdown"}
        </Text>
        {status.active ? (
          <Text style={styles.helperText}>
            Parent notice is active and visible in the guardian app.
          </Text>
        ) : null}
      </SectionCard>

      {status.active ? (
        <SectionCard>
          <Text style={styles.sectionTitle}>End lockdown update</Text>
          <Text style={styles.helperText}>
            Select the approved reason category to notify parents.
          </Text>
          <View style={styles.optionGroup}>
            {reasonCategories.map((reason) => (
              <PrimaryButton
                key={reason}
                label={reason}
                onPress={() => setSelectedReason(reason)}
                variant={selectedReason === reason ? "secondary" : "ghost"}
                style={styles.optionButton}
              />
            ))}
          </View>
          <PrimaryButton
            label={loading ? "Sending update..." : "Send lockdown lifted update"}
            onPress={handleEnd}
            disabled={loading}
            style={styles.primaryButton}
          />
        </SectionCard>
      ) : (
        <SectionCard>
          <Text style={styles.sectionTitle}>During lockdown update</Text>
          <Text style={styles.helperText}>
            This sends a calm, non-specific notice to parents.
          </Text>
          <PrimaryButton
            label={loading ? "Sending update..." : "Start lockdown notice"}
            onPress={handleStart}
            disabled={loading}
            style={styles.primaryButton}
          />
        </SectionCard>
      )}

      <SectionCard>
        <PrimaryButton
          label="Back"
          onPress={() => navigation.goBack()}
          variant="ghost"
        />
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
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginTop: 6,
  },
  optionGroup: {
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    alignSelf: "stretch",
  },
  primaryButton: {
    marginTop: 12,
  },
});
