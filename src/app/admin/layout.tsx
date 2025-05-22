// File: src/app/admin/layout.tsx
// Purpose: Layout wrapper for all admin pages with authentication protection.
// Owner: Advo Team

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";

/**
 * Layout component for all admin pages.
 * Verifies admin authentication and provides consistent styling.
 * Redirects non-admin users to the homepage.
 *
 * @param children - The page content to render within the admin layout
 * @returns React component with the admin layout wrapper
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Verify admin access - redirect unauthorized users to homepage
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white mt-[180px] md:mt-0">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
        <div className="bg-gray-900 rounded-lg shadow-lg p-6">{children}</div>
      </div>
    </div>
  );
}
