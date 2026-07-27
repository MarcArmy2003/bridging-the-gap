import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppContext } from "../store/AppContext";
import { fakeApi } from "../data/fakeApi";
import navigationRef from "../navigation/RootNavigation";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function SmokeTestRunner() {
  const { currentUser, isDemoMode } = useAppContext();
  const [status, setStatus] = useState<string>("idle");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!__DEV__) return;
      if ((process.env.EXPO_PUBLIC_RUN_SMOKE || "").toLowerCase() !== "true") return;
      setStatus("waiting-for-user");

      // Wait for demo user to be set
      for (let i = 0; i < 40; i++) {
        if (cancelled) return;
        if (currentUser && isDemoMode) break;
        await sleep(200);
      }

      setStatus("navigating-inbox");
      if (navigationRef.isReady()) {
        navigationRef.navigate("CaseInbox");
      }

      await sleep(500);

      setStatus("fetching-cases");
      const cases = await fakeApi.getCases();
      if (!cases || cases.length === 0) {
        setStatus("no-cases-found");
        return;
      }

      const first = cases[0];
      setStatus(`opening-${first.id}`);
      if (navigationRef.isReady()) {
        navigationRef.navigate("CaseDetail", { caseId: first.id });
      }

      await sleep(500);
      setStatus("setting-support-plan");
      await fakeApi.updateSupportPlan(first.id, "counselor", "SmokeTest");

      await sleep(300);
      const updated = await fakeApi.getCaseById(first.id);
      if (updated && updated.supportPlanType === "counselor") {
        setStatus("pass: support plan set");
      } else {
        setStatus("fail: support plan not set");
      }

      // Send counselor-mediated messages for smoke verification
      setStatus("sending-smoke-messages");
      try {
        await fakeApi.sendCaseMessage(first.id, "counselor", "parent", "Smoke: parent message");
        await fakeApi.sendCaseMessage(first.id, "counselor", "teacher", "Smoke: teacher message");

        const msgs = await fakeApi.getCaseMessages(first.id);

        const seesParent = msgs.some((m: any) => (m.body || "").includes("parent message"));
        const seesTeacher = msgs.some((m: any) => (m.body || "").includes("teacher message"));

        if (!seesParent || !seesTeacher) {
          setStatus("fail: counselor cannot see smoke messages");
        } else {
          // Parent view filter check
          const parentVisible = msgs.filter((m: any) =>
            m.senderRole === "counselor" ? m.recipientRole === "parent" : m.senderRole === "parent"
          );

          const parentSeesTeacher = parentVisible.some((m: any) => m.recipientRole === "teacher" || m.senderRole === "teacher");

          if (parentSeesTeacher) {
            setStatus("fail: parent can see teacher messages");
          } else {
            setStatus("pass: messaging mediation verified");
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Smoke message step failed", err);
        setStatus("fail: messaging step error");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [currentUser, isDemoMode]);

  return (
    <View style={styles.container} pointerEvents="none">
      <Text style={styles.title}>Smoke Test</Text>
      <Text>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 6,
    elevation: 2,
  },
  title: { fontWeight: "700", marginBottom: 4 },
});
