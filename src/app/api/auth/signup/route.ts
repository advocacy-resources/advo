import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/prisma/client";

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 },
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: username,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in signup:", error);
    return NextResponse.json(
      { message: "An error occurred during signup" },
      { status: 500 },
    );
  }
}
