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

// Helper function to check if user is admin or business representative
async function checkAdminOrBusinessRepRole() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "business_rep")
  ) {
    return false;
  }

  return true;
}

// GET handler for fetching a single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check if user is admin or business representative
    const isAuthorized = await checkAdminOrBusinessRepRole();
    if (!isAuthorized) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Admin or Business Representative access required.",
        },
        { status: 403 },
      );
    }

    const { id } = params;

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        managedResourceId: true,
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

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// PATCH handler for updating a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check if user is admin
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    const { id } = params;
    const requestData = await request.json();
    // Remove id from data object to prevent Prisma validation error
    const { id: userId, ...data } = requestData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

// PUT handler for updating a user (similar to PATCH but for complete updates)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check if user is admin or business representative
    const isAuthorized = await checkAdminOrBusinessRepRole();
    if (!isAuthorized) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Admin or Business Representative access required.",
        },
        { status: 403 },
      );
    }

    // Get the current session
    const session = await getServerSession(authOptions);

    // Business representatives can only update their own managed resource
    if (session?.user.role === "business_rep") {
      // If the user being updated is not the business representative, deny access
      if (session.user.id !== params.id) {
        return NextResponse.json(
          {
            error:
              "Business Representatives can only update their own profile.",
          },
          { status: 403 },
        );
      }
    }

    const { id } = params;
    const requestData = await request.json();
    // Remove id from data object to prevent Prisma validation error
    const { id: userId, ...data } = requestData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        managedResourceId: true,
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
