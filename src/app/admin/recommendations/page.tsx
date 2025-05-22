// File: src/app/admin/recommendations/page.tsx
// Purpose: Displays and manages pending resource recommendations for admin review.
// Owner: Advo Team

import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import prisma from "@/prisma/client";
import RecommendationsTable from "@/components/resources/RecommendationsTable";

export const metadata = {
  title: "Resource Recommendations | Admin Dashboard",
  description: "Manage resource recommendations",
};

/**
 * Displays the admin page for reviewing pending resource recommendations.
 * Shows a table of all pending recommendations with approval/rejection actions.
 * Requires admin authentication to access.
 * @returns React component with the pending recommendations UI
 */
export default async function RecommendationsPage() {
  // Verify admin access - redirect to login if unauthorized
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  // Query database for recommendations awaiting admin review
  const recommendationsData = await prisma.resourceRecommendation.findMany({
    where: {
      status: "pending",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform database records to match the expected ResourceRecommendation interface
  // This handles nullable fields and type casting for the component
  const recommendations = recommendationsData.map((rec) => ({
    ...rec,
    type: rec.type as "state" | "national",
    status: rec.status as "pending" | "approved" | "rejected",
    state: rec.state || undefined,
    submittedBy: rec.submittedBy || undefined,
    email: rec.email || undefined,
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="md:flex md:justify-between md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold">Resource Recommendations</h1>
          <p className="text-gray-600 mt-2">
            Review and manage pending resource recommendations.
          </p>
        </div>

        {/* View Archive button - below header on mobile, to the right on desktop */}
        <a
          href="/admin/recommendations/archive"
          className="bg-neutral-800 text-white rounded-full px-4 py-2 btn-gradient-hover inline-block"
        >
          View Archive
        </a>
      </div>
      <RecommendationsTable recommendations={recommendations} />
    </div>
  );
}
