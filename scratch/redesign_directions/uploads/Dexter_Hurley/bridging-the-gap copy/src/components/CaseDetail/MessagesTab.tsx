import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { fakeApi } from "../../data/fakeApi";
import MessagesTimeline, { MessageBubble, CaseMessage as TimelineMessage } from "./MessagesTimeline";

type Role = "counselor" | "parent" | "teacher";

interface CaseMessage extends TimelineMessage {}

interface Props {
  caseId: string;
}

export default function MessagesTab({ caseId }: Props) {
  const [targetRole, setTargetRole] = useState<"parent" | "teacher">("parent");
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

  const listRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    fakeApi.getCaseMessages(caseId).then((msgs: any) => {
      if (mounted) {
        setMessages(msgs as CaseMessage[]);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [caseId]);

  const visibleMessages = useMemo(() => {
    return messages.filter((m) =>
      m.senderRole === "counselor"
        ? m.recipientRole === targetRole
        : m.senderRole === targetRole
    );
  }, [messages, targetRole]);

  async function handleSend() {
    const body = draft.trim();
    if (!body) return;

    const msg = await fakeApi.sendCaseMessage(caseId, "counselor", targetRole, body);

    setMessages((prev) => [...prev, msg as CaseMessage]);
    setDraft("");

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }

  if (loading) {
    return <Text style={styles.loading}>Loading messages…</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <RoleToggle label="Parents" active={targetRole === "parent"} onPress={() => setTargetRole("parent")} />
        <RoleToggle label="Teachers" active={targetRole === "teacher"} onPress={() => setTargetRole("teacher")} />
      </View>

      <Text style={styles.notice}>Only you and the selected role can see these messages.</Text>

      <MessagesTimeline messages={visibleMessages} />

      <View style={styles.composer}>
        <TextInput value={draft} onChangeText={setDraft} placeholder={`Message ${targetRole}`} style={styles.input} />
        <TouchableOpacity onPress={handleSend} disabled={!draft.trim()} style={[styles.sendButton, !draft.trim() && styles.sendDisabled]}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RoleToggle({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.toggle, active && styles.toggleActive]}>
      <Text style={active ? styles.toggleTextActive : styles.toggleText}>{label}</Text>
    </TouchableOpacity>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { padding: 16 },
  toggleRow: { flexDirection: "row", padding: 8 },
  toggle: { flex: 1, padding: 10, borderWidth: 1, borderColor: "#ccc", alignItems: "center" },
  toggleActive: { backgroundColor: "#eef", borderColor: "#88f" },
  toggleText: { color: "#555" },
  toggleTextActive: { fontWeight: "600" },
  notice: { fontSize: 12, color: "#666", paddingHorizontal: 12, paddingBottom: 4 },
  list: { padding: 12 },
  empty: { color: "#777", textAlign: "center", marginTop: 20 },
  bubble: { maxWidth: "80%", padding: 10, borderRadius: 8, marginBottom: 8 },
  bubbleLeft: { backgroundColor: "#eee", alignSelf: "flex-start" },
  bubbleRight: { backgroundColor: "#dcf8c6", alignSelf: "flex-end" },
  roleBadge: { fontSize: 10, fontWeight: "600", marginBottom: 2, color: "#444" },
  composer: { flexDirection: "row", padding: 8, borderTopWidth: 1, borderColor: "#ddd" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, paddingHorizontal: 10, marginRight: 8 },
  sendButton: { backgroundColor: "#4a6cf7", paddingHorizontal: 14, justifyContent: "center", borderRadius: 6 },
  sendDisabled: { opacity: 0.4 },
  sendText: { color: "#fff", fontWeight: "600" },
});
