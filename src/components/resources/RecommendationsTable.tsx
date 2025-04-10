"use client";

import React, { useState } from "react";
import { ResourceRecommendation } from "@/interfaces/resourceRecommendation";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface RecommendationsTableProps {
  recommendations: ResourceRecommendation[];
  showActions?: boolean;
}

const RecommendationsTable: React.FC<RecommendationsTableProps> = ({
  recommendations,
  showActions = true,
}) => {
  const [updatedRecommendations, setUpdatedRecommendations] =
    useState<ResourceRecommendation[]>(recommendations);

  const handleStatusChange = async (
    id: string,
    newStatus: "pending" | "approved" | "rejected",
  ) => {
    try {
      const response = await fetch(`/api/v1/recommendations/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the local state
        setUpdatedRecommendations((prev) =>
          prev.map((rec) =>
            rec.id === id ? { ...rec, status: newStatus } : rec,
          ),
        );
      } else {
        console.error("Failed to update recommendation status");
      }
    } catch (error) {
      console.error("Error updating recommendation status:", error);
    }
  };

  const getStatusBadgeClass = (status: "pending" | "approved" | "rejected") => {
    switch (status) {
      case "pending":
        return "bg-yellow-600 text-yellow-100 border border-yellow-700";
      case "approved":
        return "bg-green-600 text-green-100 border border-green-700";
      case "rejected":
        return "bg-red-600 text-red-100 border border-red-700";
      default:
        return "bg-gray-600 text-gray-100 border border-gray-700";
    }
  };

  return (
    <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full divide-y divide-gray-700 table-fixed">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[15%] md:w-auto">
                Resource Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                State
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                Note
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                Submitted By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[85px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {updatedRecommendations.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-300">
                  No recommendations found
                </td>
              </tr>
            ) : (
              updatedRecommendations.map((recommendation) => (
                <tr key={recommendation.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {recommendation.name}
                    </div>
                    {/* Mobile-only info */}
                    <div className="md:hidden mt-1">
                      <div className="text-xs text-gray-400 capitalize">
                        {recommendation.type}
                        {" • "}
                        {recommendation.type === "state"
                          ? recommendation.state
                          : "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-300 capitalize">
                      {recommendation.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-300">
                      {recommendation.type === "state"
                        ? recommendation.state
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="text-sm text-gray-300 max-w-[200px] md:max-w-xs truncate">
                      {recommendation.note}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-300">
                      {recommendation.submittedBy || "Anonymous"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-300">
                      {formatDistanceToNow(new Date(recommendation.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                        recommendation.status,
                      )}`}
                    >
                      {recommendation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {showActions && recommendation.status === "pending" && (
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          className="text-xs px-2 py-1 bg-green-700 hover:bg-green-800 text-white border-0 w-full"
                          onClick={() =>
                            handleStatusChange(recommendation.id, "approved")
                          }
                        >
                          ✓
                        </Button>
                        <Button
                          variant="outline"
                          className="text-xs px-2 py-1 bg-red-700 hover:bg-red-800 text-white border-0 w-full"
                          onClick={() =>
                            handleStatusChange(recommendation.id, "rejected")
                          }
                        >
                          ✕
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecommendationsTable;
