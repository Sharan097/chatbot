// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { refreshTokenStore } from "@/lib/refreshTokenStore";
import { signAccessToken } from "@/lib/jwt";
import { userStore } from "@/lib/userStore";
import { z } from "zod";

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
  accessToken: z.string().min(1, "Access token is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = refreshSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const { refreshToken } = validation.data;
    const tokenData = refreshTokenStore.validateToken(refreshToken);

    if (!tokenData.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid refresh token",
          code: "INVALID_REFRESH_TOKEN",
        },
        { status: 401 }
      );
    }

    const user = userStore.getUserByEmail(tokenData.userEmail!);

    if (!user) {
      refreshTokenStore.revokeToken(refreshToken);
      return NextResponse.json(
        { success: false, error: "User not found", code: "USER_NOT_FOUND" },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { success: false, error: "User not verified", code: "USER_NOT_VERIFIED" },
        { status: 403 }
      );
    }

    if ("isLocked" in user && user.isLocked) {
      refreshTokenStore.revokeToken(refreshToken);
      return NextResponse.json(
        { success: false, error: "Account locked", code: "ACCOUNT_LOCKED" },
        { status: 403 }
      );
    }

    const newAccessToken = await signAccessToken({
      email: user.email,
      name: user.name,
      role: user.role,
      hasAccess: user.hasAccess ?? false,
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const response = NextResponse.json(
      {
        success: true,
        accessToken: newAccessToken,
        expiresAt: expiresAt.toISOString(),
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
          hasAccess: user.hasAccess ?? false,
        },
      },
      { status: 200 }
    );

    response.cookies.set("jwt-session", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Token refresh failed", code: "TOKEN_REFRESH_FAILED" },
      { status: 500 }
    );
  }
}
