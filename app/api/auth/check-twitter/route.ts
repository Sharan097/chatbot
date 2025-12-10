// app/api/auth/check-twitter/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("[API] Checking Twitter credentials...");

    // Check if Twitter credentials exist in environment variables
    const twitterClientId = process.env.TWITTER_CLIENT_ID;
    const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;

    console.log("[API] TWITTER_CLIENT_ID exists:", !!twitterClientId);
    console.log("[API] TWITTER_CLIENT_SECRET exists:", !!twitterClientSecret);

    // Validate credentials
    if (!twitterClientId || !twitterClientSecret) {
      console.error("[API] Twitter credentials missing");
      return NextResponse.json(
        {
          success: false,
          error: "Failed to authenticate. Check Twitter Client ID and Secret in .env.local",
        },
        { status: 400 }
      );
    }

    // Check if credentials are not just empty strings
    if (twitterClientId.trim() === "" || twitterClientSecret.trim() === "") {
      console.error("[API] Twitter credentials are empty");
      return NextResponse.json(
        {
          success: false,
          error: "Twitter credentials are empty. Please add valid credentials to .env.local",
        },
        { status: 400 }
      );
    }

    // Success - credentials exist
    console.log("[API] Twitter credentials validated successfully");
    return NextResponse.json({
      success: true,
      message: "Twitter authorization successful",
    });

  } catch (error) {
    console.error("[API] Error checking Twitter credentials:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during authorization",
      },
      { status: 500 }
    );
  }
}
