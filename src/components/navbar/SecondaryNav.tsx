import React from "react";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import "leaflet/dist/leaflet.css";

export default function SecondaryNav() {
  return (
    <nav className="bg-white shadow-sm py-3 border border-bottom-gray-800">
      <div className="container mx-auto px-4 flex items-start justify-around">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-purple-700">
          <Image
            src="/images/advo-logo-color.png"
            alt="Advo Logo"
            width={40}
            height={40}
            priority
          />
        </Link>

        {/* Simplified Search */}
        <div className="flex-grow max-w-2xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Terms"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>

        {/* Right side links */}
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-purple-700 flex items-center">
            Mental Health <ChevronDown size={16} className="ml-1" />
          </button>
          <button className="text-gray-600 hover:text-purple-700 flex items-center">
            Physical Health <ChevronDown size={16} className="ml-1" />
          </button>
          <button className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition duration-300">
            Submit a Resource
          </button>
        </div>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  );
}
