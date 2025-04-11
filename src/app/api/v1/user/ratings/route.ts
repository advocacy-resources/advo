import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/prisma/client";
import { Rating } from "@/enums/rating.enum";

// GET: Get all ratings for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all ratings for the user
    const userRatings = await prisma.rating.findMany({
      where: {
        userId,
      },
      select: {
        resourceId: true,
        rating: true,
      },
    });

    // Transform ratings to the expected format
    const transformedRatings = userRatings.map((rating) => ({
      resourceId: rating.resourceId,
      rating: rating.rating === 1 ? Rating.UP : Rating.DOWN,
    }));

    return NextResponse.json({
      ratings: transformedRatings,
    });
  } catch (error) {
    console.error("Error in GET /api/v1/user/ratings:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}