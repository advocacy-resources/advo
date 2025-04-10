import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/prisma/client";
import { authOptions } from "@/lib/authOptions";

// Helper function to check admin role
async function checkAdminRole() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return false;
  }

  return true;
}

// GET handler for fetching analytics data
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    // Fetch counts
    const [userCount, resourceCount, activeUserCount, frozenUserCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.resource.count(),
        prisma.user.count({
          where: { isActive: true },
        }),
        prisma.user.count({
          where: { isActive: false },
        }),
      ]);

    // Return analytics data
    return NextResponse.json({
      users: {
        total: userCount,
        active: activeUserCount,
        frozen: frozenUserCount,
      },
      resources: {
        total: resourceCount,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
