import { beforeEach, describe, expect, it, vi } from "vitest";

const getServerSessionMock = vi.fn();
const getVisibleStudentsMock = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/permissions", () => ({
  getVisibleStudents: getVisibleStudentsMock,
}));

describe("GET /api/students", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 401 when session is missing required auth context", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { email: "missing@id.example" },
    });

    const { GET } = await import("@/app/api/students/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns students for authorized session", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "u1", role: "ADMIN" },
    });
    getVisibleStudentsMock.mockResolvedValue([{ id: "s1" }]);

    const { GET } = await import("@/app/api/students/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ students: [{ id: "s1" }] });
  });
});
