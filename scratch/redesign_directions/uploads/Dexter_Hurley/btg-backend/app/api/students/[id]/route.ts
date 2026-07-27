import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getAuthContextFromSession } from "@/lib/auth/session";
import { getStudentWithAccess, FERPAViolationError } from "@/lib/assertions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const authContext = getAuthContextFromSession(session);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Layer 3: Explicit assertion - throws FERPAViolationError on unauthorized access
    const student = await getStudentWithAccess(
      authContext.userId,
      authContext.role,
      id
    );

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    if (error instanceof FERPAViolationError) {
      console.warn("FERPA violation prevented:", error.message);
      return NextResponse.json(
        { error: "Forbidden - FERPA violation prevented" },
        { status: 403 }
      );
    }
    
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
