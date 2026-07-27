import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { Facility } from "../../data/apiTypes";
import { supportResourcesApi } from "../../data/supportResourcesApi";
import { useAppContext } from "../../store/AppContext";
import {
  GuardianStackParamList,
  StaffStackParamList,
  StudentStackParamList,
} from "../../navigation/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { requireRole } from "../../utils/requireRole";
import { shouldBlockStudentSelfService } from "../../utils/gradeAccess";
import { ElementarySupportNotice } from "../../components/ElementarySupportNotice";
import { APP_NAME } from "../../config/branding";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation } from "../../navigation/compatTypes";

type ResourceNav =
  | NativeStackNavigationProp<StudentStackParamList>
  | NativeStackNavigationProp<GuardianStackParamList>
  | NativeStackNavigationProp<StaffStackParamList>;

export const CommunityPartnersScreen = () => {
  const { currentUser, setCurrentUser, districtProfile } = useAppContext();
  const navigation = useNavigation<ResourceNav>();
  const [partners, setPartners] = useState<Facility[]>([]);

  if (!requireRole(["student", "guardian", "educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  if (shouldBlockStudentSelfService(currentUser, districtProfile)) {
    return <ElementarySupportNotice onBack={() => navigation.goBack()} />;
  }

  useEffect(() => {
    const loadPartners = async () => {
      const results = await supportResourcesApi.searchFacilities({
        types: ["community_org", "faith_based"],
      });
      setPartners(results.items);
    };
    loadPartners();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Community & Faith-Based Partners</Text>
        <Text style={styles.subtitle}>
          Optional community organizations and faith-based supports curated by
          your district. Participation is always your choice.
        </Text>
      </SectionCard>

      <SectionCard>
        {partners.length === 0 ? (
          <Text style={styles.helperText}>
            No community partners are listed right now.
          </Text>
        ) : (
          partners.map((partner) => (
            <View key={partner.id} style={styles.partnerCard}>
              <Text style={styles.partnerTitle}>{partner.name}</Text>
              <Text style={styles.partnerMeta}>
                {partner.description || "Community support partner"}
              </Text>
              <Text style={styles.partnerMeta}>
                {partner.phone ? `Phone: ${partner.phone}` : "Phone not listed"}
              </Text>
              <PrimaryButton
                label="View details"
                onPress={() =>
                  navigation.navigate("FacilityDetail", {
                    facilityId: partner.id,
                  })
                }
                variant="ghost"
                style={styles.detailButton}
              />
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.footerText}>
          These partners are optional and provided for awareness only. {APP_NAME}
          does not endorse specific organizations.
        </Text>
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
  helperText: {
    fontSize: 13,
    color: theme.colors.mutedText,
  },
  partnerCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  partnerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  partnerMeta: {
    fontSize: 13,
    color: theme.colors.mutedText,
    marginBottom: 6,
  },
  detailButton: {
    alignSelf: "flex-start",
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
});
