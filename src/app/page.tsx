// File: src/app/page.tsx
// Purpose: Main homepage component that displays the resource grid for public users.
// Owner: Advo Team

"use client";

import HomeResourceGrid from "@/components/resources/HomeResourceGrid";

/**
 * Homepage component that serves as the landing page for the application.
 * Displays a grid of featured resources for users to browse.
 * @returns React component with the homepage content
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white py-8 px-4 mt-16 md:mt-0">
      <HomeResourceGrid />
    </div>
  );
}
