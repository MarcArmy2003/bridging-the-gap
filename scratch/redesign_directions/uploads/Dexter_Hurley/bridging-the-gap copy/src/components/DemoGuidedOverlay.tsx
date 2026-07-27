import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { theme } from "../components/theme";

export type GuidedStep = {
  title: string;
  description: string;
  hint?: string;
};

type DemoGuidedOverlayProps = {
  visible: boolean;
  title: string;
  steps: GuidedStep[];
  onDismiss: () => void;
};

export const DemoGuidedOverlay = ({
  visible,
  title,
  steps,
  onDismiss,
}: DemoGuidedOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onDismiss();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.stepCounter}>
              Step {currentStep + 1} of {steps.length}
            </Text>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.stepTitle}>{step?.title}</Text>
            <Text style={styles.stepDescription}>{step?.description}</Text>
            {step?.hint ? (
              <View style={styles.hintBox}>
                <Text style={styles.hintLabel}>💡 Tip:</Text>
                <Text style={styles.hintText}>{step.hint}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={handlePrev}
              disabled={currentStep === 0}
              style={[styles.button, currentStep === 0 && styles.buttonDisabled]}
            >
              <Text
                style={[
                  styles.buttonText,
                  currentStep === 0 && styles.buttonTextDisabled,
                ]}
              >
                ← Back
              </Text>
            </Pressable>

            <Pressable onPress={onDismiss} style={styles.buttonSecondary}>
              <Text style={styles.buttonTextSecondary}>Close Guide</Text>
            </Pressable>

            <Pressable
              onPress={handleNext}
              style={[styles.button, styles.buttonPrimary]}
            >
              <Text style={styles.buttonText}>
                {isLast ? "Done" : "Next →"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    maxWidth: 500,
    maxHeight: "80%",
    overflow: "hidden",
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  stepCounter: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    padding: 16,
    minHeight: 200,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
    marginBottom: 12,
  },
  hintBox: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  hintLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 4,
  },
  hintText: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonSecondary: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  buttonTextDisabled: {
    color: "#999",
  },
  buttonTextSecondary: {
    fontSize: 12,
    color: theme.colors.primary,
  },
});
