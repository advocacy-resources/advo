import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Create uploads directory if it doesn't exist
const ensureUploadsDir = async () => {
  const uploadsDir = path.join(process.cwd(), "public/uploads");
  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error("Error creating uploads directory:", error);
  }
  return uploadsDir;
};

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

    // Generate a unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadsDir();

    // Create the file path
    const filePath = path.join(uploadsDir, fileName);
    const relativePath = `/uploads/${fileName}`;

    // Convert the file to a Buffer and save it
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write the file to disk
    await writeFile(filePath, buffer);

    console.log(`File saved to ${filePath}`);

    // Log the file path for debugging
    console.log(`File saved to ${filePath}, relative path: ${relativePath}`);

    // Return the file path
    return NextResponse.json({
      success: true,
      filePath: relativePath,
      mimeType: file.type,
      type: type,
    });
  } catch (error) {
    console.error("Error storing image:", error);
    return NextResponse.json(
      { error: "Failed to store image" },
      { status: 500 },
    );
  }
}
