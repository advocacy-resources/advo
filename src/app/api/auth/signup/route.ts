import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/prisma/client";
import { generateOTP, saveOTP, sendOTPEmail } from "@/lib/otp-utils";
import { isOtpVerificationEnabled } from "@/lib/feature-flags";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

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

    // Check if OTP verification is enabled
    const otpEnabled = isOtpVerificationEnabled();

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        // If OTP verification is enabled, set isEmailVerified to false, otherwise true
        isEmailVerified: !otpEnabled,
      },
    });

    // If OTP verification is enabled, send verification email
    if (otpEnabled) {
      // Generate OTP for email verification
      const otp = generateOTP();

      // Save OTP to user record
      await saveOTP(user.id, otp);

      // Send OTP via email
      const emailSent = await sendOTPEmail(email, otp);

      if (!emailSent) {
        console.error("Failed to send verification email");
        // Continue anyway, user can request a new OTP later
      }

      return NextResponse.json(
        {
          message:
            "User created successfully. Please verify your email with the OTP sent.",
          userId: user.id,
          requiresVerification: true,
        },
        { status: 201 },
      );
    } else {
      // If OTP verification is disabled, return success without requiring verification
      return NextResponse.json(
        {
          message: "User created successfully.",
          userId: user.id,
          requiresVerification: false,
        },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("Error in signup:", error);
    return NextResponse.json(
      { message: "An error occurred during signup" },
      { status: 500 },
    );
  }
}
