import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { SeverityBadge, getSeverityLabel } from "../../components/SeverityBadge";
import { theme } from "../../components/theme";
import { fakeApi } from "../../data/fakeApi";
import { Case } from "../../models/types";
import { useAppContext } from "../../store/AppContext";
import { AccessRestrictedScreen } from "../AccessRestrictedScreen";
import { requireRole } from "../../utils/requireRole";
import { LawStackParamList } from "../../navigation/types";
import type { NativeStackNavigationProp } from "../../navigation/compatTypes";
import { useNavigation } from "../../navigation/compatTypes";

export const LawEnforcementCasesScreen = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const navigation =
    useNavigation<NativeStackNavigationProp<LawStackParamList>>();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewOfficerGuidance, setShowNewOfficerGuidance] = useState(false);
  const sharedCount = cases.length;

  if (!requireRole(["law"], currentUser)) {
    return <AccessRestrictedScreen onReset={() => setCurrentUser(null)} />;
  }

  const getIncidentLabel = (incidentType: Case["incidentType"]) => {
    return incidentType === "safety" ? "Safety emergency" : incidentType;
  };

  const loadCases = useCallback(async () => {
    setLoading(true);
    const data = await fakeApi.getEscalatedCases();
    setCases(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={cases}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadCases} />
      }
      ListHeaderComponent={
        <View>
          <SectionCard>
            <Text style={styles.title}>Safety review cases</Text>
            <Text style={styles.subtitle}>
              This view includes only cases shared with School Resource Officers.
            </Text>
            <Text style={styles.helperText}>
              This platform supports school safety coordination. Follow district
              policy and departmental procedures.
            </Text>
            {sharedCount > 0 ? (
              <View style={styles.noticeBanner}>
                <Text style={styles.noticeTitle}>
                  {sharedCount} case{sharedCount > 1 ? "s" : ""} shared for SRO
                  review
                </Text>
                <Text style={styles.noticeBody}>
                  Review shared cases and follow district guidance.
                </Text>
              </View>
            ) : null}
            <PrimaryButton
              label="Back to role selection"
              onPress={() => setCurrentUser(null)}
              variant="ghost"
              style={styles.switchButton}
            />
            <PrimaryButton
              label="Lockdown notifications"
              onPress={() => navigation.navigate("LockdownControl")}
              variant="secondary"
              style={styles.switchButton}
            />
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>
              SRO School & Youth Response Guide
            </Text>
            <Text style={styles.subtitle}>
              A step-by-step reference for School Resource Officers supporting
              schools, students, and families. This guide is informational only
              and does not replace training, policy, or legal counsel.
            </Text>
            <Text style={styles.helperText}>
              Local laws and district procedures may vary.
            </Text>
            <PrimaryButton
              label={
                showNewOfficerGuidance
                  ? "Hide new to school cases"
                  : "New to school cases?"
              }
              onPress={() =>
                setShowNewOfficerGuidance((prev) => !prev)
              }
              variant="secondary"
              style={styles.switchButton}
            />
          </SectionCard>

          {showNewOfficerGuidance ? (
            <SectionCard>
              <Text style={styles.sectionTitle}>If you are new to school cases</Text>
              <Text style={styles.helperText}>
                Common misconceptions
              </Text>
              <Text style={styles.bodyText}>
                - School cases do not work like adult cases.
              </Text>
              <Text style={styles.bodyText}>
                - Immediate enforcement is not always the best first step.
              </Text>
              <Text style={styles.bodyText}>
                - Schools do not expect SROs to take over.
              </Text>
              <Text style={styles.helperText}>
                Helpful reminders
              </Text>
              <Text style={styles.bodyText}>
                - Schools prioritize continuity and student well-being.
              </Text>
              <Text style={styles.bodyText}>
                - SRO support is part of a broader school safety system.
              </Text>
              <Text style={styles.bodyText}>
                - Collaboration leads to better outcomes.
              </Text>
            </SectionCard>
          ) : null}

          <SectionCard>
            <Text style={styles.sectionTitle}>Step 1: Understanding the school context</Text>
            <Text style={styles.bodyText}>
              Bullying and abuse cases are often ongoing, relational, and
              reported indirectly. Schools prioritize student safety, privacy,
              and minimizing retraumatization.
            </Text>
            <Text style={styles.helperText}>
              Reminder: SRO support is one part of a larger school safety
              system.
            </Text>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>Step 2: Initial case review</Text>
            <Text style={styles.bodyText}>
              - Review the case summary and timeline.
            </Text>
            <Text style={styles.bodyText}>
              - Note redactions and privacy limits.
            </Text>
            <Text style={styles.bodyText}>
              - Identify age of students, nature of concern, and school actions.
            </Text>
            <Text style={styles.helperText}>
              Avoid assumptions before speaking with school staff.
            </Text>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>
              Step 3: Coordinate with school officials first
            </Text>
            <Text style={styles.bodyText}>
              Contact the principal, school safety officer, or counselor before
              interviewing students. Schools often have critical context that
              does not appear in reports.
            </Text>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>
              Step 4: Trauma-informed student interaction
            </Text>
            <Text style={styles.bodyText}>
              Do use age-appropriate language, explain your role clearly, and
              allow a trusted adult present when appropriate.
            </Text>
            <Text style={styles.bodyText}>
              Avoid leading questions, threatening language, or pressuring
              immediate statements.
            </Text>
            <Text style={styles.helperText}>
              Sample phrasing: "Can you help me understand what you experienced?"
              "You are not in trouble."
            </Text>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>
              Step 5: Engage parents and guardians
            </Text>
            <Text style={styles.bodyText}>
              Parents may be scared, defensive, or confused about school vs.
              police roles. Introduce your role clearly, explain next steps
              calmly, and avoid assigning blame early.
            </Text>
            <Text style={styles.helperText}>
              Sample language: "Our role is to support safety while the school
              addresses the situation." "This does not automatically mean
              criminal charges."
            </Text>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>
              Step 6: Escalation vs. support
            </Text>
            <Text style={styles.bodyText}>
              Consider escalation when there are patterns of repeated harm,
              credible threats, physical injury, or coercion. School-led
              resolution or monitoring may be appropriate for lower-risk
              concerns.
            </Text>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>
              Step 7: Documentation and follow-up
            </Text>
            <Text style={styles.bodyText}>
              Document observed facts, coordinate with school records, and
              maintain chain-of-custody when applicable.
            </Text>
            <Text style={styles.helperText}>
              Documentation should reflect observed facts, not assumptions.
            </Text>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>Scenario walkthroughs</Text>
            <Text style={styles.bodyText}>
              Scenario 1: Repeated bullying (non-physical)
            </Text>
            <Text style={styles.bodyText}>
              - Multiple reports over time, redacted peer information, no
              immediate safety threat flagged.
            </Text>
            <Text style={styles.bodyText}>
              - Coordinate with school administration and counselors first.
            </Text>
            <Text style={styles.bodyText}>
              - Avoid framing the situation as criminal at the outset.
            </Text>
            <Text style={styles.bodyText}>
              - Reassure the student they are not in trouble.
            </Text>
            <Text style={styles.bodyText}>
              - Emphasize collaboration with the school when speaking with
              parents.
            </Text>

            <Text style={styles.bodyText}>
              Scenario 2: Physical altercation between students
            </Text>
            <Text style={styles.bodyText}>
              - Minor injuries, staff response notes, case escalated.
            </Text>
            <Text style={styles.bodyText}>
              - Confirm immediate safety and review school actions first.
            </Text>
            <Text style={styles.bodyText}>
              - Clarify roles between school discipline and SRO support.
            </Text>

            <Text style={styles.bodyText}>
              Scenario 3: Concerning online behavior or threat language
            </Text>
            <Text style={styles.bodyText}>
              - Screenshots and concern flags, no physical action taken yet.
            </Text>
            <Text style={styles.bodyText}>
              - Coordinate with counselors and assess credibility without
              alarmism.
            </Text>
            <Text style={styles.bodyText}>
              - Ask open-ended questions and avoid accusatory language.
            </Text>

            <Text style={styles.bodyText}>
              Scenario 4: Suspected abuse disclosed at school
            </Text>
            <Text style={styles.bodyText}>
              - Minimal details to protect the student, counselor involvement.
            </Text>
            <Text style={styles.bodyText}>
              - Follow child protection protocols and avoid repeated questioning.
            </Text>
            <Text style={styles.bodyText}>
              - Coordinate with appropriate authorities and maintain privacy.
            </Text>
          </SectionCard>
        </View>
      }
      renderItem={({ item }) => (
        <SectionCard>
          <Text style={styles.caseBanner}>
            This platform supports school safety coordination. Follow district
            policy and departmental procedures.
          </Text>
          <View style={styles.cardHeader}>
            <Text style={styles.caseTitle}>
              {getIncidentLabel(item.incidentType)}
            </Text>
            <SeverityBadge severity={item.severity} />
          </View>
          <Text style={styles.caseMeta}>
            Submitted {new Date(item.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.caseMeta}>
            Severity: {getSeverityLabel(item.severity)}
          </Text>
          <Text style={styles.caseMeta}>Status: {item.status}</Text>
          {item.sroShareReason ? (
            <Text style={styles.caseMeta}>
              Safety concern: {item.sroShareReason}
            </Text>
          ) : null}
          {item.reportSource ? (
            <Text style={styles.caseMeta}>
              Source: {item.reportSource === "student" ? "Student" : "Teacher"}
            </Text>
          ) : null}
          {item.emergencyType ? (
            <Text style={styles.caseMeta}>
              Emergency type: {item.emergencyType}
            </Text>
          ) : null}
          {item.emergencyScope ? (
            <Text style={styles.caseMeta}>
              Affected: {item.emergencyScope}
            </Text>
          ) : null}
          {item.emergencyLocation ? (
            <Text style={styles.caseMeta}>
              Location: {item.emergencyLocation}
            </Text>
          ) : null}
          {item.directToSro ? (
            <Text style={styles.caseMeta}>Routed: Direct emergency</Text>
          ) : item.autoRoutedToSro ? (
            <Text style={styles.caseMeta}>Routed: Auto</Text>
          ) : null}
          {item.safetyConcernType ? (
            <Text style={styles.caseMeta}>
              Context: {item.safetyConcernType}
            </Text>
          ) : null}
          {item.sroShareNote ? (
            <Text style={styles.caseNarrative}>{item.sroShareNote}</Text>
          ) : item.directToSro ? (
            <Text style={styles.caseNarrative}>
              No additional details were provided.
            </Text>
          ) : (
            <Text style={styles.caseNarrative}>
              Counselor notes are limited to protect privacy.
            </Text>
          )}
        </SectionCard>
      )}
      ListEmptyComponent={
        <SectionCard>
          <Text style={styles.emptyText}>
            No reports need review right now.
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
    marginBottom: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  switchButton: {
    alignSelf: "flex-start",
  },
  helperText: {
    fontSize: 13,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginTop: 6,
  },
  noticeBanner: {
    backgroundColor: theme.colors.subtleBackground,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  noticeBody: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  bodyText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    textTransform: "capitalize",
  },
  caseMeta: {
    fontSize: 13,
    color: theme.colors.mutedText,
    marginBottom: 4,
  },
  caseBanner: {
    fontSize: 12,
    color: theme.colors.mutedText,
    lineHeight: 18,
    marginBottom: 8,
  },
  caseNarrative: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
  },
});
