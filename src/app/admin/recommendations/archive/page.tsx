// File: src/app/admin/recommendations/archive/page.tsx
// Purpose: Displays archived resource recommendations that have been approved or rejected.
// Owner: Advo Team

import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import prisma from "@/prisma/client";
import RecommendationsTable from "@/components/resources/RecommendationsTable";

export const metadata = {
  title: "Recommendation Archive | Admin Dashboard",
  description: "View archived resource recommendations",
};

/**
 * Displays the archive page for resource recommendations that have been processed.
 * Shows a table of all approved or rejected recommendations with their details.
 * Requires admin authentication to access.
 * @returns React component with the recommendations archive UI
 */
export default async function RecommendationsArchivePage() {
  // Verify admin access - redirect to login if unauthorized
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  // Query database for all processed recommendations (both approved and rejected)
  const recommendationsData = await prisma.resourceRecommendation.findMany({
    where: {
      status: {
        in: ["approved", "rejected"],
      },
    },
    orderBy: {
      updatedAt: "desc",
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Recommendation Archive</h1>
          <p className="text-gray-600 mt-2">
            View previously approved or rejected resource recommendations.
          </p>
        </div>
        <a
          href="/admin/recommendations"
          className="bg-neutral-800 text-white rounded-full px-4 py-2 btn-gradient-hover inline-block"
        >
          Back to Pending
        </a>
      </div>
      <RecommendationsTable
        recommendations={recommendations}
        showActions={false}
      />
    </div>
  );
}
