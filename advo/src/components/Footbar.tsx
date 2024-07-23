"use client";

import { Linkedin, Instagram, Mail } from "lucide-react";
import Link from "next/link";

const currentYear = new Date().getFullYear();

export default function Footbar() {
  return (
    <footer className="container mx-auto grid grid-cols-3">

      {/* Footer Links */}
      <div className="bg-white-800">
        <Link className="text-sm" href="/">
          Privacy Policy
        </Link>
        <Link className="px-4 text-sm" href="/">
          Terms of Use
        </Link>
        <Link className="px-4 text-sm" href="/">
          About Us
        </Link>
        <Link className="px-4 text-sm" href="/">
          Contact
        </Link>
      </div>

      {/* Social Media Icons */}
      <div className="flex place-content-center">
        {/* Instagram icon */}
        <Link className="px-4" href=""><Instagram className="h-6 w-6" /></Link>
        {/* LinkedIn icon */}
        <Link className="px-4" href=""><Linkedin className="h-6 w-6" /></Link>
        {/* Email icon */}
        <Link className="px-4" href=""><Mail className="h-6 w-6" /></Link>
      </div>

      {/* Copyright info */}
      <div className="text-sm ml-auto pr-8">
        All Rights Reserved &copy; {currentYear}
      </div>
    </footer>
  )
}
