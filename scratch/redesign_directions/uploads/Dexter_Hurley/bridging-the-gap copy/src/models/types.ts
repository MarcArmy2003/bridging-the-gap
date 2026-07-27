export type UserRole = "student" | "educator" | "admin" | "guardian" | "law";
export type PreferredLanguage = "en" | "es";
export type StudentGradeBand = "k5" | "6_8" | "9_12";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  staffRole?: "teacher" | "counselor";
  gradeBand?: StudentGradeBand;
  preferredLanguage?: PreferredLanguage;
  isDemo?: boolean;
}

export enum CaseStatus {
  New = "new",
  InReview = "in_review",
  ActionRequired = "action_required",
  Resolved = "resolved",
  Archived = "archived",
}

export type IncidentType = "bullying" | "hazing" | "safety";
export type CaseSeverity = "low" | "medium" | "high";
export type SupportPlanType =
  | "check_in"
  | "parent"
  | "monitor"
  | "counselor"
  | "safety";

// ===== THREAT REPORTING TYPES =====
// Structured threat intake (separate from bullying/wellness cases)
// Does NOT detect weapons; enables rapid intake + escalation to SRO

export enum ThreatConcern {
  PossibleWeapon = "possible_weapon",
  ThreatMade = "threat_made",
  SuspiciousBehavior = "suspicious_behavior",
  ConcerningStatement = "concerning_statement",
}

export enum ThreatLocation {
  OnCampus = "on_campus",
  OnBus = "on_bus",
  NearbyLocation = "nearby_location",
  OnlineOnly = "online_only",
}

export enum ThreatAwareness {
  SawSomething = "saw_something",
  HeardStatement = "heard_statement",
  SocialMediaMessage = "social_media",
  SecondHandInfo = "second_hand",
}

export enum ThreatTiming {
  Happening = "happening_now",
  Unclear = "unclear",
  NotHappening = "not_happening",
}

export enum ThreatSeverity {
  Critical = "critical",  // Weapon + now = SRO instant
  High = "high",          // Weapon + unclear = SRO immediate
  Moderate = "moderate",  // Behavior/statement only = counselor
}

export interface ThreatReport {
  id: string;
  reporterId: string;
  reporterRole: "student" | "staff" | "parent";
  anonymous: boolean;
  
  // Structured intake answers
  concern: ThreatConcern;
  location: ThreatLocation;
  awareness: ThreatAwareness;
  timing: ThreatTiming;
  
  // Optional freetext detail (NOT diagnostic)
  details?: string;
  
  // Classification (automatic, rules-based)
  severity: ThreatSeverity;
  classificationReason: string; // e.g., "Weapon mentioned + happening now"
  
  // Escalation status
  escalatedToSro: boolean;
  escalatedAt?: string;
  sroResponseId?: string;
  
  // References (optional case linkage)
  linkedCaseId?: string;
  
  // Legal requirement: timestamp + immutable record
  createdAt: string;
  resolvedAt?: string;
  
  // Audit trail
  escalationLog: EscalationEvent[];
}

export interface EscalationEvent {
  id: string;
  action: "created" | "classified" | "escalated_to_sro" | "resolved" | "cleared";
  actorId: string;
  actorRole: string;
  timestamp: string;
  details?: string;
}

export interface Case {
  id: string;
  incidentType: IncidentType;
  narrative: string;
  severity: CaseSeverity;
  status: CaseStatus;
  title?: string;
  studentName?: string;
  guardianId?: string;
  ownerType?: "teacher" | "counselor";
  assignedToName?: string;
  assignedToRole?: "teacher" | "counselor";
  lastTouchedAt?: string;
  lastUpdatedAt?: string;
  updatedAt?: string;
  reportSource?: "student" | "teacher";
  directToSro?: boolean;
  emergencyType?: string;
  emergencyLocation?: string;
  emergencyScope?: string;
  handoffNote?: string;
  handoffRequestedAt?: string;
  safetyConcernType?: string;
  sharedWithSro?: boolean;
  sroShareReason?: string;
  sroShareNote?: string;
  sroSharedAt?: string;
  autoRoutedToSro?: boolean;
  autoRoutedReason?: string;
  supportPlanType?: SupportPlanType;
  supportPlanUpdatedAt?: string;
  supportPlanOwnerName?: string;
  createdAt: string;
}

export interface CaseNote {
  id: string;
  authorId: string;
  authorName: string;
  role: "educator" | "admin" | "counselor";
  content: string;
  createdAt: string;
}

export interface CaseEvent {
  id: string;
  type: "status_change" | "note_added";
  actorName: string;
  fromStatus?: CaseStatus;
  toStatus?: CaseStatus;
  notePreview?: string;
  createdAt: string;
}

export type StaffCapacityRole = "teacher" | "counselor";

export interface StaffCapacitySetting {
  id: string;
  role: StaffCapacityRole;
  softCaseCap: number;
  softCheckInCap: number;
  softMessageCap: number;
  updatedAt: string;
}

export type StaffResilienceAlertType =
  | "capacity_warning"
  | "stalled_case"
  | "handoff_required";

export interface StaffResilienceAlert {
  id: string;
  caseId?: string;
  type: StaffResilienceAlertType;
  message: string;
  createdAt: string;
  severity: "info" | "warning" | "critical";
}

export type PostIncidentCheckInStatus = "scheduled" | "sent" | "completed";

export interface PostIncidentCheckIn {
  id: string;
  caseId: string;
  recipientType: "student" | "guardian";
  message: string;
  scheduledFor: string;
  status: PostIncidentCheckInStatus;
  completedAt?: string;
}

export interface StaffDebriefItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface PostIncidentPlan {
  caseId: string;
  status: "draft" | "active" | "completed";
  notes?: string;
  followUps: PostIncidentCheckIn[];
  debriefChecklist: StaffDebriefItem[];
  updatedAt: string;
}

export interface DocumentationDraft {
  id: string;
  caseId: string;
  type: "summary" | "parent_follow_up" | "audit_note";
  content: string;
  createdAt: string;
  approved: boolean;
}

export interface IntegrityFlag {
  id: string;
  caseId: string;
  createdAt: string;
  reason: string;
  severity: "low" | "medium" | "high";
  resolved: boolean;
}

export interface AccessLogEntry {
  id: string;
  caseId: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  timestamp: string;
}

export interface RetentionPolicy {
  caseRetentionDays: number;
  auditRetentionDays: number;
  accessLogRetentionDays: number;
  updatedAt: string;
}

export interface TrainingScenario {
  id: string;
  title: string;
  description: string;
  focusAreas: string[];
}

export interface GuardianCaseView {
  id: string;
  incidentType: IncidentType;
  status: CaseStatus;
  createdAt: string;
  childName: string;
  redactedNarrative: string;
}

export enum TeacherMessageStatus {
  Sent = "sent",
  Read = "read",
}

export interface TeacherMessage {
  id: string;
  teacherId: string;
  counselorName: string;
  contextLabel: string;
  body: string;
  status: TeacherMessageStatus;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  caseId: string;
  action: string;
  timestamp: string;
  actorRole: UserRole;
}

export type MentalHealthFeeling =
  | "stressed"
  | "anxious"
  | "sad"
  | "need_to_talk"
  | "worried_about_friend";

export enum MentalHealthCheckInStatus {
  New = "new",
  Reviewed = "reviewed",
  Contacted = "contacted",
  Closed = "closed",
}

export interface MentalHealthCheckIn {
  id: string;
  studentId: string;
  studentName: string;
  selectedFeelings: MentalHealthFeeling[];
  wantsFollowUp: "yes" | "no" | "just_checking_in";
  message?: string;
  status: MentalHealthCheckInStatus;
  createdAt: string;
}

export type GuardianCheckInResponse = "yes" | "no" | "not_sure";

export type GuardianSupportRequest =
  | "resources"
  | "counselor_outreach"
  | "conversation_help"
  | "not_now";

export type PromptSubmittedBy = "guardian" | "system";

export interface PromptSuggestion {
  id: string;
  caseId: string;
  submittedBy: PromptSubmittedBy;
  category: string;
  promptText: string;
  createdAt: string;
}

export enum GuardianCheckInStatus {
  New = "new",
  Reviewed = "reviewed",
  Contacted = "contacted",
  Closed = "closed",
}

export interface GuardianCheckIn {
  id: string;
  guardianId: string;
  guardianName: string;
  responses: Record<string, GuardianCheckInResponse>;
  promptSuggestions?: PromptSuggestion[];
  promptNotes?: string;
  observations?: string;
  supportRequests: GuardianSupportRequest[];
  status: GuardianCheckInStatus;
  createdAt: string;
}

export enum GuardianMessageStatus {
  Sent = "sent",
  Seen = "seen",
  Responded = "responded",
}

export interface GuardianMessage {
  id: string;
  guardianId: string;
  guardianName: string;
  subject: string;
  body: string;
  wantsCallback: boolean;
  status: GuardianMessageStatus;
  replyBody?: string;
  repliedAt?: string;
  createdAt: string;
}

export type FeedbackRating =
  | "very_helpful"
  | "somewhat_helpful"
  | "not_helpful"
  | "prefer_not_to_answer";

export interface FeedbackEntry {
  id: string;
  guardianId: string;
  context: "guardian_message" | "case_resolved";
  referenceId: string;
  rating: FeedbackRating;
  comment?: string;
  createdAt: string;
}
