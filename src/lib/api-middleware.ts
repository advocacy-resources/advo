/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

/**
 * Middleware to check if the user is authenticated
 */
export function withAuth(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context: any) => {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 },
      );
    }

    // Add the session to the request for use in the handler
    const requestWithSession = req as NextRequest & { session: any };
    (requestWithSession as any).session = session;

    return handler(requestWithSession, context);
  };
}

/**
 * Middleware to check if the user is an admin
 */
export function withAdminAuth(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context: any) => {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    // Add the session to the request for use in the handler
    const requestWithSession = req as NextRequest & { session: any };
    (requestWithSession as any).session = session;

    return handler(requestWithSession, context);
  };
}

/**
 * Helper function to check if the user is an admin
 * For use in route handlers that need more complex logic
 */
export async function checkAdminRole() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return false;
  }

  return true;
}
