import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import prisma from "@/prisma/client";
import { IUserLogin } from "@/interfaces/user";
import { generateOTP, saveOTP, sendOTPEmail } from "@/lib/otp-utils";
import { isOtpVerificationEnabled } from "@/lib/feature-flags";

// Step 1: Request password change and send OTP
export async function POST(req: Request) {
  try {
    const { email, currentPassword, newPassword } = (await req.json()) as {
      email: string;
      currentPassword: string;
      newPassword?: string;
      otp?: string;
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

    // Check if OTP verification is enabled
    const otpEnabled = isOtpVerificationEnabled();

    if (otpEnabled) {
      // Generate OTP for password change verification
      const otp = generateOTP();
      
      // Save OTP to user record
      await saveOTP(user._id.toString(), otp);
      
      // Send OTP via email
      const emailSent = await sendOTPEmail(email, otp);
      
      if (!emailSent) {
        return NextResponse.json(
          { message: "Failed to send verification email" },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          message: "Verification code sent to your email",
          userId: user._id.toString(),
          requiresOTP: true
        },
        { status: 200 },
      );
    } else {
      // If OTP verification is disabled, change password directly
      if (!newPassword) {
        return NextResponse.json(
          { message: "New password is required" },
          { status: 400 },
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
    }
  } catch (error) {
    console.error("Error in change password:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 },
    );
  }
}
