import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RouteProp, useRoute } from "../../navigation/compatTypes";
import ReadOnlyMessages from "../../components/CaseDetail/ReadOnlyMessages";
import { StaffStackParamList } from "../../navigation/types";

type ReadOnlyRoute = RouteProp<StaffStackParamList, "ReadOnlyMessages">;

export default function ReadOnlyMessagesScreen() {
  const route = useRoute<ReadOnlyRoute>();
  const { caseId, recipientRole } = route.params;
  const role = recipientRole === "guardian" ? "parent" : "teacher";

  return (
    <View style={styles.page}>
      <Text style={styles.banner}>Messages from the school support team</Text>
      <ReadOnlyMessages caseId={caseId} role={role as any} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  banner: { padding: 12, backgroundColor: "#f7f9fc", color: "#333", fontWeight: "700" },
});
