/**
 * Demo data for Safe Voice counselor workflows
 * Provides realistic, preloaded scenarios for new counselors and demos
 */

import { Case, CaseStatus } from "../models/types";

export type DemoTask = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  description: string;
  studentName: string;
  studentGrade: number;
};

export type DemoCase = Case & {
  guidance?: string[];
  suggestedActions?: string[];
};

/**
 * Preloaded demo cases for counselor workflow training
 * Each case teaches a different decision path and support strategy
 */
const demoCases: DemoCase[] = [
  {
    id: "demo-case-1",
    title: "Peer Bullying Concern",
    incidentType: "bullying",
    narrative: "I don't feel safe in the hallway. A group keeps bothering me between classes.",
    severity: "medium",
    studentName: "Student (Grade 7)",
    status: CaseStatus.New,
    createdAt: new Date().toISOString(),
    guidance: [
      "✓ Listen and validate the student's experience",
      "✓ Assess severity: Is this ongoing harassment or one incident?",
      "✓ Identify the group and specific behaviors",
      "✓ Decide next step: monitoring, parent contact, or escalation",
    ],
    suggestedActions: [
      "Schedule private check-in with student to gather details",
      "Contact parent/guardian to inform and gather home context",
      "Speak with teachers to observe hallway dynamics",
      "Document incident details and support plan",
      "Follow up in 1 week to assess if behavior has improved",
    ],
  },
  {
    id: "demo-case-2",
    title: "Mental Health Support Request",
    incidentType: "hazing",
    narrative: "I feel overwhelmed and anxious and want to talk to someone.",
    severity: "medium",
    studentName: "Student (Grade 10)",
    status: CaseStatus.InReview,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    guidance: [
      "✓ Acknowledge the student's courage in asking for help",
      "✓ Explore what's causing the overwhelming feelings",
      "✓ Assess whether this is situational stress or ongoing mental health concern",
      "✓ Determine if parent/guardian contact is appropriate and helpful",
    ],
    suggestedActions: [
      "Provide coping strategies and stress management resources",
      "Refer to school counselor for ongoing support",
      "Share mental health resources with student and family",
      "Schedule follow-up conversation in 1 week",
      "Document support plan and student goals",
    ],
  },
  {
    id: "demo-case-3",
    title: "Safety Threat (Escalated)",
    incidentType: "safety",
    narrative: "I'm worried someone might hurt others tomorrow.",
    severity: "high",
    studentName: "Student (Grade 11)",
    status: CaseStatus.ActionRequired,
    createdAt: new Date().toISOString(),
    guidance: [
      "🚨 IMMEDIATE: This meets safety escalation criteria",
      "✓ Document the exact statement and context",
      "✓ Assess imminent danger - is there a specific threat or person named?",
      "✓ Do not delay - escalate to SRO per protocol immediately",
      "✓ Contact parent/guardian after SRO notification",
    ],
    suggestedActions: [
      "Immediately notify SRO with full context",
      "Document everything the student said (use exact words)",
      "Stay with student until escalation is complete",
      "Prepare for parent notification conversation",
      "Coordinate with SRO on next steps and follow-up",
    ],
  },
  {
    id: "demo-threat-1",
    title: "🔴 Immediate: Possible Weapon on Campus",
    incidentType: "safety",
    narrative: "Staff member reported seeing what might be a weapon in a student's backpack during lunch. Happening right now.",
    severity: "high",
    studentName: "Student (Grade 9)",
    status: CaseStatus.ActionRequired,
    createdAt: new Date().toISOString(),
    guidance: [
      "🚨 CRITICAL SEVERITY: Weapon + Immediate Timing",
      "✓ This report auto-escalates to SRO and Law Enforcement per protocol",
      "✓ Do not confront student or ask direct questions",
      "✓ SRO takes all decision-making from this point",
      "✓ No AI detection — SRO judgment is final authority",
    ],
    suggestedActions: [
      "Immediately notify SRO via emergency button",
      "Provide exact location and description from witness",
      "Clear the immediate area of other students if directed by SRO",
      "Cooperate fully with SRO and law enforcement",
      "Document witness account and timeline",
    ],
  },
  {
    id: "demo-threat-2",
    title: "🟠 Credible: Threat Made Toward Others",
    incidentType: "safety",
    narrative: "Student said something concerning in a private conversation, but timing is unclear. Counselor unsure if threat is current or from the past.",
    severity: "medium",
    studentName: "Student (Grade 10)",
    status: CaseStatus.InReview,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    guidance: [
      "🟠 HIGH SEVERITY: Threat Made + Timing Unclear",
      "✓ Escalates to SRO for assessment",
      "✓ SRO determines if timing makes this immediate or manageable",
      "✓ System routes to SRO only (not automatically to law enforcement)",
      "✓ This gives trained responders room to assess intent and timeline",
    ],
    suggestedActions: [
      "Notify SRO with exact statement and context",
      "Ask student calmly about timing: 'When was this happening?'",
      "SRO conducts threat assessment interview",
      "Document student response about timing and intent",
      "Coordinate next steps with SRO (parent contact, monitoring, etc.)",
    ],
  },
  {
    id: "demo-threat-3",
    title: "🟡 Early Warning: Suspicious Behavior Pattern",
    incidentType: "safety",
    narrative: "Student has been withdrawn, making troubling comments about feeling hopeless, and researching concerning topics online. Not an immediate threat, but warrants monitoring.",
    severity: "medium",
    studentName: "Student (Grade 11)",
    status: CaseStatus.InReview,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    guidance: [
      "🟡 MODERATE SEVERITY: Concerning Behavior + Not Immediate",
      "✓ Routes to school counselor for relationship-based support",
      "✓ Still monitored in system, but not emergency escalation",
      "✓ Focus is early intervention and mental health support",
      "✓ Counselor can escalate at any time if behavior changes",
    ],
    suggestedActions: [
      "Schedule regular check-ins with student",
      "Provide mental health resources and referrals",
      "Contact parent/guardian to share concerns and coordinate support",
      "Monitor for changes in behavior or mood",
      "Document conversations and any escalation indicators",
      "Escalate to SRO immediately if student expresses intent to harm",
    ],
  },
];

const demoTasks: DemoTask[] = [
  {
    id: "demo-task-1",
    title: "Review Jordan's case",
    severity: "medium",
    description: "New bullying report — read narrative and decide next steps",
    studentName: "Jordan M.",
    studentGrade: 7,
  },
  {
    id: "demo-task-2",
    title: "Safety assessment for Alex",
    severity: "high",
    description: "Urgent: Safety concern flagged by teacher",
    studentName: "Alex R.",
    studentGrade: 6,
  },
  {
    id: "demo-task-3",
    title: "Wellness follow-up for Morgan",
    severity: "low",
    description: "Check-in on student stress and sleep concerns",
    studentName: "Morgan K.",
    studentGrade: 8,
  },
];

export const demoData = {
  cases: demoCases,
  tasks: demoTasks,
};

/**
 * Helper function to get a specific demo case by ID
 */
export function getDemoCaseById(caseId: string): DemoCase | undefined {
  return demoCases.find((c) => c.id === caseId);
}

/**
 * Helper function to get all demo cases
 */
export function getDemoCases(): DemoCase[] {
  return demoCases;
}

/**
 * Helper function to get all demo tasks
 */
export function getDemoTasks(): DemoTask[] {
  return demoTasks;
}
