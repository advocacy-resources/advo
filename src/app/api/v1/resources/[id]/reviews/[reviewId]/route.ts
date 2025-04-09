import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET a specific review
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const { id, reviewId } = params;
    
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        User: {
          select: {
            name: true,
          },
        },
      },
    });
    
    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }
    
    if (review.resourceId !== id) {
      return NextResponse.json(
        { error: "Review does not belong to this resource" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT to update a review
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to update a review" },
        { status: 401 }
      );
    }
    
    const { id, reviewId } = params;
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
    
    // Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    
    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }
    
    // Check if the review belongs to the resource
    if (review.resourceId !== id) {
      return NextResponse.json(
        { error: "Review does not belong to this resource" },
        { status: 400 }
      );
    }
    
    // Check if the user is the owner of the review
    if (review.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own reviews" },
        { status: 403 }
      );
    }
    
    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { content },
      include: {
        User: {
          select: {
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json({ review: updatedReview });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE a review
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to delete a review" },
        { status: 401 }
      );
    }
    
    const { id, reviewId } = params;
    
    // Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    
    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }
    
    // Check if the review belongs to the resource
    if (review.resourceId !== id) {
      return NextResponse.json(
        { error: "Review does not belong to this resource" },
        { status: 400 }
      );
    }
    
    // Check if the user is the owner of the review
    if (review.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own reviews" },
        { status: 403 }
      );
    }
    
    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });
    
    return NextResponse.json(
      { message: "Review deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}