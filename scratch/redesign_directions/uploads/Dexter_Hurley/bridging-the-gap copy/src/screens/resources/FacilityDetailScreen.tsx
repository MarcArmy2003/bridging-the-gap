import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { Facility } from "../../data/apiTypes";
import { supportResourcesApi } from "../../data/supportResourcesApi";
import {
  GuardianStackParamList,
  StaffStackParamList,
  StudentStackParamList,
} from "../../navigation/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";
import { shouldBlockStudentSelfService } from "../../utils/gradeAccess";
import { APP_NAME } from "../../config/branding";
import type { RouteProp } from "../../navigation/compatTypes";
import { useRoute } from "../../navigation/compatTypes";

type FacilityRoute =
  | RouteProp<StudentStackParamList, "FacilityDetail">
  | RouteProp<GuardianStackParamList, "FacilityDetail">
  | RouteProp<StaffStackParamList, "FacilityDetail">;

export const FacilityDetailScreen = () => {
  const { currentUser, setCurrentUser, districtProfile } = useAppContext();
  const route = useRoute<FacilityRoute>();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  if (!requireRole(["student", "guardian", "educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  if (shouldBlockStudentSelfService(currentUser, districtProfile)) {
    return (
      <View style={styles.page}>
        <SectionCard>
          <Text style={styles.bodyText}>
            Support resources for younger students are available through
            parents, guardians, and school staff.
          </Text>
        </SectionCard>
      </View>
    );
  }

  useEffect(() => {
    const loadFacility = async () => {
      setLoading(true);
      const data = await supportResourcesApi.getFacilityById(
        route.params.facilityId
      );
      setFacility(data);
      setLoading(false);
    };
    loadFacility();
  }, [route.params.facilityId]);

  const formattedHours = useMemo(() => {
    if (!facility?.hours) {
      return "Not listed";
    }
    return Object.entries(facility.hours)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  }, [facility]);

  const handleCall = () => {
    Alert.alert(
      "Call",
      facility?.phone ? `Call ${facility.phone}` : "No phone listed."
    );
  };

  const handleWebsite = () => {
    Alert.alert(
      "Website",
      facility?.website ? facility.website : "No website listed."
    );
  };

  const handleSave = async () => {
    if (!currentUser || !facility) {
      return;
    }
    await supportResourcesApi.saveFacility(currentUser.id, facility.id);
    setSaved(true);
  };

  if (loading) {
    return (
      <View style={styles.page}>
        <SectionCard>
          <Text style={styles.bodyText}>Loading facility details...</Text>
        </SectionCard>
      </View>
    );
  }

  if (!facility) {
    return (
      <View style={styles.page}>
        <SectionCard>
          <Text style={styles.bodyText}>Facility not found.</Text>
        </SectionCard>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>{facility.name}</Text>
        <Text style={styles.subtitle}>{facility.description || " "}</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Services offered</Text>
        <Text style={styles.bodyText}>
          {facility.type.replace(/_/g, " ")}
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Who they serve</Text>
        <Text style={styles.bodyText}>
          {facility.audience?.length
            ? facility.audience.join(", ")
            : "Not listed"}
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.bodyText}>
          {facility.phone ? facility.phone : "Not listed"}
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Website</Text>
        <Text style={styles.bodyText}>
          {facility.website ? facility.website : "Not listed"}
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Hours</Text>
        <Text style={styles.bodyText}>{formattedHours}</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.bodyText}>
          {facility.description || "Not listed"}
        </Text>
      </SectionCard>

      <SectionCard>
        <View style={styles.actionRow}>
          <PrimaryButton
            label="Call"
            onPress={handleCall}
            variant="secondary"
            style={styles.actionButton}
          />
          <PrimaryButton
            label="Visit Website"
            onPress={handleWebsite}
            variant="secondary"
            style={styles.actionButton}
          />
          <PrimaryButton
            label={saved ? "Saved" : "Save to My List"}
            onPress={handleSave}
            variant="ghost"
            style={styles.actionButton}
          />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.footerText}>
          {APP_NAME} does not endorse providers. This list is informational
          only.
        </Text>
      </SectionCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
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
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    alignSelf: "flex-start",
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
});
