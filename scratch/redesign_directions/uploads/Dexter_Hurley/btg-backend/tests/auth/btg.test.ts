import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JWT } from "next-auth/jwt";
import {
  linkBtgUserByEmail,
  refreshBtgAccessToken,
  validateBtgClaims,
} from "@/lib/auth/btg";

function makeUnsignedJwt(payload: object) {
  const encoded = Buffer.from(JSON.stringify(payload))
    .toString("base64url")
    .replace(/=/g, "");
  return `header.${encoded}.sig`;
}

describe("validateBtgClaims", () => {
  it("accepts valid claims with issuer/audience match", () => {
    const idToken = makeUnsignedJwt({
      iss: "https://issuer.example.com",
      aud: "client-123",
      sub: "sub-1",
      email: "test@example.com",
      email_verified: true,
    });

    const result = validateBtgClaims({
      profile: { sub: "sub-1", email: "test@example.com" },
      idToken,
      clientId: "client-123",
      expectedIssuer: "https://issuer.example.com",
    });

    expect(result.ok).toBe(true);
  });

  it("rejects unverified email when required", () => {
    const result = validateBtgClaims({
      profile: {
        sub: "sub-1",
        email: "test@example.com",
        email_verified: false,
      },
      clientId: "client-123",
      requireEmailVerified: true,
    });

    expect(result).toEqual({ ok: false, error: "BTG_EMAIL_NOT_VERIFIED" });
  });
});

describe("refreshBtgAccessToken", () => {
  beforeEach(() => {
    process.env.BTG_OIDC_CLIENT_ID = "client-id";
    process.env.BTG_OIDC_CLIENT_SECRET = "secret";
    process.env.BTG_OIDC_TOKEN_URL = "https://issuer.example.com/token";
  });

  it("refreshes access token successfully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: "new-access",
          refresh_token: "new-refresh",
          token_type: "Bearer",
          expires_in: 1200,
        }),
      })
    );

    const token = (await refreshBtgAccessToken({
      id: "user-1",
      role: "ADMIN",
      btgRefreshToken: "refresh-1",
    } as JWT)) as JWT;

    expect(token.btgAccessToken).toBe("new-access");
    expect(token.btgRefreshToken).toBe("new-refresh");
    expect(token.btgNeedsReauth).toBeUndefined();
  });

  it("forces re-auth when refresh fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => "invalid_grant",
      })
    );

    const token = (await refreshBtgAccessToken({
      id: "user-1",
      role: "ADMIN",
      btgRefreshToken: "refresh-1",
    } as JWT)) as JWT;

    expect(token.authError).toBe("BTG_TOKEN_REFRESH_FAILED");
    expect(token.btgNeedsReauth).toBe(true);
    expect(typeof token.exp).toBe("number");
  });
});

describe("linkBtgUserByEmail", () => {
  it("normalizes email to lowercase before lookup", async () => {
    const finder = vi.fn().mockResolvedValue({
      id: "u1",
      email: "test@example.com",
      role: "ADMIN",
    });

    await linkBtgUserByEmail("Test@Example.com", finder);
    expect(finder).toHaveBeenCalledWith("test@example.com");
  });
});
