import { Case, CaseStatus, TrainingScenario } from "../models/types";

const scenarios: TrainingScenario[] = [
  {
    id: "training-1",
    title: "Bullying escalation tabletop",
    description:
      "Practice triage decisions, parent outreach, and student follow-up after a bullying report.",
    focusAreas: ["triage", "parent outreach", "follow-up"],
  },
  {
    id: "training-2",
    title: "Immediate safety response drill",
    description:
      "Simulate an urgent safety report, escalation, and audit documentation.",
    focusAreas: ["emergency response", "escalation", "audit notes"],
  },
  {
    id: "training-3",
    title: "Well-being support workflow",
    description:
      "Practice staff coordination for non-emergency student support and recovery.",
    focusAreas: ["support", "handoff", "post-incident"],
  },
];

let activeScenarioId: string | null = null;

const delay = async <T>(value: T, ms = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const trainingCases: Record<string, Case[]> = {
  "training-1": [
    {
      id: "TRAIN-101",
      incidentType: "bullying",
      narrative:
        "Student reports ongoing verbal bullying near the cafeteria during lunch.",
      severity: "medium",
      status: CaseStatus.InReview,
      ownerType: "teacher",
      createdAt: new Date().toISOString(),
      lastTouchedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    },
  ],
  "training-2": [
    {
      id: "TRAIN-201",
      incidentType: "safety",
      narrative: "Anonymous tip about a possible weapon on campus.",
      severity: "high",
      status: CaseStatus.ActionRequired,
      ownerType: "teacher",
      createdAt: new Date().toISOString(),
      lastTouchedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    },
  ],
  "training-3": [
    {
      id: "TRAIN-301",
      incidentType: "bullying",
      narrative:
        "Student requests counseling support after a conflict with peers.",
      severity: "low",
      status: CaseStatus.InReview,
      ownerType: "counselor",
      createdAt: new Date().toISOString(),
      lastTouchedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    },
  ],
};

export const trainingApi = {
  async getScenarios(): Promise<TrainingScenario[]> {
    return delay([...scenarios]);
  },

  async setActiveScenario(scenarioId: string | null) {
    activeScenarioId = scenarioId;
    return delay(activeScenarioId);
  },

  async getActiveScenario(): Promise<TrainingScenario | null> {
    const scenario = scenarios.find((item) => item.id === activeScenarioId);
    return delay(scenario ?? null);
  },

  async getScenarioCases(): Promise<Case[]> {
    if (!activeScenarioId) {
      return delay([]);
    }
    return delay(trainingCases[activeScenarioId] ?? []);
  },
};
