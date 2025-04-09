"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "../../assets/myAdvo-peachWhite.svg";

function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  // Consolidated search state for better maintainability
  const [searchParams, setSearchParams] = useState({
    description: "",
    zipCode: "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  const handleSignUp = () => {
    router.push("/auth/register");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError(null);

    try {
      // Only include non-empty parameters
      const searchPayload: Record<string, string | string[]> = {
        description:
          searchParams.description.trim() || (undefined as unknown as string),
        zipCode:
          searchParams.zipCode.trim() || (undefined as unknown as string),
        // Default values for required API parameters
        category: [],
        type: [],
      };

      // Filter out undefined values
      const filteredPayload = Object.fromEntries(
        Object.entries(searchPayload).filter(
          ([_, value]) => value !== undefined,
        ),
      );

      // If no search parameters provided, show a message or redirect to all resources
      if (Object.keys(filteredPayload).length <= 2) {
        // Only category and type arrays
        console.info("No search parameters provided");
        router.push("/resources");
        return;
      }

      // Make API call to search endpoint
      const response = await fetch("/api/v1/resources/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredPayload),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      await response.json(); // Process the response if needed

      // Navigate to search results page with the search parameters
      router.push(
        `/resources?search=${encodeURIComponent(
          JSON.stringify(filteredPayload),
        )}`,
      );
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(error instanceof Error ? error.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const buttonClass =
    "bg-neutral-800 text-white hover:bg-neutral-700 transition-colors duration-200 px-4 py-2";

  return (
    <header className="w-full">
      {/* Mobile Search (Top) */}
      <div className="md:hidden p-4 shadow-sm static top-0 z-10">
        {/* Mobile Logo */}
        <div className="flex justify-between items-center mb-4">
          <Image
            src={Logo}
            alt="The myAdvo Logo."
            height={40}
            className="cursor-pointer"
            onClick={() => router.push("/")}
          />
        </div>
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            placeholder="Search terms..."
            value={searchParams.description}
            onChange={(e) =>
              setSearchParams((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="px-4 py-2 border border-gray-300 focus:outline-none"
            aria-label="Search terms"
            disabled={isSearching}
          />
          <input
            type="text"
            placeholder="Zip code"
            value={searchParams.zipCode}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, zipCode: e.target.value }))
            }
            className="px-4 py-2 border border-gray-300 focus:outline-none"
            aria-label="Zip code"
            pattern="[0-9]{5}"
            title="Five digit zip code"
            disabled={isSearching}
          />
          <button type="submit" className={buttonClass} disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </button>
          {searchError && (
            <div className="text-red-500 text-sm mt-2" role="alert">
              {searchError}
            </div>
          )}
        </form>
      </div>

      {/* Navbar */}
      <div className="relative h-16 md:flex hidden items-center">
        {/* Left Logo */}
        <div className="absolute left-0 h-full flex items-center z-10">
          <Image
            src={Logo}
            alt="The myAdvo Logo."
            height={60}
            width={120}
            className="cursor-pointer m-8 p-8"
            onClick={() => {
              router.push("/");
            }}
            priority
          />
        </div>

        {/* Desktop Search - Centered */}
        <div className="absolute inset-0 hidden md:flex justify-center items-center text-black">
          <form
            onSubmit={handleSearch}
            className="flex shadow-sm overflow-hidden"
          >
            <input
              type="text"
              placeholder="Search terms..."
              value={searchParams.description}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="px-4 py-2 border-r border-gray-300 focus:outline-none"
              aria-label="Search terms"
              disabled={isSearching}
            />
            <input
              type="text"
              placeholder="Zip code"
              value={searchParams.zipCode}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  zipCode: e.target.value,
                }))
              }
              className="px-4 py-2 focus:outline-none"
              aria-label="Zip code"
              pattern="[0-9]{5}"
              title="Five digit zip code"
              disabled={isSearching}
            />
            <button
              type="submit"
              className={buttonClass}
              disabled={isSearching}
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
            {searchError && (
              <div
                className="text-red-500 text-sm absolute top-16 left-0 right-0 text-center"
                role="alert"
              >
                {searchError}
              </div>
            )}
          </form>
        </div>

        {/* Right Section */}
        <div className="absolute right-0 flex justify-end items-center px-8 h-full gap-4">
          <button
            className={buttonClass}
            onClick={() => router.push("/recommend")}
          >
            Recommend Resource
          </button>
          {session ? (
            <>
              {session.user.role === "admin" && (
                <button
                  onClick={() => router.push("/admin")}
                  className={`${buttonClass} bg-purple-700 hover:bg-purple-600`}
                >
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={() => router.push("/profile")}
                className={buttonClass}
              >
                Profile
              </button>
              <button onClick={handleSignOut} className={buttonClass}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSignIn} className={buttonClass}>
                Sign In
              </button>
              <button onClick={handleSignUp} className={buttonClass}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
