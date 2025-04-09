import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { withAdminAuth } from "@/lib/api-middleware";

export const PATCH = withAdminAuth(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;
      const { status } = await req.json();

      // Validate status
      if (!["pending", "approved", "rejected"].includes(status)) {
        return NextResponse.json(
          { message: "Invalid status value" },
          { status: 400 },
        );
      }

      // Update the recommendation status
      const updatedRecommendation = await prisma.resourceRecommendation.update({
        where: { id },
        data: { status },
      });

      return NextResponse.json(
        {
          message: "Recommendation status updated successfully",
          recommendation: updatedRecommendation,
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error updating recommendation status:", error);
      return NextResponse.json(
        { message: "Failed to update recommendation status" },
        { status: 500 },
      );
    }
  },
);
