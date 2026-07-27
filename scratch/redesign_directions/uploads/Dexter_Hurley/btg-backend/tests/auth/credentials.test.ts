import { describe, expect, it, vi } from "vitest";
import { authorizeCredentials } from "@/lib/auth/credentials";

describe("authorizeCredentials", () => {
  it("returns mapped user for valid credentials", async () => {
    const result = await authorizeCredentials(
      { email: "a@example.com", password: "secret" },
      {
        findUserByEmail: vi.fn().mockResolvedValue({
          id: "u1",
          email: "a@example.com",
          password: "hashed",
          role: "ADMIN",
        }),
        comparePassword: vi.fn().mockResolvedValue(true),
      }
    );

    expect(result).toEqual({
      id: "u1",
      email: "a@example.com",
      role: "ADMIN",
    });
  });

  it("throws for invalid password", async () => {
    await expect(
      authorizeCredentials(
        { email: "a@example.com", password: "bad" },
        {
          findUserByEmail: vi.fn().mockResolvedValue({
            id: "u1",
            email: "a@example.com",
            password: "hashed",
            role: "ADMIN",
          }),
          comparePassword: vi.fn().mockResolvedValue(false),
        }
      )
    ).rejects.toThrow("Invalid password");
  });
});
