import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Process the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'profile' or 'banner'
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!type || (type !== 'profile' && type !== 'banner')) {
      return NextResponse.json(
        { error: "Invalid image type. Must be 'profile' or 'banner'" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log(`Upload endpoint: Processing ${type} image of type ${file.type}`);
    console.log(`Upload endpoint: Buffer size: ${buffer.length} bytes`);
    
    // Convert to base64 for returning to the client
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Data}`;
    
    console.log(`Upload endpoint: Data URL length: ${dataUrl.length} chars`);
    console.log(`Upload endpoint: Data URL preview: ${dataUrl.substring(0, 50)}...`);
    
    return NextResponse.json({
      success: true,
      imageData: dataUrl,
      mimeType: file.type,
      type: type
    });
    
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}