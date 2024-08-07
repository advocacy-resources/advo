"use client";

import Link from "next/link";

function Navbar() {
  return (
    <nav className="bg-white-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-black">
          <span className="font-bold">ADVO</span> | Connecting Youth with
          Support
        </Link>
        <ul className="flex gap-10 p-4">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/about-us">About Us</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
          <li>
            <Link href="/faq">FAQ</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
