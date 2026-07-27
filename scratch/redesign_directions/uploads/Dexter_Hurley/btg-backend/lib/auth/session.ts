import type { UserRole } from "@prisma/client";
import type { Session } from "next-auth";

export interface AuthContext {
  userId: string;
  role: UserRole;
}

const VALID_ROLES = new Set<UserRole>(["PARENT", "COUNSELOR", "ADMIN", "SRO"]);

export function getAuthContextFromSession(
  session: Session | null
): AuthContext | null {
  if (!session?.user) return null;

  const { id, role } = session.user as { id?: string; role?: UserRole };
  if (!id || !role || !VALID_ROLES.has(role)) {
    return null;
  }

  return { userId: id, role };
}
