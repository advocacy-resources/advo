import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileToBuffer, bufferToDataUrl } from "@/lib/image-utils";
import { uploadToCloudStorage } from "@/lib/cloud-storage";

// For backward compatibility - local storage fallback
const LOCAL_STORAGE_ENABLED = process.env.ENABLE_LOCAL_STORAGE === "true";

/**
 * Unified image handling endpoint
 * Supports both storing images on disk and returning as base64
 *
 * @param request The incoming request
 * @returns Response with image data
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'profile' or 'banner'
    // Default to cloud storage, but allow fallback to disk or memory
    let storageType = (formData.get("storage") as string) || "cloud"; // 'cloud', 'disk', or 'memory'

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!type || (type !== "profile" && type !== "banner")) {
      return NextResponse.json(
        { error: "Invalid image type. Must be 'profile' or 'banner'" },
        { status: 400 },
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
        },
        { status: 400 },
      );
    }

    // Convert the file to a Buffer
    const buffer = await fileToBuffer(file);

    // Handle based on storage type
    if (storageType === "cloud") {
      try {
        // Upload to Google Cloud Storage
        const publicUrl = await uploadToCloudStorage(
          buffer,
          file.name,
          file.type,
        );

        console.log(`File uploaded to cloud storage: ${publicUrl}`);

        // Return the public URL
        return NextResponse.json({
          success: true,
          filePath: publicUrl, // This is now a full URL to the cloud storage
          mimeType: file.type,
          type: type,
          storage: "cloud",
        });
      } catch (cloudError) {
        console.error("Error uploading to cloud storage:", cloudError);
        // If cloud storage fails and local storage is enabled, fall back to local storage
        if (LOCAL_STORAGE_ENABLED) {
          console.log("Falling back to local storage");
          storageType = "disk";
        } else {
          throw cloudError; // Re-throw if no fallback
        }
      }
    }
    // Local disk storage (as fallback or if explicitly requested)
    if (storageType === "disk" && LOCAL_STORAGE_ENABLED) {
      // Import these modules only if needed
      const { writeFile, mkdir } = await import("fs/promises");
      // Generate a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;

      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), "public/uploads");
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        console.error("Error creating uploads directory:", error);
      }

      // Create the file path
      const filePath = path.join(uploadsDir, fileName);
      const relativePath = `/uploads/${fileName}`;

      // Write the file to disk
      await writeFile(filePath, buffer);

      console.log(
        `File saved to disk: ${filePath}, relative path: ${relativePath}`,
      );

      // Return the file path
      return NextResponse.json({
        success: true,
        filePath: relativePath,
        mimeType: file.type,
        type: type,
        storage: "disk",
      });
    } else {
      // Return as base64 data URL
      const dataUrl = bufferToDataUrl(buffer, file.type);

      console.log(`Returning data URL for ${type} image of type ${file.type}`);

      return NextResponse.json({
        success: true,
        imageData: dataUrl,
        mimeType: file.type,
        type: type,
      });
    }
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 },
    );
  }
}
