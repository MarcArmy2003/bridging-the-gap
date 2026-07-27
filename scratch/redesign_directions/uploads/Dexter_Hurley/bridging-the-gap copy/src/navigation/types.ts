export type AuthStackParamList = {
  RoleSelect: undefined;
  PublicTrust: undefined;
};

export type SubmitReportParams = {
  incidentType?: "bullying" | "hazing";
  prefillNote?: string;
  kioskMode?: boolean;
};

export type StudentStackParamList = {
  WellBeingSupport: undefined;
  MentalHealthCheckIn: undefined;
  MentalHealthConfirmation: undefined;
  CheckInHome: undefined;
  StudentEmergencyReport: undefined;
  SupportResourcesHome: undefined;
  MentalHealthSupport: undefined;
  AbuseSafetyResources: undefined;
  LocalHelpResources: undefined;
  FacilityDetail: { facilityId: string };
  BullyingHelp: undefined;
  WellBeingHelp: undefined;
  FoodHelp: undefined;
  StudentEducationHub: undefined;
  WhenToUseEmergency: undefined;
  WhenToAskForSupport: undefined;
  HowReportsHandled: undefined;
  StudentAppBoundaries: undefined;
  CommunityPartners: undefined;
};

export type StaffStackParamList = {
  CaseInbox: undefined;
  CaseDetail: { caseId: string };
  PostIncidentFollowUp: { caseId: string };
  AuditLog: { caseId: string };
  TeacherMessages: undefined;
  MessagesHub: undefined;
  ReadOnlyMessages: { caseId: string; recipientRole: "teacher" | "guardian" };
  GuidanceLibrary: undefined;
  StaffAssistedReport: undefined;
  EmergencySafetyReport: undefined;
  LockdownControl: undefined;
  SupportResourcesHome: undefined;
  MentalHealthSupport: undefined;
  AbuseSafetyResources: undefined;
  LocalHelpResources: undefined;
  CommunityPartners: undefined;
  FacilityDetail: { facilityId: string };
  MentalHealthInbox: undefined;
  GuardianSupportInbox: undefined;
  GuardianMessageInbox: undefined;
  CounselorWorkload: undefined;
  StaffResilience: undefined;
  TrainingMode: undefined;
  ReportIntegrity: undefined;
  ComplianceToolkit: undefined;
  DistrictMetrics: undefined;
  BoardPolicy: undefined;
};

export type GuardianStackParamList = {
  GuardianOnboarding: undefined;
  GuardianCaseList: undefined;
  SubmitReport: SubmitReportParams | undefined;
  GuardianNextSteps: { caseId: string };
  GuardianExpectations: undefined;
  GuardianSupport: undefined;
  GuardianSupportConfirmation: undefined;
  GuardianMessageTemplates: undefined;
  GuardianMessageConfirmation: undefined;
  SupportResourcesHome: undefined;
  MentalHealthSupport: undefined;
  AbuseSafetyResources: undefined;
  LocalHelpResources: undefined;
  CommunityPartners: undefined;
  FacilityDetail: { facilityId: string };
};

export type LawStackParamList = {
  EscalatedCases: undefined;
  LockdownControl: undefined;
};
