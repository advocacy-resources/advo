import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/prisma/client";
import { authOptions } from "@/lib/authOptions";

// Constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// Helper function to check admin role
async function checkAdminRole() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return false;
  }

  return true;
}

// GET handler for fetching resources with pagination
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page")) || DEFAULT_PAGE);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT),
    );
    const skip = (page - 1) * limit;

    // Fetch resources with pagination
    const [resources, totalCount] = await Promise.all([
      prisma.resource.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.resource.count(),
    ]);

    // Return paginated response
    return NextResponse.json({
      data: resources,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 },
    );
  }
}

// POST handler for creating a new resource
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    // Parse request body
    const resourceData = await request.json();
    
    console.log("Creating new resource");
    console.log("Profile photo exists in create data:", !!resourceData.profilePhoto);
    console.log("Banner image exists in create data:", !!resourceData.bannerImage);
    console.log("Profile photo URL exists in create data:", !!resourceData.profilePhotoUrl);
    console.log("Banner image URL exists in create data:", !!resourceData.bannerImageUrl);
    
    // If the image data is a base64 data URL, convert it to binary
    if (resourceData.profilePhoto && typeof resourceData.profilePhoto === 'string' && resourceData.profilePhoto.startsWith('data:')) {
      console.log("Converting profile photo from base64 to binary");
      try {
        // Extract the base64 data from the data URL
        const base64Data = resourceData.profilePhoto.split(',')[1];
        // Convert to binary
        const binaryData = Buffer.from(base64Data, 'base64');
        console.log("Profile photo binary data length:", binaryData.length);
        resourceData.profilePhoto = binaryData;
      } catch (error) {
        console.error("Error converting profile photo:", error);
      }
    }
    
    if (resourceData.bannerImage && typeof resourceData.bannerImage === 'string' && resourceData.bannerImage.startsWith('data:')) {
      console.log("Converting banner image from base64 to binary");
      try {
        // Extract the base64 data from the data URL
        const base64Data = resourceData.bannerImage.split(',')[1];
        // Convert to binary
        const binaryData = Buffer.from(base64Data, 'base64');
        console.log("Banner image binary data length:", binaryData.length);
        resourceData.bannerImage = binaryData;
      } catch (error) {
        console.error("Error converting banner image:", error);
      }
    }

    // Create new resource
    const resource = await prisma.resource.create({
      data: resourceData,
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 },
    );
  }
}
