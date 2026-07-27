import React from "react";

import { useAppContext } from "../store/AppContext";
import { RoleSelectScreen } from "../screens/auth/RoleSelectScreen";
import { SubmitReportScreen } from "../screens/student/SubmitReportScreen";
import { CheckInHomeScreen } from "../screens/student/CheckInHomeScreen";
import { StudentEmergencyReportScreen } from "../screens/student/StudentEmergencyReportScreen";
import { SupportResourcesHomeScreen } from "../screens/resources/SupportResourcesHomeScreen";
import { MentalHealthSupportScreen } from "../screens/resources/MentalHealthSupportScreen";
import { AbuseSafetyResourcesScreen } from "../screens/resources/AbuseSafetyResourcesScreen";
import { LocalHelpResourcesScreen } from "../screens/resources/LocalHelpResourcesScreen";
import { FacilityDetailScreen } from "../screens/resources/FacilityDetailScreen";
import { BullyingHelpScreen } from "../screens/student/BullyingHelpScreen";
import { WellBeingHelpScreen } from "../screens/student/WellBeingHelpScreen";
import { FoodHelpScreen } from "../screens/student/FoodHelpScreen";
import { WellBeingSupportScreen } from "../screens/student/WellBeingSupportScreen";
import { MentalHealthCheckInScreen } from "../screens/student/MentalHealthCheckInScreen";
import { MentalHealthConfirmationScreen } from "../screens/student/MentalHealthConfirmationScreen";
import { CaseInboxScreen } from "../screens/staff/CaseInboxScreen";
import BackToRoleButton from "../components/BackToRoleButton";
import StudentSupportWorkspace from "../screens/staff/StudentSupportWorkspace";
import MessagesHubScreen from "../screens/staff/MessagesHubScreen";
import { CaseDetailScreen } from "../screens/staff/CaseDetailScreen";
import { AuditLogScreen } from "../screens/staff/AuditLogScreen";
import { MentalHealthInboxScreen } from "../screens/staff/MentalHealthInboxScreen";
import { TeacherMessagesScreen } from "../screens/staff/TeacherMessagesScreen";
import { GuardianCaseListScreen } from "../screens/guardian/GuardianCaseListScreen";
import { GuardianOnboardingScreen } from "../screens/guardian/GuardianOnboardingScreen";
import { GuardianExpectationsScreen } from "../screens/guardian/GuardianExpectationsScreen";
import { GuardianSupportScreen } from "../screens/guardian/GuardianSupportScreen";
import { GuardianSupportConfirmationScreen } from "../screens/guardian/GuardianSupportConfirmationScreen";
import { LawEnforcementCasesScreen } from "../screens/law/LawEnforcementCasesScreen";
import { GuardianSupportInboxScreen } from "../screens/staff/GuardianSupportInboxScreen";
import { GuardianMessageTemplatesScreen } from "../screens/guardian/GuardianMessageTemplatesScreen";
import { GuardianMessageConfirmationScreen } from "../screens/guardian/GuardianMessageConfirmationScreen";
import { GuardianMessageInboxScreen } from "../screens/staff/GuardianMessageInboxScreen";
import { CounselorWorkloadScreen } from "../screens/staff/CounselorWorkloadScreen";
import { DistrictMetricsScreen } from "../screens/staff/DistrictMetricsScreen";
import { BoardPolicyScreen } from "../screens/staff/BoardPolicyScreen";
import { StaffAssistedReportScreen } from "../screens/staff/StaffAssistedReportScreen";
import { LockdownControlScreen } from "../screens/lockdown/LockdownControlScreen";
import { EmergencySafetyReportScreen } from "../screens/staff/EmergencySafetyReportScreen";
import {
  AuthStackParamList,
  GuardianStackParamList,
  LawStackParamList,
  StaffStackParamList,
  StudentStackParamList,
} from "./types";
type CreateNativeStackFn = <T extends Record<string, object | undefined>>() => {
  Navigator: React.ComponentType<any>;
  Screen: React.ComponentType<any>;
};
const { createNativeStackNavigator } = require("@react-navigation/native-stack") as {
  createNativeStackNavigator: CreateNativeStackFn;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const StudentStack = createNativeStackNavigator<StudentStackParamList>();
const StaffStack = createNativeStackNavigator<StaffStackParamList>();
const GuardianStack = createNativeStackNavigator<GuardianStackParamList>();
const LawStack = createNativeStackNavigator<LawStackParamList>();

export const AppNavigator = () => {
  const { currentUser, isDemoMode, hasSeenGuardianOnboarding } =
    useAppContext();
  const showGuardianOnboarding = isDemoMode || !hasSeenGuardianOnboarding;

  if (!currentUser) {
    return (
      <AuthStack.Navigator>
        <AuthStack.Screen
          name="RoleSelect"
          component={RoleSelectScreen}
          options={{ title: "Confidential Reporting" }}
        />
      </AuthStack.Navigator>
    );
  }

  if (currentUser.role === "student") {
    return (
      <StudentStack.Navigator screenOptions={{ headerRight: () => <BackToRoleButton /> }}>
        <StudentStack.Screen
          name="CheckInHome"
          component={CheckInHomeScreen}
          options={{ title: "Check In & Get Support" }}
        />
        <StudentStack.Screen
          name="StudentEmergencyReport"
          component={StudentEmergencyReportScreen}
          options={{ title: "Immediate Safety Emergency" }}
        />
        <StudentStack.Screen
          name="SupportResourcesHome"
          component={SupportResourcesHomeScreen}
          options={{ title: "Support & Community Resources" }}
        />
        <StudentStack.Screen
          name="MentalHealthSupport"
          component={MentalHealthSupportScreen}
          options={{ title: "Mental Health Support" }}
        />
        <StudentStack.Screen
          name="AbuseSafetyResources"
          component={AbuseSafetyResourcesScreen}
          options={{ title: "Abuse & Safety Resources" }}
        />
        <StudentStack.Screen
          name="LocalHelpResources"
          component={LocalHelpResourcesScreen}
          options={{ title: "Find Help Near You" }}
        />
        <StudentStack.Screen
          name="FacilityDetail"
          component={FacilityDetailScreen}
          options={{ title: "Facility Details" }}
        />
        <StudentStack.Screen
          name="BullyingHelp"
          component={BullyingHelpScreen}
          options={{ title: "Bullying Support" }}
        />
        <StudentStack.Screen
          name="WellBeingHelp"
          component={WellBeingHelpScreen}
          options={{ title: "Well-Being Support" }}
        />
        <StudentStack.Screen
          name="FoodHelp"
          component={FoodHelpScreen}
          options={{ title: "Food & Needs Support" }}
        />
        <StudentStack.Screen
          name="WellBeingSupport"
          component={WellBeingSupportScreen}
          options={{ title: "Well-Being & Support" }}
        />
        <StudentStack.Screen
          name="MentalHealthCheckIn"
          component={MentalHealthCheckInScreen}
          options={{ title: "Check-In" }}
        />
        <StudentStack.Screen
          name="MentalHealthConfirmation"
          component={MentalHealthConfirmationScreen}
          options={{ title: "Thank You" }}
        />
      </StudentStack.Navigator>
    );
  }

  if (currentUser.role === "guardian") {
    return (
      <GuardianStack.Navigator
        key={showGuardianOnboarding ? "guardian-onboarding" : "guardian-main"}
        initialRouteName={
          showGuardianOnboarding ? "GuardianOnboarding" : "GuardianCaseList"
        }
        screenOptions={{ headerRight: () => <BackToRoleButton /> }}
      >
        <GuardianStack.Screen
          name="GuardianOnboarding"
          component={GuardianOnboardingScreen}
          options={{ title: "Parent / Guardian Welcome" }}
        />
        <GuardianStack.Screen
          name="GuardianCaseList"
          component={GuardianCaseListScreen}
          options={{ title: "Parent / Guardian View" }}
        />
        <GuardianStack.Screen
          name="SubmitReport"
          component={SubmitReportScreen}
          options={{ title: "Report a Concern" }}
        />
        <GuardianStack.Screen
          name="GuardianExpectations"
          component={GuardianExpectationsScreen}
          options={{ title: "Parent / Guardian Expectations" }}
        />
        <GuardianStack.Screen
          name="GuardianSupport"
          component={GuardianSupportScreen}
          options={{ title: "Parent / Guardian Support" }}
        />
        <GuardianStack.Screen
          name="GuardianSupportConfirmation"
          component={GuardianSupportConfirmationScreen}
          options={{ title: "Thank You" }}
        />
        <GuardianStack.Screen
          name="GuardianMessageTemplates"
          component={GuardianMessageTemplatesScreen}
          options={{ title: "Contact School Support" }}
        />
        <GuardianStack.Screen
          name="GuardianMessageConfirmation"
          component={GuardianMessageConfirmationScreen}
          options={{ title: "Message Sent" }}
        />
        <GuardianStack.Screen
          name="SupportResourcesHome"
          component={SupportResourcesHomeScreen}
          options={{ title: "Support & Community Resources" }}
        />
        <GuardianStack.Screen
          name="MentalHealthSupport"
          component={MentalHealthSupportScreen}
          options={{ title: "Mental Health Support" }}
        />
        <GuardianStack.Screen
          name="AbuseSafetyResources"
          component={AbuseSafetyResourcesScreen}
          options={{ title: "Abuse & Safety Resources" }}
        />
        <GuardianStack.Screen
          name="LocalHelpResources"
          component={LocalHelpResourcesScreen}
          options={{ title: "Find Help Near You" }}
        />
        <GuardianStack.Screen
          name="FacilityDetail"
          component={FacilityDetailScreen}
          options={{ title: "Facility Details" }}
        />
      </GuardianStack.Navigator>
    );
  }

  if (currentUser.role === "law") {
    return (
      <LawStack.Navigator screenOptions={{ headerRight: () => <BackToRoleButton /> }}>
      <LawStack.Screen
        name="EscalatedCases"
        component={LawEnforcementCasesScreen}
        options={{ title: "SRO Case Review" }}
      />
      <LawStack.Screen
        name="LockdownControl"
        component={LockdownControlScreen}
        options={{ title: "Lockdown Notifications" }}
      />
      </LawStack.Navigator>
    );
  }

  return (
    <StaffStack.Navigator screenOptions={{ headerRight: () => <BackToRoleButton /> }}>
      <StaffStack.Screen
        name="CaseInbox"
        component={StudentSupportWorkspace}
        options={{ title: "Student Support Workspace" }}
      />
      <StaffStack.Screen
        name="MessagesHub"
        component={MessagesHubScreen}
        options={{ title: "Messages & Updates" }}
      />
      <StaffStack.Screen
        name="ReadOnlyMessages"
        component={require("../screens/shared/ReadOnlyMessagesScreen").default}
        options={{ title: "Messages" }}
      />
      <StaffStack.Screen
        name="GuidanceLibrary"
        component={require("../screens/staff/GuidanceLibraryScreen").default}
        options={{ title: "Guidance Library" }}
      />
      <StaffStack.Screen
        name="StaffAssistedReport"
        component={StaffAssistedReportScreen}
        options={{ title: "Staff-Assisted Report" }}
      />
      <StaffStack.Screen
        name="LockdownControl"
        component={LockdownControlScreen}
        options={{ title: "Lockdown Notifications" }}
      />
      <StaffStack.Screen
        name="EmergencySafetyReport"
        component={EmergencySafetyReportScreen}
        options={{ title: "Immediate Safety Concern" }}
      />
      <StaffStack.Screen
        name="SupportResourcesHome"
        component={SupportResourcesHomeScreen}
        options={{ title: "Support & Community Resources" }}
      />
      <StaffStack.Screen
        name="MentalHealthSupport"
        component={MentalHealthSupportScreen}
        options={{ title: "Mental Health Support" }}
      />
      <StaffStack.Screen
        name="AbuseSafetyResources"
        component={AbuseSafetyResourcesScreen}
        options={{ title: "Abuse & Safety Resources" }}
      />
      <StaffStack.Screen
        name="LocalHelpResources"
        component={LocalHelpResourcesScreen}
        options={{ title: "Find Help Near You" }}
      />
      <StaffStack.Screen
        name="FacilityDetail"
        component={FacilityDetailScreen}
        options={{ title: "Facility Details" }}
      />
      <StaffStack.Screen
        name="CaseDetail"
        component={CaseDetailScreen}
        options={{ title: "Case Detail" }}
      />
      <StaffStack.Screen
        name="TeacherMessages"
        component={TeacherMessagesScreen}
        options={{ title: "Messages from Counseling Team" }}
      />
      <StaffStack.Screen
        name="AuditLog"
        component={AuditLogScreen}
        options={{ title: "Audit Log" }}
      />
      <StaffStack.Screen
        name="MentalHealthInbox"
        component={MentalHealthInboxScreen}
        options={{ title: "Well-Being Check-Ins" }}
      />
      <StaffStack.Screen
        name="GuardianSupportInbox"
        component={GuardianSupportInboxScreen}
        options={{ title: "Parent / Guardian Check-Ins" }}
      />
      <StaffStack.Screen
        name="GuardianMessageInbox"
        component={GuardianMessageInboxScreen}
        options={{ title: "Parent / Guardian Messages" }}
      />
      <StaffStack.Screen
        name="CounselorWorkload"
        component={CounselorWorkloadScreen}
        options={{ title: "Teacher / Counselor Workload" }}
      />
      <StaffStack.Screen
        name="DistrictMetrics"
        component={DistrictMetricsScreen}
        options={{ title: "District Metrics" }}
      />
      <StaffStack.Screen
        name="BoardPolicy"
        component={BoardPolicyScreen}
        options={{ title: "Board Policy" }}
      />
    </StaffStack.Navigator>
  );
};
