import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/prisma/client";

// POST: Toggle favorite status for a resource
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resourceId = params.id;
    const userId = session.user.id;

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

    // Check if user has already favorited this resource
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    });

    let result;
    let isFavorited;

    if (existingFavorite) {
      // Remove favorite
      result = await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
      isFavorited = false;

      // Decrement favorite count
      await prisma.resource.update({
        where: { id: resourceId },
        data: {
          favoriteCount: {
            decrement: 1,
          },
        },
      });
    } else {
      // Add favorite
      result = await prisma.favorite.create({
        data: {
          userId,
          resourceId,
        },
      });
      isFavorited = true;

      // Increment favorite count
      await prisma.resource.update({
        where: { id: resourceId },
        data: {
          favoriteCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      favorite: result,
      isFavorited,
    });
  } catch (error) {
    console.error("Error in POST /api/resources/[id]/favorite:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET: Check if a resource is favorited by the current user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const resourceId = params.id;

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ isFavorited: false, favoriteCount: 0 });
    }

    const userId = session.user.id;

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

    // Check if user has favorited this resource
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    });

    // Get favorite count
    const favoriteCount = resource.favoriteCount || 0;

    return NextResponse.json({
      isFavorited: !!favorite,
      favoriteCount,
    });
  } catch (error) {
    console.error("Error in GET /api/resources/[id]/favorite:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
