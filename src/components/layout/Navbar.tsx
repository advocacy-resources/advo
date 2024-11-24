"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Logo from "../../assets/myAdvo-peachWhite.svg";
import { useRouter } from "next/navigation";

function Navbar() {
  const { data: session } = useSession(); // Getting the session data
  const router = useRouter(); // Correctly initialize useRouter at the top level

  const handleSignOut = () => {
    signOut({
      redirect: false,
    }); // This triggers sign-out using NextAuth
  };

  const handleSignIn = () => {
    router.push("/auth/signin"); // Redirects to custom sign-in page
  };

  return (
    <header>
      <div className="relative h-16 flex items-center">
        {/* Left Icon */}
        <div className="absolute left-0 flex items-center px-4 h-full rotate-180">
          <Image
            src="/images/gtfo.svg"
            alt="Navigation Icon"
            height={24}
            width={24}
            className="cursor-pointer"
            onClick={() => {
              router.push("/somepage"); // Replace with your desired route
            }}
          />
        </div>

        {/* Center Logo */}
        <div className="absolute inset-0 flex justify-center items-center">
          <Image
            src={Logo}
            alt="The myAdvo Logo."
            height={60}
            className="cursor-pointer"
            onClick={() => {
              router.push("/");
            }}
          />
        </div>

        {/* Right Section */}
        <div className="absolute right-0 flex justify-end items-center px-8 h-full">
          {session ? (
            <Button onClick={handleSignOut}>Sign Out</Button>
          ) : (
            <Button onClick={handleSignIn}>Sign In</Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
