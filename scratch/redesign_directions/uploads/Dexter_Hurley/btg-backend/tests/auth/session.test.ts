import { describe, expect, it } from "vitest";
import { getAuthContextFromSession } from "@/lib/auth/session";

describe("getAuthContextFromSession", () => {
  it("returns auth context for valid session shape", () => {
    const context = getAuthContextFromSession({
      user: {
        id: "user-1",
        role: "COUNSELOR",
      },
      expires: new Date(Date.now() + 60_000).toISOString(),
    } as never);

    expect(context).toEqual({ userId: "user-1", role: "COUNSELOR" });
  });

  it("returns null when id/role missing", () => {
    const context = getAuthContextFromSession({
      user: {},
      expires: new Date(Date.now() + 60_000).toISOString(),
    } as never);

    expect(context).toBeNull();
  });
});
