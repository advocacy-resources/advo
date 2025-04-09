import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/prisma/client";
import { Rating } from "@/enums/rating.enum";

// POST: Add or update a rating for a resource
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rating } = await request.json();
    const resourceId = params.id;
    const userId = session.user.id;

    // Validate rating value
    if (!Object.values(Rating).includes(rating)) {
      return NextResponse.json(
        { error: "Invalid rating value" },
        { status: 400 },
      );
    }

    // Get the resource
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        Rating: true,
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }

    // Check if user has already rated this resource
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    });

    let result;

    if (rating === Rating.NULL && existingRating) {
      // Remove rating if NULL
      result = await prisma.rating.delete({
        where: {
          id: existingRating.id,
        },
      });
    } else if (existingRating) {
      // Update existing rating
      result = await prisma.rating.update({
        where: {
          id: existingRating.id,
        },
        data: {
          rating: rating === Rating.UP ? 1 : -1,
        },
      });
    } else if (rating !== Rating.NULL) {
      // Create new rating
      result = await prisma.rating.create({
        data: {
          userId,
          resourceId,
          rating: rating === Rating.UP ? 1 : -1,
        },
      });
    }

    // Calculate new upvote count
    const upvotes = await prisma.rating.count({
      where: {
        resourceId,
        rating: 1,
      },
    });

    const downvotes = await prisma.rating.count({
      where: {
        resourceId,
        rating: -1,
      },
    });

    // Update resource with new upvote count
    await prisma.resource.update({
      where: { id: resourceId },
      data: {
        upvoteCount: upvotes - downvotes,
      },
    });

    // Calculate approval percentage
    const totalVotes = upvotes + downvotes;
    const approvalPercentage =
      totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;

    return NextResponse.json({
      success: true,
      rating: result,
      upvotes,
      downvotes,
      approvalPercentage,
    });
  } catch (error) {
    console.error("Error in POST /api/resources/[id]/rating:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET: Get rating statistics for a resource
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const resourceId = params.id;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Get the resource
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }

    // Count upvotes and downvotes
    const upvotes = await prisma.rating.count({
      where: {
        resourceId,
        rating: 1,
      },
    });

    const downvotes = await prisma.rating.count({
      where: {
        resourceId,
        rating: -1,
      },
    });

    // Calculate approval percentage
    const totalVotes = upvotes + downvotes;
    const approvalPercentage =
      totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;

    // Get user's rating if logged in
    let userRating = Rating.NULL;
    if (userId) {
      const rating = await prisma.rating.findUnique({
        where: {
          userId_resourceId: {
            userId,
            resourceId,
          },
        },
      });

      if (rating) {
        userRating = rating.rating === 1 ? Rating.UP : Rating.DOWN;
      }
    }

    return NextResponse.json({
      upvotes,
      downvotes,
      totalVotes,
      approvalPercentage,
      userRating,
    });
  } catch (error) {
    console.error("Error in GET /api/resources/[id]/rating:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
