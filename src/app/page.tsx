"use client";

import { useSession } from "next-auth/react";
import WelcomeModal from "@/components/onboarding/welcome-modal";
import MainSearch from "@/components/search/MainSearch";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-xl shadow-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/advo-color-physPurp-black.svg"
            alt="Logo"
            width={100}
            height={100}
          />
        </div>

        {/* Title */}
        <div className="mt-6 text-center text-3xl font-extrabold">
          Find Resources Around You
        </div>

        {/* Welcome Modal */}
        <WelcomeModal />

        {/* Session-Based Content */}
        {session ? (
          <div className="space-y-6">
            <p className="text-center text-lg font-medium text-gray-300">
              Welcome, {session.user?.name || "User"}!
            </p>
            <Link href="/profile" passHref>
              <button className="w-full py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Go to Profile
              </button>
            </Link>
            <Link href="/settings" passHref>
              <button className="w-full py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Go to Settings
              </button>
            </Link>
            <Link href="/favorites" passHref>
              <button className="w-full py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Go to Favorites
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-300">
              Please log in to access more features.
            </p>
            <MainSearch />
          </div>
        )}
      </div>
    </div>
  );
}
