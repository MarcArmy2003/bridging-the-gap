import { User } from "../models/types";
import { DistrictProfile } from "../data/policyConfig";

export const shouldBlockStudentSelfService = (
  user: User | null,
  district: DistrictProfile
) => {
  if (!user || user.role !== "student") {
    return false;
  }
  if (user.gradeBand !== "k5") {
    return false;
  }
  return !district.allowK5StudentSelfService;
};
