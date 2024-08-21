import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/prisma/client"; // Adjust this import to match your Prisma client location

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { username, password, email } = await req.json();

    if (!username || !password || !email) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: {
              equals: username,
            },
          },
          {
            email: {
              equals: email,
            },
          },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await hash(password, 10);

    const newUser = {
      username,
      email,
      password: hashedPassword,
    };

    await prisma.user.create({
      data: newUser,
    });

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
