import type { UserRole } from "@prisma/client";

export interface CredentialsInput {
  email?: string;
  password?: string;
}

export interface CredentialsUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
}

export async function authorizeCredentials(
  credentials: CredentialsInput,
  deps: {
    findUserByEmail: (email: string) => Promise<CredentialsUser | null>;
    comparePassword: (plainText: string, hash: string) => Promise<boolean>;
  }
) {
  if (!credentials.email || !credentials.password) {
    throw new Error("Missing credentials");
  }

  const user = await deps.findUserByEmail(credentials.email);
  if (!user) {
    throw new Error("User not found");
  }

  const passwordValid = await deps.comparePassword(
    credentials.password,
    user.password
  );
  if (!passwordValid) {
    throw new Error("Invalid password");
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
