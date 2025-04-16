import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/prisma/client";

export const dynamic = "force-dynamic";

// GET: Get all favorites for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all favorites for the user
    const userFavorites = await prisma.favorite.findMany({
      where: {
        userId,
      },
      select: {
        resourceId: true,
      },
    });

    return NextResponse.json({
      favorites: userFavorites,
    });
  } catch (error) {
    console.error("Error in GET /api/v1/user/favorites:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
