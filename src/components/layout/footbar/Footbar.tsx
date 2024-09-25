"use client";
import Link from "next/link";

import TermsOfService from "@/components/layout/footbar/TermsOfService";

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
          <TermsOfService />
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
        <Link className="px-4" href="">
          <svg
            className="h-6 w-6 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {" "}
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />{" "}
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />{" "}
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </Link>
        {/* LinkedIn icon */}
        <Link className="px-4" href="">
          <svg
            className="h-6 w-6 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {" "}
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />{" "}
            <rect x="2" y="9" width="4" height="12" />{" "}
            <circle cx="4" cy="4" r="2" />
          </svg>
        </Link>
        {/* Email icon */}
        <Link className="px-4" href="">
          <svg
            className="h-6 w-6 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        </Link>
      </div>

      {/* Copyright info */}
      <div className="text-sm ml-auto pr-8">
        All Rights Reserved &copy; {currentYear}
      </div>
    </footer>
  );
}
