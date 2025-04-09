import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET request to fetch all reviews for a resource
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if resource exists
    const resource = await prisma.resource.findUnique({
      where: { id },
    });
    
    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }
    
    // Fetch reviews for the resource
    const reviews = await prisma.review.findMany({
      where: { resourceId: id },
      include: {
        User: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST request to create a new review
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to submit a review" },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const { content } = await req.json();
    
    // Validate content
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Review content is required" },
        { status: 400 }
      );
    }
    
    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Review content must be 1000 characters or less" },
        { status: 400 }
      );
    }
    
    // Check if resource exists
    const resource = await prisma.resource.findUnique({
      where: { id },
    });
    
    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Create the review
    const review = await prisma.review.create({
      data: {
        content,
        userId,
        resourceId: id,
      },
      include: {
        User: {
          select: {
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}