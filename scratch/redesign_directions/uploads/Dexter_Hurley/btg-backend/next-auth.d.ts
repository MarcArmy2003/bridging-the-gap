import { UserRole } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      authProvider?: "credentials" | "btg";
    } & DefaultSession["user"];
    authError?: string;
    btg?: {
      subject?: string;
      tenant?: string;
      roles?: string[];
      tokenType?: string;
      accessTokenExpiresAt?: number;
    };
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    authProvider?: "credentials" | "btg";
    authError?: string;
    btgSubject?: string;
    btgTenant?: string;
    btgRoles?: string[];
    btgAccessToken?: string;
    btgRefreshToken?: string;
    btgIdToken?: string;
    btgTokenType?: string;
    btgAccessTokenExpiresAt?: number;
    btgNeedsReauth?: boolean;
  }
}

export {};
