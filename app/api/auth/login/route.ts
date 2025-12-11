import { NextRequest, NextResponse } from "next/server";
import { userStore } from "@/lib/userStore";
import { signAccessToken } from "@/lib/jwt";
import { refreshTokenStore } from "@/lib/refreshTokenStore";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    const user = userStore.getUser(normalizedEmail, password);

    if (!user) {
      const existingUser = userStore.getUserByEmail(normalizedEmail);

      if (existingUser && !existingUser.isVerified) {
        return NextResponse.json(
          {
            success: false,
            error: "Email not verified",
            code: "EMAIL_NOT_VERIFIED",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    if ("isLocked" in user && user.isLocked) {
      return NextResponse.json(
        { success: false, error: "Account locked", code: "ACCOUNT_LOCKED" },
        { status: 403 }
      );
    }

    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasAccess: user.hasAccess ?? false,
    });

    const { token: refreshToken, expiresAt } = refreshTokenStore.generateToken(
      user.email,
      30
    );

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            hasAccess: user.hasAccess ?? false,
          },
          accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          refreshExpiresAt: expiresAt.toISOString(),
        },
      },
      { status: 200 }
    );

    response.cookies.set("jwt-session", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: "Internal error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
