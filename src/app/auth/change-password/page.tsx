"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const ChangePasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChangePassword = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });

      if (response.ok) {
        setSuccess("Password changed successfully!");
        setTimeout(() => router.push("/auth/signin"), 2000);
      } else {
        const data = await response.json();
        setError(
          data.message || "An error occurred while changing the password",
        );
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Change password error:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left half with the image */}
      <div className="w-1/2 relative hidden md:block">
        <div className="absolute inset-0">
          <Image
            src="/AdvoHomeHeroBanner.png"
            alt="Change Password Image"
            className="object-cover"
            width={1920}
            height={1080}
          />
        </div>
      </div>

      {/* Right half with the change password form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/advo-color-physPurp-black.svg"
              alt="Logo"
              width={100}
              height={100}
            />
          </div>
          <div className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Change Your Password
          </div>
          <form onSubmit={handleChangePassword} className="space-y-6">
            {error && <div className="text-red-500">{error}</div>}
            {success && <div className="text-green-500">{success}</div>}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-center space-x-4">
              <button type="submit" className="parallelogram-btn">
                <span className="inline-block transform skew-x-[18deg]">
                  Change Password
                </span>
              </button>
            </div>
          </form>
          <div className="flex justify-center items-center mt-4">
            <Link
              href="/auth/signin"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
