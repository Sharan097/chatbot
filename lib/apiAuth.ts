// lib/apiAuth.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";

export async function requireAuth(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[API AUTH] No authorization header');
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Unauthorized User, please Login once again",
          code: "UNAUTHORIZED"
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    
    // Verify token
    const payload = await verifyJWT(token);
    
    if (!payload) {
      console.log('[API AUTH] Invalid or expired token');
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Unauthorized User, please Login once again",
          code: "INVALID_TOKEN"
        },
        { status: 401 }
      );
    }

    console.log('[API AUTH] User authenticated:', payload.email);
    
    // Return user data to use in API
    return { user: payload };

  } catch (error) {
    console.error('[API AUTH] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        message: "Unauthorized User, please Login once again",
        code: "AUTH_ERROR"
      },
      { status: 401 }
    );
  }
}
