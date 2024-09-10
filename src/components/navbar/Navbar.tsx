"use client";

import Image from "next/image";
import logo from "$/AdvoLogoWhite.png";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MainSearch from "@/components/search/MainSearch";

function Navbar() {
  return (
    <nav className="relative min-h-[40%] text-advo-pink">
      <div className="relative z-10">
        {/* Top Section: Logo and Buttons */}
        <div className="min-h-[50px] flex justify-between items-center px-8 py-4">
          <div>
            <Image src={logo} alt="Advo Logo" height={75} />
          </div>
          <div className="flex flex-row gap-8">
            <Button className="text-white bg-advo-pink hover:bg-[#FDF952] hover:text-black hover:shadow-glow">
              Submit a Resource
            </Button>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="px-4 py-12">
          <h1 className="text-center text-6xl mb-8">Find Support Today!</h1>
          <MainSearch />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
