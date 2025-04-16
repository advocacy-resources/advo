import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

// We don't need authentication for submitting recommendations
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate required fields
    if (
      !data.name ||
      !data.type ||
      !data.note ||
      !data.description ||
      !data.category ||
      data.category.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: name, type, description, category, and note are required",
        },
        { status: 400 },
      );
    }

    // Validate state field is required when type is "state"
    if (data.type === "state" && !data.state) {
      return NextResponse.json(
        { message: "State is required when type is 'state'" },
        { status: 400 },
      );
    }

    // Validate type field
    if (data.type !== "state" && data.type !== "national") {
      return NextResponse.json(
        { message: "Type must be 'state' or 'national'" },
        { status: 400 },
      );
    }

    // Create the recommendation
    const recommendation = await prisma.resourceRecommendation.create({
      data: {
        name: data.name,
        type: data.type,
        state: data.type === "state" ? data.state : null,
        description: data.description || "",
        category: data.category || [],
        note: data.note,
        contact: data.contact || { phone: "", email: "", website: "" },
        address: data.address || { street: "", city: "", state: "", zip: "" },
        submittedBy: data.submittedBy || null,
        email: data.email || null,
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        message: "Recommendation submitted successfully",
        id: recommendation.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating recommendation:", error);
    return NextResponse.json(
      { message: "Failed to submit recommendation" },
      { status: 500 },
    );
  }
}
