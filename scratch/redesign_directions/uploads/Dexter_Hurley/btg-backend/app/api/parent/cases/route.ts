import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, verifyMobileToken } from "@/lib/mobileAuth";
import { getVisibleCases } from "@/lib/permissions";
import { assertParentHasStudentAccess, FERPAViolationError } from "@/lib/assertions";
import { prisma } from "@/lib/prisma";

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

    const cases = await getVisibleCases({
      userId: payload.sub,
      role: payload.role,
    });

    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Mobile cases error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  const token = getBearerToken(req.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = verifyMobileToken(token);

    if (payload.role !== "PARENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { studentId, title, description } = await req.json();

    if (!studentId || !title || !description) {
      return NextResponse.json(
        { error: "studentId, title, and description are required" },
        { status: 400 }
      );
    }

    await assertParentHasStudentAccess(payload.sub, studentId);

    const newCase = await prisma.case.create({
      data: {
        studentId,
        title,
        description,
        status: "OPEN",
        severity: "MEDIUM",
        isConfidential: false,
      },
    });

    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch (error) {
    if (error instanceof FERPAViolationError) {
      return NextResponse.json(
        { error: "Forbidden - FERPA violation prevented" },
        { status: 403 }
      );
    }

    console.error("Mobile create case error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}