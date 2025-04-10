"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null; // Avoid rendering while redirecting
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Simulate a profile update request
    try {
      // Replace with your API call to save the profile data
      console.log("Updating profile with:", { name, email });
      setSuccess(true);
    } catch (_err) {
      // Using _err to indicate it's intentionally unused
      setError("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-xl shadow-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/advo-color-white.svg"
            alt="Logo"
            width={100}
            height={100}
          />
        </div>
        <div className="mt-6 text-center text-3xl font-extrabold">
          Account Settings
        </div>
        <form onSubmit={handleSaveChanges} className="space-y-6">
          {error && <div className="text-red-500">{error}</div>}
          {success && (
            <div className="text-green-500">Profile updated successfully!</div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
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
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Changes
          </button>
        </form>
        <div className="mt-6 space-y-4">
          <button
            onClick={() => router.push("/auth/change-password")}
            className="w-full py-2 px-4 rounded-md bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            Change Password
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
