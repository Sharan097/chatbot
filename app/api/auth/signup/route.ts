import { NextRequest, NextResponse } from "next/server";
import { userStore } from "@/lib/userStore";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input data",
          code: "INVALID_INPUT",
          errors: validation.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = userStore.getUserByEmail(normalizedEmail);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists",
          code: "USER_EXISTS",
        },
        { status: 409 }
      );
    }

    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    try {
      userStore.addUser({
        email: normalizedEmail,
        password, // In production, hash this password!
        name: name || normalizedEmail.split("@")[0],
        role: "user",
        isVerified: false,
        hasAccess: false,
        verificationToken,
        verificationTokenExpiry: tokenExpiry,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to create user:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create user account",
          code: "USER_CREATE_ERROR",
        },
        { status: 500 }
      );
    }

    try {
      await sendVerificationEmail(normalizedEmail, verificationToken, name);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);

      userStore.updateUser(normalizedEmail, { isLocked: true });

      return NextResponse.json(
        {
          success: false,
          message: "Failed to send verification email. Please try again.",
          code: "EMAIL_SEND_FAILED",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "User registered successfully. Please check your email to verify your account.",
        code: "REGISTRATION_SUCCESS",
        userId: normalizedEmail,
        email: normalizedEmail,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[SIGNUP] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during registration",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

// GET method for testing
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: "Use POST method to register",
      code: "METHOD_NOT_ALLOWED",
    },
    { status: 405 }
  );
}
