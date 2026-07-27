import { User, UserRole } from "../models/types";

export const requireRole = (
  allowedRoles: UserRole[],
  user: User | null
): boolean => {
  if (!user) {
    return false;
  }
  return allowedRoles.includes(user.role);
};
