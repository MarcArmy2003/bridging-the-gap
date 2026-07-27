import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { feedbackApi } from "../../data/feedbackApi";
import { guardianMessagingApi } from "../../data/guardianMessagingApi";
import {
  FeedbackRating,
  GuardianMessage,
  GuardianMessageStatus,
} from "../../models/types";
import { GuardianStackParamList } from "../../navigation/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useFocusEffect, useNavigation } from "../../navigation/compatTypes";

const templates = [
  {
    title: "General Concern About My Child",
    body:
      "Hello,\nI wanted to reach out because I've noticed some changes in my child's mood and stress levels related to school. I'm not certain what's causing it, but I wanted to check in and see if you've observed anything at school or have suggestions on how we can best support them together.\nThank you for your time and support.",
  },
  {
    title: "Concern About Peer Interactions",
    body:
      "Hello,\nMy child has shared some concerns about interactions with peers at school, and I wanted to reach out for guidance. I'm hoping to better understand what support options are available and how we can work together to ensure my child feels safe and supported.\nI appreciate your help.",
  },
  {
    title: "Request for Guidance",
    body:
      "Hello,\nI'm looking for guidance on how to best support my child during a challenging time. I don't feel an urgent response is needed, but I would appreciate any insight or resources you recommend.\nThank you for your support.",
  },
  {
    title: "Emotional Well-Being Check-In",
    body:
      "Hello,\nI wanted to share that my child has been feeling overwhelmed and anxious about school recently. I'm reaching out to see if we can connect or discuss ways to support their emotional well-being in a school setting.\nThank you for your time.",
  },
  {
    title: "Next Steps and Support",
    body:
      "Hello,\nThank you for your time and attention. I'd appreciate the opportunity to discuss next steps or supports that may be helpful for my child. Please let me know a good time or format to connect.\nI value your partnership.",
  },
];

const gradeBandOptions = [
  { label: "K-5", value: "k5" },
  { label: "6-8", value: "6_8" },
  { label: "9-12", value: "9_12" },
];

const gradeBandNotes: Record<string, string> = {
  k5: "Children at this age may have trouble explaining what they feel. Small changes can be important signals.",
  "6_8":
    "Middle school students may minimize concerns or avoid talking about peer issues.",
  "9_12":
    "High school students may worry about social consequences or retaliation.",
};

const statusLabels: Record<GuardianMessageStatus, string> = {
  [GuardianMessageStatus.Sent]: "Sent",
  [GuardianMessageStatus.Seen]: "Seen",
  [GuardianMessageStatus.Responded]: "Responded",
};

export const GuardianMessageTemplatesScreen = () => {
  const { currentUser, setCurrentUser, isDemoMode } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<GuardianStackParamList>>();
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [messageBody, setMessageBody] = useState(templates[0].body);
  const [gradeBand, setGradeBand] = useState("6_8");
  const [wantsCallback, setWantsCallback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messages, setMessages] = useState<GuardianMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackRatings, setFeedbackRatings] = useState<
    Record<string, FeedbackRating>
  >({});
  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>(
    {}
  );

  if (!requireRole(["guardian"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const loadMessages = useCallback(async () => {
    if (!currentUser) {
      return;
    }
    if (isDemoMode) {
      setLoading(false);
      setMessages([
        {
          id: "DEMO-MSG-1",
          guardianId: currentUser.id,
          guardianName: currentUser.name,
          subject: "General Concern About My Child",
          body: "Demo message content.",
          wantsCallback: true,
          status: GuardianMessageStatus.Seen,
          createdAt: new Date().toISOString(),
        },
        {
          id: "DEMO-MSG-2",
          guardianId: currentUser.id,
          guardianName: currentUser.name,
          subject: "Request for Guidance",
          body: "Demo message content.",
          wantsCallback: false,
          status: GuardianMessageStatus.Responded,
          replyBody:
            "Thanks for reaching out. We'll review and follow up with next steps.",
          repliedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }
    setLoading(true);
    const data = await guardianMessagingApi.getMessagesForGuardian(
      currentUser.id
    );
    setMessages(data);
    setLoading(false);
  }, [currentUser, isDemoMode]);

  const loadFeedback = useCallback(async () => {
    if (!currentUser) {
      return;
    }
    if (isDemoMode) {
      setFeedbackRatings({});
      setFeedbackNotes({});
      return;
    }
    const data = await feedbackApi.getFeedbackForGuardian(currentUser.id);
    const ratings: Record<string, FeedbackRating> = {};
    const notes: Record<string, string> = {};
    data.forEach((entry) => {
      if (entry.context === "guardian_message") {
        ratings[entry.referenceId] = entry.rating;
        if (entry.comment) {
          notes[entry.referenceId] = entry.comment;
        }
      }
    });
    setFeedbackRatings(ratings);
    setFeedbackNotes(notes);
  }, [currentUser, isDemoMode]);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
      loadFeedback();
    }, [loadMessages, loadFeedback])
  );

  const buildMessageBody = (
    templateBody: string,
    selectedBand: string
  ) => {
    const note = gradeBandNotes[selectedBand];
    if (!note) {
      return templateBody;
    }
    return `${templateBody}\n\n${note}`;
  };

  const handleTemplateSelect = (template: (typeof templates)[number]) => {
    setSelectedTemplate(template);
    setMessageBody(buildMessageBody(template.body, gradeBand));
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      return;
    }
    if (isDemoMode) {
      Alert.alert(
        "Demo mode active",
        "Demo mode is on, so messages are not sent."
      );
      return;
    }
    if (!messageBody.trim()) {
      Alert.alert("Message needed", "Please add a short message before sending.");
      return;
    }
    setSubmitting(true);
    await guardianMessagingApi.createMessage({
      guardianId: currentUser.id,
      guardianName: currentUser.name,
      subject: selectedTemplate.title,
      body: messageBody,
      wantsCallback,
    });
    setSubmitting(false);
    setWantsCallback(false);
    navigation.navigate("GuardianMessageConfirmation");
  };

  const handleFeedbackSubmit = async (messageId: string) => {
    if (!currentUser) {
      return;
    }
    if (isDemoMode) {
      Alert.alert(
        "Demo mode active",
        "Demo mode is on, so feedback is not collected."
      );
      return;
    }
    const rating = feedbackRatings[messageId];
    if (!rating) {
      return;
    }
    await feedbackApi.createFeedback({
      guardianId: currentUser.id,
      context: "guardian_message",
      referenceId: messageId,
      rating,
      comment: feedbackNotes[messageId],
    });
    await loadFeedback();
  };

  const feedbackOptions: { label: string; value: FeedbackRating }[] = [
    { label: "Very helpful", value: "very_helpful" },
    { label: "Somewhat helpful", value: "somewhat_helpful" },
    { label: "Not helpful", value: "not_helpful" },
    { label: "Prefer not to answer", value: "prefer_not_to_answer" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        {isDemoMode ? (
          <Text style={styles.demoBadge}>Demo Mode Active</Text>
        ) : null}
        <Text style={styles.title}>Start a conversation with the school</Text>
        <Text style={styles.subtitle}>
          Choose a template and edit it as needed before sending.
        </Text>
        <Text style={styles.helperText}>
          Messages are shared with authorized school staff only. Response times
          may vary.
        </Text>
        {isDemoMode ? (
          <Text style={styles.demoNote}>
            Demo mode is on, so messages are not sent.
          </Text>
        ) : null}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Student grade band</Text>
        <Text style={styles.helperText}>
          Templates adapt based on grade band to keep language age-appropriate.
        </Text>
        <View style={styles.optionGroup}>
          {gradeBandOptions.map((option) => (
            <PrimaryButton
              key={option.value}
              label={option.label}
              onPress={() => {
                setGradeBand(option.value);
                setMessageBody(
                  buildMessageBody(selectedTemplate.body, option.value)
                );
              }}
              variant={gradeBand === option.value ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
        <Text style={styles.helperText}>{gradeBandNotes[gradeBand]}</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Choose a template</Text>
        <View style={styles.optionGroup}>
          {templates.map((template) => (
            <PrimaryButton
              key={template.title}
              label={template.title}
              onPress={() => handleTemplateSelect(template)}
              variant={
                selectedTemplate.title === template.title
                  ? "secondary"
                  : "ghost"
              }
              style={styles.optionButton}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Edit your message</Text>
        <TextInput
          style={styles.textArea}
          value={messageBody}
          onChangeText={setMessageBody}
          multiline
        />
        <PrimaryButton
          label={
            wantsCallback
              ? "Teacher / counselor follow-up requested"
              : "I would like a teacher or counselor to reach out"
          }
          onPress={() => setWantsCallback((prev) => !prev)}
          variant={wantsCallback ? "secondary" : "ghost"}
          style={styles.optionButton}
        />
        <PrimaryButton
          label={submitting ? "Sending..." : "Send message"}
          onPress={handleSubmit}
          disabled={submitting || isDemoMode}
          style={styles.submitButton}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Your recent messages</Text>
        {loading ? (
          <Text style={styles.mutedText}>Loading your messages...</Text>
        ) : messages.length === 0 ? (
          <Text style={styles.mutedText}>
            You have not sent any messages yet.
          </Text>
        ) : (
          messages.map((message) => (
            <View key={message.id} style={styles.messageRow}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageTitle}>{message.subject}</Text>
                {isDemoMode ? (
                  <Text style={styles.demoChip}>Demo Content</Text>
                ) : null}
              </View>
              <Text style={styles.messageMeta}>
                Status: {statusLabels[message.status]}
              </Text>
              <Text style={styles.messageMeta}>
                {new Date(message.createdAt).toLocaleString()}
              </Text>
              {message.replyBody ? (
                <Text style={styles.replyText}>{message.replyBody}</Text>
              ) : (
                <Text style={styles.messageMeta}>
                  Response times may vary based on school schedules.
                </Text>
              )}
              {message.status === GuardianMessageStatus.Responded &&
              !feedbackRatings[message.id] &&
              !isDemoMode ? (
                <View style={styles.feedbackBlock}>
                  <Text style={styles.feedbackTitle}>
                    Was this experience helpful?
                  </Text>
                  <View style={styles.optionGroup}>
                    {feedbackOptions.map((option) => (
                      <PrimaryButton
                        key={option.value}
                        label={option.label}
                        onPress={() =>
                          setFeedbackRatings((prev) => ({
                            ...prev,
                            [message.id]: option.value,
                          }))
                        }
                        variant={
                          feedbackRatings[message.id] === option.value
                            ? "secondary"
                            : "ghost"
                        }
                        style={styles.optionButton}
                      />
                    ))}
                  </View>
                  <TextInput
                    style={styles.feedbackInput}
                    placeholder="Any feedback you'd like to share? (Optional)"
                    placeholderTextColor={theme.colors.mutedText}
                    value={feedbackNotes[message.id] || ""}
                    onChangeText={(value) =>
                      setFeedbackNotes((prev) => ({
                        ...prev,
                        [message.id]: value,
                      }))
                    }
                    multiline
                  />
                  <Text style={styles.feedbackNote}>
                    Feedback helps improve school support systems.
                  </Text>
                  <PrimaryButton
                    label="Send feedback"
                    onPress={() => handleFeedbackSubmit(message.id)}
                    variant="secondary"
                  />
                </View>
              ) : null}
            </View>
          ))
        )}
      </SectionCard>
    </ScrollView>
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
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
  },
  demoBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F4D06F",
    color: "#5A3E00",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  demoNote: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  optionGroup: {
    gap: 8,
  },
  optionButton: {
    alignSelf: "stretch",
  },
  textArea: {
    minHeight: 160,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 8,
  },
  mutedText: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
  messageRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  demoChip: {
    backgroundColor: "#F4D06F",
    color: "#5A3E00",
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  messageMeta: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  replyText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
    marginTop: 6,
  },
  feedbackBlock: {
    marginTop: 12,
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  feedbackInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 10,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
  },
  feedbackNote: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginBottom: 8,
  },
});
