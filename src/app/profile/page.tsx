"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null; // Avoid rendering anything while redirecting
  }

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/auth/signin", // Redirect to the sign-in page after logging out
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Name
            </label>
            <p className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
              {session.user?.name || "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <p className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
              {session.user?.email || "N/A"}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-6 w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
