import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/prisma/client";
import { verifyOTP, clearOTP } from "@/lib/otp-utils";

export async function POST(req: Request) {
  try {
    const { userId, otp, newPassword } = await req.json();

    if (!userId || !otp || !newPassword) {
      return NextResponse.json(
        { message: "User ID, OTP, and new password are required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Verify OTP
    const isValid = await verifyOTP(userId, otp);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Clear OTP after successful verification
    await clearOTP(userId);

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing password change:", error);
    return NextResponse.json(
      { message: "An error occurred while changing the password" },
      { status: 500 }
    );
  }
}