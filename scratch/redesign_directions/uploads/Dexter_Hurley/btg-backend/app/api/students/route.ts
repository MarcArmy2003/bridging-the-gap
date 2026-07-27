import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getAuthContextFromSession } from "@/lib/auth/session";
import { getVisibleStudents } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  const authContext = getAuthContextFromSession(session);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const students = await getVisibleStudents({
      userId: authContext.userId,
      role: authContext.role,
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
