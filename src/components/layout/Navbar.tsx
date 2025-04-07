"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "../../assets/myAdvo-peachWhite.svg";

function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [zipCode, setZipCode] = useState("");

  const handleSignOut = () => {
    signOut({ redirect: false });
  };

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  const handleSignUp = () => {
    router.push("/auth/register");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm, zipCode);
  };

  const buttonClass =
    "bg-neutral-800 text-white hover:bg-neutral-700 transition-colors duration-200 px-4 py-2";

  return (
    <header className="w-full">
      {/* Mobile Search (Top) */}
      <div className="md:hidden p-4  shadow-sm static top-0 z-10">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            placeholder="Search terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Zip code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:outline-none"
          />
          <button type="submit" className={buttonClass}>
            Search
          </button>
        </form>
      </div>

      {/* Navbar */}
      <div className="relative h-16 md:flex hidden items-center">
        {/* Left Logo */}
        <div className="absolute inset-0">
          <Image
            src={Logo}
            alt="The myAdvo Logo."
            height={60}
            className="cursor-pointer m-2"
            onClick={() => router.push("/")}
          />
        </div>

        {/* Desktop Search - Centered */}
        <div className="absolute inset-0 hidden md:flex justify-center items-center text-black">
          <form
            onSubmit={handleSearch}
            className="flex  shadow-sm overflow-hidden"
          >
            <input
              type="text"
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border-r border-gray-300 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Zip code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="px-4 py-2 focus:outline-none"
            />
            <button type="submit" className={buttonClass}>
              Search
            </button>
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
              <button onClick={handleSignOut} className={buttonClass}>
                Sign Out
              </button>
              <button onClick={handleSignUp} className={buttonClass}>
                Sign Up
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
