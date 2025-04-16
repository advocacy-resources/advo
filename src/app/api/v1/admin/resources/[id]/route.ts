import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api-middleware";
import {
  getResource,
  updateResource,
  deleteResource,
} from "@/lib/resource-operations";
import prisma from "@/prisma/client";

// GET handler for fetching a single resource
export const GET = withAdminAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;
      const resource = await getResource(id);

      if (!resource) {
        return NextResponse.json(
          { error: "Resource not found" },
          { status: 404 },
        );
      }

      console.log(`API: Resource ${id} owner:`, resource.owner);
      return NextResponse.json(resource);
    } catch (error) {
      console.error("Error fetching resource:", error);
      return NextResponse.json(
        { error: "Failed to fetch resource" },
        { status: 500 },
      );
    }
  },
);

// PUT handler for updating a resource
export const PUT = withAdminAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;
      const resourceData = await request.json();

      console.log("Updating resource with ID:", id);
      console.log(
        "Profile photo exists in update data:",
        !!resourceData.profilePhoto,
      );
      console.log(
        "Banner image exists in update data:",
        !!resourceData.bannerImage,
      );
      console.log(
        "Profile photo URL exists in update data:",
        !!resourceData.profilePhotoUrl,
      );
      console.log(
        "Banner image URL exists in update data:",
        !!resourceData.bannerImageUrl,
      );

      // Get the existing resource to check for existing image URLs
      const existingResource = await prisma.resource.findUnique({
        where: { id },
        select: {
          profilePhotoUrl: true,
          bannerImageUrl: true,
        },
      });

      // If we have URLs from the file upload component, make sure they're preserved
      if (
        resourceData.profilePhotoUrl &&
        resourceData.profilePhotoUrl.startsWith("/uploads/")
      ) {
        console.log(
          "Using profile photo URL from uploads:",
          resourceData.profilePhotoUrl,
        );
      } else if (
        !resourceData.profilePhotoUrl &&
        existingResource?.profilePhotoUrl
      ) {
        // If no new URL is provided but one exists in the database, preserve it
        resourceData.profilePhotoUrl = existingResource.profilePhotoUrl;
        console.log(
          "Preserving existing profile photo URL:",
          resourceData.profilePhotoUrl,
        );
      }

      if (
        resourceData.bannerImageUrl &&
        resourceData.bannerImageUrl.startsWith("/uploads/")
      ) {
        console.log(
          "Using banner image URL from uploads:",
          resourceData.bannerImageUrl,
        );
      } else if (
        !resourceData.bannerImageUrl &&
        existingResource?.bannerImageUrl
      ) {
        // If no new URL is provided but one exists in the database, preserve it
        resourceData.bannerImageUrl = existingResource.bannerImageUrl;
        console.log(
          "Preserving existing banner image URL:",
          resourceData.bannerImageUrl,
        );
      }

      // Remove fields that shouldn't be updated directly
      const {
        id: _resourceId, // Renamed and prefixed with _ to indicate it's intentionally unused
        // Removed explicit destructuring of unused variables
        // Instead, use a more generic approach to exclude fields that shouldn't be updated
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        favoriteCount: _favoriteCount,
        upvoteCount: _upvoteCount,
        Like: _like,
        Rating: _rating,
        ...updateData
      } = resourceData;

      // Update resource using the shared utility
      const updatedResource = await updateResource(id, updateData);

      if (!updatedResource) {
        return NextResponse.json(
          { error: "Resource not found" },
          { status: 404 },
        );
      }

      console.log("Resource updated successfully");

      return NextResponse.json(updatedResource);
    } catch (error) {
      console.error("Error updating resource:", error);
      return NextResponse.json(
        { error: "Failed to update resource" },
        { status: 500 },
      );
    }
  },
);

// DELETE handler for deleting a resource
export const DELETE = withAdminAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;

      // Delete resource using the shared utility
      const result = await deleteResource(id);

      if (!result) {
        return NextResponse.json(
          { error: "Resource not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { message: "Resource deleted successfully" },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error deleting resource:", error);
      return NextResponse.json(
        { error: "Failed to delete resource" },
        { status: 500 },
      );
    }
  },
);
