import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { verifyOTP, clearOTP, markEmailAsVerified } from "@/lib/otp-utils";

export async function POST(req: Request) {
  try {
    const { userId, otp } = await req.json();

    if (!userId || !otp) {
      return NextResponse.json(
        { message: "User ID and OTP are required" },
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

    // Clear OTP after successful verification
    await clearOTP(userId);

    // Mark email as verified if not already
    if (!user.isEmailVerified) {
      await markEmailAsVerified(userId);
    }

    return NextResponse.json(
      { 
        message: "OTP verified successfully",
        verified: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { message: "An error occurred while verifying OTP" },
      { status: 500 }
    );
  }
}