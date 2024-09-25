import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        image: true,
        dateOfBirth: true,
        gender: true,
        pronouns: true,
        primaryLanguage: true,
        secondaryLanguages: true,
        city: true,
        state: true,
        zipCode: true,
        phone: true,
        preferredCommunication: true,
        interests: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in GET /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.id;

    const updateData = await request.json();
    console.log("Update data received:", updateData);

    // Remove fields that shouldn't be updated
    const safeUpdateData = {
      ...updateData,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      email: undefined,
      googleId: undefined,
      accounts: undefined,
      sessions: undefined,
    };

    // Convert date strings to Date objects
    if (safeUpdateData.dateOfBirth) {
      safeUpdateData.dateOfBirth = new Date(safeUpdateData.dateOfBirth);
    }

    // Ensure secondaryLanguages and interests are arrays
    if (
      safeUpdateData.secondaryLanguages &&
      !Array.isArray(safeUpdateData.secondaryLanguages)
    ) {
      safeUpdateData.secondaryLanguages = [];
    }
    if (safeUpdateData.interests && !Array.isArray(safeUpdateData.interests)) {
      safeUpdateData.interests = [];
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: safeUpdateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        image: true,
        dateOfBirth: true,
        gender: true,
        pronouns: true,
        primaryLanguage: true,
        secondaryLanguages: true,
        city: true,
        state: true,
        zipCode: true,
        phone: true,
        preferredCommunication: true,
        interests: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error in PUT /api/users/[id]:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Internal Server Error", details: error.message },
        { status: 500 },
      );
    } else {
      return NextResponse.json(
        {
          error: "Internal Server Error",
          details: "An unknown error occurred",
        },
        { status: 500 },
      );
    }
  }
}
