import {
  Facility,
  FacilityDomainApi,
  FacilitySearchResponse,
  FacilitySearchParams,
  FacilityType,
  ResourceAudience,
  ResourceConcern,
  ResourceDelivery,
} from "./apiTypes";
import { facilities } from "./facilities";

const savedByUser: Record<string, Set<string>> = {};
const GOOGLE_MIN_RESULTS = 5;
const ZIP_REGEX = /^\d{5}$/;

const normalize = (value: string) => value.trim().toLowerCase();

const concernTypeHints: Record<ResourceConcern, FacilityType[]> = {
  general: [],
  bullying: ["youth_services", "community_org", "family_services"],
  mental_health: ["counseling_therapy", "youth_services", "crisis_support"],
  family_crisis: ["family_services", "crisis_support", "community_org"],
  legal_support: ["community_org", "family_services"],
  basic_needs: ["community_clinic", "community_org", "family_services"],
};

const concernTagHints: Record<ResourceConcern, string[]> = {
  general: [],
  bullying: ["bullying", "peer", "school_conflict", "mentoring"],
  mental_health: ["mental_health", "stress", "anxiety", "depression", "crisis"],
  family_crisis: ["family", "abuse_support", "crisis", "safety"],
  legal_support: ["legal", "advocacy", "rights"],
  basic_needs: ["basic_needs", "food", "housing", "referrals"],
};

const matchesQuery = (facility: Facility, query: string) => {
  if (!query) {
    return true;
  }
  const haystack = [
    facility.name,
    facility.city,
    facility.state,
    facility.zip,
    facility.addressLine1,
    facility.type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
};

const normalizeAudience = (audience?: string[] | null) =>
  (audience || []).map((item) => normalize(item));

const matchesAudience = (facility: Facility, audience: ResourceAudience = "all") => {
  if (audience === "all") {
    return true;
  }
  const values = normalizeAudience(facility.audience);
  if (audience === "student") {
    return values.includes("youth") || values.includes("student");
  }
  if (audience === "parent") {
    return values.includes("parent") || values.includes("family");
  }
  return values.includes("family");
};

const matchesDelivery = (facility: Facility, delivery: ResourceDelivery = "either") => {
  if (delivery === "either") {
    return true;
  }
  const tags = (facility.tags || []).map((tag) => normalize(tag));
  const isVirtual =
    tags.includes("virtual") ||
    tags.includes("online") ||
    tags.includes("hotline") ||
    facility.zip === "" ||
    normalize(facility.city) === "nationwide";
  if (delivery === "virtual") {
    return isVirtual;
  }
  return !isVirtual;
};

const matchesConcern = (facility: Facility, concern: ResourceConcern = "general") => {
  if (concern === "general") {
    return true;
  }
  const hintedTypes = concernTypeHints[concern];
  const tags = (facility.tags || []).map((tag) => normalize(tag));
  const hintedTags = concernTagHints[concern];
  return (
    hintedTypes.includes(facility.type) ||
    hintedTags.some((hint) => tags.some((tag) => tag.includes(hint)))
  );
};

const zipScore = (facility: Facility, zipCode?: string) => {
  if (!zipCode || !ZIP_REGEX.test(zipCode)) {
    return 0;
  }
  if (facility.zip === zipCode) {
    return 3;
  }
  if (facility.zip && facility.zip.slice(0, 3) === zipCode.slice(0, 3)) {
    return 1;
  }
  return 0;
};

const deriveDistanceMiles = (score: number): number | null => {
  if (score >= 3) return 2;
  if (score === 1) return 10;
  return null;
};

const matchesTypes = (facility: Facility, types?: FacilityType[]) => {
  if (!types || types.length === 0) {
    return true;
  }
  return types.includes(facility.type);
};

const mapGoogleResultType = (types?: FacilityType[], concern: ResourceConcern = "general"): FacilityType => {
  if (types && types.length > 0) {
    return types[0];
  }
  const hints = concernTypeHints[concern];
  return hints[0] || "community_org";
};

const geocodeZip = async (zipCode: string, apiKey: string) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    zipCode
  )}&key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Unable to geocode ZIP code");
  }
  const json = await response.json();
  const location = json?.results?.[0]?.geometry?.location;
  if (!location?.lat || !location?.lng) {
    throw new Error("No geocode results for ZIP code");
  }
  return { lat: location.lat as number, lng: location.lng as number };
};

const googleQueriesFor = (zipCode: string, concern: ResourceConcern) => {
  switch (concern) {
    case "bullying":
      return [
        `youth counseling near ${zipCode}`,
        `school bullying support near ${zipCode}`,
      ];
    case "mental_health":
      return [
        `mental health counseling near ${zipCode}`,
        `family crisis center near ${zipCode}`,
      ];
    case "family_crisis":
      return [
        `family crisis center near ${zipCode}`,
        `domestic violence support near ${zipCode}`,
      ];
    case "legal_support":
      return [`legal aid near ${zipCode}`];
    case "basic_needs":
      return [
        `food assistance near ${zipCode}`,
        `housing assistance near ${zipCode}`,
      ];
    default:
      return [
        `youth counseling near ${zipCode}`,
        `family support services near ${zipCode}`,
      ];
  }
};

const searchGooglePlacesFallback = async (
  zipCode: string,
  concern: ResourceConcern,
  audience: ResourceAudience,
  delivery: ResourceDelivery,
  types: FacilityType[] | undefined
): Promise<Facility[]> => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey || !ZIP_REGEX.test(zipCode) || delivery === "virtual") {
    return [];
  }

  try {
    const { lat, lng } = await geocodeZip(zipCode, apiKey);
    const queries = googleQueriesFor(zipCode, concern);
    const mappedType = mapGoogleResultType(types, concern);
    const collected: Facility[] = [];

    for (const query of queries) {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&location=${lat},${lng}&radius=25000&key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(url);
      if (!response.ok) {
        continue;
      }
      const json = await response.json();
      const results = (json?.results || []) as any[];

      for (const result of results.slice(0, 6)) {
        const address = (result.formatted_address || "") as string;
        const parts = address.split(",").map((item) => item.trim());
        const city = parts.length > 1 ? parts[parts.length - 3] || "Unknown" : "Unknown";
        const stateZip = parts.length > 1 ? parts[parts.length - 2] || "" : "";
        const stateZipParts = stateZip.split(" ").filter(Boolean);
        const state = stateZipParts[0] || "";
        const parsedZip = stateZipParts.find((item) => ZIP_REGEX.test(item)) || zipCode;

        collected.push({
          id: `google-${result.place_id}`,
          name: result.name || "Community Resource",
          source: "google_places",
          type: mappedType,
          description: "Public listing from Google Places",
          phone: null,
          website: null,
          addressLine1: parts[0] || address,
          city,
          state,
          zip: parsedZip,
          lat: result.geometry?.location?.lat || null,
          lng: result.geometry?.location?.lng || null,
          audience: audience === "all" ? ["family", "youth"] : [audience],
          tags: ["google_places", concern],
          active: true,
          distanceMiles: null,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return collected;
  } catch {
    return [];
  }
};

const dedupeByNameAndZip = (items: Facility[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${normalize(item.name)}|${normalize(item.zip || "")}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const supportResourcesApi: FacilityDomainApi = {
  async searchFacilities(params: FacilitySearchParams): Promise<FacilitySearchResponse> {
    // TODO: Replace curated mock data with Supabase queries.
    const query = normalize(params.query || "");
    const zipCode = (params.zipCode || "").trim();
    const concern = params.concern || "general";
    const audience = params.audience || "all";
    const delivery = params.delivery || "either";

    const curated = facilities
      .filter(
        (facility) =>
          facility.active &&
          matchesTypes(facility, params.types) &&
          matchesQuery(facility, query) &&
          matchesAudience(facility, audience) &&
          matchesConcern(facility, concern) &&
          matchesDelivery(facility, delivery)
      )
      .map((facility) => {
        const score = zipScore(facility, zipCode);
        return {
          ...facility,
          source:
            normalize(facility.city) === "nationwide" || !facility.zip
              ? "national"
              : "curated",
          distanceMiles: deriveDistanceMiles(score),
          __score: score,
        } as Facility & { __score: number };
      })
      .sort((a, b) => b.__score - a.__score || a.name.localeCompare(b.name))
      .map(({ __score, ...item }) => item);

    let fallback: Facility[] = [];
    if (zipCode && ZIP_REGEX.test(zipCode) && curated.length < GOOGLE_MIN_RESULTS) {
      fallback = await searchGooglePlacesFallback(
        zipCode,
        concern,
        audience,
        delivery,
        params.types
      );
    }

    const merged = dedupeByNameAndZip([...curated, ...fallback]);
    return {
      items: merged,
      usedGoogleFallback: fallback.length > 0,
      curatedCount: curated.length,
      fallbackCount: fallback.length,
    };
  },

  async getFacilityById(id: string): Promise<Facility | null> {
    // TODO: Replace mock data with Supabase queries.
    const facility = facilities.find((item) => item.id === id);
    return facility ?? null;
  },

  async saveFacility(userId: string, facilityId: string): Promise<void> {
    // TODO: Replace mock data with Supabase queries.
    if (!savedByUser[userId]) {
      savedByUser[userId] = new Set();
    }
    savedByUser[userId].add(facilityId);
  },

  async getSavedFacilities(userId: string): Promise<Facility[]> {
    // TODO: Replace mock data with Supabase queries.
    const saved = savedByUser[userId];
    if (!saved) {
      return [];
    }
    return facilities.filter((item) => saved.has(item.id));
  },
};
