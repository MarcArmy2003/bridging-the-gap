import React from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";

type Props = { children?: React.ReactNode };

class DevErrorBoundaryInner extends React.Component<
  Props,
  { hasError: boolean; error?: Error | null; info?: string | null }
> {
  state = { hasError: false, error: null as Error | null, info: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("DevErrorBoundary caught:", error, info);
    this.setState({ hasError: true, error, info: info?.componentStack ?? null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>App Render Error (dev)</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <Text style={styles.stack}>{this.state.info}</Text>
        </ScrollView>
      );
    }

    return this.props.children as React.ReactElement | null;
  }
}

export default function DevErrorBoundary({ children }: Props) {
  const enabled = __DEV__ && process.env.EXPO_PUBLIC_DEV_ERROR_BOUNDARY === "true";
  if (!enabled) return children as React.ReactElement | null;
  return <DevErrorBoundaryInner>{children}</DevErrorBoundaryInner>;
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  message: { marginBottom: 8 },
  stack: { color: "#666" },
});
