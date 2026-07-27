export type SupportedLanguage = "en" | "es";

export interface StatePolicyProfile {
  id: string;
  name: string;
  abuseHotlineName: string;
  abuseHotlineUrl: string;
  mandatoryReporterNoteEnabled: boolean;
  sroTitle: string;
  dataRetentionDays: number;
}

export interface DistrictProfile {
  id: string;
  name: string;
  schoolName: string;
  stateId: string;
  logoText: string;
  accentColor: string;
  supportedLanguages: SupportedLanguage[];
  allowK5StudentSelfService: boolean;
  kioskEnabled: boolean;
  counselorSoftCap: number;
}

export const stateProfiles: StatePolicyProfile[] = [
  {
    id: "FL",
    name: "Florida",
    abuseHotlineName: "Florida Abuse Hotline",
    abuseHotlineUrl: "https://www.myflfamilies.com/service-programs/abuse-hotline",
    mandatoryReporterNoteEnabled: true,
    sroTitle: "School Resource Officer",
    dataRetentionDays: 365,
  },
];

export const districtProfiles: DistrictProfile[] = [
  {
    id: "suncoast",
    name: "Suncoast Public Schools",
    schoolName: "Gulfview Middle School",
    stateId: "FL",
    logoText: "SP",
    accentColor: "#0F766E",
    supportedLanguages: ["en", "es"],
    allowK5StudentSelfService: false,
    kioskEnabled: true,
    counselorSoftCap: 14,
  },
];

export const getStateProfile = (id: string) =>
  stateProfiles.find((profile) => profile.id === id) || stateProfiles[0];

export const getDistrictProfile = (id: string) =>
  districtProfiles.find((profile) => profile.id === id) || districtProfiles[0];
