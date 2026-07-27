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
import { guardianSupportApi } from "../../data/guardianSupportApi";
import {
  GuardianCheckIn,
  GuardianCheckInResponse,
  GuardianCheckInStatus,
  GuardianSupportRequest,
} from "../../models/types";
import { GuardianStackParamList } from "../../navigation/types";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { useAppContext } from "../../store/AppContext";
import { requireRole } from "../../utils/requireRole";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useFocusEffect, useNavigation } from "../../navigation/compatTypes";

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

const questionOptions: { id: string; text: string }[] = [
  { id: "withdrawn", text: "Has your child seemed more withdrawn than usual?" },
  {
    id: "school_stress",
    text: "Has your child talked about school stress recently?",
  },
  { id: "peer_conflicts", text: "Has your child mentioned conflicts with peers?" },
  { id: "anxious", text: "Has your child seemed anxious about school?" },
  { id: "sleep_change", text: "Has your child been sleeping or eating differently?" },
];

const responseOptions: { label: string; value: GuardianCheckInResponse }[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Not sure", value: "not_sure" },
];

const guardianPromptCategories = [
  {
    title: "General well-being",
    prompts: [
      {
        id: "wellbeing_lately",
        text: "How have you been feeling about school lately?",
      },
      { id: "easiest_part", text: "What part of the school day feels easiest?" },
      { id: "hardest_part", text: "What part feels hardest?" },
    ],
  },
  {
    title: "Bullying / peer concerns",
    prompts: [
      {
        id: "uncomfortable_times",
        text: "Are there times you feel uncomfortable around other students?",
      },
      {
        id: "unsafe_unwelcome",
        text: "Has anyone made you feel unsafe or unwelcome?",
      },
      {
        id: "comfortable_people",
        text: "Who do you feel comfortable talking to at school?",
      },
    ],
  },
  {
    title: "Emotional support",
    prompts: [
      {
        id: "stress_helps",
        text: "When you feel stressed, what usually helps?",
      },
      {
        id: "worried_recently",
        text: "Is there anything you've been worried about recently?",
      },
      {
        id: "adults_listen",
        text: "Do you feel like adults at school listen to you?",
      },
    ],
  },
  {
    title: "Home / basic needs",
    prompts: [
      {
        id: "supported_home_school",
        text: "Do you feel supported at home and school?",
      },
      {
        id: "outside_school_harder",
        text:
          "Is there anything outside of school that's been making days harder?",
      },
    ],
  },
];

const supportOptions: { label: string; value: GuardianSupportRequest }[] = [
  { label: "I'd like parenting resources", value: "resources" },
  {
    label: "I'd like to talk with a teacher or counselor",
    value: "counselor_outreach",
  },
  { label: "I'd like help starting a conversation", value: "conversation_help" },
  { label: "Not at this time", value: "not_now" },
];

const statusLabels: Record<GuardianCheckInStatus, string> = {
  [GuardianCheckInStatus.New]: "New",
  [GuardianCheckInStatus.Reviewed]: "Reviewed",
  [GuardianCheckInStatus.Contacted]: "Contacted",
  [GuardianCheckInStatus.Closed]: "Closed",
};

const supportRequestLabels: Record<GuardianSupportRequest, string> = {
  resources: "Parenting resources",
  counselor_outreach: "Teacher / counselor outreach",
  conversation_help: "Conversation support",
  not_now: "Not at this time",
};

const formatSupportRequests = (requests: GuardianSupportRequest[]) => {
  if (!requests.length) {
    return "Not at this time";
  }
  return requests.map((item) => supportRequestLabels[item]).join(", ");
};

const suggestionCards = [
  'Many parents find it helpful to ask open-ended questions like, "What was the hardest part of your day?"',
  "Children do not always name bullying directly - changes in mood can be a signal.",
  "Listening without immediately solving can help children feel safer sharing.",
];

const resourceCategories = [
  {
    title: "School & Peer Challenges",
    items: [
      "Talking about bullying",
      "Helping children navigate friendships",
      "Supporting children after conflicts",
    ],
  },
  {
    title: "Emotional Well-Being",
    items: [
      "Anxiety and stress in children",
      "Building resilience",
      "Helping kids express emotions",
    ],
  },
  {
    title: "Parenting Tools",
    items: [
      "Age-appropriate communication",
      "Setting boundaries with empathy",
      "Supporting teens without shutting them down",
    ],
  },
  {
    title: "When to Seek Extra Help",
    items: [
      "Signs a child may need professional support",
      "How schools typically respond",
      "How to talk to a teacher or counselor",
    ],
  },
];

export const GuardianSupportScreen = () => {
  const { currentUser, setCurrentUser, isDemoMode } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<GuardianStackParamList>>();
  const [gradeBand, setGradeBand] = useState("6_8");
  const [responses, setResponses] = useState<
    Record<string, GuardianCheckInResponse>
  >({});
  const [supportRequests, setSupportRequests] = useState<
    GuardianSupportRequest[]
  >([]);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [promptNotes, setPromptNotes] = useState("");
  const [observations, setObservations] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkIns, setCheckIns] = useState<GuardianCheckIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [promptResponse, setPromptResponse] = useState<string | null>(null);

  if (!requireRole(["guardian"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const loadCheckIns = useCallback(async () => {
    if (!currentUser) {
      return;
    }
    if (isDemoMode) {
      setLoading(false);
      setCheckIns([
        {
          id: "DEMO-GUARD-1",
          guardianId: currentUser.id,
          guardianName: currentUser.name,
          responses: { school_stress: "yes" },
          supportRequests: ["conversation_help"],
          status: GuardianCheckInStatus.New,
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }
    setLoading(true);
    const data = await guardianSupportApi.getCheckInsForGuardian(
      currentUser.id
    );
    setCheckIns(data);
    setLoading(false);
  }, [currentUser, isDemoMode]);

  useFocusEffect(
    useCallback(() => {
      loadCheckIns();
    }, [loadCheckIns])
  );

  const updateResponse = (
    questionId: string,
    value: GuardianCheckInResponse
  ) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleSupportRequest = (value: GuardianSupportRequest) => {
    if (value === "not_now") {
      setSupportRequests(["not_now"]);
      return;
    }
    setSupportRequests((prev) => {
      const next = prev.filter((item) => item !== "not_now");
      return next.includes(value)
        ? next.filter((item) => item !== value)
        : [...next, value];
    });
  };

  const togglePromptSelection = (promptId: string) => {
    setSelectedPrompts((prev) =>
      prev.includes(promptId)
        ? prev.filter((id) => id !== promptId)
        : [...prev, promptId]
    );
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      return;
    }
    if (isDemoMode) {
      Alert.alert(
        "Demo mode active",
        "Demo mode is on, so submissions are not sent."
      );
      return;
    }
    const hasAnyAnswer = questionOptions.some((q) => responses[q.id]);
    const hasPromptSelection = selectedPrompts.length > 0;
    const hasNotes =
      observations.trim().length > 0 || promptNotes.trim().length > 0;
    const hasSupportRequest =
      supportRequests.some((request) => request !== "not_now") || false;
    if (
      !hasAnyAnswer &&
      !hasPromptSelection &&
      !hasNotes &&
      !hasSupportRequest
    ) {
      Alert.alert(
        "Optional check-in",
        "Choose at least one response or prompt suggestion to submit."
      );
      return;
    }
    setSubmitting(true);
    const promptSuggestions = guardianPromptCategories
      .flatMap((category) =>
        category.prompts.map((prompt) => ({
          promptId: prompt.id,
          promptText: prompt.text,
          category: category.title,
        }))
      )
      .filter((prompt) => selectedPrompts.includes(prompt.promptId))
      .map((prompt) => ({
        submittedBy: "guardian" as const,
        category: prompt.category,
        promptText: prompt.promptText,
      }));
    await guardianSupportApi.createCheckIn({
      guardianId: currentUser.id,
      guardianName: currentUser.name,
      responses,
      promptSuggestions,
      promptNotes,
      observations,
      supportRequests: supportRequests.length ? supportRequests : ["not_now"],
    });
    setSubmitting(false);
    setResponses({});
    setSupportRequests([]);
    setSelectedPrompts([]);
    setPromptNotes("");
    setObservations("");
    navigation.navigate("GuardianSupportConfirmation");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        {isDemoMode ? (
          <Text style={styles.demoBadge}>Demo Mode Active</Text>
        ) : null}
        <Text style={styles.title}>How is your child doing?</Text>
        <Text style={styles.subtitle}>
          There are no right or wrong answers. These check-ins help us support
          your child in a caring, non-judgmental way.
        </Text>
        <Text style={styles.disclaimer}>
          This app does not provide medical or mental health advice. If you
          believe your child may be in immediate danger, contact emergency
          services or a qualified professional.
        </Text>
      </SectionCard>

      {!promptDismissed ? (
        <SectionCard>
          <Text style={styles.sectionTitle}>Quick check-in prompt</Text>
          <Text style={styles.helperText}>
            How has your child been feeling about school recently?
          </Text>
          <View style={styles.optionGroup}>
            <PrimaryButton
              label="Everything seems okay"
              onPress={() => setPromptResponse("Everything seems okay")}
              variant="ghost"
              style={styles.optionButton}
            />
            <PrimaryButton
              label="Some concerns"
              onPress={() => setPromptResponse("Some concerns")}
              variant="ghost"
              style={styles.optionButton}
            />
            <PrimaryButton
              label="I'd like guidance"
              onPress={() => navigation.navigate("GuardianMessageTemplates")}
              variant="secondary"
              style={styles.optionButton}
            />
            <PrimaryButton
              label="Dismiss"
              onPress={() => setPromptDismissed(true)}
              variant="ghost"
              style={styles.optionButton}
            />
          </View>
          {promptResponse ? (
            <Text style={styles.helperText}>
              Thanks for checking in. You can return here anytime.
            </Text>
          ) : null}
        </SectionCard>
      ) : null}

      <SectionCard>
        <Text style={styles.sectionTitle}>Student grade band</Text>
        <Text style={styles.helperText}>
          Guidance adapts based on age to keep the language appropriate.
        </Text>
        <View style={styles.optionGroup}>
          {gradeBandOptions.map((option) => (
            <PrimaryButton
              key={option.value}
              label={option.label}
              onPress={() => setGradeBand(option.value)}
              variant={gradeBand === option.value ? "secondary" : "ghost"}
              style={styles.optionButton}
            />
          ))}
        </View>
        <Text style={styles.helperText}>{gradeBandNotes[gradeBand]}</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.title}>Supporting Your Child</Text>
        <Text style={styles.subtitle}>
          Guidance, questions, and resources for parents who want to support
          their child's well-being.
        </Text>
        <Text style={styles.helperText}>{gradeBandNotes[gradeBand]}</Text>

        <Text style={styles.sectionTitle}>
          Step 1: Notice possible signs (no assumptions)
        </Text>
        <Text style={styles.bodyText}>- Sudden changes in mood or behavior</Text>
        <Text style={styles.bodyText}>
          - Avoiding school or activities they once enjoyed
        </Text>
        <Text style={styles.bodyText}>
          - Complaints of stomach aches or headaches
        </Text>
        <Text style={styles.bodyText}>- Changes in sleep or appetite</Text>
        <Text style={styles.bodyText}>- Withdrawing from friends or family</Text>
        <Text style={styles.helperText}>
          These signs do not always mean bullying, but they can be a signal that
          something is going on.
        </Text>

        <Text style={styles.sectionTitle}>
          Step 2: Questions parents can gently ask
        </Text>
        <Text style={styles.bodyText}>
          - How have things been feeling at school lately?
        </Text>
        <Text style={styles.bodyText}>
          - Is there anything that has been making school harder for you?
        </Text>
        <Text style={styles.bodyText}>
          - Who do you usually feel comfortable around at school?
        </Text>
        <Text style={styles.bodyText}>
          - Has anything happened that made you feel uncomfortable or upset?
        </Text>
        <Text style={styles.helperText}>
          Ask one question at a time, listen more than you speak, and avoid
          interrupting or correcting.
        </Text>

        <Text style={styles.sectionTitle}>
          Step 3: What to say (and not say)
        </Text>
        <Text style={styles.bodyText}>Helpful responses</Text>
        <Text style={styles.bodyText}>- Thank you for telling me.</Text>
        <Text style={styles.bodyText}>- I'm really glad you shared this.</Text>
        <Text style={styles.bodyText}>- We can figure this out together.</Text>
        <Text style={styles.bodyText}>Try to avoid</Text>
        <Text style={styles.bodyText}>- Why didn't you tell me sooner?</Text>
        <Text style={styles.bodyText}>- Just ignore it.</Text>
        <Text style={styles.bodyText}>- That doesn't sound like a big deal.</Text>

        <Text style={styles.sectionTitle}>
          Step 4: Next supportive steps
        </Text>
        <Text style={styles.bodyText}>- Continue checking in at home</Text>
        <Text style={styles.bodyText}>
          - Reach out to a teacher or counselor
        </Text>
        <Text style={styles.bodyText}>
          - Use the app to request guidance or support
        </Text>
        <Text style={styles.bodyText}>
          - Review parenting resources together
        </Text>
        <Text style={styles.helperText}>
          You do not need to solve everything at once.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>
          Gentle check-in questions for emotional well-being
        </Text>
        <Text style={styles.bodyText}>
          - What part of your day feels the most stressful?
        </Text>
        <Text style={styles.bodyText}>
          - What helps you feel calm when you're overwhelmed?
        </Text>
        <Text style={styles.bodyText}>
          - Is there anything you wish adults understood better?
        </Text>
        <Text style={styles.helperText}>
          Children do not always have the words. Patience matters.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>
          Questions You Can Suggest We Ask
        </Text>
        <Text style={styles.helperText}>
          If it helps, you can suggest questions the school may gently ask your
          child. You're not required to fill this out.
        </Text>
        {guardianPromptCategories.map((category) => (
          <View key={category.title} style={styles.promptCategory}>
            <Text style={styles.promptCategoryTitle}>{category.title}</Text>
            <View style={styles.optionGroup}>
              {category.prompts.map((prompt) => (
                <PrimaryButton
                  key={prompt.id}
                  label={prompt.text}
                  onPress={() => togglePromptSelection(prompt.id)}
                  variant={
                    selectedPrompts.includes(prompt.id) ? "secondary" : "ghost"
                  }
                  style={styles.optionButton}
                />
              ))}
            </View>
          </View>
        ))}
        <TextInput
          style={styles.textArea}
          placeholder="Anything else you'd like us to know?"
          placeholderTextColor={theme.colors.mutedText}
          value={promptNotes}
          onChangeText={setPromptNotes}
          multiline
        />
        <Text style={styles.helperText}>
          Questions are suggestions only and may be adapted by school staff.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>
          Stress-reducing activities and new hobbies
        </Text>
        <Text style={styles.bodyText}>Physical and movement-based</Text>
        <Text style={styles.bodyText}>
          - Walking together, team sports, martial arts, dance, yoga, biking,
          swimming
        </Text>
        <Text style={styles.bodyText}>Creative and expressive</Text>
        <Text style={styles.bodyText}>
          - Drawing, painting, music, writing, journaling, storytelling, theater
        </Text>
        <Text style={styles.bodyText}>Calm and grounding</Text>
        <Text style={styles.bodyText}>
          - Gardening, cooking together, mindful breathing, puzzles
        </Text>
        <Text style={styles.bodyText}>Social and confidence-building</Text>
        <Text style={styles.bodyText}>
          - Clubs, volunteering, group activities, mentorship programs
        </Text>
        <Text style={styles.helperText}>
          Activities that build confidence can reduce the impact of bullying.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Quick check-in</Text>
        {questionOptions.map((question) => (
          <View key={question.id} style={styles.questionBlock}>
            <Text style={styles.questionText}>{question.text}</Text>
            <View style={styles.optionRow}>
              {responseOptions.map((option) => (
                <PrimaryButton
                  key={option.value}
                  label={option.label}
                  onPress={() => updateResponse(question.id, option.value)}
                  variant={
                    responses[question.id] === option.value
                      ? "secondary"
                      : "ghost"
                  }
                  style={styles.optionButton}
                />
              ))}
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>What you're noticing at home</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Anything you'd like the school to know?"
          placeholderTextColor={theme.colors.mutedText}
          value={observations}
          onChangeText={setObservations}
          multiline
        />
        <Text style={styles.helperText}>
          This is optional and will only be shared with authorized support staff.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Would you like guidance or support?</Text>
        <View style={styles.optionGroup}>
          {supportOptions.map((option) => (
            <PrimaryButton
              key={option.value}
              label={option.label}
              onPress={() => toggleSupportRequest(option.value)}
              variant={
                supportRequests.includes(option.value) ? "secondary" : "ghost"
              }
              style={styles.optionButton}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Supportive suggestions</Text>
        {suggestionCards.map((tip, index) => (
          <View key={`${tip}-${index}`} style={styles.tipCard}>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Great resources for parenting</Text>
        <Text style={styles.helperText}>
          These resources are informational only and do not replace
          professional guidance.
        </Text>
        {resourceCategories.map((category) => (
          <View key={category.title} style={styles.resourceBlock}>
            <Text style={styles.resourceTitle}>{category.title}</Text>
            {category.items.map((item) => (
              <Text key={item} style={styles.resourceItem}>
                • {item}
              </Text>
            ))}
          </View>
        ))}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Optional next actions</Text>
        <PrimaryButton
          label="Request guidance from a teacher or counselor"
          onPress={() => navigation.navigate("GuardianMessageTemplates")}
          variant="secondary"
          style={styles.optionButton}
        />
        <PrimaryButton
          label="Share observations with the school"
          onPress={() => navigation.navigate("GuardianMessageTemplates")}
          variant="secondary"
          style={styles.optionButton}
        />
        <PrimaryButton
          label="View parenting resources"
          onPress={() => navigation.navigate("GuardianSupport")}
          variant="ghost"
          style={styles.optionButton}
        />
        <PrimaryButton
          label="Not ready to take action yet"
          onPress={() => navigation.navigate("GuardianSupport")}
          variant="ghost"
          style={styles.optionButton}
        />
      </SectionCard>

      <SectionCard>
        <PrimaryButton
          label={submitting ? "Submitting..." : "Send check-in"}
          onPress={handleSubmit}
          disabled={submitting}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Your recent check-ins</Text>
        {loading ? (
          <Text style={styles.mutedText}>Loading your check-ins...</Text>
        ) : checkIns.length === 0 ? (
          <Text style={styles.mutedText}>
            You have not submitted any check-ins yet.
          </Text>
        ) : (
          checkIns.map((entry) => (
            <View key={entry.id} style={styles.checkInRow}>
              <View style={styles.checkInHeader}>
                <Text style={styles.checkInTitle}>
                  {new Date(entry.createdAt).toLocaleString()}
                </Text>
                {isDemoMode ? (
                  <Text style={styles.demoChip}>Demo Content</Text>
                ) : null}
              </View>
              <Text style={styles.checkInMeta}>
                Status: {statusLabels[entry.status]}
              </Text>
              <Text style={styles.checkInMeta}>
                Support requested: {formatSupportRequests(entry.supportRequests)}
              </Text>
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
    fontSize: 22,
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
    marginBottom: 10,
  },
  disclaimer: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  questionBlock: {
    marginBottom: 14,
  },
  questionText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionGroup: {
    gap: 8,
  },
  optionButton: {
    flexGrow: 1,
    minWidth: 120,
    marginTop: 6,
  },
  bodyText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  promptCategory: {
    marginBottom: 12,
  },
  promptCategoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6,
  },
  tipCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  resourceBlock: {
    marginTop: 12,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6,
  },
  resourceItem: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  mutedText: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
  checkInRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  checkInHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  checkInTitle: {
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
  checkInMeta: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
});
