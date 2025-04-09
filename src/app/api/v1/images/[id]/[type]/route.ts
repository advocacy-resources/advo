import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; type: string } }
) {
  try {
    const { id, type } = params;
    console.log(`Fetching ${type} image for resource ${id}`);

    // Validate type parameter
    if (type !== "profile" && type !== "banner") {
      return NextResponse.json(
        { error: "Invalid image type. Must be 'profile' or 'banner'" },
        { status: 400 }
      );
    }

    // Find the resource
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: {
        profilePhoto: type === "profile",
        profilePhotoType: type === "profile",
        profilePhotoUrl: type === "profile",
        bannerImage: type === "banner",
        bannerImageType: type === "banner",
        bannerImageUrl: type === "banner",
      },
    });

    console.log("Resource query result:", JSON.stringify(resource, null, 2));

    if (!resource) {
      console.log("Resource not found");
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Get the appropriate image data, MIME type, and URL
    const imageData = type === "profile" 
      ? resource.profilePhoto 
      : resource.bannerImage;
    
    const mimeType = type === "profile" 
      ? resource.profilePhotoType 
      : resource.bannerImageType;
      
    const imageUrl = type === "profile"
      ? resource.profilePhotoUrl
      : resource.bannerImageUrl;

    // Check if we have a URL path stored
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('/uploads/')) {
      console.log(`Using stored URL path for ${type}: ${imageUrl}`);
      return NextResponse.json({
        imageData: imageUrl,
        mimeType: mimeType || 'image/jpeg'
      });
    }

    // If no image data, return a default image
    if (!imageData) {
      console.log(`No ${type} image found for resource ${id}`);
      
      // Return a default image
      const defaultImagePath = type === "profile"
        ? "/images/tulsa-center.png"
        : "/resourcebannerimage.png";
      
      return NextResponse.json({
        imageData: defaultImagePath,
        mimeType: "image/png"
      });
    }

    // Process the image data
    let dataUrl;
    
    if (typeof imageData === 'string') {
      const imageDataStr = imageData as string;
      if (imageDataStr.startsWith('data:')) {
        // Already a data URL, use it directly
        dataUrl = imageDataStr;
      } else if (imageDataStr.startsWith('/uploads/')) {
        // It's a file path, return it directly
        return NextResponse.json({
          imageData: imageDataStr,
          mimeType: mimeType || 'image/jpeg'
        });
      } else {
        // Some other string format, try to convert
        try {
          const base64Data = Buffer.from(imageData).toString('base64');
          dataUrl = `data:${mimeType || 'image/jpeg'};base64,${base64Data}`;
        } catch (error) {
          console.error("Error converting string to data URL:", error);
          dataUrl = imageData; // Fall back to using it directly
        }
      }
    } else if (imageData) {
      // Convert the binary data to base64
      const base64Data = Buffer.from(imageData).toString('base64');
      dataUrl = `data:${mimeType || 'image/jpeg'};base64,${base64Data}`;
    } else {
      // No image data
      dataUrl = null;
    }

    // Return the data URL
    return NextResponse.json({
      imageData: dataUrl,
      mimeType: mimeType || 'image/jpeg'
    });
  } catch (error) {
    console.error("Error retrieving image:", error);
    return NextResponse.json(
      { error: "Failed to retrieve image" },
      { status: 500 }
    );
  }
}