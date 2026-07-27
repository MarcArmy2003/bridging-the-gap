import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { teacherMessagingApi } from "../../data/teacherMessagingApi";
import { TeacherMessage, TeacherMessageStatus } from "../../models/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";

export const TeacherMessagesScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [loading, setLoading] = useState(false);

  if (!currentUser || currentUser.staffRole !== "teacher") {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const loadMessages = useCallback(async () => {
    setLoading(true);
    const data = await teacherMessagingApi.getMessagesForTeacher(currentUser.id);
    setMessages(data);
    setLoading(false);
  }, [currentUser.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleMarkRead = async (messageId: string) => {
    await teacherMessagingApi.markRead(messageId);
    await loadMessages();
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Messages from Counseling Team</Text>
        <Text style={styles.subtitle}>
          Guidance shared by counselors to keep you aligned and supported.
        </Text>
      </SectionCard>

      {messages.length === 0 ? (
        <SectionCard>
          <Text style={styles.emptyText}>
            No messages yet. When a counselor follows up, you’ll see it here.
          </Text>
        </SectionCard>
      ) : (
        messages.map((message) => (
          <SectionCard key={message.id} style={styles.messageCard}>
            <Text style={styles.messageTitle}>
              {message.counselorName} · {message.contextLabel}
            </Text>
            <Text style={styles.messageMeta}>
              {new Date(message.createdAt).toLocaleString()}
            </Text>
            <Text style={styles.messageBody}>{message.body}</Text>
            <View style={styles.messageActions}>
              <PrimaryButton
                label="Open message"
                onPress={() => undefined}
                style={styles.actionButton}
              />
              {message.status === TeacherMessageStatus.Sent ? (
                <PrimaryButton
                  label="Mark as read"
                  onPress={() => handleMarkRead(message.id)}
                  variant="secondary"
                  style={styles.actionButton}
                />
              ) : (
                <Text style={styles.readBadge}>Read</Text>
              )}
            </View>
          </SectionCard>
        ))
      )}

      {loading ? (
        <Text style={styles.loadingText}>Refreshing messages…</Text>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
  messageCard: {
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  messageMeta: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginBottom: 10,
  },
  messageBody: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  messageActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    alignSelf: "flex-start",
  },
  readBadge: {
    fontSize: 12,
    color: theme.colors.mutedText,
    alignSelf: "center",
  },
  loadingText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginTop: 8,
    textAlign: "center",
  },
});
