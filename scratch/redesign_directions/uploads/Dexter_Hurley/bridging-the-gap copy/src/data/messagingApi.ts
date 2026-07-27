import { supabase } from "../lib/supabase";
import { fakeApi } from "./fakeApi";

type SenderRole = "counselor" | "parent" | "teacher";
type RecipientRole = SenderRole;

type CaseMessageRow = {
  id: string;
  case_id: string;
  sender_id: string;
  sender_role: SenderRole;
  recipient_role: RecipientRole;
  body: string;
  created_at: string;
};

type CaseMessage = {
  id: string;
  caseId: string;
  senderId: string;
  senderRole: SenderRole;
  recipientRole: RecipientRole;
  body: string;
  createdAt: string;
};

const mapRow = (r: CaseMessageRow): CaseMessage => ({
  id: r.id,
  caseId: r.case_id,
  senderId: r.sender_id,
  senderRole: r.sender_role,
  recipientRole: r.recipient_role,
  body: r.body,
  createdAt: r.created_at,
});

const hasSupabase = !!process.env.EXPO_PUBLIC_SUPABASE_URL;

export async function getCaseMessages(
  caseId: string,
  viewerRole?: SenderRole
): Promise<CaseMessage[]> {
  if (!hasSupabase) {
    // fallback to in-memory demo implementation
    // fakeApi returns slightly different shape; adapt here
    const msgs = await fakeApi.getCaseMessages(caseId, viewerRole as any);
    return (msgs as any[]).map((m) => ({
      id: m.id,
      caseId: m.caseId || m.caseId,
      senderId: m.senderId,
      senderRole: m.senderRole,
      recipientRole: m.recipientRole,
      body: m.body,
      createdAt: m.createdAt,
    }));
  }

  const { data, error } = await supabase
    .from("case_messages")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row: any) => mapRow(row as CaseMessageRow));
}

export async function sendMessage(
  caseId: string,
  senderId: string,
  senderRole: SenderRole,
  body: string,
  recipientRole: RecipientRole
): Promise<CaseMessage> {
  if (!hasSupabase) {
    const msg = await fakeApi.sendMessage(caseId, senderId, senderRole as any, body, recipientRole as any);
    return {
      id: msg.id,
      caseId: msg.caseId || msg.caseId,
      senderId: msg.senderId,
      senderRole: msg.senderRole,
      recipientRole: msg.recipientRole,
      body: msg.body,
      createdAt: msg.createdAt,
    } as CaseMessage;
  }

  const { data, error } = await supabase
    .from("case_messages")
    .insert([
      {
        case_id: caseId,
        sender_id: senderId,
        sender_role: senderRole,
        recipient_role: recipientRole,
        body,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return mapRow(data as CaseMessageRow);
}

// Backwards-compatible helper matching fakeApi.sendCaseMessage signature
export async function sendCaseMessage(
  caseId: string,
  senderRole: SenderRole,
  recipientRole: RecipientRole,
  body: string
): Promise<CaseMessage> {
  // caller may not have a senderId; try to use supabase auth, otherwise synthetic
  const senderId = (supabase?.auth?.user && supabase.auth.user()?.id) || `DEMO-${senderRole.toUpperCase()}`;
  return sendMessage(caseId, senderId, senderRole, body, recipientRole);
}

export default { getCaseMessages, sendMessage, sendCaseMessage };
