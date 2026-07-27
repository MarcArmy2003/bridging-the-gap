import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SectionCard } from "../../components/SectionCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { theme } from "../../components/theme";
import { ElementarySupportNotice } from "../../components/ElementarySupportNotice";
import {
  Facility,
  FacilityType,
  ResourceAudience,
  ResourceConcern,
  ResourceDelivery,
} from "../../data/apiTypes";
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
import { APP_NAME } from "../../config/branding";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation } from "../../navigation/compatTypes";

type ResourceNav =
  | NativeStackNavigationProp<StudentStackParamList>
  | NativeStackNavigationProp<GuardianStackParamList>
  | NativeStackNavigationProp<StaffStackParamList>;

export const LocalHelpResourcesScreen = () => {
  const { currentUser, setCurrentUser, districtProfile } = useAppContext();
  const navigation = useNavigation<ResourceNav>();
  const [query, setQuery] = useState("");
  const [concern, setConcern] = useState<ResourceConcern>("general");
  const [audience, setAudience] = useState<ResourceAudience>("all");
  const [delivery, setDelivery] = useState<ResourceDelivery>("either");
  const [filters, setFilters] = useState<FacilityType[]>([]);
  const [results, setResults] = useState<Facility[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [usedGoogleFallback, setUsedGoogleFallback] = useState(false);

  if (!requireRole(["student", "guardian", "educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  if (shouldBlockStudentSelfService(currentUser, districtProfile)) {
    return <ElementarySupportNotice onBack={() => navigation.goBack()} />;
  }

  const filterOptions: { label: string; value: FacilityType }[] = [
    { label: "Youth services", value: "youth_services" },
    { label: "Counseling / therapy", value: "counseling_therapy" },
    { label: "Community clinics", value: "community_clinic" },
    { label: "Crisis support", value: "crisis_support" },
    { label: "Family services", value: "family_services" },
    { label: "Community organizations", value: "community_org" },
    { label: "Faith-based supports", value: "faith_based" },
  ];

  const loadResults = useCallback(
    async (
      zipCode: string,
      selectedFilters: FacilityType[],
      selectedConcern: ResourceConcern,
      selectedAudience: ResourceAudience,
      selectedDelivery: ResourceDelivery
    ) => {
      setIsSearching(true);
      const data = await supportResourcesApi.searchFacilities({
        zipCode,
        types: selectedFilters,
        concern: selectedConcern,
        audience: selectedAudience,
        delivery: selectedDelivery,
      });
      setResults(data.items);
      setUsedGoogleFallback(data.usedGoogleFallback);
      setIsSearching(false);
      setHasSearched(true);
    },
    []
  );

  useEffect(() => {
    if (!hasSearched) {
      return;
    }
    if (!/^\d{5}$/.test(query.trim())) {
      return;
    }
    loadResults(query.trim(), filters, concern, audience, delivery);
  }, [filters, concern, audience, delivery, hasSearched, loadResults, query]);

  const toggleFilter = (value: FacilityType) => {
    setFilters((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleSearch = () => {
    const zip = query.trim();
    if (!/^\d{5}$/.test(zip)) {
      Alert.alert("Enter ZIP code", "Please enter a valid 5-digit ZIP code.");
      return;
    }
    loadResults(zip, filters, concern, audience, delivery);
  };

  const handleCall = (facility: Facility) => {
    Alert.alert("Call", `Call ${facility.name} at ${facility.phone || "N/A"}`);
  };

  const handleWebsite = (facility: Facility) => {
    Alert.alert(
      "Website",
      facility.website ? facility.website : "No website listed."
    );
  };

  const handleSave = async (facility: Facility) => {
    if (!currentUser) {
      return;
    }
    await supportResourcesApi.saveFacility(currentUser.id, facility.id);
    setSavedIds((prev) => new Set(prev).add(facility.id));
  };

  const formatAddress = (facility: Facility) => {
    const parts = [
      facility.addressLine1,
      facility.city,
      facility.state,
      facility.zip,
    ]
      .filter(Boolean)
      .join(", ");
    return parts || "Address not listed";
  };

  const formatType = (value: FacilityType) => {
    const match = filterOptions.find((option) => option.value === value);
    return match ? match.label : value.replace(/_/g, " ");
  };

  const concernOptions: { label: string; value: ResourceConcern }[] = [
    { label: "General", value: "general" },
    { label: "Bullying", value: "bullying" },
    { label: "Mental health", value: "mental_health" },
    { label: "Family crisis", value: "family_crisis" },
    { label: "Legal aid", value: "legal_support" },
    { label: "Basic needs", value: "basic_needs" },
  ];

  const audienceOptions: { label: string; value: ResourceAudience }[] = [
    { label: "All", value: "all" },
    { label: "Student", value: "student" },
    { label: "Parent", value: "parent" },
    { label: "Family", value: "family" },
  ];

  const deliveryOptions: { label: string; value: ResourceDelivery }[] = [
    { label: "In-person + virtual", value: "either" },
    { label: "In-person", value: "in_person" },
    { label: "Virtual", value: "virtual" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.sectionTitle}>Immediate Help</Text>
        <Text style={styles.helperText}>
          If someone is in immediate danger, call emergency services now.
        </Text>
        <Text style={styles.locationMeta}>• Emergency: 911</Text>
        <Text style={styles.locationMeta}>• Crisis support: 988 (call/text)</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.title}>Find Help Near You</Text>
        <Text style={styles.subtitle}>
          Enter a ZIP code and browse trusted support resources.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>ZIP code</Text>
        <TextInput
          style={styles.input}
          placeholder="30318"
          keyboardType="number-pad"
          maxLength={5}
          placeholderTextColor={theme.colors.mutedText}
          value={query}
          onChangeText={setQuery}
        />
        <PrimaryButton
          label={isSearching ? "Searching..." : "Search"}
          onPress={handleSearch}
          variant="secondary"
          style={styles.searchButton}
        />
        <Text style={styles.sectionTitle}>Filters</Text>
        <Text style={styles.helperText}>Concern type</Text>
        <View style={styles.filterRow}>
          {concernOptions.map((option) => (
            <PrimaryButton
              key={option.value}
              label={option.label}
              onPress={() => setConcern(option.value)}
              variant={concern === option.value ? "secondary" : "ghost"}
              style={styles.filterButton}
            />
          ))}
        </View>

        <Text style={styles.helperText}>Audience</Text>
        <View style={styles.filterRow}>
          {audienceOptions.map((option) => (
            <PrimaryButton
              key={option.value}
              label={option.label}
              onPress={() => setAudience(option.value)}
              variant={audience === option.value ? "secondary" : "ghost"}
              style={styles.filterButton}
            />
          ))}
        </View>

        <Text style={styles.helperText}>Format</Text>
        <View style={styles.filterRow}>
          {deliveryOptions.map((option) => (
            <PrimaryButton
              key={option.value}
              label={option.label}
              onPress={() => setDelivery(option.value)}
              variant={delivery === option.value ? "secondary" : "ghost"}
              style={styles.filterButton}
            />
          ))}
        </View>

        <Text style={styles.helperText}>Resource category</Text>
        <View style={styles.filterRow}>
          {filterOptions.map((option) => (
            <PrimaryButton
              key={option.value}
              label={option.label}
              onPress={() => toggleFilter(option.value)}
              variant={filters.includes(option.value) ? "secondary" : "ghost"}
              style={styles.filterButton}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Results ({results.length})</Text>
        {usedGoogleFallback ? (
          <Text style={styles.helperText}>
            Showing additional public listings because curated local results were limited.
          </Text>
        ) : null}
        {hasSearched && results.length === 0 ? (
          <Text style={styles.helperText}>
            No results found. Try another ZIP code or fewer filters.
          </Text>
        ) : (
          results.map((facility) => (
            <View key={facility.id} style={styles.locationCard}>
              <Text style={styles.locationTitle}>{facility.name}</Text>
              {facility.source ? (
                <Text style={styles.locationMeta}>
                  Source: {facility.source === "curated" ? "Curated local directory" : facility.source === "google_places" ? "Public listing" : "National resource"}
                </Text>
              ) : null}
              <Text style={styles.locationMeta}>
                Type: {formatType(facility.type)}
              </Text>
              {typeof facility.distanceMiles === "number" ? (
                <Text style={styles.locationMeta}>
                  Approx. distance: {facility.distanceMiles} miles
                </Text>
              ) : null}
              <Text style={styles.locationMeta}>
                Phone: {facility.phone || "Not listed"}
              </Text>
              <Text style={styles.locationMeta}>
                Website: {facility.website || "Not listed"}
              </Text>
              <Text style={styles.locationMeta}>
                Address: {formatAddress(facility)}
              </Text>
              <View style={styles.actionRow}>
                <PrimaryButton
                  label="Call"
                  onPress={() => handleCall(facility)}
                  variant="secondary"
                  style={styles.actionButton}
                />
                <PrimaryButton
                  label="Website"
                  onPress={() => handleWebsite(facility)}
                  variant="secondary"
                  style={styles.actionButton}
                />
                <PrimaryButton
                  label={savedIds.has(facility.id) ? "Saved" : "Save"}
                  onPress={() => handleSave(facility)}
                  variant="ghost"
                  style={styles.actionButton}
                />
              </View>
              <PrimaryButton
                label="View details"
                onPress={() =>
                  navigation.navigate("FacilityDetail", {
                    facilityId: facility.id,
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
          {APP_NAME} does not endorse providers. This list is informational
          only.
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.surface,
  },
  searchButton: {
    alignSelf: "flex-start",
    marginTop: 10,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
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
  locationCard: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 12,
    marginTop: 12,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  locationMeta: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    alignSelf: "flex-start",
  },
  detailButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
});
