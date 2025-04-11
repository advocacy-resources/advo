import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/prisma/client";

// GET: Fetch user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        favorites: {
          select: {
            resourceId: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Transform the favorites array to just be an array of resource IDs
    const transformedUser = {
      ...user,
      favorites: user.favorites.map((fav) => fav.resourceId),
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error("Error in GET /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PUT: Update user by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updateData = await request.json();
    console.log("Update data received:", updateData);

    // Only update the name field directly
    const safeUpdateData = {
      name: updateData.name ?? undefined,
    };

    // We don't update favorites directly through this endpoint
    // If needed, create a separate endpoint for managing favorites

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: safeUpdateData,
      select: {
        id: true,
        email: true,
        name: true,
        favorites: {
          select: {
            resourceId: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    // Transform the favorites array to just be an array of resource IDs
    const transformedUser = {
      ...updatedUser,
      favorites: updatedUser.favorites.map((fav) => fav.resourceId),
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error("Error in PUT /api/users/[id]:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    );
  }
}

// DELETE: Delete user by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the user can only delete their own account
    if (session.user?.id !== params.id) {
      return NextResponse.json(
        { error: "You can only delete your own account" },
        { status: 403 },
      );
    }

    // Delete user's ratings
    await prisma.rating.deleteMany({
      where: { userId: params.id },
    });

    // Delete user's favorites
    await prisma.favorite.deleteMany({
      where: { userId: params.id },
    });

    // Delete user's likes
    await prisma.like.deleteMany({
      where: { userId: params.id },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in DELETE /api/users/[id]:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    );
  }
}
