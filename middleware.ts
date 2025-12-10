import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ===== STEP 1: Critical Exceptions ===== */

  // Allow all auth + webhook routes through
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/webhook")) {
    return NextResponse.next();
  }

  // Static assets & Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  /* ===== STEP 2: Check Authentication ===== */

  const nextAuthToken =
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value;

  const jwtToken = request.cookies.get("jwt-session")?.value;

  let hasValidJwtSession = false;

  if (jwtToken) {
    const payload = await verifyJWT(jwtToken);
    if (payload) {
      hasValidJwtSession = true;
    } else {
      const response = NextResponse.next();
      response.cookies.delete("jwt-session");
    }
  }

  const isAuthenticated = !!nextAuthToken || hasValidJwtSession;

  /* ===== STEP 3: Handle Auth Pages ===== */

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/verify" ||
    pathname.startsWith("/auth/verify");

  if (isAuthPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    
    return NextResponse.next();
  }

  /* ===== STEP 4: Protect All Other Routes ===== */

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    
    if (pathname !== "/" && !pathname.startsWith("/api")) {
      loginUrl.searchParams.set("error", "unauthorized");
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    
    return NextResponse.redirect(loginUrl);
  }

  /* ===== STEP 5: Allow Authenticated Access ===== */

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};







// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { verifyJWT } from "@/lib/jwt";

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   console.log("🔒 [MIDDLEWARE] Request:", pathname);

//   /* ===== STEP 1: Critical Exceptions ===== */

//   // Allow all auth + webhook routes through
//   if (pathname.startsWith("/api/auth")) {
//     console.log("✅ [MIDDLEWARE] Auth API bypass");
//     return NextResponse.next();
//   }

//   if (pathname.startsWith("/api/webhook")) {
//     console.log("✅ [MIDDLEWARE] Webhook bypass");
//     return NextResponse.next();
//   }

//   // Static assets & Next.js internals
//   if (
//     pathname.startsWith("/_next") ||
//     pathname === "/favicon.ico" ||
//     /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/.test(pathname)
//   ) {
//     return NextResponse.next();
//   }

//   /* ===== STEP 2: Check Authentication ===== */

//   const nextAuthToken =
//     request.cookies.get("__Secure-next-auth.session-token")?.value ||
//     request.cookies.get("next-auth.session-token")?.value;

//   const jwtToken = request.cookies.get("jwt-session")?.value;

//   let hasValidJwtSession = false;

//   if (jwtToken) {
//     const payload = await verifyJWT(jwtToken);
//     if (payload) {
//       hasValidJwtSession = true;
//       console.log("✅ [MIDDLEWARE] Valid JWT session");
//     } else {
//       console.log("⚠️ [MIDDLEWARE] Invalid or expired jwt-session cookie");
//       // Clear invalid JWT cookie
//       const response = NextResponse.next();
//       response.cookies.delete("jwt-session");
//     }
//   }

//   const isAuthenticated = !!nextAuthToken || hasValidJwtSession;

//   console.log("🔍 [MIDDLEWARE] Auth status:", {
//     nextAuthToken: !!nextAuthToken,
//     jwtTokenPresent: !!jwtToken,
//     hasValidJwtSession,
//     isAuthenticated,
//     pathname,
//   });

//   /* ===== STEP 3: Handle Auth Pages ===== */

//   // ✅ UPDATED: Include /verify page in auth pages list
//   const isAuthPage =
//     pathname === "/login" ||
//     pathname === "/signup" ||
//     pathname === "/verify" ||
//     pathname.startsWith("/auth/verify");

//   if (isAuthPage) {
//     // ✅ If user is already authenticated and tries to access auth pages, redirect to home
//     if (isAuthenticated) {
//       console.log(
//         "⚠️ [MIDDLEWARE] Authenticated user blocked from auth page → /"
//       );
//       return NextResponse.redirect(new URL("/", request.url));
//     }
    
//     // ✅ Allow unauthenticated users to access auth pages
//     console.log("✅ [MIDDLEWARE] Allowing access to auth page");
//     return NextResponse.next();
//   }

//   /* ===== STEP 4: Protect All Other Routes ===== */

//   if (!isAuthenticated) {
//     console.log("❌ [MIDDLEWARE] Unauthenticated access blocked → /login");
//     const loginUrl = new URL("/login", request.url);
    
//     // ✅ UPDATED: Only add error param for protected routes (not homepage)
//     // This prevents "session expired" message for new users
//     if (pathname !== "/" && !pathname.startsWith("/api")) {
//       loginUrl.searchParams.set("error", "unauthorized");
//       loginUrl.searchParams.set("callbackUrl", pathname);
//     }
    
//     return NextResponse.redirect(loginUrl);
//   }

//   /* ===== STEP 5: Allow Authenticated Access ===== */

//   console.log("✅ [MIDDLEWARE] Authenticated access granted");
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
//   ],
// };


