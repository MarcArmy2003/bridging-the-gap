import type { UserRole } from "@prisma/client";
import type { OAuthConfig } from "next-auth/providers/oauth";
import type { JWT } from "next-auth/jwt";

export type BtgProfile = {
  sub?: string;
  email?: string;
  email_verified?: boolean | string | number;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  role?: string;
  roles?: string[] | string;
  tenant?: string;
  tenant_id?: string;
};

export const BTG_PROVIDER_ID = "btg";
export const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60_000;

type IdTokenClaims = {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  email?: string;
  email_verified?: boolean | string | number;
};

function decodeJwtPayload(token: string): IdTokenClaims | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as IdTokenClaims;
  } catch {
    return null;
  }
}

function normalizeBool(value: boolean | string | number | undefined) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  if (typeof value === "number") return value === 1;
  return undefined;
}

export function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function isBtgEnabled() {
  return process.env.ENABLE_BTG_AUTH === "true";
}

export function getBtgProvider(): OAuthConfig<BtgProfile> {
  const clientId = getRequiredEnv("BTG_OIDC_CLIENT_ID");
  const clientSecret = getRequiredEnv("BTG_OIDC_CLIENT_SECRET");
  const scope =
    process.env.BTG_OIDC_SCOPE || "openid profile email offline_access";
  const wellKnown = process.env.BTG_OIDC_WELL_KNOWN;
  const issuer = process.env.BTG_OIDC_ISSUER;
  const authorizationUrl = process.env.BTG_OIDC_AUTHORIZATION_URL;
  const tokenUrl = process.env.BTG_OIDC_TOKEN_URL;
  const userInfoUrl = process.env.BTG_OIDC_USERINFO_URL;

  if (!wellKnown && !issuer) {
    throw new Error(
      "BTG provider requires BTG_OIDC_WELL_KNOWN or BTG_OIDC_ISSUER"
    );
  }

  if (!wellKnown && (!authorizationUrl || !tokenUrl || !userInfoUrl)) {
    throw new Error(
      "BTG provider requires explicit authorization/token/userinfo endpoints when well-known discovery is not used"
    );
  }

  return {
    id: BTG_PROVIDER_ID,
    name: "BTG",
    type: "oauth",
    clientId,
    clientSecret,
    issuer,
    wellKnown,
    checks: ["pkce", "state"],
    idToken: true,
    authorization: authorizationUrl
      ? {
          url: authorizationUrl,
          params: { scope },
        }
      : { params: { scope } },
    token: tokenUrl ? { url: tokenUrl } : undefined,
    userinfo: userInfoUrl ? { url: userInfoUrl } : undefined,
    profile(profile) {
      const name =
        profile.name ||
        profile.preferred_username ||
        [profile.given_name, profile.family_name].filter(Boolean).join(" ") ||
        profile.email ||
        profile.sub;

      return {
        id: profile.sub || "",
        email: profile.email || "",
        name: name || "",
      };
    },
  };
}

export function validateBtgClaims(args: {
  profile: BtgProfile;
  idToken?: string;
  clientId: string;
  expectedIssuer?: string;
  expectedAudience?: string;
  requireEmailVerified?: boolean;
}) {
  const { profile, idToken, clientId, expectedIssuer, expectedAudience } = args;
  const requireEmailVerified = args.requireEmailVerified ?? true;
  const claims = idToken ? decodeJwtPayload(idToken) : null;

  const subject = profile.sub ?? claims?.sub;
  const email = profile.email?.toLowerCase() ?? claims?.email?.toLowerCase();
  if (!subject || !email) {
    return { ok: false as const, error: "BTG_MISSING_CLAIMS" };
  }

  if (requireEmailVerified) {
    const profileVerified = normalizeBool(profile.email_verified);
    const claimsVerified = normalizeBool(claims?.email_verified);
    const emailVerified = profileVerified ?? claimsVerified;
    if (emailVerified === false) {
      return { ok: false as const, error: "BTG_EMAIL_NOT_VERIFIED" };
    }
  }

  if (claims?.iss && expectedIssuer && claims.iss !== expectedIssuer) {
    return { ok: false as const, error: "BTG_INVALID_ISSUER" };
  }

  if (claims?.aud) {
    const expectedAud = expectedAudience || clientId;
    const audList = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (expectedAud && !audList.includes(expectedAud)) {
      return { ok: false as const, error: "BTG_INVALID_AUDIENCE" };
    }
  }

  return {
    ok: true as const,
    subject,
    email,
    tenant: profile.tenant || profile.tenant_id,
    roles: Array.isArray(profile.roles)
      ? profile.roles
      : profile.roles
        ? [profile.roles]
        : profile.role
          ? [profile.role]
          : [],
  };
}

export async function linkBtgUserByEmail(
  email: string,
  finder: (email: string) => Promise<{ id: string; email: string; role: UserRole } | null>
) {
  return finder(email.toLowerCase());
}

export async function refreshBtgAccessToken(token: JWT) {
  const refreshToken = token.btgRefreshToken;
  if (!refreshToken) {
    return {
      ...token,
      authError: "BTG_REFRESH_TOKEN_MISSING",
      btgNeedsReauth: true,
      exp: Math.floor(Date.now() / 1000) - 1,
    };
  }

  const tokenEndpoint = process.env.BTG_OIDC_TOKEN_URL;
  if (!tokenEndpoint) {
    return {
      ...token,
      authError: "BTG_TOKEN_ENDPOINT_MISSING",
      btgNeedsReauth: true,
      exp: Math.floor(Date.now() / 1000) - 1,
    };
  }

  try {
    const clientId = getRequiredEnv("BTG_OIDC_CLIENT_ID");
    const clientSecret = getRequiredEnv("BTG_OIDC_CLIENT_SECRET");

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("BTG refresh failed:", response.status, body);
      return {
        ...token,
        authError: "BTG_TOKEN_REFRESH_FAILED",
        btgNeedsReauth: true,
        exp: Math.floor(Date.now() / 1000) - 1,
      };
    }

    const refreshed = (await response.json()) as {
      access_token: string;
      expires_in?: number;
      refresh_token?: string;
      id_token?: string;
      token_type?: string;
    };

    return {
      ...token,
      btgAccessToken: refreshed.access_token,
      btgIdToken: refreshed.id_token ?? token.btgIdToken,
      btgTokenType: refreshed.token_type ?? token.btgTokenType ?? "Bearer",
      btgAccessTokenExpiresAt: Date.now() + (refreshed.expires_in ?? 3600) * 1000,
      btgRefreshToken: refreshed.refresh_token ?? refreshToken,
      authError: undefined,
      btgNeedsReauth: undefined,
    };
  } catch (error) {
    console.error("BTG refresh callback failure:", error);
    return {
      ...token,
      authError: "BTG_REFRESH_CALLBACK_FAILURE",
      btgNeedsReauth: true,
      exp: Math.floor(Date.now() / 1000) - 1,
    };
  }
}
