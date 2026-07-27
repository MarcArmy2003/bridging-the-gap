import React from "react";
import { ScrollView } from "react-native";
import { SectionCard } from "../../components/SectionCard";
import { Text } from "react-native";

export const GuidanceLibraryScreen = () => (
  <ScrollView style={{ padding: 16 }}>
    <SectionCard>
      <Text style={{ fontWeight: "600" }}>Unsure about next steps?</Text>
      <Text>
        If the concern is ongoing but not urgent, begin with a student check-in.
        Document observations and monitor patterns over time.
      </Text>
    </SectionCard>

    <SectionCard>
      <Text style={{ fontWeight: "600" }}>When to involve parents</Text>
      <Text>
        Parent outreach is appropriate when concerns affect well-being,
        attendance, or learning continuity.
      </Text>
    </SectionCard>

    <SectionCard>
      <Text style={{ fontWeight: "600" }}>Escalation guidance</Text>
      <Text>Escalate only when safety indicators are present. Use documented steps.</Text>
    </SectionCard>
  </ScrollView>
);

export default GuidanceLibraryScreen;
