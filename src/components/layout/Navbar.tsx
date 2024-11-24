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
      <div className="relative h-16">
        <Image
          src={Logo}
          alt="The myAdvo Logo."
          height={60}
          className="absolute flex justify-center h-full w-full py-2 z-1"
          onClick={() => {
            router.push("/");
          }}
        />
        <div className="absolute right-0 flex justify-end items-center px-8 h-full -z-1">
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
