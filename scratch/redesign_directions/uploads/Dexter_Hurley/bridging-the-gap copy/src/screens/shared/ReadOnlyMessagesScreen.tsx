import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useMessagesByCase } from "../../hooks/useMessages";

export const ReadOnlyMessagesScreen = () => {
  const route: any = useRoute();
  const { caseId, recipientRole } = route.params || {};
  const { messages } = useMessagesByCase(caseId, recipientRole);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages from the School Support Team</Text>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.content || item.body}</Text>}
      />
    </View>
  );
};

export default ReadOnlyMessagesScreen;

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  header: { fontWeight: "600", marginBottom: 8 },
  item: { marginVertical: 6 },
});
