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

export default async function RecommendationsArchivePage() {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  // Fetch archived recommendations (approved or rejected)
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

  // Cast the data to match the ResourceRecommendation interface
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
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
        >
          Back to Pending
        </a>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600 text-lg">
            No archived recommendations found.
          </p>
        </div>
      ) : (
        <RecommendationsTable
          recommendations={recommendations}
          showActions={false}
        />
      )}
    </div>
  );
}
