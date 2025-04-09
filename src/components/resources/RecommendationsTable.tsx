"use client";

import React, { useState } from "react";
import { ResourceRecommendation } from "@/interfaces/resourceRecommendation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

interface RecommendationsTableProps {
  recommendations: ResourceRecommendation[];
  showActions?: boolean;
}

const RecommendationsTable: React.FC<RecommendationsTableProps> = ({
  recommendations,
  showActions = true,
}) => {
  const [updatedRecommendations, setUpdatedRecommendations] = useState<
    ResourceRecommendation[]
  >(recommendations);

  const handleStatusChange = async (
    id: string,
    newStatus: "pending" | "approved" | "rejected"
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

  const getStatusBadgeClass = (
    status: "pending" | "approved" | "rejected"
  ) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Resource Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>State</TableHead>
            <TableHead className="w-[300px]">Note</TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {updatedRecommendations.map((recommendation) => (
            <TableRow key={recommendation.id}>
              <TableCell className="font-medium">
                {recommendation.name}
              </TableCell>
              <TableCell className="capitalize">
                {recommendation.type}
              </TableCell>
              <TableCell>
                {recommendation.type === "state" ? recommendation.state : "N/A"}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {recommendation.note}
              </TableCell>
              <TableCell>{recommendation.submittedBy || "Anonymous"}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(recommendation.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                    recommendation.status,
                  )}`}
                >
                  {recommendation.status}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                {showActions && recommendation.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      onClick={() =>
                        handleStatusChange(recommendation.id, "approved")
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      onClick={() =>
                        handleStatusChange(recommendation.id, "rejected")
                      }
                    >
                      Reject
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecommendationsTable;