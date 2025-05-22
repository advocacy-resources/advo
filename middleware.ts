import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the origin from the request
  const origin = request.headers.get("origin") || "";

  // Define allowed origins
  const allowedOrigins = [
    "https://myadvo.org",
    "http://localhost:3000",
    "http://localhost:3001",
  ];

  // Check if the origin is allowed
  const isAllowedOrigin =
    allowedOrigins.includes(origin) || origin.includes("localhost");

  // Handle OPTIONS preflight requests
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });

    if (isAllowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS",
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
    }

    return response;
  }

  // Handle regular requests
  const response = NextResponse.next();

  // Add CORS headers to API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    if (isAllowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
  }

  return response;
}

// Configure which routes this middleware applies to
export const config = {
  matcher: [
    // Match all API routes and OPTIONS requests
    "/api/:path*",
  ],
};
