import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionCard } from "../../components/SectionCard";
import { theme } from "../../components/theme";
import { ThreatReport, ThreatSeverity, EscalationEvent } from "../../models/types";
import {
  resolveThreatReport,
  clearThreatReport,
  getSROOnCallContact,
} from "../../data/sroNotificationApi";

type SROThreatPortalScreenProps = {
  sroId: string;
  sroName: string;
};

/**
 * SRO Threat Portal
 * 
 * Role-restricted view for School Resource Officers ONLY
 * Shows all threat reports in queue with severity prioritization
 * Enables resolution, clearing, and escalation to law enforcement
 */
export const SROThreatPortalScreen = ({
  sroId,
  sroName,
}: SROThreatPortalScreenProps) => {
  const [threatReports, setThreatReports] = useState<ThreatReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ThreatReport | null>(
    null
  );
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    loadThreatReports();
  }, []);

  const loadThreatReports = async () => {
    try {
      setLoading(true);
      // Fetch only unresolved threat reports for this SRO
      const response = await fetch("/api/threat-reports?status=active", {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_SRO_API_TOKEN}`,
        },
      });
      const data = await response.json();
      // Sort by severity (critical first)
      const sorted = (data || []).sort(
        (a: ThreatReport, b: ThreatReport) => {
          const severityOrder: Record<ThreatSeverity, number> = {
            [ThreatSeverity.Critical]: 0,
            [ThreatSeverity.High]: 1,
            [ThreatSeverity.Moderate]: 2,
          };
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
      );
      setThreatReports(sorted);
    } catch (error) {
      console.error("Failed to load threat reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (report: ThreatReport, resolution: string) => {
    try {
      setResolving(true);
      await resolveThreatReport(report.id, sroId, resolution);
      // Refresh list
      await loadThreatReports();
      setSelectedReport(null);
    } catch (error) {
      console.error("Failed to resolve report:", error);
    } finally {
      setResolving(false);
    }
  };

  const handleClear = async (report: ThreatReport, reason: string) => {
    try {
      setResolving(true);
      await clearThreatReport(report.id, sroId, reason);
      await loadThreatReports();
      setSelectedReport(null);
    } catch (error) {
      console.error("Failed to clear report:", error);
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading threat reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚨 Threat Report Queue</Text>
        <Text style={styles.headerSubtitle}>
          Signed in as: {sroName}
        </Text>
        <Text style={styles.queueCount}>
          {threatReports.length} active report
          {threatReports.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {selectedReport ? (
        // DETAIL VIEW
        <ScrollView style={styles.content}>
          <SectionCard>
            <Text style={styles.detailTitle}>{selectedReport.concern}</Text>
            <View style={styles.severityBadge}>
              <Text style={styles.severityBadgeText}>
                {selectedReport.severity.toUpperCase()}
              </Text>
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>Report Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Concern:</Text>
              <Text style={styles.detailValue}>{selectedReport.concern}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{selectedReport.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Timing:</Text>
              <Text style={styles.detailValue}>{selectedReport.timing}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reported:</Text>
              <Text style={styles.detailValue}>
                {new Date(selectedReport.createdAt).toLocaleString()}
              </Text>
            </View>
            {selectedReport.details && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Details:</Text>
                <Text style={styles.detailValue}>{selectedReport.details}</Text>
              </View>
            )}
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>Actions</Text>
            <Text style={styles.instructionsText}>
              {selectedReport.severity === ThreatSeverity.Critical
                ? "🔴 CRITICAL: Initiate emergency response protocol. Contact law enforcement if not already contacted."
                : selectedReport.severity === ThreatSeverity.High
                ? "🟠 HIGH: Conduct immediate assessment. Escalate to law enforcement if credible threat confirmed."
                : "🟡 MODERATE: Review with counselor. Determine if further assessment needed."}
            </Text>

            {selectedReport.severity !== ThreatSeverity.Moderate && (
              <View style={styles.actionGroup}>
                <Text style={styles.actionLabel}>
                  Contact Law Enforcement?
                </Text>
                <Text style={styles.actionHelper}>
                  Use your standard protocols. This system does not auto-call.
                </Text>
                <Text style={styles.actionLink}>
                  📞 District Safety Contact{" "}
                  <Text style={styles.actionLinkButton}>→</Text>
                </Text>
              </View>
            )}

            <View style={styles.buttonGroup}>
              <PrimaryButton
                label="Back to List"
                onPress={() => setSelectedReport(null)}
                variant="ghost"
                style={styles.button}
              />
              <PrimaryButton
                label={resolving ? "Processing..." : "Mark Resolved"}
                onPress={() =>
                  handleResolve(selectedReport, "Threat assessed and addressed")
                }
                disabled={resolving}
                variant="primary"
                style={styles.button}
              />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Clear if Duplicate/False</Text>
            <PrimaryButton
              label={resolving ? "Clearing..." : "Clear Report"}
              onPress={() => handleClear(selectedReport, "Determined to be false or duplicate")}
              disabled={resolving}
              variant="secondary"
              style={styles.button}
            />
          </SectionCard>

          <SectionCard>
            <Text style={styles.auditLabel}>Audit Log</Text>
            {selectedReport.escalationLog?.map((event: EscalationEvent) => (
              <View key={event.id} style={styles.auditEntry}>
                <Text style={styles.auditAction}>{event.action.toUpperCase()}</Text>
                <Text style={styles.auditTime}>
                  {new Date(event.timestamp).toLocaleString()}
                </Text>
                {event.details && (
                  <Text style={styles.auditDetails}>{event.details}</Text>
                )}
              </View>
            ))}
          </SectionCard>
        </ScrollView>
      ) : (
        // LIST VIEW
        <FlatList
          data={threatReports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedReport(item)}
              style={[
                styles.reportCard,
                item.severity === ThreatSeverity.Critical &&
                  styles.reportCardCritical,
                item.severity === ThreatSeverity.High && styles.reportCardHigh,
              ]}
            >
              <View style={styles.reportHeader}>
                <Text style={styles.reportSeverity}>
                  {item.severity === ThreatSeverity.Critical
                    ? "🔴"
                    : item.severity === ThreatSeverity.High
                    ? "🟠"
                    : "🟡"}
                </Text>
                <Text style={styles.reportConcern}>{item.concern}</Text>
              </View>
              <Text style={styles.reportLocation}>{item.location}</Text>
              <Text style={styles.reportTime}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                ✓ No active threat reports
              </Text>
              <Text style={styles.emptySubtext}>
                New reports will appear here immediately
              </Text>
            </View>
          }
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.mutedText,
    marginTop: 12,
  },
  header: {
    backgroundColor: "#FEE2E2",
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#991B1B",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#7F1D1D",
    marginBottom: 8,
  },
  queueCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  reportCard: {
    backgroundColor: theme.colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  reportCardCritical: {
    borderLeftColor: theme.colors.danger,
    backgroundColor: "#FFF5F5",
  },
  reportCardHigh: {
    borderLeftColor: theme.colors.warning,
    backgroundColor: "#FFFBEB",
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  reportSeverity: {
    fontSize: 20,
  },
  reportConcern: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
  },
  reportLocation: {
    fontSize: 13,
    color: theme.colors.mutedText,
    marginBottom: 4,
  },
  reportTime: {
    fontSize: 11,
    color: theme.colors.mutedText,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.colors.mutedText,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 12,
  },
  severityBadge: {
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  severityBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.primaryText,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.mutedText,
  },
  detailValue: {
    fontSize: 13,
    color: theme.colors.text,
    maxWidth: "60%",
  },
  instructionsText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#FFF7ED",
    borderRadius: 6,
  },
  actionGroup: {
    marginVertical: 12,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  actionHelper: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginBottom: 8,
  },
  actionLink: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  actionLinkButton: {
    color: theme.colors.primary,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 16,
  },
  button: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 16,
  },
  auditLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 12,
  },
  auditEntry: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.subtleBackground,
    borderRadius: 4,
    marginBottom: 8,
  },
  auditAction: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: 2,
  },
  auditTime: {
    fontSize: 10,
    color: theme.colors.mutedText,
  },
  auditDetails: {
    fontSize: 11,
    color: theme.colors.mutedText,
    marginTop: 4,
  },
});
