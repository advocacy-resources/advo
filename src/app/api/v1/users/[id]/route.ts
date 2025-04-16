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
        // Demographic information
        ageGroup: true,
        raceEthnicity: true,
        gender: true,
        pronoun1: true,
        pronoun2: true,
        sexualOrientation: true,
        incomeBracket: true,
        livingSituation: true,
        livingArrangement: true,
        zipcode: true,
        state: true,
        resourceInterests: true,
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

    // Update allowed fields
    const safeUpdateData = {
      name: updateData.name ?? undefined,
      // Demographic information
      ageGroup: updateData.ageGroup ?? undefined,
      raceEthnicity: updateData.raceEthnicity ?? undefined,
      gender: updateData.gender ?? undefined,
      pronoun1: updateData.pronoun1 ?? undefined,
      pronoun2: updateData.pronoun2 ?? undefined,
      sexualOrientation: updateData.sexualOrientation ?? undefined,
      incomeBracket: updateData.incomeBracket ?? undefined,
      livingSituation: updateData.livingSituation ?? undefined,
      livingArrangement: updateData.livingArrangement ?? undefined,
      zipcode: updateData.zipcode ?? undefined,
      // Derive state from zipcode if provided
      state: updateData.zipcode
        ? deriveStateFromZipcode(updateData.zipcode)
        : (updateData.state ?? undefined),
      resourceInterests: updateData.resourceInterests ?? undefined,
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
        // Demographic information
        ageGroup: true,
        raceEthnicity: true,
        gender: true,
        pronoun1: true,
        pronoun2: true,
        sexualOrientation: true,
        incomeBracket: true,
        livingSituation: true,
        livingArrangement: true,
        zipcode: true,
        state: true,
        resourceInterests: true,
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

// Helper function to derive state from zipcode
function deriveStateFromZipcode(zipcode: string): string | null {
  if (!zipcode || zipcode.length < 1) return null;

  // Simple mapping of first digit to state (same as in analytics route)
  const zipcodeToState: Record<string, string> = {
    "0": "NY",
    "1": "NY",
    "2": "VA",
    "3": "FL",
    "4": "MI",
    "5": "TX",
    "6": "IL",
    "7": "TX",
    "8": "CO",
    "9": "CA",
  };

  const firstDigit = zipcode.charAt(0);
  return zipcodeToState[firstDigit] || null;
}
