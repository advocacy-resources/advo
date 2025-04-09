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

// PATCH handler for updating a user's active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = params;
    const { isActive } = await request.json();

    // Validate isActive is a boolean
    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "Invalid status. isActive must be a boolean value." },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}