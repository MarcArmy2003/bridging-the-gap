import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { fakeApi } from "../data/fakeApi";

export type MessageRole = "counselor" | "parent" | "teacher";
export interface CaseMessage {
  id: string;
  caseId: string;
  senderRole: MessageRole;
  recipientRole: MessageRole;
  body: string;
  createdAt: number;
}

export default function MessagesTab({ caseId }: { caseId: string }) {
  const [targetRole, setTargetRole] = useState<"parent" | "teacher">("parent");
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList<CaseMessage>>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fakeApi.getCaseMessages(caseId).then((msgs: any) => {
      if (!mounted) return;
      // normalize createdAt to number if stored as string
      const normalized = (msgs || []).map((m: any) => ({ ...m, createdAt: typeof m.createdAt === "number" ? m.createdAt : Date.parse(m.createdAt) }));
      setMessages(normalized);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [caseId]);

  const visibleMessages = messages.filter((m) =>
    m.senderRole === targetRole || m.recipientRole === targetRole || m.senderRole === "counselor"
  );

  const handleSend = async () => {
    if (!draft.trim()) return;
    const msg = await fakeApi.sendCaseMessage(caseId, "counselor", targetRole, draft.trim());
    // normalize
    const normalized = { ...msg, createdAt: typeof msg.createdAt === "number" ? msg.createdAt : Date.parse(msg.createdAt) } as CaseMessage;
    setMessages((prev) => [...prev, normalized]);
    setDraft("");
    // scroll to bottom
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const renderItem = ({ item }: { item: CaseMessage }) => (
    <View style={styles.msgRow}>
      <View style={styles.rowTop}>
        <Text style={styles.roleBadge}>{item.senderRole === "counselor" ? "Counselor" : item.senderRole === "parent" ? "Parent" : "Teacher"}</Text>
        <Text style={styles.ts}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      <Text style={styles.msgBody}>{item.body}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.toggleRow}>
          <Button title="Parents" onPress={() => setTargetRole("parent")} color={targetRole === "parent" ? "#0a84ff" : undefined} />
          <Button title="Teachers" onPress={() => setTargetRole("teacher")} color={targetRole === "teacher" ? "#0a84ff" : undefined} />
        </View>

        {loading ? (
          <Text style={styles.helper}>Loading messages…</Text>
        ) : visibleMessages.length === 0 ? (
          <Text style={styles.helper}>No messages yet for this view.</Text>
        ) : (
          <FlatList
            ref={listRef}
            data={visibleMessages}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 12 }}
          />
        )}

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={`Message ${targetRole}`}
            style={styles.input}
            multiline
          />
          <Button title="Send" onPress={handleSend} disabled={!draft.trim()} />
        </View>

        <Text style={styles.note}>Only you and the selected role can see these messages</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toggleRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 8 },
  msgRow: { padding: 10, borderBottomWidth: 1, borderColor: "#eee" },
  rowTop: { flexDirection: "row", justifyContent: "space-between" },
  roleBadge: { fontWeight: "700" },
  ts: { color: "#666", fontSize: 12 },
  msgBody: { marginTop: 6, fontSize: 14 },
  composer: { flexDirection: "row", gap: 8, padding: 8, alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8, minHeight: 44 },
  helper: { padding: 12, color: "#666" },
  note: { fontSize: 12, color: "#666", textAlign: "center", marginTop: 8 },
});
