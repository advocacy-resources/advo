import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import prisma from "@/prisma/client";
import { IUserLogin } from "@/interfaces/user";

export async function POST(req: Request) {
  try {
    const { email, currentPassword, newPassword } = (await req.json()) as {
      email: string;
      currentPassword: string;
      newPassword: string;
    };

    // Find the user
    const user = (await prisma.user.findUnique({
      where: { email },
    })) as IUserLogin | null;

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify current password
    const passwordMatches = await compare(currentPassword, user.password);
    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 },
      );
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in change password:", error);
    return NextResponse.json(
      { message: "An error occurred while changing the password" },
      { status: 500 },
    );
  }
}
