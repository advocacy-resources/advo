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

// PATCH handler for updating a user's role
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
    const { role } = await request.json();

    // Validate role
    if (!role || (role !== "user" && role !== "admin")) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'user' or 'admin'." },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 },
    );
  }
}
