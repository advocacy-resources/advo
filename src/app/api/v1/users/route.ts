import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client"; // Update with the correct path to your Prisma client

export async function GET() {
  try {
    const users = await prisma.user.findMany(); // Fetch users from the DB
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
