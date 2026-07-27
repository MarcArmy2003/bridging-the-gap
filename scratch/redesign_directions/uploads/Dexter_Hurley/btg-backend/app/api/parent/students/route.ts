import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, verifyMobileToken } from "@/lib/mobileAuth";
import { getVisibleStudents } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const token = getBearerToken(req.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = verifyMobileToken(token);

    if (payload.role !== "PARENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const students = await getVisibleStudents({
      userId: payload.sub,
      role: payload.role,
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Mobile students error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}