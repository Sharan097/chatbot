import { NextRequest, NextResponse } from "next/server";
import { userStore } from "@/lib/userStore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification token is required",
          code: "MISSING_TOKEN",
        },
        { status: 400 }
      );
    }

    const verifiedUser = userStore.verifyUser(token);

    if (!verifiedUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid or expired verification token. The link may have expired (10 min limit) or been used already.",
          code: "INVALID_TOKEN",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your email has been verified successfully!",
        code: "VERIFICATION_SUCCESS",
        user: {
          id: verifiedUser.email,
          email: verifiedUser.email,
          name: verifiedUser.name,
          isVerified: verifiedUser.isVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify email due to server error",
        code: "VERIFICATION_ERROR",
      },
      { status: 500 }
    );
  }
}

// Block other methods
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "Method not allowed. Use GET with token query parameter.",
      code: "METHOD_NOT_ALLOWED",
    },
    { status: 405 }
  );
}
