import React from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { theme } from "./theme";

type DemoExitConfirmationProps = {
  visible: boolean;
  onConfirmExit: () => void;
  onCancel: () => void;
};

export const DemoExitConfirmation = ({
  visible,
  onConfirmExit,
  onCancel,
}: DemoExitConfirmationProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Exit Demo Mode?</Text>
          <Text style={styles.message}>
            You will return to live data access. Demo cases will reset.
          </Text>

          <View style={styles.buttonGroup}>
            <Pressable
              onPress={onCancel}
              style={[styles.button, styles.buttonSecondary]}
            >
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                Keep Demo Mode
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirmExit}
              style={[styles.button, styles.buttonPrimary]}
            >
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                Exit to Live Data
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  dialog: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: theme.colors.mutedText,
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: "#FFFFFF",
    borderColor: theme.colors.border,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  buttonTextPrimary: {
    color: theme.colors.primaryText,
  },
  buttonTextSecondary: {
    color: theme.colors.text,
  },
});
