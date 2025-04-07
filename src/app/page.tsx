"use client";

import { useSession } from "next-auth/react";
import WelcomeModal from "@/components/onboarding/welcome-modal";
// import MainSearch from "@/components/search/MainSearch";
import Link from "next/link";
// import Image from "next/image";

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
        <div className="space-y-4"></div>
      )}
    </div>
  );
}
