"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LogoImage from "@/assets/myAdvo-peachWhite.svg";
import { isOtpVerificationEnabled } from "@/lib/feature-flags";

const ChangePasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const handleInitiatePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, currentPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isOtpVerificationEnabled() && data.requiresOTP) {
          setUserId(data.userId);
          setShowOtpForm(true);
          setSuccess("Verification code sent to your email");
        } else {
          setSuccess("Password changed successfully!");
          setTimeout(() => router.push("/auth/signin"), 2000);
        }
      } else {
        setError(
          data.message || "An error occurred while changing the password",
        );
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Change password error:", error);
    }
  };

  const handleCompletePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/change-password/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password changed successfully! Redirecting to login...");
        setTimeout(() => router.push("/auth/signin"), 2000);
      } else {
        setError(data.message || "Invalid or expired OTP");
      }
    } catch (error) {
      setError("An unexpected error occurred during verification");
      console.error("OTP verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");

    try {
      const response = await fetch("/api/auth/otp/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess("A new verification code has been sent to your email");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to resend verification code");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Resend OTP error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-900 rounded-xl shadow-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <Image src={LogoImage} alt="Logo" width={120} height={120} priority />
        </div>
        <div className="mt-6 text-center text-3xl font-extrabold font-univers">
          {showOtpForm ? "Verify Your Identity" : "Change Your Password"}
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="text-red-500 bg-red-900/30 p-3 rounded-lg text-center font-anonymous-pro">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-500 bg-green-900/30 p-3 rounded-lg text-center font-anonymous-pro">
            {success}
          </div>
        )}

        {!showOtpForm ? (
          <form
            onSubmit={handleInitiatePasswordChange}
            className="space-y-6 font-anonymous-pro"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-700 bg-neutral-800 text-white rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-700 bg-neutral-800 text-white rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-300"
              >
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-700 bg-neutral-800 text-white rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-700 bg-neutral-800 text-white rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-full bg-neutral-800 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 btn-gradient-hover"
            >
              Change Password
            </button>
          </form>
        ) : (
          /* OTP Verification Form */
          <form
            onSubmit={handleCompletePasswordChange}
            className="space-y-6 font-anonymous-pro"
          >
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-300"
              >
                Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter 6-digit code"
                className="mt-1 block w-full px-4 py-3 border border-gray-700 bg-neutral-800 text-white rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
              <p className="mt-2 text-sm text-gray-400">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 px-4 rounded-full bg-neutral-800 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 btn-gradient-hover"
            >
              {isVerifying ? "Verifying..." : "Verify & Change Password"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-pink-400 hover:text-pink-300 transition-colors text-sm"
              >
                Didn&apos;t receive the code? Resend
              </button>
            </div>
          </form>
        )}
        <hr className="hr-gradient-hover my-6" />
        <div className="text-center text-sm font-anonymous-pro">
          <Link
            href="/auth/signin"
            className="text-pink-400 hover:text-pink-300 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
