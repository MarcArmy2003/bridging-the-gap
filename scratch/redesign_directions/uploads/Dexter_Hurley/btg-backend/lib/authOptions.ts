import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import {
  ACCESS_TOKEN_REFRESH_BUFFER_MS,
  BTG_PROVIDER_ID,
  BtgProfile,
  getBtgProvider,
  getRequiredEnv,
  isBtgEnabled,
  linkBtgUserByEmail,
  refreshBtgAccessToken,
  validateBtgClaims,
} from "@/lib/auth/btg";
import { authorizeCredentials } from "@/lib/auth/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        return authorizeCredentials(
          {
            email: credentials?.email,
            password: credentials?.password,
          },
          {
            findUserByEmail: (email) =>
              prisma.user.findUnique({
                where: { email },
              }),
            comparePassword: bcrypt.compare,
          }
        );
      },
    }),
    ...(isBtgEnabled() ? [getBtgProvider()] : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider !== BTG_PROVIDER_ID) {
          return true;
        }

        const clientId = getRequiredEnv("BTG_OIDC_CLIENT_ID");
        const claimValidation = validateBtgClaims({
          profile: (profile || {}) as BtgProfile,
          idToken: account.id_token,
          clientId,
          expectedIssuer:
            process.env.BTG_OIDC_EXPECTED_ISSUER || process.env.BTG_OIDC_ISSUER,
          expectedAudience: process.env.BTG_OIDC_EXPECTED_AUDIENCE,
          requireEmailVerified:
            process.env.BTG_REQUIRE_EMAIL_VERIFIED !== "false",
        });

        if (!claimValidation.ok) {
          console.error("BTG claim validation failed", {
            error: claimValidation.error,
          });
          return `/auth-test?error=${claimValidation.error}`;
        }

        const dbUser = await linkBtgUserByEmail(
          claimValidation.email,
          (email: string) =>
            prisma.user.findUnique({
              where: { email },
              select: { id: true, email: true, role: true },
            })
        );

        if (!dbUser) {
          console.error("BTG user not linked in Prisma", {
            email: claimValidation.email,
          });
          return "/auth-test?error=BTG_USER_NOT_LINKED";
        }

        user.id = dbUser.id;
        user.email = dbUser.email;
        user.role = dbUser.role;
        return true;
      } catch (error) {
        console.error("BTG signIn callback failure:", error);
        return "/auth-test?error=BTG_CALLBACK_FAILURE";
      }
    },
    async jwt({ token, user, account, profile }) {
      if (user && "id" in user && "role" in user) {
        token.id = user.id;
        token.role = user.role;
        token.authProvider =
          account?.provider === BTG_PROVIDER_ID ? BTG_PROVIDER_ID : "credentials";
      }

      if (account?.provider === BTG_PROVIDER_ID) {
        const claimValidation = validateBtgClaims({
          profile: (profile || {}) as BtgProfile,
          idToken: account.id_token,
          clientId: getRequiredEnv("BTG_OIDC_CLIENT_ID"),
          expectedIssuer:
            process.env.BTG_OIDC_EXPECTED_ISSUER || process.env.BTG_OIDC_ISSUER,
          expectedAudience: process.env.BTG_OIDC_EXPECTED_AUDIENCE,
          requireEmailVerified:
            process.env.BTG_REQUIRE_EMAIL_VERIFIED !== "false",
        });

        if (!claimValidation.ok) {
          return {
            ...token,
            authError: claimValidation.error,
            btgNeedsReauth: true,
            exp: Math.floor(Date.now() / 1000) - 1,
          };
        }

        token.authProvider = BTG_PROVIDER_ID;
        token.btgSubject = claimValidation.subject;
        token.btgTenant = claimValidation.tenant;
        token.btgRoles = claimValidation.roles;
        token.btgAccessToken = account.access_token;
        token.btgRefreshToken = account.refresh_token;
        token.btgIdToken = account.id_token;
        token.btgTokenType = account.token_type || "Bearer";
        token.btgAccessTokenExpiresAt = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
        token.authError = undefined;
      }

      if (
        token.authProvider === BTG_PROVIDER_ID &&
        typeof token.btgAccessTokenExpiresAt === "number" &&
        Date.now() > token.btgAccessTokenExpiresAt - ACCESS_TOKEN_REFRESH_BUFFER_MS
      ) {
        token = await refreshBtgAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      if (token.btgNeedsReauth) {
        session.authError = token.authError || "REAUTH_REQUIRED";
        return session;
      }

      if (!token.id || !token.role) {
        session.authError = token.authError || "REAUTH_REQUIRED";
        return session;
      }

      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.authProvider = token.authProvider;
      }

      session.authError = token.authError;

      if (token.authProvider === BTG_PROVIDER_ID) {
        session.btg = {
          subject: token.btgSubject,
          tenant: token.btgTenant,
          roles: token.btgRoles,
          tokenType: token.btgTokenType,
          accessTokenExpiresAt:
            typeof token.btgAccessTokenExpiresAt === "number"
              ? token.btgAccessTokenExpiresAt
              : undefined,
        };
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    },
  },
  events: {
    async signOut(message) {
      if (message.token?.authProvider === BTG_PROVIDER_ID) {
        console.info("BTG session signed out locally");
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
