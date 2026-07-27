import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
} from "react-native";
import { theme } from "./theme";

export type BoardPresentationStep = {
  title: string;
  content: string;
  section: string;
  duration?: number; // seconds
};

type BoardPresentationModeProps = {
  visible: boolean;
  steps: BoardPresentationStep[];
  onClose: () => void;
};

export const BoardPresentationMode = ({
  visible,
  steps,
  onClose,
}: BoardPresentationModeProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay || !visible) return;

    const currentStepDuration = steps[currentStep]?.duration || 8;
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setAutoPlay(false);
      }
    }, currentStepDuration * 1000);

    return () => clearTimeout(timer);
  }, [currentStep, autoPlay, visible, steps]);

  const goToNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setAutoPlay(false);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setAutoPlay(false);
    }
  };

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
  };

  if (!visible || steps.length === 0) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📊 Presentation Mode</Text>
          <Text style={styles.headerSubtitle}>
            Demonstration view for boards and community stakeholders.
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
        >
          <Text style={styles.stepSection}>{step.section}</Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepContent}>{step.content}</Text>
        </ScrollView>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            onPress={goToPrevious}
            disabled={currentStep === 0}
            style={[styles.button, currentStep === 0 && styles.buttonDisabled]}
          >
            <Text
              style={[
                styles.buttonText,
                currentStep === 0 && styles.buttonTextDisabled,
              ]}
            >
              ← Previous
            </Text>
          </Pressable>

          <Pressable
            onPress={toggleAutoPlay}
            style={[styles.button, styles.buttonToggle]}
          >
            <Text style={styles.buttonText}>
              {autoPlay ? "⏸ Pause" : "▶ Play"}
            </Text>
          </Pressable>

          <Pressable
            onPress={goToNext}
            disabled={currentStep === steps.length - 1}
            style={[
              styles.button,
              currentStep === steps.length - 1 && styles.buttonDisabled,
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                currentStep === steps.length - 1 && styles.buttonTextDisabled,
              ]}
            >
              Next →
            </Text>
          </Pressable>

          <Pressable onPress={onClose} style={[styles.button, styles.buttonClose]}>
            <Text style={styles.buttonText}>Exit</Text>
          </Pressable>
        </View>

        {/* Step Indicator */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 20,
  },
  header: {
    backgroundColor: "#FFF7ED",
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.mutedText,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  stepSection: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 16,
    lineHeight: 36,
  },
  stepContent: {
    fontSize: 16,
    lineHeight: 28,
    color: theme.colors.mutedText,
  },
  progressContainer: {
    height: 4,
    backgroundColor: theme.colors.border,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  controls: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonToggle: {
    backgroundColor: theme.colors.warning,
  },
  buttonClose: {
    backgroundColor: theme.colors.danger,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primaryText,
  },
  buttonTextDisabled: {
    color: "rgba(255, 255, 255, 0.5)",
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    fontWeight: "500",
  },
});
