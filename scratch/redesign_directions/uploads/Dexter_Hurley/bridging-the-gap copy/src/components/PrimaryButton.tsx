import React from "react";
import { Pressable, StyleSheet, Text, StyleProp, ViewStyle } from "react-native";
import { theme } from "./theme";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  style,
  disabled,
}) => {
  const backgroundStyle =
    variant === "primary"
      ? styles.primary
      : variant === "secondary"
      ? styles.secondary
      : styles.ghost;

  const textStyle =
    variant === "primary"
      ? styles.primaryText
      : variant === "secondary"
      ? styles.secondaryText
      : styles.ghostText;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        backgroundStyle,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, textStyle]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.subtleBackground,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: theme.colors.primaryText,
  },
  secondaryText: {
    color: theme.colors.primary,
  },
  ghostText: {
    color: theme.colors.text,
  },
});
