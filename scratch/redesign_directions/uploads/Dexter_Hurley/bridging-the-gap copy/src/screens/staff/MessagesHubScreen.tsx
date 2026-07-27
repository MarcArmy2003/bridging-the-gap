import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SectionCard } from "../../components/SectionCard";
import { fakeApi } from "../../data/fakeApi";
import { useNavigation } from "../../navigation/compatTypes";

type Nav = any;

export default function MessagesHubScreen() {
  const [summary, setSummary] = useState({ parent: 0, teacher: 0, system: 0 });
  const [firstCase, setFirstCase] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const cases = await fakeApi.getCases();
      let parent = 0;
      let teacher = 0;
      let system = 0;
      let firstCaseId: string | null = null;
      for (const c of cases) {
        if (!firstCaseId) firstCaseId = c.id;
        const msgs = await fakeApi.getCaseMessages(c.id);
        for (const m of msgs) {
          if (m.senderRole === "counselor" && m.recipientRole === "parent") parent++;
          if (m.senderRole === "counselor" && m.recipientRole === "teacher") teacher++;
        }
        const events = await fakeApi.getCaseEvents(c.id);
        system += (events || []).filter((e: any) => e.type === "status_change").length;
      }
      if (!mounted) return;
      setSummary({ parent, teacher, system });
      setFirstCase(firstCaseId);
    })();
    return () => { mounted = false; };
  }, []);

  const navigation = useNavigation<Nav>();

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.header}>Messages & Updates</Text>
        <Text style={styles.sub}>A curated communication hub controlled by counselors.</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Counselor → Parents</Text>
        <Text style={styles.sectionText}>{summary.parent} messages sent</Text>
        <TouchableOpacity
          style={styles.action}
          onPress={() => {
            if (!firstCase) return;
            (navigation as any).navigate("ReadOnlyMessages", { caseId: firstCase, recipientRole: "guardian" });
          }}
        >
          <Text style={styles.actionText}>View parent communications</Text>
        </TouchableOpacity>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Counselor → Teachers</Text>
        <Text style={styles.sectionText}>{summary.teacher} messages sent</Text>
        <TouchableOpacity
          style={styles.action}
          onPress={() => {
            if (!firstCase) return;
            (navigation as any).navigate("ReadOnlyMessages", { caseId: firstCase, recipientRole: "teacher" });
          }}
        >
          <Text style={styles.actionText}>View teacher communications</Text>
        </TouchableOpacity>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>System updates</Text>
        <Text style={styles.sectionText}>{summary.system} recent updates</Text>
        <TouchableOpacity style={styles.action}>
          <Text style={styles.actionText}>View system updates</Text>
        </TouchableOpacity>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 18, gap: 12 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  sub: { fontSize: 13, color: "#666" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  sectionText: { color: "#666", marginBottom: 8 },
  action: { padding: 10, borderRadius: 8, backgroundColor: "#eef2ff", alignItems: "center" },
  actionText: { color: "#3b5fd3", fontWeight: "700" },
});
