import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SectionCard } from "../../components/SectionCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { theme } from "../../components/theme";
import { useCases } from "../../hooks/useCases"; // existing or thin wrapper

export const StudentSupportWorkspace = () => {
  const navigation = useNavigation();
  const { cases } = useCases();

  const counts = {
    review: (cases || []).filter((c: any) => String(c.status).toLowerCase() === "new").length,
    progress: (cases || []).filter((c: any) => String(c.status).toLowerCase() === "in_review" || String(c.status).toLowerCase() === "action_required").length,
    monitoring: (cases || []).filter((c: any) => String(c.supportPlanType).toLowerCase() === "monitor").length,
    urgent: (cases || []).filter((c: any) => String(c.severity).toLowerCase() === "high").length,
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Student Support Workspace</Text>

      <View style={styles.grid}>
        <FocusCard title="Needs Review" count={counts.review} onPress={() => (navigation as any).navigate("CaseInbox", { filter: "new" })} />
        <FocusCard title="In Progress" count={counts.progress} onPress={() => (navigation as any).navigate("CaseInbox", { filter: "in_progress" })} />
        <FocusCard title="Monitoring" count={counts.monitoring} onPress={() => (navigation as any).navigate("CaseInbox", { filter: "monitoring" })} />
        <FocusCard title="Urgent" count={counts.urgent} onPress={() => (navigation as any).navigate("CaseInbox", { filter: "urgent" })} />
      </View>

      <SectionCard>
        <Text style={styles.sectionTitle}>Messages & Updates</Text>
        <PrimaryButton label="Open Messages Hub" onPress={() => (navigation as any).navigate("MessagesHub")} />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>All Cases</Text>
        <PrimaryButton label="View Case List" onPress={() => (navigation as any).navigate("CaseInbox")} />
      </SectionCard>
    </ScrollView>
  );
};

const FocusCard = ({ title, count, onPress }: any) => (
  <SectionCard style={{ flex: 1 }}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.count}>{count}</Text>
    <PrimaryButton label="View" onPress={onPress} />
  </SectionCard>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  cardTitle: { fontSize: 14, color: theme.colors.mutedText },
  count: { fontSize: 28, fontWeight: "700", marginVertical: 6 },
});

export default StudentSupportWorkspace;
