"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Logo from "../../assets/myAdvo-peachWhite.svg";
import Exit from "../../assets/Exit.svg";

function Navbar() {
  const { data: session } = useSession(); // Getting the session data

  const handleSignOut = () => {
    signOut(); // This triggers sign-out using NextAuth
  };

  const handleSignIn = () => {
    signIn(); // This triggers sign-in using NextAuth
  };

  return (
    <nav className="relative min-h-[40%] bg-slate-800 text-white">
      {/* Navbar Content */}
      <div id="nav-container" className="flex flex-row justify-between px-8">
        <Image src={Exit} alt="Exit." height={30} className="rotate-180" />
        <Image src={Logo} alt="The myAdvo Logo." height={60} />
        {session ? (
          <Button onClick={handleSignOut}>Sign Out</Button>
        ) : (
          <Button onClick={handleSignIn}>Sign In</Button>
        )}
      </div>
      <div className="text-center py-4 px-6">
        <h1 className="text-2xl pb-3 font-bold tracking-widest">WELCOME!</h1>
        <hr />
      </div>
      <div className="flex flex-row px-2 justify-evenly">
        <Button variant="mobile-menu" size="lg" id="social">
          <span className="inline-block -skew-x-6">SOCIAL</span>
        </Button>
        <Button variant="mobile-menu" size="lg" id="mental">
          <span className="inline-block -skew-x-6">MENTAL</span>
        </Button>
        <Button variant="mobile-menu" size="lg" id="physical">
          <span className="inline-block -skew-x-6">PHYSICAL</span>
        </Button>
      </div>
      <div className="text-center py-4">
        <p>
          <a>more filters...</a>
        </p>
      </div>
    </nav>
  );
}

export default Navbar;
