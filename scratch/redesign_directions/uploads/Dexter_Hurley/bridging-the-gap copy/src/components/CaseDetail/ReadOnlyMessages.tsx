import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MessagesTimeline, { CaseMessage } from "./MessagesTimeline";
import { fakeApi } from "../../data/fakeApi";

type Role = "parent" | "teacher";

export default function ReadOnlyMessages({ caseId, role }: { caseId: string; role: Role }) {
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fakeApi.getCaseMessages(caseId).then((msgs: any[]) => {
      if (!mounted) return;
      // filter for parent/teacher visibility
      const filtered = (msgs || []).filter((m) => m.senderRole === role || m.recipientRole === role);
      setMessages(filtered as CaseMessage[]);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [caseId, role]);

  if (loading) return <Text style={styles.loading}>Loading messages…</Text>;

  return (
    <View style={styles.container}>
      <MessagesTimeline messages={messages} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { padding: 16 },
});
