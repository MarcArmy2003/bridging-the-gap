import { supabase } from "../lib/supabase";
import {
  Case,
  CaseEvent,
  CaseNote,
  CaseStatus,
  SupportPlanType,
} from "../models/types";

type CaseRow = {
  id: string;
  public_id?: string | null;
  title: string | null;
  status: CaseStatus;
  created_at: string;
  updated_at: string | null;
  support_plan_type?: string | null;
  support_plan_updated_at?: string | null;
  support_plan_owner_name?: string | null;
};

type CaseNoteRow = {
  id: string;
  case_id: string;
  author_id: string;
  content: string;
  created_at: string;
};

type CaseEventRow = {
  id: string;
  case_id: string;
  type: "status_change" | "note_added";
  actor_name: string;
  from_status: CaseStatus | null;
  to_status: CaseStatus | null;
  note_preview: string | null;
  created_at: string;
};

const mapCaseRow = (row: CaseRow): Case => ({
  id: row.public_id ?? row.id,
  title: row.title ?? undefined,
  status: row.status,
  incidentType: "bullying",
  narrative: "",
  severity: "low",
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? undefined,
  supportPlanType: (row.support_plan_type as Case["supportPlanType"]) ?? undefined,
  supportPlanUpdatedAt: row.support_plan_updated_at ?? undefined,
  supportPlanOwnerName: row.support_plan_owner_name ?? undefined,
});

const mapNoteRow = (row: CaseNoteRow): CaseNote => ({
  id: row.id,
  authorId: row.author_id,
  authorName: "Staff",
  role: "counselor",
  content: row.content,
  createdAt: row.created_at,
});

const mapEventRow = (row: CaseEventRow): CaseEvent => ({
  id: row.id,
  type: row.type,
  actorName: row.actor_name,
  fromStatus: row.from_status ?? undefined,
  toStatus: row.to_status ?? undefined,
  notePreview: row.note_preview ?? undefined,
  createdAt: row.created_at,
});

const resolveCase = async (id: string): Promise<CaseRow | null> => {
  const { data: byPublic, error: publicError } = await supabase
    .from("cases")
    .select("*")
    .eq("public_id", id)
    .single();

  if (byPublic) {
    return byPublic as CaseRow;
  }
  if (publicError && publicError.code !== "PGRST116") {
    throw publicError;
  }

  const { data: byId, error: idError } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .single();

  if (idError && idError.code !== "PGRST116") {
    throw idError;
  }
  return (byId ?? null) as CaseRow | null;
};

export async function getCaseById(id: string): Promise<Case | null> {
  const row = await resolveCase(id);

  if (!row) {
    return null;
  }
  return mapCaseRow(row);
}

export async function updateCaseStatus(
  id: string,
  nextStatus: CaseStatus,
  actorName: string,
  previousStatus: CaseStatus
): Promise<void> {
  const row = await resolveCase(id);
  if (!row) {
    throw new Error("Case not found");
  }
  const { error } = await supabase
    .from("cases")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", row.id);

  if (error) {
    throw error;
  }

  const { error: eventError } = await supabase.from("case_events").insert({
    case_id: row.id,
    type: "status_change",
    actor_name: actorName,
    from_status: previousStatus,
    to_status: nextStatus,
  });

  if (eventError) {
    throw eventError;
  }
}

export async function updateSupportPlan(
  id: string,
  supportPlanType: SupportPlanType,
  ownerName: string
): Promise<void> {
  const row = await resolveCase(id);
  if (!row) {
    throw new Error("Case not found");
  }
  const { error } = await supabase
    .from("cases")
    .update({
      support_plan_type: supportPlanType,
      support_plan_updated_at: new Date().toISOString(),
      support_plan_owner_name: ownerName,
    })
    .eq("id", row.id);

  if (error) {
    throw error;
  }
}

export async function addCaseNote(
  caseId: string,
  content: string,
  actorName: string,
  authorId: string
): Promise<CaseNote> {
  const row = await resolveCase(caseId);
  if (!row) {
    throw new Error("Case not found");
  }
  const { data, error } = await supabase
    .from("case_notes")
    .insert({
      case_id: row.id,
      author_id: authorId,
      content,
    })
    .select()
    .single();

  if (error || !data) {
    throw error ?? new Error("Unable to add note");
  }

  const { error: eventError } = await supabase.from("case_events").insert({
    case_id: row.id,
    type: "note_added",
    actor_name: actorName,
    note_preview: content.slice(0, 80),
  });

  if (eventError) {
    throw eventError;
  }

  return mapNoteRow(data as CaseNoteRow);
}

export async function getCaseActivity(
  caseId: string
): Promise<{ notes: CaseNote[]; events: CaseEvent[] }> {
  const row = await resolveCase(caseId);
  if (!row) {
    return { notes: [], events: [] };
  }
  const [notesResponse, eventsResponse] = await Promise.all([
    supabase
      .from("case_notes")
      .select("*")
      .eq("case_id", row.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("case_events")
      .select("*")
      .eq("case_id", row.id)
      .order("created_at", { ascending: false }),
  ]);

  if (notesResponse.error) {
    throw notesResponse.error;
  }
  if (eventsResponse.error) {
    throw eventsResponse.error;
  }

  return {
    notes: (notesResponse.data ?? []).map((row: unknown) =>
      mapNoteRow(row as CaseNoteRow)
    ),
    events: (eventsResponse.data ?? []).map((row: unknown) =>
      mapEventRow(row as CaseEventRow)
    ),
  };
}
