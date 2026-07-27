import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

type Role = "counselor" | "parent" | "teacher";

export interface CaseMessage {
  id: string;
  caseId: string;
  senderRole: Role;
  recipientRole: Role;
  body: string;
  createdAt: string;
}

export function MessageBubble({ message }: { message: CaseMessage }) {
  const isCounselor = message.senderRole === "counselor";
  return (
    <View style={[styles.bubble, isCounselor ? styles.bubbleRight : styles.bubbleLeft]}>
      {!isCounselor && <Text style={styles.roleBadge}>{message.senderRole === "parent" ? "Parent" : "Teacher"}</Text>}
      <Text>{message.body}</Text>
    </View>
  );
}

export default function MessagesTimeline({ messages }: { messages: CaseMessage[] }) {
  return (
    <FlatList
      data={messages}
      keyExtractor={(m) => m.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No messages yet.</Text>}
      renderItem={({ item }) => <MessageBubble message={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12 },
  empty: { color: "#777", textAlign: "center", marginTop: 20 },
  bubble: { maxWidth: "80%", padding: 10, borderRadius: 8, marginBottom: 8 },
  bubbleLeft: { backgroundColor: "#eee", alignSelf: "flex-start" },
  bubbleRight: { backgroundColor: "#dcf8c6", alignSelf: "flex-end" },
  roleBadge: { fontSize: 10, fontWeight: "600", marginBottom: 2, color: "#444" },
});
