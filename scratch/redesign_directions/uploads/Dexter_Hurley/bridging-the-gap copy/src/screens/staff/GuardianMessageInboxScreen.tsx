import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { guardianMessagingApi } from "../../data/guardianMessagingApi";
import { GuardianMessage, GuardianMessageStatus } from "../../models/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";

const statusLabels: Record<GuardianMessageStatus, string> = {
  [GuardianMessageStatus.Sent]: "Sent",
  [GuardianMessageStatus.Seen]: "Seen",
  [GuardianMessageStatus.Responded]: "Responded",
};

export const GuardianMessageInboxScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [messages, setMessages] = useState<GuardianMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  const loadMessages = useCallback(async () => {
    setLoading(true);
    await guardianMessagingApi.markAllSeen();
    const data = await guardianMessagingApi.getAllMessages();
    setMessages(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  if (!requireRole(["educator", "admin"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const replyTemplates = [
    {
      title: "Acknowledgment & reassurance",
      body:
        "Hello,\nThank you for reaching out and sharing your concerns. I appreciate you taking the time to communicate with us. I will review this information and follow up shortly.\nPlease know we are here to support your child.",
    },
    {
      title: "Request for more information",
      body:
        "Hello,\nThank you for your message. To better understand how we can support your child, I may reach out with a few follow-up questions.\nI appreciate your partnership.",
    },
    {
      title: "Scheduling a conversation",
      body:
        "Hello,\nI would be happy to connect further. Please let me know a time that works for you, or I can suggest available options.\nThank you for working with us.",
    },
    {
      title: "Next steps identified",
      body:
        "Hello,\nThank you for connecting with us. We have identified next steps and will continue to monitor and support your child. I will keep you informed as appropriate.\nPlease feel free to reach out with additional questions.",
    },
  ];

  const handleReply = async (messageId: string) => {
    if (!replyDraft.trim()) {
      return;
    }
    await guardianMessagingApi.respondToMessage(messageId, replyDraft);
    setActiveReplyId(null);
    setReplyDraft("");
    await loadMessages();
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={messages}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadMessages} />
      }
      ListHeaderComponent={
        <SectionCard>
          <Text style={styles.title}>Parent / Guardian messages</Text>
          <Text style={styles.subtitle}>
            Messages are shared with authorized support staff only.
          </Text>
        </SectionCard>
      }
      renderItem={({ item }) => (
        <SectionCard>
          <View style={styles.cardHeader}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.status}>{statusLabels[item.status]}</Text>
          </View>
          <Text style={styles.meta}>
            From: {item.guardianName} ·{" "}
            {new Date(item.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.body}>{item.body}</Text>
          {item.wantsCallback ? (
            <Text style={styles.callback}>
              Parent / Guardian requested a teacher or counselor follow-up.
            </Text>
          ) : null}
          {item.replyBody ? (
            <View style={styles.replyBlock}>
              <Text style={styles.replyLabel}>Teacher / Counselor reply</Text>
              <Text style={styles.replyBody}>{item.replyBody}</Text>
            </View>
          ) : (
            <View style={styles.replyBlock}>
              <Text style={styles.replyLabel}>Send a reply</Text>
              <View style={styles.templateGroup}>
                {replyTemplates.map((template) => (
                  <PrimaryButton
                    key={template.title}
                    label={template.title}
                    onPress={() => {
                      setActiveReplyId(item.id);
                      setReplyDraft(template.body);
                    }}
                    variant="ghost"
                    style={styles.templateButton}
                  />
                ))}
              </View>
              {activeReplyId === item.id ? (
                <>
                  <TextInput
                    style={styles.textArea}
                    value={replyDraft}
                    onChangeText={setReplyDraft}
                    multiline
                  />
                  <PrimaryButton
                    label="Send reply"
                    onPress={() => handleReply(item.id)}
                    variant="secondary"
                  />
                </>
              ) : (
                <PrimaryButton
                  label="Write a custom reply"
                  onPress={() => {
                    setActiveReplyId(item.id);
                    setReplyDraft("");
                  }}
                  variant="ghost"
                  style={styles.templateButton}
                />
              )}
            </View>
          )}
        </SectionCard>
      )}
      ListEmptyComponent={
        <SectionCard>
          <Text style={styles.emptyText}>
            No Parent / Guardian messages have been sent yet.
          </Text>
        </SectionCard>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  subject: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  status: {
    fontSize: 12,
    color: theme.colors.mutedText,
  },
  meta: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  callback: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginTop: 8,
  },
  replyBlock: {
    marginTop: 12,
  },
  replyLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6,
  },
  replyBody: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  templateGroup: {
    gap: 8,
    marginBottom: 10,
  },
  templateButton: {
    alignSelf: "flex-start",
  },
  textArea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
});
