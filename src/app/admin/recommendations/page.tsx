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

export default async function RecommendationsPage() {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/auth/signin?callbackUrl=/admin");
  }
  

  // Fetch only pending recommendations
  const recommendationsData = await prisma.resourceRecommendation.findMany({
    where: {
      status: "pending",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Cast the data to match the ResourceRecommendation interface
  const recommendations = recommendationsData.map((rec) => ({
    ...rec,
    type: rec.type as "state" | "national",
    status: rec.status as "pending" | "approved" | "rejected",
    state: rec.state || undefined, // Convert null to undefined
    submittedBy: rec.submittedBy || undefined, // Convert null to undefined
    email: rec.email || undefined, // Convert null to undefined
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Resource Recommendations</h1>
          <p className="text-gray-600 mt-2">
            Review and manage pending resource recommendations.
          </p>
        </div>
        <a
          href="/admin/recommendations/archive"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
        >
          View Archive
        </a>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600 text-lg">
            No pending recommendations to review.
          </p>
        </div>
      ) : (
        <RecommendationsTable recommendations={recommendations} />
      )}
    </div>
  );
}