import { describe, expect, it } from "vitest";
import { buildBtgLogoutUrl } from "@/lib/auth/logout";

describe("buildBtgLogoutUrl", () => {
  it("builds logout URL with redirect and id_token_hint", () => {
    process.env.BTG_OIDC_LOGOUT_URL = "https://issuer.example.com/logout";
    process.env.BTG_OIDC_POST_LOGOUT_REDIRECT_URI =
      "http://localhost:3000/auth-test";

    const url = buildBtgLogoutUrl("id-token-1");
    expect(url).toBe(
      "https://issuer.example.com/logout?post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth-test&id_token_hint=id-token-1"
    );
  });
});
