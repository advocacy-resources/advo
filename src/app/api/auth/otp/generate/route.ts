import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { generateOTP, saveOTP, sendOTPEmail } from "@/lib/otp-utils";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return NextResponse.json(
        { message: "If the email exists, an OTP has been sent" },
        { status: 200 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to user record
    await saveOTP(user.id, otp);

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return NextResponse.json(
        { message: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "OTP sent successfully",
        userId: user.id 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating OTP:", error);
    return NextResponse.json(
      { message: "An error occurred while generating OTP" },
      { status: 500 }
    );
  }
}