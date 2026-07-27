import React, { createContext, useContext, useMemo, useState } from "react";
import { StudentGradeBand, User } from "../models/types";
import {
  DistrictProfile,
  StatePolicyProfile,
  districtProfiles,
  stateProfiles,
} from "../data/policyConfig";

interface AppContextValue {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  hasSeenGuardianOnboarding: boolean;
  setHasSeenGuardianOnboarding: (value: boolean) => void;
  isDemoMode: boolean;
  setIsDemoMode: (value: boolean) => void;
  isTrainingMode: boolean;
  setIsTrainingMode: (value: boolean) => void;
  activeTrainingScenarioId: string | null;
  setActiveTrainingScenarioId: (value: string | null) => void;
  isKioskMode: boolean;
  setIsKioskMode: (value: boolean) => void;
  stateProfile: StatePolicyProfile;
  setStateProfile: (profile: StatePolicyProfile) => void;
  districtProfile: DistrictProfile;
  setDistrictProfile: (profile: DistrictProfile) => void;
  demoStudentGradeBand: StudentGradeBand;
  setDemoStudentGradeBand: (value: StudentGradeBand) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasSeenGuardianOnboarding, setHasSeenGuardianOnboarding] =
    useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [activeTrainingScenarioId, setActiveTrainingScenarioId] =
    useState<string | null>(null);
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [stateProfile, setStateProfile] = useState(stateProfiles[0]);
  const [districtProfile, setDistrictProfile] = useState(districtProfiles[0]);
  const [demoStudentGradeBand, setDemoStudentGradeBand] =
    useState<StudentGradeBand>("6_8");

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      hasSeenGuardianOnboarding,
      setHasSeenGuardianOnboarding,
      isDemoMode,
      setIsDemoMode,
      isTrainingMode,
      setIsTrainingMode,
      activeTrainingScenarioId,
      setActiveTrainingScenarioId,
      isKioskMode,
      setIsKioskMode,
      stateProfile,
      setStateProfile,
      districtProfile,
      setDistrictProfile,
      demoStudentGradeBand,
      setDemoStudentGradeBand,
    }),
    [
      currentUser,
      hasSeenGuardianOnboarding,
      isDemoMode,
      isTrainingMode,
      activeTrainingScenarioId,
      isKioskMode,
      stateProfile,
      districtProfile,
      demoStudentGradeBand,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
