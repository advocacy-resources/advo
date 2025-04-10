/**
 * Utility functions for image handling and conversion
 */
// Removed import: import { Resource } from "@/interfaces/resource";

/**
 * Convert a Buffer to a data URL
 */
export function bufferToDataUrl(
  buffer: Buffer,
  mimeType: string = "image/jpeg",
) {
  const base64Data = buffer.toString("base64");
  return `data:${mimeType};base64,${base64Data}`;
}

/**
 * Convert a data URL to a Buffer
 */
export function dataUrlToBuffer(dataUrl: string) {
  // Check if it's already a data URL
  if (typeof dataUrl === "string" && dataUrl.startsWith("data:")) {
    const base64Data = dataUrl.split(",")[1];
    return Buffer.from(base64Data, "base64");
  }

  // If it's not a data URL, return null
  return null;
}

/**
 * Process resource images by converting binary data to data URLs
 */
export function processResourceImages(resource: any) {
  if (!resource) return resource;

  const processedResource = { ...resource };

  // Handle profile photo
  if (resource.profilePhoto) {
    // If it's already a data URL or a file path, keep it as is
    if (
      typeof resource.profilePhoto === "string" &&
      (resource.profilePhoto.startsWith("data:") ||
        resource.profilePhoto.startsWith("/uploads/"))
    ) {
      processedResource.profilePhoto = resource.profilePhoto;
    } else {
      // Otherwise, convert binary data to data URL
      processedResource.profilePhoto = bufferToDataUrl(
        resource.profilePhoto,
        resource.profilePhotoType || "image/jpeg",
      );
    }
  }

  // Handle banner image
  if (resource.bannerImage) {
    // If it's already a data URL or a file path, keep it as is
    if (
      typeof resource.bannerImage === "string" &&
      (resource.bannerImage.startsWith("data:") ||
        resource.bannerImage.startsWith("/uploads/"))
    ) {
      processedResource.bannerImage = resource.bannerImage;
    } else {
      // Otherwise, convert binary data to data URL
      processedResource.bannerImage = bufferToDataUrl(
        resource.bannerImage,
        resource.bannerImageType || "image/jpeg",
      );
    }
  }

  // Handle profile photo URL if it exists
  if (resource.profilePhotoUrl) {
    processedResource.profilePhotoUrl = resource.profilePhotoUrl;
  }

  // Handle banner image URL if it exists
  if (resource.bannerImageUrl) {
    processedResource.bannerImageUrl = resource.bannerImageUrl;
  }

  return processedResource;
}

/**
 * Convert a File to a Buffer
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const bytes = await file.arrayBuffer();
  return Buffer.from(bytes);
}
