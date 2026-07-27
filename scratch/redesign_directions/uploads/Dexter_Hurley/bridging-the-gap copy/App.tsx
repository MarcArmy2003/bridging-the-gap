import { NavigationContainer } from "@react-navigation/native";
import navigationRef from "./src/navigation/RootNavigation";
import { AppProvider } from "./src/store/AppContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import DevErrorBoundary from "./src/components/DevErrorBoundary";
import AutoDemoUser from "./src/dev/AutoDemoUser";

export default function App() {
  return (
    <AppProvider>
      <DevErrorBoundary>
        <NavigationContainer ref={navigationRef}>
          {/* Dev helper: auto-set a demo user so navigator renders a known branch */}
          <AutoDemoUser />
          {/* Dev smoke runner: gated via EXPO_PUBLIC_RUN_SMOKE=true in dev */}
          {__DEV__ && (process.env.EXPO_PUBLIC_RUN_SMOKE || "").toLowerCase() === "true" ? (
            // Lazy require so this module is dev-only and doesn't affect production bundle
            require("./src/dev/SmokeTestRunner").default()
          ) : null}
          <AppNavigator />
        </NavigationContainer>
      </DevErrorBoundary>
    </AppProvider>
  );
}

// AutoDemoUser is now implemented in src/dev/AutoDemoUser.tsx (dev-only)
