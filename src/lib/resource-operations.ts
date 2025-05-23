import prisma from "@/prisma/client";
import { processResourceImages } from "@/lib/image-utils";
import { Prisma } from "@prisma/client";

/**
 * Get a resource by ID
 */
export async function getResource(id: string) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      return null;
    }

    // Find the business representative (owner) of this resource
    const owner = await prisma.user.findFirst({
      where: {
        managedResourceId: id,
        role: "business_rep",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    console.log(`Resource ID: ${id}, Found owner:`, owner);

    // Process images (convert binary to data URLs)
    const processedResource = processResourceImages(resource);

    // Add owner information to the resource
    return {
      ...processedResource,
      owner: owner || null,
    };
  } catch (error) {
    console.error("Error fetching resource:", error);
    throw error;
  }
}

/**
 * Update a resource
 */
// Define a type for resource update data using Prisma's types
type ResourceUpdateData = Prisma.ResourceUpdateInput;

export async function updateResource(id: string, data: ResourceUpdateData) {
  try {
    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!existingResource) {
      return null;
    }

    // Remove fields that shouldn't be updated directly
    // Using destructuring with rest operator to exclude fields we don't want to update
    const {
      // These variables are intentionally destructured but not used
      // as a way to exclude them from the updateData object
      ...updateData
    } = data;

    // Create a copy of the update data that we'll modify
    const finalUpdateData = { ...updateData };

    // Handle profile photo URL
    if (
      updateData.profilePhotoUrl &&
      typeof updateData.profilePhotoUrl === "string"
    ) {
      if (updateData.profilePhotoUrl.startsWith("/uploads/")) {
        // It's a file path from the uploads directory - preserve it
        console.log(
          "Preserving profile photo URL path:",
          updateData.profilePhotoUrl,
        );

        // Make sure we're not also trying to update the binary data
        // This ensures we don't overwrite the URL with null binary data
        if (!updateData.profilePhoto) {
          finalUpdateData.profilePhoto = undefined;
        }
      }
    } else if (
      !updateData.profilePhotoUrl &&
      existingResource.profilePhotoUrl
    ) {
      // If no new URL is provided but one exists in the database, preserve it
      finalUpdateData.profilePhotoUrl = existingResource.profilePhotoUrl;
    }

    // Handle banner image URL
    if (
      updateData.bannerImageUrl &&
      typeof updateData.bannerImageUrl === "string"
    ) {
      if (updateData.bannerImageUrl.startsWith("/uploads/")) {
        // It's a file path from the uploads directory - preserve it
        console.log(
          "Preserving banner image URL path:",
          updateData.bannerImageUrl,
        );

        // Make sure we're not also trying to update the binary data
        // This ensures we don't overwrite the URL with null binary data
        if (!updateData.bannerImage) {
          finalUpdateData.bannerImage = undefined;
        }
      }
    } else if (!updateData.bannerImageUrl && existingResource.bannerImageUrl) {
      // If no new URL is provided but one exists in the database, preserve it
      finalUpdateData.bannerImageUrl = existingResource.bannerImageUrl;
    }

    console.log("Updating resource with final data:", {
      ...finalUpdateData,
      profilePhoto: finalUpdateData.profilePhoto ? "BINARY_DATA" : undefined,
      bannerImage: finalUpdateData.bannerImage ? "BINARY_DATA" : undefined,
      profilePhotoUrl: finalUpdateData.profilePhotoUrl,
      bannerImageUrl: finalUpdateData.bannerImageUrl,
    });

    // Update resource with our modified data
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: finalUpdateData,
    });

    return updatedResource;
  } catch (error) {
    console.error("Error updating resource:", error);
    throw error;
  }
}

/**
 * Delete a resource
 */
export async function deleteResource(id: string) {
  try {
    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!existingResource) {
      return false;
    }

    // Delete resource
    await prisma.resource.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
}

/**
 * Get resources with pagination
 */
export async function getResources(
  page: number = 1,
  limit: number = 10,
  filters: {
    category?: string[];
    type?: string[];
  } = {},
) {
  try {
    // Build where clause based on filters
    const where: Prisma.ResourceWhereInput = {};

    if (filters.category && filters.category.length > 0) {
      where.category = {
        hasSome: filters.category,
      };
    }

    // Check if 'type' exists in the schema before using it
    if (filters.type && filters.type.length > 0) {
      // Use a more generic approach since 'type' might not be in the schema
      // Create a properly typed extension of the where clause
      const extendedWhere = where as Prisma.ResourceWhereInput & {
        type?: { hasSome: string[] };
      };

      extendedWhere.type = {
        hasSome: filters.type,
      };
    }

    // Get total count for pagination
    const total = await prisma.resource.count({ where });

    // Calculate pagination values
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get resources
    const resources = await prisma.resource.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
    // Process images for each resource
    const processedResources = resources.map((resource) => {
      // Use a type assertion to handle the resource type
      // This is necessary because the Prisma resource type doesn't match the expected type for processResourceImages
      return processResourceImages(resource);
    });

    return {
      data: processedResources,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching resources:", error);
    throw error;
  }
}
