import Link from "next/link";

import TermsOfService from "@/components/layout/footbar/TermsOfService";

export default function Footbar() {
  return (
    <footer className="flex justify-between items-start  px-8">
      {/* Footer Links */}
      <div className="flex flex-col w-1/2 bg-white-800 text-sm">
        <Link href="/">Privacy Policy</Link>
        <Link href="/">
          <TermsOfService />
        </Link>
        <Link href="/">About Us</Link>
        <Link href="/">Contact</Link>
      </div>

      <div className="flex flex-col gap-2 w-1/2">
        {/* Social Media Icons */}
        <div className="flex justify-end gap-4">
          {/* Instagram icon */}
          <Link href="https://www.instagram.com/advocacyresources/">
            <svg
              className="h-6 w-6 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              stroke-line-join="round"
            >
              {" "}
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />{" "}
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />{" "}
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </Link>
          {/* LinkedIn icon */}
          <Link href="https://www.linkedin.com/company/advocacy-resources/posts/?feedView=all">
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
          <Link href="">
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
        <div className="text-sm text-right ml-auto">
          All Rights Reserved &copy; 2024
        </div>
      </div>
    </footer>
  );
}
