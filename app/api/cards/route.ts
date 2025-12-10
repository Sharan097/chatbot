// app/api/cards/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
  // Protect this API with auth
  const authResult = await requireAuth(request);
  
  // If auth failed, return the error response
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  console.log('📋 [CARDS API] User:', user.email);

  // Return cards data
  return NextResponse.json(
    {
      success: true,
      data: {
        cards: [
          { id: 1, title: 'Social Media Engine', hasAccess: user.hasAccess },
          { id: 2, title: 'Boarding Pass', hasAccess: true },
          { id: 3, title: 'AI Diagnostics', hasAccess: user.hasAccess },
          { id: 4, title: 'Concert Tickets', hasAccess: user.hasAccess },
          { id: 5, title: 'Flight Tickets', hasAccess: user.hasAccess },
          { id: 6, title: 'Match Tickets', hasAccess: user.hasAccess },
        ]
      }
    },
    { status: 200 }
  );
}
