import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, StyleSheet } from "react-native";
import { fakeApi } from "../data/fakeApi";
import { useAppContext } from "../store/AppContext";

export default function CaseMessages({ caseId }: { caseId: string }) {
  const { currentUser } = useAppContext();
  const [messages, setMessages] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"all" | "parents" | "teachers">("all");

  const viewerRole: "counselor" | "parent" | "teacher" | undefined = ((): any => {
    if (!currentUser) return undefined;
    if (currentUser.staffRole === "counselor") return "counselor";
    if (currentUser.role === "guardian") return "parent";
    if (currentUser.staffRole === "teacher") return "teacher";
    return undefined;
  })();

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await fakeApi.getCaseMessages(caseId, viewerRole as any);
      if (!mounted) return;
      setMessages(data || []);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [caseId, viewerRole]);

  const send = async (recipientRole: "parent" | "teacher" | "counselor") => {
    if (!currentUser) return;
    if (!body.trim()) return;
    setSending(true);
    const senderRole = currentUser.staffRole === "counselor" ? "counselor" : currentUser.role === "guardian" ? "parent" : (currentUser.staffRole as any) || "teacher";
    const msg = await fakeApi.sendMessage(caseId, currentUser.id, senderRole as any, body, recipientRole as any);
    setMessages((m) => [...m, msg]);
    setBody("");
    setSending(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.msgRow}>
      <Text style={styles.roleBadge}>{item.senderRole} → {item.recipientRole}</Text>
      <Text style={styles.msgBody}>{item.body}</Text>
      <Text style={styles.ts}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  // For counselors: allow toggle to target parents vs teachers
  const isCounselor = viewerRole === "counselor";
  const visibleMessages = messages.filter((m) => {
    if (!viewerRole || viewerRole === "counselor") {
      if (isCounselor && filter === "parents") return m.recipientRole === "parent" || m.senderRole === "parent" || m.recipientRole === "counselor";
      if (isCounselor && filter === "teachers") return m.recipientRole === "teacher" || m.senderRole === "teacher" || m.recipientRole === "counselor";
      return true;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {isCounselor ? (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          <Button title="All" onPress={() => setFilter("all")} />
          <Button title="Parents" onPress={() => setFilter("parents")} />
          <Button title="Teachers" onPress={() => setFilter("teachers")} />
        </View>
      ) : null}
      <FlatList data={visibleMessages} keyExtractor={(i) => i.id} renderItem={renderItem} />

      {viewerRole === "counselor" ? (
        <View style={styles.sendRow}>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Write a message..."
            style={styles.input}
          />
          <Button title="To Parents" onPress={() => send("parent")} disabled={sending} />
          <Button title="To Teachers" onPress={() => send("teacher")} disabled={sending} />
        </View>
      ) : viewerRole ? (
        // parents/teachers can message counselor
        <View style={styles.sendRow}>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Message counseling team"
            style={styles.input}
          />
          <Button title={sending ? "..." : "Send"} onPress={() => send("counselor")} disabled={sending} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  msgRow: { padding: 8, borderBottomWidth: 1, borderColor: "#eee" },
  roleBadge: { fontWeight: "700", marginBottom: 4 },
  msgBody: { marginBottom: 4 },
  ts: { color: "#666", fontSize: 12 },
  sendRow: { flexDirection: "row", padding: 8, alignItems: "center" },
  input: { flex: 1, marginRight: 8, borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 4 },
});
