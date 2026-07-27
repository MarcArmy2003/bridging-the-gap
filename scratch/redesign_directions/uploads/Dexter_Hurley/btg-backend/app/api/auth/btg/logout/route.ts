import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { buildBtgLogoutUrl } from "@/lib/auth/logout";

export async function GET(req: NextRequest) {
  const nextAuthUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;
  const fallback = `${nextAuthUrl}/auth-test`;

  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token?.authProvider !== "btg") {
      return NextResponse.redirect(fallback);
    }

    const logoutUrl = buildBtgLogoutUrl(token.btgIdToken);
    return NextResponse.redirect(logoutUrl || fallback);
  } catch (error) {
    console.error("BTG logout callback failure:", error);
    return NextResponse.redirect(`${fallback}?error=BTG_LOGOUT_FAILED`);
  }
}
