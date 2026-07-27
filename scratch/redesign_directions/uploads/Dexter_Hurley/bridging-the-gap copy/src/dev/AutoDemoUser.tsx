import React, { useEffect } from "react";
import { useAppContext } from "../store/AppContext";

// Dev-only auto demo user. No-op outside of __DEV__.
export default function AutoDemoUser() {
  // Only run in development and when EXPO_PUBLIC_AUTO_DEMO is truthy.
  if (!__DEV__) return null;
  const autoDemoFlag = typeof process !== "undefined" ? process.env.EXPO_PUBLIC_AUTO_DEMO : undefined;
  if (!autoDemoFlag || autoDemoFlag.toLowerCase() !== "true") return null;

  try {
    const { currentUser, setCurrentUser, setIsDemoMode } = useAppContext();
    useEffect(() => {
      if (!currentUser) {
        setIsDemoMode?.(true);
        setCurrentUser({
          id: "DEMO-COUNSELOR",
          name: "Demo Counselor",
          role: "educator",
          staffRole: "counselor",
        } as any);
      }
    }, [currentUser, setCurrentUser, setIsDemoMode]);
  } catch (err) {
    // If context isn't available yet, do nothing — this component is optional.
  }

  return null;
}
