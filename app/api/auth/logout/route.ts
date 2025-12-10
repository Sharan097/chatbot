// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { refreshTokenStore } from "@/lib/refreshTokenStore";
import { z } from "zod";

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
  email: z.string().email().optional(),
  logoutAll: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = logoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const { refreshToken, email, logoutAll } = parsed.data;

    if (logoutAll && email) {
      refreshTokenStore.revokeAllUserTokens(email);
    }

    if (refreshToken) {
      refreshTokenStore.revokeToken(refreshToken);
    }

    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.set("jwt-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
