"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signIn,
  useSession,
  getProviders,
  ClientSafeProvider,
} from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import LogoImage from "@/assets/myAdvo-peachWhite.svg";
import { isOtpVerificationEnabled } from "@/lib/feature-flags";

interface SignInProps {
  providers: Record<string, ClientSafeProvider>;
}

const SignIn: React.FC<SignInProps> = ({ providers }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState("");
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (response?.ok) {
        console.log("Sign in successful");
      } else {
        // Check if the error is about email verification and if OTP verification is enabled
        if (
          isOtpVerificationEnabled() &&
          response?.error?.includes("verify your email")
        ) {
          // Get user ID to send verification code
          const userResponse = await fetch("/api/auth/otp/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          const userData = await userResponse.json();

          if (userResponse.ok && userData.userId) {
            setUserId(userData.userId);
            setShowVerificationForm(true);
            setSuccess("A verification code has been sent to your email");
          } else {
            setError(
              "Unable to send verification code. Please try again later.",
            );
          }
        } else {
          setError(response?.error || "An unexpected error occurred");
        }
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Sign in error:", error);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setSuccess("Email verified successfully! You can now sign in.");
        setTimeout(() => {
          setShowVerificationForm(false);
          setOtp("");
        }, 2000);
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
    <div className="min-h-screen flex items-center justify-center bg-black text-white mt-[180px] md:mt-0">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-900 rounded-xl shadow-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <Image src={LogoImage} alt="Logo" width={120} height={120} priority />
        </div>
        <div className="mt-6 text-center text-3xl font-extrabold font-univers">
          Sign in to your account
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

        {!showVerificationForm ? (
          <form
            onSubmit={handleSignIn}
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
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-700 bg-neutral-800 text-white rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-full bg-neutral-800 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 btn-gradient-hover"
            >
              Sign In
            </button>
          </form>
        ) : (
          /* OTP Verification Form */
          <form
            onSubmit={handleVerifyOTP}
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
              {isVerifying ? "Verifying..." : "Verify Email"}
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
        <div className="mt-6 space-y-4">
          {providers &&
            Object.values(providers).map((provider) =>
              provider.name !== "Credentials" ? (
                <div key={provider.name} className="flex justify-center">
                  <button
                    onClick={() => signIn(provider.id)}
                    className="w-full py-3 px-4 rounded-full bg-neutral-800 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 btn-gradient-hover flex items-center justify-center gap-2"
                  >
                    {provider.name === "Google" && (
                      <Image
                        src="/google-logo.svg"
                        alt="Google"
                        width={20}
                        height={20}
                      />
                    )}
                    Sign in with {provider.name}
                  </button>
                </div>
              ) : null,
            )}
        </div>
        <hr className="hr-gradient-hover my-6" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-anonymous-pro">
          <Link
            href="/auth/register"
            className="text-pink-400 hover:text-pink-300 transition-colors"
          >
            Don&apos;t have an account? Sign Up
          </Link>
          <Link
            href="/auth/change-password"
            className="text-pink-400 hover:text-pink-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<
    string,
    ClientSafeProvider
  > | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };

    fetchProviders();
  }, []);

  return providers ? <SignIn providers={providers} /> : null;
}
