import { randomBytes } from 'crypto';
import prisma from "@/prisma/client";
import nodemailer from 'nodemailer';

// Generate a random 6-digit OTP
export function generateOTP(): string {
  // Generate a random number between 100000 and 999999
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Save OTP to user record
export async function saveOTP(userId: string, otp: string): Promise<void> {
  // OTP expires in 10 minutes
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      otpSecret: otp,
      otpExpiry,
    },
  });
}

// Verify OTP
export async function verifyOTP(userId: string, otp: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { otpSecret: true, otpExpiry: true },
  });

  if (!user || !user.otpSecret || !user.otpExpiry) {
    return false;
  }

  // Check if OTP is expired
  if (user.otpExpiry < new Date()) {
    return false;
  }

  // Check if OTP matches
  return user.otpSecret === otp;
}

// Clear OTP after successful verification
export async function clearOTP(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      otpSecret: null,
      otpExpiry: null,
    },
  });
}

// Mark email as verified
export async function markEmailAsVerified(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isEmailVerified: true,
    },
  });
}

// Send OTP via email
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Your Verification Code</h2>
          <div style="background-color: #fff; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #4f46e5;">${otp}</h1>
          </div>
          <p style="color: #666; text-align: center;">This code will expire in 10 minutes.</p>
          <p style="color: #666; text-align: center; margin-top: 30px; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}