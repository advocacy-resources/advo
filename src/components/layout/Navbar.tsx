"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "../../assets/myAdvo-peachWhite.svg";
import { X } from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  const handleSignUp = () => {
    router.push("/auth/register");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError(null);

    try {
      // Only include non-empty parameters
      const searchPayload: Record<string, string | string[]> = {
        description: searchParams.description.trim() || "",
        zipCode: searchParams.zipCode.trim() || "",
        // Default values for required API parameters
        category: [],
        type: [],
      };

      // Remove empty string values
      const filteredPayload = Object.fromEntries(
        Object.entries(searchPayload).filter(
          ([_, value]) => {
            if (typeof value === 'string') {
              return value !== "";
            }
            return true; // Keep arrays even if empty
          }
        ),
      );

      // If no search parameters provided (only empty category and type arrays), redirect to all resources
      if (!filteredPayload.description && !filteredPayload.zipCode) {
        console.info("No search parameters provided");
        router.push("/resources");
        return;
      }

      // Navigate directly to search results page with the search parameters
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
    "bg-neutral-800 text-white rounded-full px-4 py-2 btn-gradient-hover";

  return (
    <header className="w-full">
      {/* Mobile Search (Top) */}
      <div className="md:hidden p-4 shadow-sm static top-0 z-10">
        {/* Mobile Logo and Menu */}
        <div className="flex justify-between items-center mb-4">
          <Image
            src={Logo}
            alt="The myAdvo Logo."
            height={40}
            className="cursor-pointer"
            onClick={() => router.push("/")}
          />

          {/* Mobile Menu Button */}
          <button
            className="p-2 rounded-full focus:outline-none btn-gradient-hover"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-white" />
            ) : (
              <div className="space-y-1.5">
                <div className="w-6 h-0.5 bg-white"></div>
                <div className="w-6 h-0.5 bg-white"></div>
                <div className="w-6 h-0.5 bg-white"></div>
              </div>
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay and Dropdown */}
        {mobileMenuOpen && (
          <>
            {/* Overlay to capture clicks outside the menu */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-10"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            ></div>

            {/* Menu Dropdown */}
            <div className="absolute right-0 left-0 mt-2 mx-4 bg-neutral-800 rounded-md shadow-lg py-2 z-20 border border-neutral-700">
              <button
                onClick={() => {
                  router.push("/recommend");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-sm text-white rounded-full btn-gradient-hover"
              >
                Recommend Resource
              </button>

              {session ? (
                <>
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-white rounded-full btn-gradient-hover"
                  >
                    Profile
                  </button>
                  {session.user.role === "admin" && (
                    <button
                      onClick={() => {
                        router.push("/admin");
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-sm text-purple-300 rounded-full btn-gradient-hover"
                    >
                      Admin Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-red-300 rounded-full btn-gradient-hover border-t border-neutral-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleSignIn();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-white rounded-full btn-gradient-hover"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      handleSignUp();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-white rounded-full btn-gradient-hover"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </>
        )}
        <form
          onSubmit={handleSearch}
          id="mobile-search-form"
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            id="mobile-search-input"
            placeholder="Search terms..."
            value={searchParams.description}
            onChange={(e) =>
              setSearchParams((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="px-4 py-2 border border-gray-300 focus:outline-none bg-neutral-800 text-white placeholder:text-gray-300"
            aria-label="Search terms"
            disabled={isSearching}
          />
          <input
            type="text"
            id="mobile-zip-input"
            placeholder="Zip code"
            value={searchParams.zipCode}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, zipCode: e.target.value }))
            }
            className="px-4 py-2 border border-gray-300 focus:outline-none bg-neutral-800 text-white placeholder:text-gray-300"
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
      <nav className="relative h-16 md:flex hidden items-center">
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
            id="desktop-search-form"
            className="flex shadow-sm overflow-hidden"
          >
            <input
              type="text"
              id="desktop-search-input"
              placeholder="Search terms..."
              value={searchParams.description}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="px-4 py-2 border-r border-gray-300 focus:outline-none bg-neutral-800 text-white placeholder:text-gray-300"
              aria-label="Search terms"
              disabled={isSearching}
            />
            <input
              type="text"
              id="desktop-zip-input"
              placeholder="Zip code"
              value={searchParams.zipCode}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  zipCode: e.target.value,
                }))
              }
              className="px-4 py-2 focus:outline-none bg-neutral-800 text-white placeholder:text-gray-300"
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
                  className="bg-purple-700 text-white rounded-full px-4 py-2 btn-gradient-hover"
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
      </nav>
    </header>
  );
}

export default Navbar;
