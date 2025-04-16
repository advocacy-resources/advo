"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "../../assets/myAdvo-peachWhite.svg";
import { useAppDispatch } from "@/store/hooks";
import {
  setSearchParams,
  fetchResources,
  resetHomeState,
} from "@/store/slices/resourcesSlice";
import UserProfileModal from "@/components/users/UserProfileModal";
import ResourceManageModal from "@/components/resources/ResourceManageModal";
import { useUserData } from "@/hooks/useUserData";
import { Search } from "lucide-react";
import { X } from "lucide-react";

function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Consolidated search state for better maintainability
  const [searchParams, setLocalSearchParams] = useState({
    description: "",
    zipCode: "",
    distance: "25", // Default to 25 miles
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isResourceManageModalOpen, setIsResourceManageModalOpen] =
    useState(false);
  const {
    userData,
    isLoading: isUserDataLoading,
    saveUserData,
  } = useUserData(session?.user?.id);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);

  // Add/remove class to body when mobile search is visible
  useEffect(() => {
    if (mobileSearchVisible) {
      document.body.classList.add("mobile-search-visible");
    } else {
      document.body.classList.remove("mobile-search-visible");
    }
  }, [mobileSearchVisible]);

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

    console.log("[SEARCH DEBUG] Search initiated with params:", searchParams);

    try {
      // Only include non-empty parameters
      const searchPayload: Record<string, string | string[]> = {
        description: searchParams.description.trim() || "",
        zipCode: searchParams.zipCode.trim() || "",
        distance: searchParams.distance || "25", // Include distance parameter
        // Default values for required API parameters
        category: [],
        type: [],
      };

      console.log("[SEARCH DEBUG] Initial search payload:", searchPayload);

      // Remove empty string values
      const filteredPayload = Object.fromEntries(
        Object.entries(searchPayload).filter(([_, value]) => {
          if (typeof value === "string") {
            return value !== "";
          }
          return true; // Keep arrays even if empty
        }),
      );

      console.log("[SEARCH DEBUG] Filtered payload:", filteredPayload);

      // If no search parameters provided (only empty category and type arrays), redirect to all resources
      if (!filteredPayload.description && !filteredPayload.zipCode) {
        console.info("[SEARCH DEBUG] No search parameters provided");
        router.push("/resources");
        return;
      }

      // Navigate directly to search results page with the search parameters
      const searchQueryParam = encodeURIComponent(
        JSON.stringify(filteredPayload),
      );
      console.log("[SEARCH DEBUG] Search query param:", searchQueryParam);
      console.log(
        "[SEARCH DEBUG] Decoded search query:",
        JSON.stringify(filteredPayload),
      );

      router.push(`/resources?search=${searchQueryParam}`);

      // Reset search fields after submitting
      setLocalSearchParams({
        description: "",
        zipCode: "",
        distance: "25", // Reset to default
      });
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(error instanceof Error ? error.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const buttonClass =
    "bg-neutral-800 text-white rounded-full px-4 py-2 btn-gradient-hover shadow-md";

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50 bg-transparent">
      {/* Mobile Search (Top) */}
      <div className="md:hidden p-4 shadow-sm z-10">
        {/* Mobile Logo and Menu */}
        <div className="flex justify-between items-center mb-4">
          <Image
            src={Logo}
            alt="The myAdvo Logo."
            height={40}
            className="cursor-pointer"
            onClick={() => {
              // Reset the entire state for homepage
              dispatch(resetHomeState());
              // Force a new fetch of resources
              dispatch(fetchResources(1));
              router.push("/");
            }}
          />

          <div className="flex items-center">
            {/* Search Toggle Button */}
            <button
              className="p-2 rounded-full focus:outline-none btn-gradient-hover mr-2"
              onClick={() => setMobileSearchVisible(!mobileSearchVisible)}
              aria-label="Toggle search"
              aria-expanded={mobileSearchVisible}
            >
              <Search size={24} className="text-white" />
            </button>

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
                      setIsProfileModalOpen(true);
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
                  {session.user.role === "business_rep" &&
                    session.user.managedResourceId && (
                      <button
                        onClick={() => {
                          setIsResourceManageModalOpen(true);
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-green-300 rounded-full btn-gradient-hover"
                      >
                        Manage Resource
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
          className={`transition-all duration-300 ease-in-out ${
            mobileSearchVisible
              ? "flex flex-col sm:flex-row sm:overflow-hidden sm:rounded-full"
              : "hidden"
          }`}
        >
          <input
            type="text"
            id="mobile-search-input"
            placeholder="Search terms..."
            value={searchParams.description}
            onChange={(e) =>
              setLocalSearchParams((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="px-4 py-2 border border-gray-600 focus:outline-none bg-neutral-800 text-white placeholder:text-gray-300 sm:rounded-l-full rounded-t-lg sm:rounded-t-none mb-2 sm:mb-0"
            aria-label="Search terms"
            disabled={isSearching}
          />
          <div className="flex flex-col sm:flex-row mb-2 sm:mb-0">
            <input
              type="text"
              id="mobile-zip-input"
              placeholder="Zip code"
              value={searchParams.zipCode}
              onChange={(e) =>
                setLocalSearchParams((prev) => ({
                  ...prev,
                  zipCode: e.target.value,
                }))
              }
              className="px-4 py-2 border border-gray-600 focus:outline-none bg-neutral-800 text-white placeholder:text-gray-300 sm:border-l-0 rounded-b-lg sm:rounded-b-none sm:rounded-l-none mb-2 sm:mb-0"
              aria-label="Zip code"
              pattern="[0-9]{5}"
              title="Five digit zip code"
              disabled={isSearching}
            />
            <select
              id="mobile-distance-select"
              value={searchParams.distance}
              onChange={(e) =>
                setLocalSearchParams((prev) => ({
                  ...prev,
                  distance: e.target.value,
                }))
              }
              className="px-4 py-2 border border-gray-600 focus:outline-none bg-neutral-800 text-white placeholder:text-gray-300 sm:border-l-0 sm:border-r-0 rounded-b-lg sm:rounded-b-none sm:rounded-none mb-2 sm:mb-0"
              aria-label="Distance in miles"
              disabled={isSearching}
            >
              <option value="5">5 miles</option>
              <option value="10">10 miles</option>
              <option value="25">25 miles</option>
              <option value="50">50 miles</option>
              <option value="100">100 miles</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-neutral-800 text-white rounded-full sm:rounded-l-none px-4 py-2 btn-gradient-hover"
            disabled={isSearching}
          >
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
      <nav className="h-16 md:flex hidden items-center">
        {/* Left Logo */}
        <div className="absolute left-0 h-full flex items-center z-10">
          <div
            className="cursor-pointer ml-4 flex items-center"
            onClick={() => {
              // Reset the entire state for homepage
              dispatch(resetHomeState());
              // Force a new fetch of resources
              dispatch(fetchResources(1));
              router.push("/");
              console.log(
                "Logo clicked, navigating to homepage and fetching fresh resources",
              );
            }}
          >
            <Image
              src={Logo}
              alt="The myAdvo Logo."
              height={60}
              width={120}
              className="p-2"
              priority
            />
          </div>
        </div>

        {/* Desktop Search - Centered */}
        <div className="absolute inset-0 hidden md:flex justify-center items-center text-black">
          <form
            onSubmit={handleSearch}
            id="desktop-search-form"
            className="flex shadow-md overflow-hidden rounded-full max-w-[40%] md:max-w-[45%] lg:max-w-[50%] bg-neutral-800"
          >
            <input
              type="text"
              id="desktop-search-input"
              placeholder="Search..."
              value={searchParams.description}
              onChange={(e) =>
                setLocalSearchParams((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="px-2 md:px-3 py-1 md:py-2 border-r border-gray-600 focus:outline-none bg-neutral-800 text-white placeholder:text-gray-300 rounded-l-full w-full min-w-0 text-xs md:text-sm"
              aria-label="Search terms"
              disabled={isSearching}
            />
            <div className="flex">
              <input
                type="text"
                id="desktop-zip-input"
                placeholder="Zip"
                value={searchParams.zipCode}
                onChange={(e) =>
                  setLocalSearchParams((prev) => ({
                    ...prev,
                    zipCode: e.target.value,
                  }))
                }
                className="px-2 md:px-3 py-1 md:py-2 focus:outline-none bg-neutral-800 text-white placeholder:text-gray-300 w-16 md:w-20 lg:w-24 text-xs md:text-sm border-r border-gray-600"
                aria-label="Zip code"
                pattern="[0-9]{5}"
                title="Five digit zip code"
                disabled={isSearching}
              />
              <select
                id="desktop-distance-select"
                value={searchParams.distance}
                onChange={(e) =>
                  setLocalSearchParams((prev) => ({
                    ...prev,
                    distance: e.target.value,
                  }))
                }
                className="px-2 md:px-3 py-1 md:py-2 focus:outline-none bg-neutral-800 text-white placeholder:text-gray-300 w-20 md:w-24 lg:w-28 text-xs md:text-sm"
                aria-label="Distance in miles"
                disabled={isSearching}
              >
                <option value="5">5 mi</option>
                <option value="10">10 mi</option>
                <option value="25">25 mi</option>
                <option value="50">50 mi</option>
                <option value="100">100 mi</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-neutral-800 text-white px-2 md:px-3 py-1 md:py-2 rounded-r-full btn-gradient-hover whitespace-nowrap flex items-center justify-center w-8 md:w-10 h-full"
              disabled={isSearching}
              aria-label="Search"
            >
              {isSearching ? (
                <span className="animate-pulse text-base">...</span>
              ) : (
                <Search size={40} strokeWidth={2.5} className="text-white" />
              )}
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
        <div className="absolute right-0 flex flex-wrap justify-end items-center px-1 md:px-2 lg:px-4 h-full gap-1 md:gap-1 lg:gap-2">
          <button
            className={`${buttonClass} text-xs md:text-xs lg:text-sm px-1 md:px-2 lg:px-3 py-1 md:py-1 lg:py-2`}
            onClick={() => router.push("/recommend")}
          >
            <span className="hidden lg:inline">Recommend</span>
            <span className="md:hidden lg:hidden">+</span>
            <span className="hidden md:inline lg:hidden">Add</span>
          </button>
          {session ? (
            <>
              {session.user.role === "admin" && (
                <button
                  onClick={() => router.push("/admin")}
                  className="bg-purple-700 text-white rounded-full text-xs md:text-xs lg:text-sm px-1 md:px-2 lg:px-3 py-1 md:py-1 lg:py-2 btn-gradient-hover"
                >
                  <span className="hidden md:hidden lg:inline">Admin</span>
                  <span className="md:inline lg:hidden">A</span>
                </button>
              )}
              {session.user.role === "business_rep" &&
                session.user.managedResourceId && (
                  <button
                    onClick={() => setIsResourceManageModalOpen(true)}
                    className="bg-green-700 text-white rounded-full text-xs md:text-xs lg:text-sm px-1 md:px-2 lg:px-3 py-1 md:py-1 lg:py-2 btn-gradient-hover"
                  >
                    <span className="hidden md:hidden lg:inline">
                      Manage Resource
                    </span>
                    <span className="md:inline lg:hidden">MR</span>
                  </button>
                )}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className={`${buttonClass} text-xs md:text-xs lg:text-sm px-1 md:px-2 lg:px-3 py-1 md:py-1 lg:py-2`}
              >
                <span className="hidden md:inline">Profile</span>
                <span className="md:hidden">P</span>
              </button>
              <button
                onClick={handleSignOut}
                className={`${buttonClass} text-xs md:text-xs lg:text-sm px-1 md:px-2 lg:px-3 py-1 md:py-1 lg:py-2`}
              >
                <span className="hidden md:inline">Sign Out</span>
                <span className="md:hidden">Out</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSignIn}
                className={`${buttonClass} text-xs md:text-xs lg:text-sm px-1 md:px-2 lg:px-3 py-1 md:py-1 lg:py-2`}
              >
                <span className="hidden md:inline">Sign In</span>
                <span className="md:hidden">In</span>
              </button>
              <button
                onClick={handleSignUp}
                className={`${buttonClass} text-xs md:text-xs lg:text-sm px-1 md:px-2 lg:px-3 py-1 md:py-1 lg:py-2`}
              >
                <span className="hidden md:inline">Sign Up</span>
                <span className="md:hidden">Up</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* User Profile Modal */}
      {userData && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={setIsProfileModalOpen}
          userData={userData}
          onUserUpdate={saveUserData}
        />
      )}

      {/* Resource Management Modal for Business Representatives */}
      {session?.user?.role === "business_rep" &&
        session?.user?.managedResourceId && (
          <ResourceManageModal
            isOpen={isResourceManageModalOpen}
            onClose={setIsResourceManageModalOpen}
            resourceId={session.user.managedResourceId}
          />
        )}
    </header>
  );
}

export default Navbar;
