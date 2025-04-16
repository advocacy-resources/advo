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
    const { role, managedResourceId } = await request.json();

    // Validate role
    if (
      !role ||
      (role !== "user" && role !== "admin" && role !== "business_rep")
    ) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'user', 'admin', or 'business_rep'." },
        { status: 400 },
      );
    }

    // Get the current session
    const session = await getServerSession(authOptions);

    // Business representatives cannot change roles
    if (session?.user.role === "business_rep") {
      return NextResponse.json(
        { error: "Business Representatives cannot change user roles." },
        { status: 403 },
      );
    }

    // Validate managedResourceId for business_rep role
    if (role === "business_rep" && !managedResourceId) {
      return NextResponse.json(
        { error: "Business Representative role requires a managedResourceId." },
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

    // Update user role and managedResourceId if applicable
    const updateData: any = { role };

    // Add or remove managedResourceId based on role
    if (role === "business_rep") {
      updateData.managedResourceId = managedResourceId;
    } else {
      // Clear managedResourceId if role is not business_rep
      updateData.managedResourceId = null;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        managedResourceId: true,
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
